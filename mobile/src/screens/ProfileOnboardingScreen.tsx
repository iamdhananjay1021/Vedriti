import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Compass, MapPin, ShieldCheck, User } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { Button, Chips, DateField, Field } from '../components/ui';
import { KeyboardAwareScrollView } from '../components/ui/KeyboardAwareScrollView';
import { useAuth } from '../context/AuthContext';
import type { Gender } from '../types/api';
import { isValidPhone, isValidPin, localPhone } from '../utils/format';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman & Nicobar', 'Chandigarh',
  'Dadra & Nagar Haveli and Daman & Diu', 'Lakshadweep',
];

const POPULAR_GOTRAS = ['कश्यप', 'भारद्वाज', 'वशिष्ठ', 'गर्ग', 'गौतम', 'शांडिल्य', 'पराशर', 'कौशिक'];

const STEP_TITLES = ['About you', 'Birth details', 'Delivery address'];

type Errors = Partial<Record<string, string>>;

interface Props {
  onSkip: () => void;
}

export const ProfileOnboardingScreen: React.FC<Props> = ({ onSkip }) => {
  const { user, updateProfile, logout } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [stateQuery, setStateQuery] = useState('');

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: localPhone(user?.phone || ''),
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

  const needsPhone = !user?.phone;

  const set = (key: keyof typeof form) => (value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const stateMatches = useMemo(() => {
    const q = stateQuery.trim().toLowerCase();
    if (!q) return [];
    return INDIAN_STATES.filter((s) => s.toLowerCase().includes(q)).slice(0, 5);
  }, [stateQuery]);

  const validate = (current: number) => {
    const next: Errors = {};
    if (current === 1) {
      if (form.name.trim().length < 2) next.name = 'Please enter your full name';
      if (needsPhone && !isValidPhone(form.phone)) next.phone = 'Enter a valid 10-digit mobile number';
      if (!form.gender) next.gender = 'Choose one';
      if (!form.dateOfBirth) next.dateOfBirth = 'Date of birth is required';
    }
    if (current === 3) {
      if (form.address.trim().length < 5) next.address = 'Enter your full address with a landmark';
      if (form.city.trim().length < 2) next.city = 'City is required';
      if (form.state.trim().length < 2) next.state = 'State is required';
      if (!isValidPin(form.pinCode)) next.pinCode = 'Enter a valid 6-digit PIN code';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const payloadFor = (current: number) => {
    if (current === 1) {
      return {
        name: form.name.trim(),
        ...(needsPhone ? { phone: form.phone } : {}),
        gender: form.gender as Gender,
        dateOfBirth: form.dateOfBirth,
      };
    }
    if (current === 2) {
      return { timeOfBirth: form.timeOfBirth, placeOfBirth: form.placeOfBirth.trim(), gotra: form.gotra.trim(), rashi: form.rashi.trim() };
    }
    return { address: form.address.trim(), city: form.city.trim(), state: form.state.trim(), pinCode: form.pinCode.trim() };
  };

  const next = async () => {
    if (!validate(step)) return;
    setSaving(true);
    try {
      await updateProfile(payloadFor(step));
      if (step < 3) setStep(step + 1);
    } catch (e: any) {
      Alert.alert('Could not save', e.message);
    } finally {
      setSaving(false);
    }
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const renderIntro = () => (
    <View style={styles.introWrap}>
      <View style={styles.introBadge}>
        <ShieldCheck size={28} color={C.primarySaffron} />
      </View>
      <Text style={styles.introTitle}>Complete your profile</Text>
      <Text style={styles.introSub}>A few quick details help Pandit Ji prepare your sankalp, kundli and deliveries. It takes about a minute.</Text>

      <View style={styles.points}>
        {[
          { icon: User, title: 'About you', text: 'Name and date of birth for your sankalp' },
          { icon: Compass, title: 'Birth details', text: 'Optional, helps with kundli and muhurat' },
          { icon: MapPin, title: 'Delivery address', text: 'For puja kits and pujas at your home' },
        ].map(({ icon: Icon, title, text }) => (
          <View key={title} style={styles.point}>
            <View style={styles.pointIcon}>
              <Icon size={18} color={C.primarySaffron} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.pointTitle}>{title}</Text>
              <Text style={styles.pointText}>{text}</Text>
            </View>
          </View>
        ))}
      </View>

      <Button title="Complete now" onPress={() => setStep(1)} style={styles.primary} />
      <Button title="I'll do it later" variant="outline" onPress={onSkip} style={styles.secondary} />
      <Text style={styles.note}>You can finish this any time from Account. We will ask again when you book a puja.</Text>
    </View>
  );

  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          <Field label="Full name" required value={form.name} onChangeText={set('name')} error={errors.name} placeholder="Name used in your sankalp" autoComplete="name" />
          {needsPhone ? (
            <Field
              label="Mobile number"
              required
              prefix="+91"
              value={form.phone}
              onChangeText={(v) => set('phone')(v.replace(/\D/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.phone}
              hint="Pandit Ji will contact you on this number"
            />
          ) : null}
          <Chips
            label="Gender"
            value={form.gender}
            onChange={set('gender')}
            error={errors.gender}
            options={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />
          <DateField
            label="Date of birth"
            required
            value={form.dateOfBirth}
            onChange={set('dateOfBirth')}
            error={errors.dateOfBirth}
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
          />
        </>
      );
    }
    if (step === 2) {
      return (
        <>
          <Text style={styles.optional}>All optional. You can skip this step.</Text>
          <DateField label="Time of birth" mode="time" value={form.timeOfBirth} onChange={set('timeOfBirth')} placeholder="If you know it" />
          <Field label="Place of birth" value={form.placeOfBirth} onChangeText={set('placeOfBirth')} placeholder="e.g. Lucknow, Uttar Pradesh" />
          <Field label="Gotra" value={form.gotra} onChangeText={set('gotra')} placeholder="e.g. Kashyap (tap a gotra below)" />
          <View style={styles.chipsWrap}>
            {POPULAR_GOTRAS.map((g) => {
              const on = form.gotra === g;
              return (
                <TouchableOpacity key={g} onPress={() => set('gotra')(g)} style={[styles.chip, on && styles.chipOn]} accessibilityRole="button">
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{g}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Field label="Janma rashi" value={form.rashi} onChangeText={set('rashi')} placeholder="e.g. Mesh, Vrishabh" />
        </>
      );
    }
    return (
      <>
        <Field
          label="Full address"
          required
          value={form.address}
          onChangeText={set('address')}
          error={errors.address}
          multiline
          placeholder="House, street, area and landmark"
          style={styles.multiline}
        />
        <Field label="City" required value={form.city} onChangeText={set('city')} error={errors.city} placeholder="e.g. Lucknow" />
        <Field
          label="State"
          required
          value={form.state}
          onChangeText={(v) => {
            set('state')(v);
            setStateQuery(v);
          }}
          error={errors.state}
          placeholder="e.g. Uttar Pradesh"
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
          label="PIN code"
          required
          value={form.pinCode}
          onChangeText={(v) => set('pinCode')(v.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          error={errors.pinCode}
          placeholder="6-digit PIN code"
        />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      {step === 0 ? (
        <KeyboardAwareScrollView contentContainerStyle={styles.scroll}>
          {renderIntro()}
          <TouchableOpacity onPress={logout} style={styles.logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      ) : (
        <View style={styles.flex}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={back} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Back">
              <ArrowLeft size={20} color={C.heading} />
            </TouchableOpacity>
            <View style={styles.progress}>
              {[1, 2, 3].map((n) => (
                <View key={n} style={[styles.bar, n <= step && styles.barOn]} />
              ))}
            </View>
            <TouchableOpacity onPress={onSkip} hitSlop={8}>
              <Text style={styles.skip}>Skip</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAwareScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.stepCount}>Step {step} of 3</Text>
            <Text style={styles.stepTitle}>{STEP_TITLES[step - 1]}</Text>
            <View style={styles.form}>{renderStep()}</View>
          </KeyboardAwareScrollView>

          <View style={styles.footer}>
            <Button title={step === 3 ? 'Finish' : 'Next'} onPress={next} loading={saving} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const C = THEME.colors;
const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: '#FFF8EE' },
  scroll: { padding: 20, paddingBottom: 32, flexGrow: 1 },
  introWrap: { flex: 1, justifyContent: 'center' },
  introBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FDF3E7', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  introTitle: { fontSize: 28, fontWeight: '800', color: C.heading, letterSpacing: -0.4 },
  introSub: { fontSize: 14.5, lineHeight: 21, color: C.bodyText, marginTop: 8 },
  points: { marginTop: 24, marginBottom: 28, gap: 12 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#EFE3D0', padding: 14 },
  pointIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FDF3E7', alignItems: 'center', justifyContent: 'center' },
  pointTitle: { fontSize: 15, fontWeight: '800', color: C.heading },
  pointText: { fontSize: 12.5, color: C.mutedText, marginTop: 2 },
  primary: { alignSelf: 'stretch' },
  secondary: { alignSelf: 'stretch', marginTop: 10 },
  note: { fontSize: 12.5, color: C.mutedText, textAlign: 'center', marginTop: 14, lineHeight: 18 },
  logout: { alignSelf: 'center', paddingVertical: 12 },
  logoutText: { color: C.mutedText, fontWeight: '700', fontSize: 13.5 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#EFE3D0', alignItems: 'center', justifyContent: 'center' },
  progress: { flex: 1, flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#EBDFCB' },
  barOn: { backgroundColor: C.primarySaffron },
  skip: { color: C.mutedText, fontWeight: '800', fontSize: 14, paddingHorizontal: 4 },
  stepCount: { fontSize: 12.5, fontWeight: '800', color: C.primarySaffron, letterSpacing: 0.4, textTransform: 'uppercase' },
  stepTitle: { fontSize: 26, fontWeight: '800', color: C.heading, letterSpacing: -0.3, marginTop: 4, marginBottom: 18 },
  form: { gap: 2 },
  optional: { fontSize: 13, color: C.mutedText, marginBottom: 12 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14, marginTop: -2 },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E8DCC9', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipOn: { backgroundColor: C.primarySaffron, borderColor: C.primarySaffron },
  chipText: { fontSize: 13, fontWeight: '700', color: '#44403C' },
  chipTextOn: { color: '#FFFFFF' },
  multiline: { minHeight: 76, textAlignVertical: 'top' },
  suggestions: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#EFE3D0', marginTop: -6, marginBottom: 14, overflow: 'hidden' },
  suggestion: { paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F3E9DD' },
  suggestionText: { color: C.heading, fontSize: 14, fontWeight: '600' },
  footer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, backgroundColor: '#FFF8EE' },
});
