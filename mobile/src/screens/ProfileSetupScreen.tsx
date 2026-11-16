import React, { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Compass, MapPin, Sparkles, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../constants/theme';
import { RADIUS, SPACE } from '../constants/ui';
import { Button, Chips, DateField, Field } from '../components/ui';
import { KeyboardAwareScrollView } from '../components/ui/KeyboardAwareScrollView';
import { useAuth } from '../context/AuthContext';
import type { Gender } from '../types/api';
import { isValidEmail, isValidPhone, isValidPin, localPhone } from '../utils/format';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman & Nicobar', 'Chandigarh',
  'Dadra & Nagar Haveli and Daman & Diu', 'Lakshadweep',
];

const POPULAR_GOTRAS = ['कश्यप', 'भारद्वाज', 'वशिष्ठ', 'गर्ग', 'गौतम', 'शांडिल्य', 'पराशर', 'कौशिक'];

interface Props {
  mode: 'setup' | 'edit';
  onDone?: () => void;
}

type Errors = Partial<Record<string, string>>;

export const ProfileSetupScreen: React.FC<Props> = ({ mode, onDone }) => {
  const { user, updateProfile, logout } = useAuth();
  const phoneLocked = user?.authProvider === 'phone';
  const emailLocked = user?.authProvider === 'email';

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: localPhone(user?.phone || ''),
    email: user?.email || '',
    gender: (user?.gender || null) as Gender | null,
    dateOfBirth: user?.dateOfBirth || '',
    timeOfBirth: user?.timeOfBirth || '',
    placeOfBirth: user?.placeOfBirth || '',
    gotra: user?.gotra || '',
    rashi: user?.rashi || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pinCode: user?.pinCode || '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [stateQuery, setStateQuery] = useState('');

  const set = (key: keyof typeof form) => (value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const stateMatches = useMemo(() => {
    const q = stateQuery.trim().toLowerCase();
    if (!q) return [];
    return INDIAN_STATES.filter((s) => s.toLowerCase().includes(q)).slice(0, 5);
  }, [stateQuery]);

  const validate = () => {
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = 'कृपया यजमान का पूरा नाम लिखें';
    if (!isValidPhone(form.phone)) next.phone = 'मान्य 10-अंकीय मोबाइल नंबर दर्ज करें';
    if (form.email && !isValidEmail(form.email)) next.email = 'मान्य ईमेल पता दर्ज करें';
    if (!form.gender) next.gender = 'लिंग चुनें';
    if (!form.dateOfBirth) next.dateOfBirth = 'जन्म तिथि आवश्यक है';
    if (form.address.trim().length < 5) next.address = 'कृपया पूरा पता एवं लैंडमार्क लिखें';
    if (form.city.trim().length < 2) next.city = 'शहर आवश्यक है';
    if (form.state.trim().length < 2) next.state = 'राज्य आवश्यक है';
    if (!isValidPin(form.pinCode)) next.pinCode = 'मान्य 6-अंकीय पिन कोड दर्ज करें';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        ...(phoneLocked ? {} : { phone: form.phone }),
        ...(emailLocked ? {} : { email: form.email.trim() }),
        gender: form.gender as Gender,
        dateOfBirth: form.dateOfBirth,
        timeOfBirth: form.timeOfBirth,
        placeOfBirth: form.placeOfBirth.trim(),
        gotra: form.gotra.trim() || 'कश्यप',
        rashi: form.rashi.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pinCode: form.pinCode.trim(),
      });
      onDone?.();
    } catch (e: any) {
      Alert.alert('त्रुटि', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.flex}>
        {/* TOP APP HEADER */}
        <View style={styles.header}>
          {mode === 'edit' ? (
            <TouchableOpacity onPress={onDone} style={styles.backBtn} accessibilityLabel="Go back">
              <ChevronLeft size={22} color={THEME.colors.heading} />
            </TouchableOpacity>
          ) : null}
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>
              {mode === 'setup' ? 'यजमान प्रोफ़ाइल पूर्ण करें' : 'यजमान विवरण संपादित करें'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {mode === 'setup'
                ? 'संकल्प, पूजा अनुष्ठान और जन्मकुंडली हेतु आवश्यक वैदिक विवरण भरें।'
                : 'सटीक संकल्प एवं पूजा सामग्री डिलीवरी हेतु अपना विवरण अद्यतन रखें।'}
            </Text>
          </View>
        </View>

        <KeyboardAwareScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* SECTION 1: PERSONAL DETAILS */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: '#FFEDD5' }]}>
                <User size={16} color="#C65D24" />
              </View>
              <Text style={styles.cardTitle}>व्यक्तिगत परिचय (Personal Details)</Text>
            </View>

            <Field
              label="यजमान का पूरा नाम *"
              required
              value={form.name}
              onChangeText={set('name')}
              error={errors.name}
              placeholder="संकल्प में प्रयुक्त पूरा नाम"
              autoComplete="name"
            />

            <Field
              label="मोबाइल नंबर *"
              required
              prefix="+91"
              value={form.phone}
              onChangeText={(v) => set('phone')(v.replace(/\D/g, '').slice(0, 10))}
              editable={!phoneLocked}
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.phone}
              hint={phoneLocked ? 'सत्यापित लॉगिन नंबर' : 'पंडित जी इसी नंबर पर संपर्क करेंगे'}
            />

            <Field
              label="ईमेल (Email ID)"
              value={form.email}
              onChangeText={set('email')}
              editable={!emailLocked}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              placeholder="वैकल्पिक (Optional)"
              hint={emailLocked ? 'लॉगिन ईमेल' : undefined}
            />

            <Chips
              label="लिंग (Gender) *"
              value={form.gender}
              onChange={set('gender')}
              error={errors.gender}
              options={[
                { value: 'MALE', label: 'पुरुष (Male)' },
                { value: 'FEMALE', label: 'महिला (Female)' },
                { value: 'OTHER', label: 'अन्य (Other)' },
              ]}
            />
          </View>

          {/* SECTION 2: VEDIC & BIRTH DETAILS */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Compass size={16} color="#D97706" />
              </View>
              <View>
                <Text style={styles.cardTitle}>जन्म एवं वैदिक विवरण (Vedic Details)</Text>
                <Text style={styles.cardSubtitle}>संकल्प, कुंडली एवं शुभ मुहूर्त निर्धारण हेतु</Text>
              </View>
            </View>

            <DateField
              label="जन्म तिथि (Date of Birth) *"
              required
              value={form.dateOfBirth}
              onChange={set('dateOfBirth')}
              error={errors.dateOfBirth}
              maximumDate={new Date()}
              minimumDate={new Date(1920, 0, 1)}
            />

            <DateField
              label="जन्म समय (Time of Birth)"
              mode="time"
              value={form.timeOfBirth}
              onChange={set('timeOfBirth')}
              placeholder="वैकल्पिक (Optional)"
            />

            <Field
              label="जन्म स्थान (Place of Birth)"
              value={form.placeOfBirth}
              onChangeText={set('placeOfBirth')}
              placeholder="उदा. लखनऊ, उत्तर प्रदेश"
            />

            {/* Gotra Field with 1-Tap Popular Chips */}
            <Field
              label="गोत्र (Gotra)"
              value={form.gotra}
              onChangeText={set('gotra')}
              placeholder="उदा. कश्यप / भारद्वाज (अज्ञात होने पर कश्यप चुनें)"
            />

            <Text style={styles.gotraChipLabel}>लोकप्रिय गोत्र (1-टैप चुनें):</Text>
            <View style={styles.gotraChipsWrap}>
              {POPULAR_GOTRAS.map((g) => {
                const isSelected = form.gotra === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => set('gotra')(g)}
                    style={[styles.gotraChip, isSelected && styles.gotraChipActive]}
                  >
                    <Text style={[styles.gotraChipText, isSelected && styles.gotraChipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Field
              label="जन्म राशि (Janma Rashi)"
              value={form.rashi}
              onChangeText={set('rashi')}
              placeholder="उदा. मेष / वृषभ / मिथुन (वैकल्पिक)"
            />
          </View>

          {/* SECTION 3: ADDRESS */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <MapPin size={16} color="#15803D" />
              </View>
              <View>
                <Text style={styles.cardTitle}>स्थायी पता (Address for Delivery)</Text>
                <Text style={styles.cardSubtitle}>घर पर पूजा एवं सामग्री किट वितरण हेतु</Text>
              </View>
            </View>

            <Field
              label="मकान / गली / क्षेत्र का पूरा पता *"
              required
              value={form.address}
              onChangeText={set('address')}
              error={errors.address}
              multiline
              placeholder="पूरा पता मय लैंडमार्क / निकटतम स्थान"
              style={styles.multiline}
            />

            <Field
              label="शहर / जिला (City) *"
              required
              value={form.city}
              onChangeText={set('city')}
              error={errors.city}
              placeholder="उदा. लखनऊ"
            />

            <Field
              label="राज्य (State) *"
              required
              value={form.state}
              onChangeText={(v) => {
                set('state')(v);
                setStateQuery(v);
              }}
              error={errors.state}
              placeholder="उदा. Uttar Pradesh"
            />

            {stateMatches.length && !INDIAN_STATES.includes(form.state) ? (
              <View style={styles.suggestions}>
                {stateMatches.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.suggestion}
                    onPress={() => {
                      set('state')(s);
                      setStateQuery('');
                    }}
                  >
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            <Field
              label="पिन कोड (PIN Code) *"
              required
              value={form.pinCode}
              onChangeText={(v) => set('pinCode')(v.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
              error={errors.pinCode}
              placeholder="6-अंकीय पिन कोड"
            />
          </View>

          <Button
            title={mode === 'setup' ? 'सहेजें एवं आगे बढ़ें' : 'परिवर्तन सहेजें (Save Changes)'}
            onPress={save}
            loading={saving}
            style={styles.saveBtn}
          />

          {mode === 'setup' ? (
            <Button title="लॉगआउट" variant="ghost" onPress={logout} style={styles.logoutBtn} />
          ) : null}

          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              Managed by Urbexon Software Solutions LLP
            </Text>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: '#FAF7F2' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE3D0',
  },
  backBtn: {
    padding: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: '#F7EFE3',
    marginTop: 2,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2A170F',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6E6053',
    marginTop: 2,
    lineHeight: 16,
  },
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EFE3D0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#2A170F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E9DD',
    paddingBottom: 10,
    marginBottom: 14,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A170F',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#6E6053',
    marginTop: 1,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  gotraChipLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6E6053',
    marginBottom: 6,
    marginTop: -2,
  },
  gotraChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  gotraChip: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EFE3D0',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  gotraChipActive: {
    backgroundColor: '#C65D24',
    borderColor: '#C65D24',
  },
  gotraChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#44403C',
  },
  gotraChipTextActive: {
    color: '#FFFFFF',
  },
  suggestions: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE3D0',
    marginTop: -8,
    marginBottom: 14,
    overflow: 'hidden',
  },
  suggestion: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E9DD',
  },
  suggestionText: {
    color: '#2A170F',
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: 6,
  },
  logoutBtn: {
    marginTop: 10,
  },
  footerNote: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerNoteText: {
    fontSize: 11,
    color: '#877B70',
    fontWeight: '600',
  },
});
