import React, { useMemo, useState } from 'react';
import { KeyboardAwareScrollView } from '../components/ui/KeyboardAwareScrollView';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { Button, Chips, DateField, Field, SectionTitle } from '../components/ui';
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
    if (form.name.trim().length < 2) next.name = 'Please enter your full name';
    if (!isValidPhone(form.phone)) next.phone = 'Enter a valid 10-digit mobile number';
    if (form.email && !isValidEmail(form.email)) next.email = 'Enter a valid email';
    if (!form.gender) next.gender = 'Please select gender';
    if (!form.dateOfBirth) next.dateOfBirth = 'Date of birth is required';
    if (form.address.trim().length < 5) next.address = 'Please enter your full address';
    if (form.city.trim().length < 2) next.city = 'City is required';
    if (form.state.trim().length < 2) next.state = 'State is required';
    if (!isValidPin(form.pinCode)) next.pinCode = 'Enter a valid 6-digit PIN code';
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
        gotra: form.gotra.trim(),
        rashi: form.rashi.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pinCode: form.pinCode.trim(),
      });
      onDone?.();
    } catch (e: any) {
      Alert.alert('Could not save', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.flex}>
        <View style={styles.header}>
          {mode === 'edit' ? (
            <TouchableOpacity onPress={onDone} style={styles.back} accessibilityLabel="Go back">
              <ChevronLeft size={22} color={THEME.colors.heading} />
            </TouchableOpacity>
          ) : null}
          <View style={styles.flex}>
            <Text style={styles.title}>{mode === 'setup' ? 'Complete your profile' : 'Edit profile'}</Text>
            <Text style={styles.subtitle}>
              {mode === 'setup'
                ? 'Pandit Ji needs these details for your sankalp, bookings and kundli.'
                : 'Keep your details up to date for accurate sankalp and delivery.'}
            </Text>
          </View>
        </View>

        <KeyboardAwareScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SectionTitle title="Personal details" />
          <Field label="Full name" required value={form.name} onChangeText={set('name')} error={errors.name} placeholder="As used in sankalp" autoComplete="name" />
          <Field
            label="Mobile number"
            required
            prefix="+91"
            value={form.phone}
            onChangeText={(v) => set('phone')(v.replace(/\D/g, '').slice(0, 10))}
            editable={!phoneLocked}
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.phone}
            hint={phoneLocked ? 'Verified login number' : 'Pandit Ji will contact you on this number'}
          />
          <Field
            label="Email"
            value={form.email}
            onChangeText={set('email')}
            editable={!emailLocked}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            placeholder="Optional"
            hint={emailLocked ? 'Login email' : undefined}
          />
          <Chips
            label="Gender *"
            value={form.gender}
            onChange={set('gender')}
            error={errors.gender}
            options={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'OTHER', label: 'Other' },
            ]}
          />

          <SectionTitle title="Birth details" subtitle="Used for kundli and muhurat. Time and place are optional." />
          <DateField label="Date of birth" required value={form.dateOfBirth} onChange={set('dateOfBirth')} error={errors.dateOfBirth} maximumDate={new Date()} minimumDate={new Date(1920, 0, 1)} />
          <DateField label="Time of birth" mode="time" value={form.timeOfBirth} onChange={set('timeOfBirth')} placeholder="Optional" />
          <Field label="Place of birth" value={form.placeOfBirth} onChangeText={set('placeOfBirth')} placeholder="City, State" />
          <Field label="Gotra" value={form.gotra} onChangeText={set('gotra')} placeholder="e.g. Kashyap (leave blank if unknown)" />
          <Field label="Rashi" value={form.rashi} onChangeText={set('rashi')} placeholder="Optional" />

          <SectionTitle title="Address" subtitle="For puja at home and puja kit delivery." />
          <Field
            label="House / Street / Area"
            required
            value={form.address}
            onChangeText={set('address')}
            error={errors.address}
            multiline
            placeholder="Full address with landmark"
            style={styles.multiline}
          />
          <Field label="City" required value={form.city} onChangeText={set('city')} error={errors.city} />
          <Field
            label="State"
            required
            value={form.state}
            onChangeText={(v) => {
              set('state')(v);
              setStateQuery(v);
            }}
            error={errors.state}
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
          />

          <Button title={mode === 'setup' ? 'Save & Continue' : 'Save Changes'} onPress={save} loading={saving} style={styles.save} />
          {mode === 'setup' ? <Button title="Logout" variant="ghost" onPress={logout} /> : null}
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: THEME.colors.primaryBg },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 8 },
  back: { padding: 4, marginTop: 2 },
  title: { fontSize: 22, fontWeight: '800', color: THEME.colors.heading, letterSpacing: -0.2 },
  subtitle: { fontSize: 13, color: THEME.colors.bodyText, marginTop: 4 },
  scroll: { padding: 20, paddingBottom: 48 },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  suggestions: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: THEME.colors.border, marginTop: -8, marginBottom: 14 },
  suggestion: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: THEME.colors.borderLight },
  suggestionText: { color: THEME.colors.heading },
  save: { marginTop: 8 },
});
