import React, { useMemo, useState } from 'react';
import { KeyboardAwareScrollView } from '../components/ui/KeyboardAwareScrollView';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle2, Compass, HeartHandshake, Languages, Lock, MessageCircleQuestion, ShieldAlert, UserCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

const TYPES: { type: KundliType; icon: any; hint: string }[] = [
  { type: 'JANAM_KUNDLI', icon: Compass, hint: 'Complete birth chart reading with remedies' },
  { type: 'GUNA_MILAN', icon: HeartHandshake, hint: 'Match making for marriage (36 guna)' },
  { type: 'DOSHA_NIVARAN', icon: ShieldAlert, hint: 'Mangal, Kaal Sarp, Pitra, Shani dosha' },
  { type: 'GENERAL_QUERY', icon: MessageCircleQuestion, hint: 'Ask Pandit Ji any question' },
];

const TRUST = [
  { icon: UserCheck, label: 'Personal reading' },
  { icon: Lock, label: 'Confidential' },
  { icon: Languages, label: 'Hindi / English' },
];

const StepHeader: React.FC<{ n: number; title: string }> = ({ n, title }) => (
  <View style={styles.stepHeader}>
    <View style={styles.stepBadge}>
      <Text style={styles.stepBadgeText}>{n}</Text>
    </View>
    <Text style={styles.stepTitle}>{title}</Text>
  </View>
);

const DOSHAS =['Mangal Dosha', 'Kaal Sarp Dosha', 'Pitra Dosha', 'Shani Sade Sati', 'Not sure'];

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
    <View>
      <SectionTitle title={title} />
      <Field label="Full name" required value={value.fullName} onChangeText={set('fullName')} error={errors[`${prefix}.fullName`]} />
      <Chips
        label="Gender"
        value={value.gender}
        onChange={(g) => set('gender')(g as Gender)}
        options={[
          { value: 'MALE', label: 'Male' },
          { value: 'FEMALE', label: 'Female' },
          { value: 'OTHER', label: 'Other' },
        ]}
      />
      <DateField
        label="Date of birth"
        required
        value={value.dateOfBirth}
        onChange={set('dateOfBirth')}
        error={errors[`${prefix}.dateOfBirth`]}
        maximumDate={new Date()}
        minimumDate={new Date(1920, 0, 1)}
      />
      {!value.timeUnknown ? (
        <DateField label="Time of birth" required mode="time" value={value.timeOfBirth} onChange={set('timeOfBirth')} error={errors[`${prefix}.timeOfBirth`]} />
      ) : null}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>I don't know the exact birth time</Text>
        <Switch
          value={value.timeUnknown}
          onValueChange={(v) => onChange({ ...value, timeUnknown: v, timeOfBirth: v ? '' : value.timeOfBirth })}
          trackColor={{ true: THEME.colors.primarySaffron, false: THEME.colors.border }}
        />
      </View>
      <Field
        label="Place of birth"
        required
        value={value.placeOfBirth}
        onChangeText={set('placeOfBirth')}
        placeholder="City, State"
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
    if (p.fullName.trim().length < 2) next[`${prefix}.fullName`] = 'Full name is required';
    if (!p.dateOfBirth) next[`${prefix}.dateOfBirth`] = 'Date of birth is required';
    if (!p.timeUnknown && !p.timeOfBirth) next[`${prefix}.timeOfBirth`] = 'Select birth time or mark it unknown';
    if (p.placeOfBirth.trim().length < 2) next[`${prefix}.placeOfBirth`] = 'Place of birth is required';
  };

  const fullQuestions = useMemo(() => {
    const parts = [];
    if (type === 'DOSHA_NIVARAN' && doshas.length) parts.push(`Dosha: ${doshas.join(', ')}`);
    if (questions.trim()) parts.push(questions.trim());
    return parts.join('\n');
  }, [type, doshas, questions]);

  const submit = async () => {
    const next: Errors = {};
    validatePerson(primary, 'primary', next);
    if (type === 'GUNA_MILAN') validatePerson(partner, 'partner', next);
    if (type === 'GENERAL_QUERY' && questions.trim().length < 5) next.questions = 'Please write your question';
    if (!isValidPhone(phone)) next.phone = 'Enter a valid 10-digit mobile number';
    setErrors(next);
    if (Object.keys(next).length) {
      Alert.alert('Details missing', 'Please fill the highlighted fields.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.submitKundli({
        type,
        primaryPerson: { ...primary, fullName: primary.fullName.trim(), placeOfBirth: primary.placeOfBirth.trim() },
        partnerPerson: type === 'GUNA_MILAN' ? { ...partner, fullName: partner.fullName.trim(), placeOfBirth: partner.placeOfBirth.trim() } : undefined,
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
      Alert.alert('Could not send', e.message);
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
      Alert.alert('Payment', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppBackground variant="golden">
      <AppHeader title="Kundli & Jyotish" subtitle="Send your details to Pandit Ji" onNotificationPress={onNotificationPress} />
      <View style={styles.flex}>
        <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {submitted ? (
            <Card style={styles.success}>
              <CheckCircle2 size={44} color={THEME.colors.bilvaGreen} />
              <Text style={styles.successTitle}>Details sent to Pandit Ji</Text>
              <Text style={styles.successText}>
                Request ID {submitted.requestId}.{' '}
                {submitted.paymentMethod === 'ONLINE' && !paid
                  ? 'Complete the payment so Pandit Ji can start your analysis.'
                  : 'Pandit Ji will review your kundli and reply here. You will also get a call if needed.'}
              </Text>
              {submitted.paymentMethod === 'ONLINE' && !paid ? (
                <Button title={`Pay ${rupees(submitted.amount)}`} onPress={payPending} loading={submitting} style={styles.full} />
              ) : null}
              <Button title="View my requests" variant="outline" onPress={onViewRequests} style={styles.full} />
              <Button title="Send another request" variant="ghost" onPress={reset} style={styles.full} />
            </Card>
          ) : (
            <>
              <LinearGradient colors={['#F59A45', '#E4702B', '#CF5A22']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
                <View style={styles.heroTop}>
                  <View style={styles.heroOm}>
                    <Text style={styles.heroOmText}>ॐ</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.heroTitle}>Consult Pandit Ji</Text>
                    <Text style={styles.heroSub}>Personal Kundli & Jyotish guidance</Text>
                  </View>
                </View>
                <View style={styles.trustRow}>
                  {TRUST.map(({ icon: Icon, label }) => (
                    <View key={label} style={styles.trustItem}>
                      <Icon size={14} color="#FFFFFF" />
                      <Text style={styles.trustText}>{label}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>

              <StepHeader n={1} title="Choose consultation" />
              <View style={styles.typeList}>
                {TYPES.map(({ type: t, icon: Icon, hint }, i) => {
                  const active = t === type;
                  const tf = settings ? settings.kundliFees[t] : undefined;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setType(t)}
                      activeOpacity={0.8}
                      style={[styles.type, i < TYPES.length - 1 && styles.typeDivider, active && styles.typeActive]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                    >
                      <View style={[styles.typeIcon, active && styles.typeIconActive]}>
                        <Icon size={20} color={active ? '#FFF' : THEME.colors.primarySaffron} />
                      </View>
                      <View style={styles.flex}>
                        <Text style={styles.typeTitle} numberOfLines={1}>{KUNDLI_TYPE_LABELS[t]}</Text>
                        <Text style={styles.typeHint} numberOfLines={2}>{hint}</Text>
                      </View>
                      <View style={styles.typeRight}>
                        <Text style={styles.typeFee}>{tf === undefined ? '' : tf ? rupees(tf) : 'Free'}</Text>
                        <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <StepHeader n={2} title="Birth details" />
              <Card style={styles.formCard}>
                {canUseMine ? (
                  <Button title="Use my birth details" variant="outline" onPress={fillMine} style={styles.mine} />
                ) : null}
                <PersonForm
                  title={type === 'GUNA_MILAN' ? 'Boy / first person' : 'Your details'}
                  value={primary}
                  onChange={setPrimary}
                  errors={errors}
                  prefix="primary"
                />
                {type === 'GUNA_MILAN' ? (
                  <PersonForm title="Girl / second person" value={partner} onChange={setPartner} errors={errors} prefix="partner" />
                ) : null}
              </Card>

              {type === 'DOSHA_NIVARAN' ? (
                <Card style={styles.formCard}>
                  <SectionTitle title="Which dosha?" />
                  <View style={styles.wrap}>
                    {DOSHAS.map((d) => {
                      const active = doshas.includes(d);
                      return (
                        <TouchableOpacity
                          key={d}
                          onPress={() => setDoshas((prev) => (active ? prev.filter((x) => x !== d) : [...prev, d]))}
                          style={[styles.chip, active && styles.chipActive]}
                        >
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>{d}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Card>
              ) : null}

              <StepHeader n={3} title="Your question & contact" />
              <Card style={styles.formCard}>
                <Field
                  label={type === 'GENERAL_QUERY' ? 'Your question' : 'Questions for Pandit Ji (optional)'}
                  required={type === 'GENERAL_QUERY'}
                  value={questions}
                  onChangeText={setQuestions}
                  multiline
                  maxLength={1800}
                  style={styles.multiline}
                  error={errors.questions}
                  placeholder="Career, marriage, health, business, muhurat..."
                />
                <Field
                  label="Contact number"
                  required
                  prefix="+91"
                  value={phone}
                  onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
                  keyboardType="phone-pad"
                  maxLength={10}
                  error={errors.phone}
                />
                <Chips
                  label="Reply language"
                  value={language}
                  onChange={setLanguage}
                  options={[
                    { value: 'HINDI', label: 'Hindi' },
                    { value: 'ENGLISH', label: 'English' },
                  ]}
                />
                {fee > 0 ? (
                  <Chips
                    label="Payment"
                    value={paymentMethod}
                    onChange={setPaymentMethod}
                    options={[
                      { value: 'ONLINE', label: `Pay ${rupees(fee)} now` },
                      ...(settings?.allowPayLater ? [{ value: 'PAY_LATER' as const, label: 'Pay later' }] : []),
                    ]}
                  />
                ) : null}
              </Card>

              <View style={styles.summary}>
                <View style={styles.flex}>
                  <Text style={styles.summaryLabel}>{KUNDLI_TYPE_LABELS[type]}</Text>
                  <Text style={styles.summaryNote}>Reviewed personally by Pandit Ji</Text>
                </View>
                <Text style={styles.summaryFee}>{fee > 0 ? rupees(fee) : 'Free'}</Text>
              </View>
              <Button title="Send to Pandit Ji" onPress={submit} loading={submitting} style={styles.full} />
              <View style={styles.privacy}>
                <Lock size={12} color={THEME.colors.mutedText} />
                <Text style={styles.privacyText}>Your birth details are shared only with Pandit Ji.</Text>
              </View>
            </>
          )}
        </KeyboardAwareScrollView>
      </View>
    </AppBackground>
  );
};

const C = THEME.colors;
const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  hero: { borderRadius: 20, padding: 16, marginBottom: 18 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroOm: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  heroOmText: { fontSize: 26, lineHeight: 40, color: '#FFFFFF', includeFontPadding: false },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 2 },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  trustText: { fontSize: 11.5, fontWeight: '700', color: '#FFFFFF' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: 6 },
  stepBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.primarySaffron, alignItems: 'center', justifyContent: 'center' },
  stepBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  stepTitle: { fontSize: 16, fontWeight: '800', color: C.heading },
  typeList: { backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: C.borderLight, overflow: 'hidden', marginBottom: 14 },
  type: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: '#FFF' },
  typeDivider: { borderBottomWidth: 1, borderBottomColor: C.borderLight },
  typeActive: { backgroundColor: C.softSaffronBg },
  typeIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.softSaffronBg, alignItems: 'center', justifyContent: 'center' },
  typeIconActive: { backgroundColor: C.primarySaffron },
  typeTitle: { fontSize: 15, fontWeight: '800', color: C.heading },
  typeHint: { fontSize: 12, lineHeight: 16, color: C.mutedText, marginTop: 2 },
  typeRight: { alignItems: 'flex-end', gap: 8 },
  typeFee: { fontSize: 14, fontWeight: '800', color: C.primarySaffron },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: C.primarySaffron },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primarySaffron },
  formCard: { marginBottom: 14 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.softSaffronBg, borderRadius: 14, padding: 14, marginTop: 4 },
  summaryLabel: { fontSize: 14, fontWeight: '800', color: C.heading },
  summaryNote: { fontSize: 12, color: C.mutedText, marginTop: 2 },
  summaryFee: { fontSize: 18, fontWeight: '800', color: C.primarySaffron },
  privacy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 12 },
  privacyText: { fontSize: 11.5, color: C.mutedText },
  chipActive: { borderColor: C.primarySaffron, backgroundColor: C.softSaffronBg },
  mine: { marginVertical: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  switchLabel: { fontSize: 13, color: C.bodyText, flex: 1 },
  block: { marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: C.border, backgroundColor: '#FFF' },
  chipText: { fontSize: 13, color: C.bodyText, fontWeight: '600' },
  chipTextActive: { color: C.primarySaffron },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  full: { marginTop: 12, alignSelf: 'stretch' },
  success: { alignItems: 'center', paddingVertical: 28 },
  successTitle: { fontSize: 20, fontWeight: '800', color: C.heading, marginTop: 12 },
  successText: { fontSize: 14, color: C.bodyText, textAlign: 'center', marginTop: 8 },
});
