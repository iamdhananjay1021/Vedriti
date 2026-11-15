import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAwareScrollView } from '../components/ui/KeyboardAwareScrollView';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { BrandMark } from '../components/common/BrandLogo';
import { Button, Field } from '../components/ui';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPhone, localPhone } from '../utils/format';
import { WEBSITE_URL } from '../config/api';

type EmailMode = 'otp' | 'password' | 'signup' | 'forgot';

const EMAIL_TITLES: Record<EmailMode, string> = {
  otp: 'Login / Sign up with email code',
  password: 'Login with password',
  signup: 'Create account',
  forgot: 'Reset password',
};

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

export const LoginScreen: React.FC = () => {
  const { completeLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const codeRef = useRef<TextInput>(null);

  const [phone, setPhone] = useState('');

  const [emailMode, setEmailMode] = useState<EmailMode>('otp');
  const [email, setEmail] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const resetCodes = () => {
    setError(null);
    setDevOtp(undefined);
    setResendIn(0);
    setEmailCode('');
    setEmailCodeSent(false);
    setPassword('');
    setConfirm('');
  };

  const switchEmailMode = (next: EmailMode) => {
    setEmailMode(next);
    resetCodes();
  };

  const run = async (task: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  const focusCode = () => setTimeout(() => codeRef.current?.focus(), 300);

  const needsPhone = emailMode === 'otp' || emailMode === 'signup';

  const sendEmailCode = () => {
    if (!isValidEmail(email)) return setError('Please enter a valid email address');
    if (emailMode === 'signup' && name.trim().length < 2) return setError('Please enter your name');
    if (needsPhone && !isValidPhone(localPhone(phone))) return setError('Please enter a valid 10-digit mobile number');
    run(async () => {
      const res = emailMode === 'forgot' ? await api.forgotPassword(email.trim()) : await api.requestEmailOtp(email.trim(), localPhone(phone));
      if (emailMode === 'signup' && res.isNewUser === false) {
        setEmailMode('otp');
      }
      setEmailCodeSent(true);
      setEmailCode('');
      setDevOtp(res.devOtp);
      setResendIn(res.resendInSeconds);
      focusCode();
    });
  };

  const checkNewPassword = () => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  };

  const submitEmail = () => {
    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) return setError('Please enter a valid email address');

    if (emailMode === 'password') {
      if (!password) return setError('Please enter your password');
      return run(async () => {
        await completeLogin(await api.loginEmail(cleanEmail, password));
      });
    }

    if (!/^\d{4,6}$/.test(emailCode)) return setError('Please enter the code sent to your email');

    if (emailMode === 'otp') {
      return run(async () => {
        await completeLogin(await api.verifyEmailOtp(cleanEmail, localPhone(phone), emailCode));
      });
    }

    const problem = checkNewPassword();
    if (problem) return setError(problem);

    if (emailMode === 'signup') {
      return run(async () => {
        await completeLogin(await api.signupEmail(cleanEmail, localPhone(phone), password, emailCode, name.trim()));
      });
    }

    return run(async () => {
      await completeLogin(await api.resetPassword(cleanEmail, emailCode, password));
    });
  };

  const resendRow = (onChange: () => void, changeLabel: string, onResend: () => void) => (
    <View style={styles.rowBetween}>
      <TouchableOpacity onPress={onChange}>
        <Text style={styles.link}>{changeLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onResend} disabled={resendIn > 0 || loading}>
        <Text style={[styles.link, resendIn > 0 && styles.linkDisabled]}>{resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}</Text>
      </TouchableOpacity>
    </View>
  );

  const passwordFields = (label: string) => (
    <>
      <View>
        <Field
          label={label}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete={emailMode === 'password' ? 'password' : 'new-password'}
          placeholder={emailMode === 'password' ? 'Your password' : 'At least 8 characters'}
        />
        <TouchableOpacity
          style={styles.eye}
          onPress={() => setShowPassword((s) => !s)}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} color={THEME.colors.mutedText} /> : <Eye size={18} color={THEME.colors.mutedText} />}
        </TouchableOpacity>
      </View>
      {emailMode !== 'password' ? (
        <Field
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          placeholder="Re-enter password"
        />
      ) : null}
    </>
  );

  const codeField = (value: string, onChange: (v: string) => void, onComplete?: (v: string) => void) => (
    <>
      <Field
        label="Verification code"
        ref={codeRef}
        value={value}
        onChangeText={(v) => {
          const clean = v.replace(/\D/g, '').slice(0, 6);
          onChange(clean);
          if (clean.length === 6) onComplete?.(clean);
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="6-digit code"
        style={styles.otpInput}
      />
      {devOtp ? <Text style={styles.devHint}>Test code: {devOtp}</Text> : null}
    </>
  );

  const renderEmail = () => {
    const needsCode = emailMode !== 'password';
    const awaitingCode = needsCode && !emailCodeSent;
    return (
      <View>
        <Text style={styles.modeTitle}>{EMAIL_TITLES[emailMode]}</Text>
        {emailMode === 'signup' && !emailCodeSent ? (
          <Field label="Your name" value={name} onChangeText={setName} placeholder="Full name" autoComplete="name" />
        ) : null}
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          editable={!emailCodeSent}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder="you@example.com"
        />
        {needsPhone ? (
          <Field
            label="Mobile number"
            prefix="+91"
            value={phone}
            onChangeText={(v) => setPhone(v.replace(/D/g, '').slice(0, 10))}
            editable={!emailCodeSent}
            keyboardType="phone-pad"
            autoComplete="tel"
            maxLength={10}
            placeholder="10-digit mobile number"
          />
        ) : null}
        {emailCodeSent ? (
          <Text style={styles.info}>
            We sent a 6-digit code to <Text style={styles.bold}>{email.trim()}</Text>. Check your inbox and spam folder.
          </Text>
        ) : null}
        {emailMode === 'otp' && emailCodeSent ? codeField(emailCode, setEmailCode) : null}
        {(emailMode === 'signup' || emailMode === 'forgot') && emailCodeSent ? (
          <>
            {codeField(emailCode, setEmailCode)}
            {passwordFields(emailMode === 'forgot' ? 'New password' : 'Create password')}
          </>
        ) : null}
        {emailMode === 'password' ? passwordFields('Password') : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {awaitingCode ? (
          <Button title="Send code" onPress={sendEmailCode} loading={loading} />
        ) : (
          <Button
            title={emailMode === 'signup' ? 'Create Account' : emailMode === 'forgot' ? 'Reset & Login' : 'Login'}
            onPress={submitEmail}
            loading={loading}
          />
        )}

        {needsCode && emailCodeSent
          ? resendRow(() => {
              setEmailCodeSent(false);
              setEmailCode('');
              setError(null);
            }, 'Change email', sendEmailCode)
          : null}

        <View style={styles.links}>
          {emailMode !== 'password' ? (
            <TouchableOpacity onPress={() => switchEmailMode('password')}>
              <Text style={styles.link}>Login with password</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => switchEmailMode('forgot')}>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>
          )}
          {emailMode !== 'otp' ? (
            <TouchableOpacity onPress={() => switchEmailMode('otp')}>
              <Text style={styles.link}>Login with email code</Text>
            </TouchableOpacity>
          ) : null}
          {emailMode !== 'signup' ? (
            <TouchableOpacity onPress={() => switchEmailMode('signup')}>
              <Text style={styles.link}>Create account with password</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FFF8EC', '#FAF6EE', '#FAF6EE']} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.flex}>
          <KeyboardAwareScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.hero}>
              <BrandMark size={88} />
              <Text style={styles.brand}>VedRit</Text>
              <Text style={styles.tagline}>Book puja, appointments & kundli with Pandit Ji</Text>
            </View>

            <View style={styles.card}>
              {renderEmail()}
            </View>

            <Text style={styles.legal}>
              By continuing you agree to our{' '}
              <Text style={styles.link} onPress={() => Linking.openURL(`${WEBSITE_URL}/privacy-policy`)}>
                Privacy Policy
              </Text>
            </Text>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 24 },
  omCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: THEME.colors.primarySaffron,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: THEME.colors.goldLight,
  },
  om: { fontSize: 50, color: '#FFF8E7', lineHeight: 66 },
  brand: { fontSize: 30, fontWeight: '800', color: THEME.colors.royalCrimson, marginTop: 12, fontFamily: THEME.typography.serif },
  tagline: { fontSize: 14, color: THEME.colors.bodyText, marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, borderWidth: 1, borderColor: THEME.colors.borderLight, ...THEME.shadows.royal },
  modeTitle: { fontSize: 16, fontWeight: '800', color: THEME.colors.heading, marginBottom: 12 },
  info: { fontSize: 13.5, color: THEME.colors.bodyText, marginBottom: 12 },
  bold: { fontWeight: '800', color: THEME.colors.heading },
  otpInput: { fontSize: 22, letterSpacing: 8, fontWeight: '700' },
  devHint: { fontSize: 12, color: THEME.colors.bilvaGreen, marginTop: -8, marginBottom: 10 },
  error: { color: '#B91C1C', fontSize: 13, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  links: { alignItems: 'center', gap: 10, marginTop: 16 },
  link: { color: THEME.colors.primarySaffron, fontWeight: '700' },
  linkDisabled: { color: THEME.colors.mutedText },
  note: { fontSize: 12.5, color: THEME.colors.mutedText, textAlign: 'center', marginTop: 12 },
  eye: { position: 'absolute', right: 14, top: 38 },
  legal: { textAlign: 'center', fontSize: 12, color: THEME.colors.mutedText, marginTop: 18 },
});
