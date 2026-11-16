import React, { useMemo, useState } from 'react';
import { KeyboardAwareScrollView } from '../components/ui/KeyboardAwareScrollView';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import {
  CheckCircle2,
  Compass,
  HeartHandshake,
  Languages,
  Lock,
  MessageCircleQuestion,
  ShieldAlert,
  UserCheck,
  Sparkles,
  ChevronRight,
  History,
  Info,
} from 'lucide-react-native';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { Button, Card, Chips, DateField, Field, SectionTitle } from '../components/ui';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { api } from '../services/api';
import { openPayment } from '../services/payment';
import type { Gender, KundliPerson, KundliRequest, KundliType } from '../types/api';
import { isValidPhone, KUNDLI_TYPE_LABELS, localPhone, rupees } from '../utils/format';

interface KundliScreenProps {
  onViewRequests: () => void;
  onNotificationPress?: () => void;
}

const TYPES: { type: KundliType; icon: any; title: string; hint: string }[] = [
  {
    type: 'JANAM_KUNDLI',
    icon: Compass,
    title: 'जन्म कुंडली विश्लेषण',
    hint: 'लग्न, राशि, ग्रह स्थिति व सटीक वैदिक उपाय',
  },
  {
    type: 'GUNA_MILAN',
    icon: HeartHandshake,
    title: 'गुण मिलान (विवाह कुंडली)',
    hint: '36 गुण मिलान, नाड़ी दोष व वैवाहिक मार्गदर्शन',
  },
  {
    type: 'DOSHA_NIVARAN',
    icon: ShieldAlert,
    title: 'दोष निवारण व शांति',
    hint: 'मंगल, कालसर्प, पितृ दोष व साढ़ेसाती का प्रभाव',
  },
  {
    type: 'GENERAL_QUERY',
    icon: MessageCircleQuestion,
    title: 'ज्योतिष प्रश्न परामर्श',
    hint: 'करियर, व्यापार, स्वास्थ्य या संपत्ति पर प्रश्न',
  },
];

const TRUST = [
  { icon: UserCheck, label: 'आचार्य द्वारा व्यक्तिगत अध्ययन' },
  { icon: Lock, label: '100% गोपनीय' },
  { icon: Languages, label: 'हिंदी / English' },
];

const StepHeader: React.FC<{ n: number; title: string; subtitle?: string }> = ({ n, title, subtitle }) => (
  <View style={styles.stepHeader}>
    <View style={styles.stepBadge}>
      <Text style={styles.stepBadgeText}>{n}</Text>
    </View>
    <View style={styles.flex}>
      <Text style={styles.stepTitle}>{title}</Text>
      {subtitle ? <Text style={styles.stepSub}>{subtitle}</Text> : null}
    </View>
  </View>
);

const DOSHAS = ['मंगल दोष', 'कालसर्प दोष', 'पितृ दोष', 'शनि साढ़े साती', 'ग्रह पीड़ा / अन्य'];

const emptyPerson = (): KundliPerson => ({
  fullName: '',
  gender: 'MALE',
  dateOfBirth: '',
  timeOfBirth: '',
  timeUnknown: false,
  placeOfBirth: '',
});

type Errors = Record<string, string>;

const PersonForm: React.FC<{
  title: string;
  value: KundliPerson;
  onChange: (p: KundliPerson) => void;
  errors: Errors;
  prefix: string;
}> = ({ title, value, onChange, errors, prefix }) => {
  const set = <K extends keyof KundliPerson>(key: K) => (v: KundliPerson[K]) => onChange({ ...value, [key]: v });
  return (
    <View style={styles.personFormBlock}>
      <SectionTitle title={title} />
      <Field
        label="पूरा नाम (Full Name)"
        required
        value={value.fullName}
        onChangeText={set('fullName')}
        placeholder="उदा. अमित शर्मा"
        error={errors[`${prefix}.fullName`]}
      />
      <Chips
        label="लिंग (Gender)"
        value={value.gender}
        onChange={(g) => set('gender')(g as Gender)}
        options={[
          { value: 'MALE', label: 'पुरुष (Male)' },
          { value: 'FEMALE', label: 'महिला (Female)' },
          { value: 'OTHER', label: 'अन्य' },
        ]}
      />
      <DateField
        label="जन्म तिथि (Date of Birth)"
        required
        value={value.dateOfBirth}
        onChange={set('dateOfBirth')}
        error={errors[`${prefix}.dateOfBirth`]}
        maximumDate={new Date()}
        minimumDate={new Date(1920, 0, 1)}
      />
      {!value.timeUnknown ? (
        <DateField
          label="जन्म समय (Time of Birth)"
          required
          mode="time"
          value={value.timeOfBirth}
          onChange={set('timeOfBirth')}
          error={errors[`${prefix}.timeOfBirth`]}
        />
      ) : null}
      <View style={styles.switchRow}>
        <View style={styles.flex}>
          <Text style={styles.switchLabel}>सटीक जन्म समय ज्ञात नहीं है</Text>
          <Text style={styles.switchSub}>पंडित जी जन्म तिथि व चंद्र कुंडली से अध्ययन करेंगे</Text>
        </View>
        <Switch
          value={value.timeUnknown}
          onValueChange={(v) => onChange({ ...value, timeUnknown: v, timeOfBirth: v ? '' : value.timeOfBirth })}
          trackColor={{ true: THEME.colors.primarySaffron, false: '#E2D8CC' }}
          thumbColor="#FFFFFF"
        />
      </View>
      <Field
        label="जन्म स्थान (Place of Birth)"
        required
        value={value.placeOfBirth}
        onChangeText={set('placeOfBirth')}
        placeholder="शहर, राज्य (उदा. वाराणसी, उत्तर प्रदेश)"
        error={errors[`${prefix}.placeOfBirth`]}
      />
    </View>
  );
};

export const KundliScreen: React.FC<KundliScreenProps> = ({ onViewRequests, onNotificationPress }) => {
  const { user } = useAuth();
  const { settings } = useAppData();
  const [type, setType] = useState<KundliType>('JANAM_KUNDLI');
  const [primary, setPrimary] = useState<KundliPerson>(emptyPerson());
  const [partner, setPartner] = useState<KundliPerson>({ ...emptyPerson(), gender: 'FEMALE' });
  const [doshas, setDoshas] = useState<string[]>([]);
  const [questions, setQuestions] = useState('');
  const [language, setLanguage] = useState<'HINDI' | 'ENGLISH'>('HINDI');
  const [phone, setPhone] = useState(localPhone(user?.phone || ''));
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'PAY_LATER'>('ONLINE');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<KundliRequest | null>(null);
  const [paid, setPaid] = useState(false);

  const fee = settings?.kundliFees?.[type] ?? 0;
  const canUseMine = Boolean(user?.dateOfBirth && user?.placeOfBirth);

  const fillMine = () => {
    if (!user) return;
    setPrimary({
      fullName: user.name,
      gender: (user.gender || 'MALE') as Gender,
      dateOfBirth: user.dateOfBirth,
      timeOfBirth: user.timeOfBirth,
      timeUnknown: !user.timeOfBirth,
      placeOfBirth: user.placeOfBirth,
    });
  };

  const validatePerson = (p: KundliPerson, prefix: string, next: Errors) => {
    if (p.fullName.trim().length < 2) next[`${prefix}.fullName`] = 'पूरा नाम दर्ज करें';
    if (!p.dateOfBirth) next[`${prefix}.dateOfBirth`] = 'जन्म तिथि चुनें';
    if (!p.timeUnknown && !p.timeOfBirth) next[`${prefix}.timeOfBirth`] = 'जन्म समय दर्ज करें या अज्ञात चुनें';
    if (p.placeOfBirth.trim().length < 2) next[`${prefix}.placeOfBirth`] = 'जन्म स्थान दर्ज करें';
  };

  const fullQuestions = useMemo(() => {
    const parts = [];
    if (type === 'DOSHA_NIVARAN' && doshas.length) parts.push(`दोष: ${doshas.join(', ')}`);
    if (questions.trim()) parts.push(questions.trim());
    return parts.join('\n');
  }, [type, doshas, questions]);

  const submit = async () => {
    const next: Errors = {};
    validatePerson(primary, 'primary', next);
    if (type === 'GUNA_MILAN') validatePerson(partner, 'partner', next);
    if (type === 'GENERAL_QUERY' && questions.trim().length < 5) {
      next.questions = 'कृपया अपना प्रश्न कम से कम 5 अक्षरों में लिखें';
    }
    if (!isValidPhone(phone)) next.phone = 'मान्य 10 अंकों का मोबाइल नंबर दर्ज करें';
    setErrors(next);
    if (Object.keys(next).length) {
      Alert.alert('विवरण अधूरा है', 'कृपया लाल रंग में हाइलाइट किए गए फ़ील्ड भरें।');
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.submitKundli({
        type,
        primaryPerson: {
          ...primary,
          fullName: primary.fullName.trim(),
          placeOfBirth: primary.placeOfBirth.trim(),
        },
        partnerPerson:
          type === 'GUNA_MILAN'
            ? {
                ...partner,
                fullName: partner.fullName.trim(),
                placeOfBirth: partner.placeOfBirth.trim(),
              }
            : undefined,
        questions: fullQuestions,
        contactPhone: phone,
        preferredLanguage: language,
        paymentMethod: fee > 0 ? paymentMethod : 'PAY_LATER',
      });
      setSubmitted(created);
      setPaid(created.paymentStatus === 'PAID');
      if (created.paymentMethod === 'ONLINE' && created.paymentUrl) {
        setPaid(await openPayment(created.paymentUrl, 'kundli', created.requestId));
      }
    } catch (e: any) {
      Alert.alert('अनुरोध भेजने में त्रुटि', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(null);
    setPrimary(emptyPerson());
    setPartner({ ...emptyPerson(), gender: 'FEMALE' });
    setQuestions('');
    setDoshas([]);
    setErrors({});
  };

  const payPending = async () => {
    if (!submitted) return;
    setSubmitting(true);
    try {
      const url = submitted.paymentUrl || (await api.payNow('kundli', submitted.requestId)).paymentUrl;
      setPaid(await openPayment(url, 'kundli', submitted.requestId));
    } catch (e: any) {
      Alert.alert('भुगतान', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppBackground variant="golden">
      <AppHeader
        title="कुंडली एवं ज्योतिष"
        subtitle="आचार्य जी द्वारा जन्मपत्री परामर्श"
        onNotificationPress={onNotificationPress}
      />
      <View style={styles.flex}>
        <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {submitted ? (
            <Card style={styles.success}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={36} color="#15803D" />
              </View>
              <Text style={styles.successTitle}>विवरण आचार्य जी को प्राप्त हुआ</Text>
              <View style={styles.requestIdBadge}>
                <Text style={styles.requestIdText}>अनुरोध संख्या: #{submitted.requestId}</Text>
              </View>
              <Text style={styles.successText}>
                {submitted.paymentMethod === 'ONLINE' && !paid
                  ? 'कृपया दक्षिणा भुगतान पूर्ण करें ताकि आचार्य जी आपकी जन्मपत्री का अध्ययन शुरू कर सकें।'
                  : 'आचार्य जी आपकी जन्मपत्री का गहन अध्ययन कर ऐप में उपाय व फलादेश भेजेंगे। आवश्यकता होने पर आपको कॉल भी किया जाएगा।'}
              </Text>
              {submitted.paymentMethod === 'ONLINE' && !paid ? (
                <Button
                  title={`दक्षिणा दें • ${rupees(submitted.amount)}`}
                  onPress={payPending}
                  loading={submitting}
                  style={styles.full}
                />
              ) : null}
              <Button
                title="मेरे पिछले परामर्श देखें"
                variant="outline"
                onPress={onViewRequests}
                style={styles.full}
              />
              <Button title="नया परामर्श भेजें" variant="ghost" onPress={reset} style={styles.full} />
            </Card>
          ) : (
            <>
              {/* TOP SACRED BANNER / TRUST INTRO */}
              <View style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroAvatar}>
                    <Text style={styles.heroOm}>ॐ</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.heroTitle}>वैदिक जन्मपत्री परामर्श</Text>
                    <Text style={styles.heroSub}>आचार्य रजनीश शर्मा जी द्वारा सटीक फलादेश</Text>
                  </View>
                  <TouchableOpacity
                    onPress={onViewRequests}
                    style={styles.historyBtn}
                    activeOpacity={0.8}
                  >
                    <History size={14} color="#C65D24" />
                    <Text style={styles.historyBtnText}>इतिहास</Text>
                  </TouchableOpacity>
                </View>

                {/* Trust Badges Row */}
                <View style={styles.trustRow}>
                  {TRUST.map(({ icon: Icon, label }) => (
                    <View key={label} style={styles.trustPill}>
                      <Icon size={12} color="#C65D24" />
                      <Text style={styles.trustText}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* STEP 1: CHOOSE CONSULTATION */}
              <StepHeader
                n={1}
                title="परामर्श का प्रकार चुनें"
                subtitle="जिस विषय पर मार्गदर्शन चाहिए, उसका चयन करें"
              />
              <View style={styles.typeListContainer}>
                {TYPES.map(({ type: t, icon: Icon, title: tTitle, hint }, i) => {
                  const active = t === type;
                  const tf = settings ? settings.kundliFees[t] : undefined;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setType(t)}
                      activeOpacity={0.85}
                      style={[
                        styles.typeCard,
                        active && styles.typeCardActive,
                        i < TYPES.length - 1 && styles.typeCardBorder,
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                    >
                      <View style={[styles.typeIconBox, active && styles.typeIconBoxActive]}>
                        <Icon size={18} color={active ? '#FFFFFF' : '#C65D24'} />
                      </View>
                      <View style={styles.flex}>
                        <Text style={[styles.typeTitle, active && styles.typeTitleActive]} numberOfLines={1}>
                          {tTitle}
                        </Text>
                        <Text style={styles.typeHint} numberOfLines={2}>
                          {hint}
                        </Text>
                      </View>
                      <View style={styles.typeRight}>
                        <Text style={[styles.typeFee, active && styles.typeFeeActive]}>
                          {tf === undefined ? '' : tf ? rupees(tf) : 'निःशुल्क'}
                        </Text>
                        <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                          {active ? <View style={styles.radioInner} /> : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* STEP 2: BIRTH DETAILS */}
              <StepHeader
                n={2}
                title="जन्म विवरण"
                subtitle="सटीक लग्न व ग्रह गणना हेतु शुद्ध समय दर्ज करें"
              />
              <View style={styles.formCard}>
                {canUseMine ? (
                  <TouchableOpacity onPress={fillMine} style={styles.fillMineBtn} activeOpacity={0.8}>
                    <Sparkles size={14} color="#C65D24" />
                    <Text style={styles.fillMineText}>मेरी प्रोफ़ाइल का जन्म विवरण स्वतः भरें</Text>
                  </TouchableOpacity>
                ) : null}

                <PersonForm
                  title={type === 'GUNA_MILAN' ? 'वर (लड़का) का विवरण' : 'आपका जन्म विवरण'}
                  value={primary}
                  onChange={setPrimary}
                  errors={errors}
                  prefix="primary"
                />

                {type === 'GUNA_MILAN' ? (
                  <View style={styles.partnerFormDivider}>
                    <PersonForm
                      title="वधू (लड़की) का विवरण"
                      value={partner}
                      onChange={setPartner}
                      errors={errors}
                      prefix="partner"
                    />
                  </View>
                ) : null}
              </View>

              {/* DOSHA CHIPS (IF DOSHA NIVARAN SELECTED) */}
              {type === 'DOSHA_NIVARAN' ? (
                <View style={styles.formCard}>
                  <SectionTitle title="संबंधित दोष या समस्या चुनें" />
                  <View style={styles.doshaWrap}>
                    {DOSHAS.map((d) => {
                      const active = doshas.includes(d);
                      return (
                        <TouchableOpacity
                          key={d}
                          onPress={() =>
                            setDoshas((prev) =>
                              active ? prev.filter((x) => x !== d) : [...prev, d]
                            )
                          }
                          style={[styles.doshaChip, active && styles.doshaChipActive]}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.doshaChipText, active && styles.doshaChipTextActive]}>
                            {d}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {/* STEP 3: QUESTION & CONTACT */}
              <StepHeader
                n={3}
                title="आपका प्रश्न एवं संपर्क"
                subtitle="आचार्य जी से पूछने के लिए प्रश्न व उत्तर की भाषा"
              />
              <View style={styles.formCard}>
                <Field
                  label={
                    type === 'GENERAL_QUERY'
                      ? 'आपका मुख्य प्रश्न (अनिवार्य)'
                      : 'आचार्य जी के लिए विशेष प्रश्न (वैकल्पिक)'
                  }
                  required={type === 'GENERAL_QUERY'}
                  value={questions}
                  onChangeText={setQuestions}
                  multiline
                  maxLength={1800}
                  style={styles.multiline}
                  error={errors.questions}
                  placeholder="विवाह, नौकरी, व्यापार, स्वास्थ्य, संपत्ति या किसी विशेष समस्या का विवरण लिखें..."
                />
                <Field
                  label="संपर्क मोबाइल नंबर (Contact Number)"
                  required
                  prefix="+91"
                  value={phone}
                  onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="10 अंकों का मोबाइल नंबर"
                  error={errors.phone}
                />
                <Chips
                  label="परामर्श की भाषा (Language)"
                  value={language}
                  onChange={setLanguage}
                  options={[
                    { value: 'HINDI', label: 'हिंदी (Hindi)' },
                    { value: 'ENGLISH', label: 'English' },
                  ]}
                />
                {fee > 0 ? (
                  <Chips
                    label="दक्षिणा विकल्प (Payment Option)"
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    options={[
                      { value: 'ONLINE', label: `अभी ऑनलाइन दें (${rupees(fee)})` },
                      ...(settings?.allowPayLater
                        ? [{ value: 'PAY_LATER' as const, label: 'बाद में दें (Pay Later)' }]
                        : []),
                    ]}
                  />
                ) : null}
              </View>

              {/* REASSURING SUMMARY BOX */}
              <View style={styles.summaryBox}>
                <View style={styles.summaryTop}>
                  <View style={styles.flex}>
                    <Text style={styles.summaryLabel}>
                      {TYPES.find((x) => x.type === type)?.title || KUNDLI_TYPE_LABELS[type]}
                    </Text>
                    <Text style={styles.summaryNote}>आचार्य रजनीश शर्मा जी द्वारा व्यक्तिगत अध्ययन</Text>
                  </View>
                  <Text style={styles.summaryFee}>{fee > 0 ? rupees(fee) : 'निःशुल्क'}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.privacyRow}>
                  <Lock size={12} color="#786B60" />
                  <Text style={styles.privacyText}>
                    आपकी जन्मपत्री विवरण केवल आचार्य जी के पास 100% सुरक्षित रहता है।
                  </Text>
                </View>
              </View>

              {/* SUBMIT BUTTON */}
              <Button
                title="आचार्य जी को विवरण भेजें"
                onPress={submit}
                loading={submitting}
                style={styles.submitBtn}
              />

              <View style={styles.bottomSpacing} />
            </>
          )}
        </KeyboardAwareScrollView>
      </View>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 56 },

  // Hero Card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EBE3D8',
    marginBottom: 16,
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FDF2E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F3DCB0',
  },
  heroOm: {
    fontSize: 22,
    color: '#C65D24',
    lineHeight: 30,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2A170F',
  },
  heroSub: {
    fontSize: 11.5,
    color: '#786B60',
    marginTop: 1,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0E5D4',
  },
  historyBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C65D24',
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5EEE6',
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F0E8DE',
  },
  trustText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#554A41',
  },

  // Steps
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    marginTop: 8,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#C65D24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A170F',
  },
  stepSub: {
    fontSize: 11,
    color: '#8C7E72',
    marginTop: 1,
  },

  // Type Selector
  typeListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EBE3D8',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  typeCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F4EFEA',
  },
  typeCardActive: {
    backgroundColor: '#FFF9F4',
  },
  typeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FAF2EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F5DCB5',
  },
  typeIconBoxActive: {
    backgroundColor: '#C65D24',
    borderColor: '#C65D24',
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2A170F',
  },
  typeTitleActive: {
    color: '#C65D24',
    fontWeight: '700',
  },
  typeHint: {
    fontSize: 11,
    lineHeight: 15,
    color: '#786B60',
    marginTop: 2,
  },
  typeRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  typeFee: {
    fontSize: 13,
    fontWeight: '700',
    color: '#786B60',
  },
  typeFeeActive: {
    color: '#C65D24',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D4C8BC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#C65D24',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#C65D24',
  },

  // Form Card
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EBE3D8',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  personFormBlock: {
    gap: 2,
  },
  partnerFormDivider: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F2E8DC',
  },
  fillMineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF3EB',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F5DDC7',
    marginBottom: 12,
  },
  fillMineText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#C65D24',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E8DE',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A170F',
  },
  switchSub: {
    fontSize: 10,
    color: '#786B60',
    marginTop: 1,
  },

  // Doshas
  doshaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  doshaChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8DED2',
    backgroundColor: '#FAF7F2',
  },
  doshaChipActive: {
    borderColor: '#C65D24',
    backgroundColor: '#FEF3EB',
  },
  doshaChipText: {
    fontSize: 12,
    color: '#554A41',
    fontWeight: '500',
  },
  doshaChipTextActive: {
    color: '#C65D24',
    fontWeight: '600',
  },

  multiline: {
    minHeight: 85,
    textAlignVertical: 'top',
  },

  // Summary Box
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBE3D8',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#382016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A170F',
  },
  summaryNote: {
    fontSize: 11,
    color: '#786B60',
    marginTop: 2,
  },
  summaryFee: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C65D24',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F3EADB',
    marginVertical: 10,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  privacyText: {
    fontSize: 11,
    color: '#786B60',
    flex: 1,
    lineHeight: 15,
  },

  submitBtn: {
    marginTop: 4,
    borderRadius: 14,
    backgroundColor: '#C65D24',
    paddingVertical: 13,
  },
  bottomSpacing: {
    height: 24,
  },

  // Success Card
  success: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE3D8',
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F4EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C6E8CF',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2A170F',
    textAlign: 'center',
  },
  requestIdBadge: {
    backgroundColor: '#FAF5ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0E5D4',
    marginTop: 8,
  },
  requestIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C65D24',
  },
  successText: {
    fontSize: 13,
    color: '#554A41',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 19,
  },
  full: {
    marginTop: 12,
    alignSelf: 'stretch',
    borderRadius: 12,
  },
});
