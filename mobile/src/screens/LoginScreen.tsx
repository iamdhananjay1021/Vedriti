import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ImageBackground, Linking, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { ArrowLeft, Check, Eye, EyeOff, Lock, Mail, Smartphone } from 'lucide-react-native';
import { BrandLogo } from '../components/common/BrandLogo';
import { GoogleIcon } from '../components/common/GoogleIcon';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { OtpInput } from '../components/ui/OtpInput';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPhone, localPhone } from '../utils/format';
import { WEBSITE_URL } from '../config/api';

type Mode = 'otp' | 'password' | 'signup' | 'forgot';

const REMEMBER_KEY = 'vedrit.login.remember';

const HEADINGS: Record<Mode, { title: string; sub: string }> = {
  otp: { title: 'Login', sub: 'Welcome back, enter your email and mobile number. We will email you a 6-digit code.' },
  password: { title: 'Login', sub: 'Welcome back, login to your account with your password.' },
  signup: { title: 'Sign up', sub: 'Create your VedRit account with your email and mobile number.' },
  forgot: { title: 'Reset password', sub: 'Enter your email and we will send you a code.' },
};

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

const maskEmail = (email: string) => {
  const [user, domain] = email.trim().split('@');
  if (!domain) return email;
  const visible = user.length <= 2 ? user.slice(0, 1) : user.slice(0, 2);
  return `${visible}${'•'.repeat(Math.max(2, user.length - visible.length))}@${domain}`;
};

interface GlassFieldProps extends TextInputProps {
  icon: React.ReactNode;
  prefix?: string;
  onIconPress?: () => void;
  iconLabel?: string;
}

const GlassField = React.forwardRef<TextInput, GlassFieldProps>(({ icon, prefix, onIconPress, iconLabel, style, ...input }, ref) => (
  <View style={styles.field}>
    {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
    <TextInput ref={ref} placeholderTextColor="rgba(255,255,255,0.65)" selectionColor="#FFFFFF" style={[styles.input, style]} {...input} />
    {onIconPress ? (
      <TouchableOpacity onPress={onIconPress} accessibilityLabel={iconLabel} hitSlop={10}>
        {icon}
      </TouchableOpacity>
    ) : (
      icon
    )}
  </View>
));
GlassField.displayName = 'GlassField';

export const LoginScreen: React.FC = () => {
  const { completeLogin } = useAuth();
  const { inset } = useKeyboardInset();
  const typing = inset > 0;
  const [mode, setMode] = useState<Mode>('otp');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const codeRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [remember, setRemember] = useState(true);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const needsPhone = mode === 'otp' || mode === 'signup';
  const tallVerify = codeSent && (mode === 'signup' || mode === 'forgot');
  const compact = typing || tallVerify;

  useEffect(() => {
    SecureStore.getItemAsync(REMEMBER_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as { email?: string; phone?: string };
        if (saved.email) setEmail(saved.email);
        if (saved.phone) setPhone(saved.phone);
      })
      .catch(() => undefined);
  }, []);

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

  const finishLogin = async (task: () => Promise<Awaited<ReturnType<typeof api.loginEmail>>>) => {
    const result = await task();
    try {
      if (remember) await SecureStore.setItemAsync(REMEMBER_KEY, JSON.stringify({ email: email.trim(), phone: localPhone(phone) }));
      else await SecureStore.deleteItemAsync(REMEMBER_KEY);
    } catch {
      /* ignore */
    }
    await completeLogin(result);
  };

  const focusCode = () => setTimeout(() => codeRef.current?.focus(), 350);

  const sendCode = () => {
    const cleanEmail = email.trim();
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
      return run(() => finishLogin(() => api.loginEmail(cleanEmail, password)));
    }

    if (!/^\d{6}$/.test(otpCode)) return setError('Please enter the 6-digit code sent to your email');

    if (mode === 'otp') return run(() => finishLogin(() => api.verifyEmailOtp(cleanEmail, localPhone(phone), otpCode)));

    const problem = newPasswordProblem();
    if (problem) return setError(problem);

    if (mode === 'signup') return run(() => finishLogin(() => api.signupEmail(cleanEmail, localPhone(phone), password, otpCode)));

    return run(() => finishLogin(() => api.resetPassword(cleanEmail, otpCode, password)));
  };

  const eyeIcon = showPassword ? <EyeOff size={20} color="rgba(255,255,255,0.85)" /> : <Eye size={20} color="rgba(255,255,255,0.85)" />;

  const passwordField = (placeholder: string, value: string, onChange: (v: string) => void, autoComplete: 'password' | 'new-password') => (
    <GlassField
      icon={eyeIcon}
      onIconPress={() => setShowPassword((s) => !s)}
      iconLabel={showPassword ? 'Hide password' : 'Show password'}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      secureTextEntry={!showPassword}
      autoCapitalize="none"
      autoComplete={autoComplete}
    />
  );

  const primaryButton = (title: string, onPress: () => void) => (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.85} accessibilityRole="button" accessibilityState={{ busy: loading, disabled: loading }}>
      <LinearGradient colors={['#F59A45', '#E4702B', '#C65D24']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.button, loading && styles.buttonBusy]}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{title}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderVerify = () => (
    <View>
      <TouchableOpacity style={styles.back} onPress={resetState} accessibilityRole="button">
        <ArrowLeft size={16} color="#FFFFFF" />
        <Text style={styles.backText}>Change email</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.sub}>
        We sent a 6-digit code to <Text style={styles.bold}>{maskEmail(email)}</Text>. It may take a minute, check spam too.
      </Text>

      <OtpInput ref={codeRef} glass value={code} onChange={setCode} hasError={Boolean(error)} onComplete={mode === 'otp' ? (c) => submit(c) : undefined} />
      {devOtp ? <Text style={styles.devHint}>Test code: {devOtp}</Text> : null}

      {mode === 'signup' || mode === 'forgot' ? (
        <View style={styles.fields}>
          {passwordField(mode === 'forgot' ? 'New password' : 'Create password', password, setPassword, 'new-password')}
          {passwordField('Confirm password', confirm, setConfirm, 'new-password')}
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>{primaryButton(mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Reset & login' : 'Verify & continue', () => submit())}</View>

      <View style={styles.resend}>
        <Text style={styles.muted}>Didn't get it? </Text>
        <TouchableOpacity onPress={resend} disabled={resendIn > 0 || loading}>
          <Text style={[styles.boldLink, resendIn > 0 && styles.linkDisabled]}>{resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForm = () => (
    <View>
      {mode === 'forgot' ? (
        <TouchableOpacity style={styles.back} onPress={() => switchMode('password')} accessibilityRole="button">
          <ArrowLeft size={16} color="#FFFFFF" />
          <Text style={styles.backText}>Back to login</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.title}>{HEADINGS[mode].title}</Text>
      <Text style={styles.sub}>{HEADINGS[mode].sub}</Text>

      <View style={styles.fields}>
        <GlassField
          icon={<Mail size={20} color="rgba(255,255,255,0.85)" />}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        {needsPhone ? (
          <GlassField
            icon={<Smartphone size={20} color="rgba(255,255,255,0.85)" />}
            prefix="+91"
            value={phone}
            onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
            placeholder="Mobile number"
            keyboardType="phone-pad"
            autoComplete="tel"
            maxLength={10}
          />
        ) : null}
        {mode === 'password' ? passwordField('Password', password, setPassword, 'password') : null}
      </View>

      <View style={styles.rowBetween}>
        <TouchableOpacity style={styles.remember} onPress={() => setRemember((r) => !r)} accessibilityRole="checkbox" accessibilityState={{ checked: remember }}>
          <View style={[styles.checkbox, remember && styles.checkboxOn]}>{remember ? <Check size={13} color="#FFFFFF" strokeWidth={3.5} /> : null}</View>
          <Text style={styles.rememberText}>Remember me</Text>
        </TouchableOpacity>
        {mode === 'password' ? (
          <TouchableOpacity onPress={() => switchMode('forgot')}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>{mode === 'password' ? primaryButton('Login', () => submit()) : primaryButton('Send code', sendCode)}</View>

      {mode === 'otp' || mode === 'password' || mode === 'signup' ? (
        <>
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>
          <View style={styles.googleBtn} accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityLabel="Continue with Google, coming soon">
            <GoogleIcon size={22} />
            <Text style={styles.googleText}>Continue with Google</Text>
            <View style={styles.soonPill}>
              <Text style={styles.soonText}>Coming soon</Text>
            </View>
          </View>
        </>
      ) : null}

      {mode === 'otp' || mode === 'password' ? (
        <TouchableOpacity style={styles.switchRow} onPress={() => switchMode(mode === 'otp' ? 'password' : 'otp')}>
          <Lock size={14} color="rgba(255,255,255,0.85)" />
          <Text style={styles.linkText}>{mode === 'otp' ? 'Login with password' : 'Login with email code'}</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.resend}>
        <Text style={styles.muted}>{mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}</Text>
        <TouchableOpacity onPress={() => switchMode(mode === 'signup' ? 'otp' : 'signup')}>
          <Text style={styles.boldLink}>{mode === 'signup' ? 'Login' : 'Signup'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../../assets/images/login-bg.jpg')} style={styles.flex} resizeMode="cover">
      <StatusBar style="light" />
      <SafeAreaView style={styles.flex}>
        <View style={[styles.body, { paddingTop: compact ? 8 : 20, paddingBottom: typing ? inset + 8 : compact ? 16 : 56 }]}>
          <View style={styles.card}>
            {!compact ? (
              <View style={styles.cardBrand}>
                <BrandLogo size={46} light />
                <Text style={styles.tagline}>Puja  •  Appointment  •  Kundli</Text>
                <View style={styles.divider} />
              </View>
            ) : null}
            {codeSent && mode !== 'password' ? renderVerify() : renderForm()}
          </View>
        </View>
        {!compact ? (
          <Text style={styles.legal}>
            By continuing you agree to our{' '}
            <Text style={styles.boldLink} onPress={() => Linking.openURL(`${WEBSITE_URL}/privacy-policy`)}>
              Privacy Policy
            </Text>
          </Text>
        ) : null}
      </SafeAreaView>
    </ImageBackground>
  );
};

const WHITE = '#FFFFFF';
const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  cardBrand: { alignItems: 'center', marginBottom: 18 },
  tagline: { color: '#F7D58B', fontSize: 11.5, fontWeight: '700', letterSpacing: 1.1, marginTop: 8 },
  divider: { alignSelf: 'stretch', height: 1, backgroundColor: 'rgba(255,255,255,0.22)', marginTop: 16 },
  card: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: 'rgba(34,10,26,0.34)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  title: { fontSize: 32, fontWeight: '800', color: WHITE, letterSpacing: -0.4 },
  sub: { fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.92)', marginTop: 6, marginBottom: 22 },
  bold: { fontWeight: '800', color: WHITE },
  fields: { gap: 14 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    gap: 10,
  },
  prefix: { color: WHITE, fontSize: 15, fontWeight: '700' },
  input: { flex: 1, color: WHITE, fontSize: 15.5, paddingVertical: 0, height: '100%' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: '#E4702B', borderColor: '#E4702B' },
  rememberText: { color: WHITE, fontSize: 14 },
  actions: { marginTop: 20 },
  button: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  buttonBusy: { opacity: 0.8 },
  buttonText: { color: WHITE, fontSize: 18, fontWeight: '800' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  orLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  orText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
  },
  googleText: { color: WHITE, fontSize: 15, fontWeight: '700' },
  soonPill: { backgroundColor: 'rgba(247,213,139,0.95)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  soonText: { color: '#6B2A0F', fontSize: 10.5, fontWeight: '800' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14 },
  linkText: { color: 'rgba(255,255,255,0.92)', fontSize: 14, fontWeight: '600' },
  boldLink: { color: WHITE, fontSize: 14.5, fontWeight: '800' },
  linkDisabled: { color: 'rgba(255,255,255,0.55)' },
  resend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  muted: { color: 'rgba(255,255,255,0.9)', fontSize: 14.5 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: WHITE, fontSize: 14, fontWeight: '700' },
  devHint: { fontSize: 12.5, color: '#B6F2C2', marginTop: 10 },
  error: { color: '#FFD0C9', fontSize: 13.5, marginTop: 14, fontWeight: '600' },
  legal: { position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,0.85)', paddingHorizontal: 20 },
});
