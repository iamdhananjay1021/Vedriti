import React, { useEffect, useRef, useState } from 'react';
import { Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Eye, EyeOff, MailCheck, ShieldCheck } from 'lucide-react-native';
import { KeyboardAwareScrollView } from '../components/ui/KeyboardAwareScrollView';
import { OtpInput } from '../components/ui/OtpInput';
import { THEME } from '../constants/theme';
import { BrandMark } from '../components/common/BrandLogo';
import { Button, Field } from '../components/ui';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPhone, localPhone } from '../utils/format';
import { WEBSITE_URL } from '../config/api';

type Mode = 'otp' | 'password' | 'signup' | 'forgot';

const HEADINGS: Record<Mode, { title: string; sub: string }> = {
  otp: { title: 'Welcome to VedRit', sub: 'Enter your email and mobile number. We will email you a 6-digit code.' },
  password: { title: 'Welcome back', sub: 'Login with your email and password.' },
  signup: { title: 'Create your account', sub: 'Tell us a little about you to get started.' },
  forgot: { title: 'Reset password', sub: 'Enter your email and we will send you a code.' },
};

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

const maskEmail = (email: string) => {
  const [user, domain] = email.trim().split('@');
  if (!domain) return email;
  const visible = user.length <= 2 ? user.slice(0, 1) : user.slice(0, 2);
  return `${visible}${'•'.repeat(Math.max(2, user.length - visible.length))}@${domain}`;
};

export const LoginScreen: React.FC = () => {
  const { completeLogin } = useAuth();
  const [mode, setMode] = useState<Mode>('otp');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const codeRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const needsPhone = mode === 'otp' || mode === 'signup';
  const tab: 'login' | 'signup' = mode === 'signup' ? 'signup' : 'login';

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const resetState = () => {
    setError(null);
    setDevOtp(undefined);
    setResendIn(0);
    setCode('');
    setCodeSent(false);
    setPassword('');
    setConfirm('');
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    resetState();
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

  const focusCode = () => setTimeout(() => codeRef.current?.focus(), 350);

  const sendCode = () => {
    const cleanEmail = email.trim();
    if (mode === 'signup' && name.trim().length < 2) return setError('Please enter your name');
    if (!isValidEmail(cleanEmail)) return setError('Please enter a valid email address');
    if (needsPhone && !isValidPhone(localPhone(phone))) return setError('Please enter a valid 10-digit mobile number');
    run(async () => {
      const res = mode === 'forgot' ? await api.forgotPassword(cleanEmail) : await api.requestEmailOtp(cleanEmail, localPhone(phone));
      if (mode === 'signup' && res.isNewUser === false) setMode('otp');
      setCodeSent(true);
      setCode('');
      setDevOtp(res.devOtp);
      setResendIn(res.resendInSeconds);
      focusCode();
    });
  };

  const resend = () => {
    if (resendIn > 0 || loading) return;
    run(async () => {
      const res = mode === 'forgot' ? await api.forgotPassword(email.trim()) : await api.requestEmailOtp(email.trim(), localPhone(phone));
      setCode('');
      setDevOtp(res.devOtp);
      setResendIn(res.resendInSeconds);
      focusCode();
    });
  };

  const newPasswordProblem = () => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  };

  const submit = (otpCode = code) => {
    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) return setError('Please enter a valid email address');

    if (mode === 'password') {
      if (!password) return setError('Please enter your password');
      return run(async () => {
        await completeLogin(await api.loginEmail(cleanEmail, password));
      });
    }

    if (!/^\d{6}$/.test(otpCode)) return setError('Please enter the 6-digit code sent to your email');

    if (mode === 'otp') {
      return run(async () => {
        await completeLogin(await api.verifyEmailOtp(cleanEmail, localPhone(phone), otpCode));
      });
    }

    const problem = newPasswordProblem();
    if (problem) return setError(problem);

    if (mode === 'signup') {
      return run(async () => {
        await completeLogin(await api.signupEmail(cleanEmail, localPhone(phone), password, otpCode, name.trim()));
      });
    }

    return run(async () => {
      await completeLogin(await api.resetPassword(cleanEmail, otpCode, password));
    });
  };

  const passwordFields = (label: string, withConfirm: boolean) => (
    <>
      <View>
        <Field
          label={label}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete={withConfirm ? 'new-password' : 'password'}
          placeholder={withConfirm ? 'At least 8 characters' : 'Your password'}
        />
        <TouchableOpacity style={styles.eye} onPress={() => setShowPassword((s) => !s)} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
          {showPassword ? <EyeOff size={18} color={THEME.colors.mutedText} /> : <Eye size={18} color={THEME.colors.mutedText} />}
        </TouchableOpacity>
      </View>
      {withConfirm ? (
        <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry={!showPassword} autoCapitalize="none" placeholder="Re-enter password" />
      ) : null}
    </>
  );

  const renderVerify = () => (
    <View>
      <TouchableOpacity style={styles.back} onPress={resetState} accessibilityRole="button">
        <ArrowLeft size={16} color={THEME.colors.primarySaffron} />
        <Text style={styles.link}>Change email</Text>
      </TouchableOpacity>
      <View style={styles.verifyIcon}>
        <MailCheck size={26} color={THEME.colors.primarySaffron} />
      </View>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.sub}>
        We sent a 6-digit code to <Text style={styles.bold}>{maskEmail(email)}</Text>. It may take a minute, check spam too.
      </Text>

      <View style={styles.otpWrap}>
        <OtpInput ref={codeRef} value={code} onChange={setCode} hasError={Boolean(error)} onComplete={mode === 'otp' ? (c) => submit(c) : undefined} />
      </View>
      {devOtp ? <Text style={styles.devHint}>Test code: {devOtp}</Text> : null}

      {mode === 'signup' || mode === 'forgot' ? <View style={styles.gap}>{passwordFields(mode === 'forgot' ? 'New password' : 'Create password', true)}</View> : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title={mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Reset & login' : 'Verify & continue'} onPress={() => submit()} loading={loading} />

      <View style={styles.resend}>
        <Text style={styles.muted}>Didn't get it? </Text>
        <TouchableOpacity onPress={resend} disabled={resendIn > 0 || loading}>
          <Text style={[styles.link, resendIn > 0 && styles.linkDisabled]}>{resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForm = () => (
    <View>
      {mode !== 'forgot' ? (
        <View style={styles.tabs}>
          {(['login', 'signup'] as const).map((t) => {
            const active = tab === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => switchMode(t === 'login' ? 'otp' : 'signup')}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t === 'login' ? 'Login' : 'Sign up'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <TouchableOpacity style={styles.back} onPress={() => switchMode('password')} accessibilityRole="button">
          <ArrowLeft size={16} color={THEME.colors.primarySaffron} />
          <Text style={styles.link}>Back to login</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.title}>{HEADINGS[mode].title}</Text>
      <Text style={styles.sub}>{HEADINGS[mode].sub}</Text>

      {mode === 'signup' ? <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" /> : null}
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
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
          onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
          keyboardType="phone-pad"
          autoComplete="tel"
          maxLength={10}
          placeholder="10-digit mobile number"
        />
      ) : null}
      {mode === 'password' ? passwordFields('Password', false) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {mode === 'password' ? <Button title="Login" onPress={() => submit()} loading={loading} /> : <Button title="Send code" onPress={sendCode} loading={loading} />}

      <View style={styles.links}>
        {mode === 'otp' ? (
          <TouchableOpacity onPress={() => switchMode('password')}>
            <Text style={styles.link}>Login with password instead</Text>
          </TouchableOpacity>
        ) : null}
        {mode === 'password' ? (
          <>
            <TouchableOpacity onPress={() => switchMode('otp')}>
              <Text style={styles.link}>Login with email code instead</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => switchMode('forgot')}>
              <Text style={styles.linkMuted}>Forgot password?</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#FFF3E0', '#FAF6EE', '#FAF6EE']} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAwareScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <BrandMark size={72} />
            <Text style={styles.brand}>
              Ved<Text style={styles.brandAccent}>Rit</Text>
            </Text>
            <Text style={styles.tagline}>Puja, appointments & kundli with Pandit Ji</Text>
          </View>

          <View style={styles.card}>{codeSent && mode !== 'password' ? renderVerify() : renderForm()}</View>

          <View style={styles.secure}>
            <ShieldCheck size={14} color={THEME.colors.mutedText} />
            <Text style={styles.legal}>
              Secure login. By continuing you agree to our{' '}
              <Text style={styles.linkInline} onPress={() => Linking.openURL(`${WEBSITE_URL}/privacy-policy`)}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const C = THEME.colors;
const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 22 },
  brand: { fontSize: 30, fontWeight: '800', color: C.heading, marginTop: 10, letterSpacing: -0.4 },
  brandAccent: { color: C.primarySaffron },
  tagline: { fontSize: 13.5, color: C.bodyText, marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: C.borderLight },
  tabs: { flexDirection: 'row', backgroundColor: C.softSaffronBg, borderRadius: 999, padding: 4, marginBottom: 20 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 999 },
  tabActive: { backgroundColor: C.primarySaffron },
  tabText: { fontSize: 14, fontWeight: '700', color: C.bodyText },
  tabTextActive: { color: '#FFFFFF' },
  title: { fontSize: 22, fontWeight: '800', color: C.heading, letterSpacing: -0.3 },
  sub: { fontSize: 13.5, lineHeight: 19, color: C.bodyText, marginTop: 4, marginBottom: 18 },
  bold: { fontWeight: '800', color: C.heading },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: 16 },
  verifyIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.softSaffronBg, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  otpWrap: { marginBottom: 6 },
  gap: { marginTop: 14 },
  devHint: { fontSize: 12, color: C.bilvaGreen, marginTop: 8, marginBottom: 4 },
  error: { color: '#B91C1C', fontSize: 13, marginBottom: 10, marginTop: 6 },
  resend: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  muted: { fontSize: 13.5, color: C.mutedText },
  links: { alignItems: 'center', gap: 12, marginTop: 16 },
  link: { color: C.primarySaffron, fontWeight: '700', fontSize: 14 },
  linkMuted: { color: C.mutedText, fontWeight: '600', fontSize: 13.5 },
  linkInline: { color: C.primarySaffron, fontWeight: '700' },
  linkDisabled: { color: C.mutedText },
  eye: { position: 'absolute', right: 14, top: 38 },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18, paddingHorizontal: 12 },
  legal: { flexShrink: 1, textAlign: 'center', fontSize: 12, color: C.mutedText },
});
