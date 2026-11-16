import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Linking, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Smartphone } from 'lucide-react-native';
import { OtpInput } from '../components/ui/OtpInput';
import { GoogleIcon } from '../components/common/GoogleIcon';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { THEME } from '../constants/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPhone, localPhone } from '../utils/format';
import { WEBSITE_URL } from '../config/api';

type Mode = 'login' | 'signup' | 'password' | 'forgot';

const REMEMBER_KEY = 'vedrit.login.remember';

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

const maskEmail = (email: string) => {
  const [user, domain] = email.trim().split('@');
  if (!domain) return email;
  const visible = user.length <= 2 ? user.slice(0, 1) : user.slice(0, 2);
  return `${visible}${'•'.repeat(Math.max(2, user.length - visible.length))}@${domain}`;
};

interface FieldProps extends TextInputProps {
  icon: React.ReactNode;
  prefix?: string;
  onIconPress?: () => void;
  iconLabel?: string;
}

const Input = React.forwardRef<TextInput, FieldProps>(({ icon, prefix, onIconPress, iconLabel, style, ...input }, ref) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#A29588"
        selectionColor={THEME.colors.primarySaffron}
        style={[styles.input, style]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...input}
      />
      {onIconPress ? (
        <TouchableOpacity onPress={onIconPress} accessibilityLabel={iconLabel} hitSlop={10}>
          {icon}
        </TouchableOpacity>
      ) : (
        icon
      )}
    </View>
  );
});
Input.displayName = 'Input';

const Steps: React.FC<{ step: 1 | 2; labels: [string, string] }> = ({ step, labels }) => (
  <View style={styles.steps}>
    {labels.map((label, i) => {
      const n = i + 1;
      const done = n < step;
      const active = n === step;
      return (
        <React.Fragment key={label}>
          {i > 0 ? <View style={[styles.stepLine, (done || active) && styles.stepLineOn]} /> : null}
          <View style={styles.stepItem}>
            <View style={[styles.stepDot, (done || active) && styles.stepDotOn]}>
              <Text style={[styles.stepNum, (done || active) && styles.stepNumOn]}>{done ? '✓' : n}</Text>
            </View>
            <Text style={[styles.stepLabel, active && styles.stepLabelOn]}>{label}</Text>
          </View>
        </React.Fragment>
      );
    })}
  </View>
);

export const LoginScreen: React.FC = () => {
  const { completeLogin } = useAuth();
  const { width } = useWindowDimensions();
  const { inset } = useKeyboardInset();
  const typing = inset > 0;
  const codeRef = useRef<TextInput>(null);

  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devOtp, setDevOtp] = useState<string | undefined>();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const needsPhone = mode === 'signup';
  const verifying = codeSent && mode !== 'password';

  useEffect(() => {
    SecureStore.getItemAsync(REMEMBER_KEY)
      .then((saved) => {
        if (!saved) return;
        let value = saved;
        if (saved.startsWith('{')) {
          try {
            value = String(JSON.parse(saved).email || '');
          } catch {
            value = '';
          }
        }
        if (isValidEmail(value)) setEmail(value);
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
    SecureStore.setItemAsync(REMEMBER_KEY, email.trim()).catch(() => undefined);
    await completeLogin(result);
  };

  const focusCode = () => setTimeout(() => codeRef.current?.focus(), 350);

  const sendCode = () => {
    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) return setError('Please enter a valid email address');
    if (needsPhone && !isValidPhone(localPhone(phone))) return setError('Please enter a valid 10-digit mobile number');
    run(async () => {
      const res = mode === 'forgot' ? await api.forgotPassword(cleanEmail) : await api.requestEmailOtp(cleanEmail, needsPhone ? localPhone(phone) : undefined);
      if (mode === 'signup' && res.isNewUser === false) setMode('login');
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
      const res = mode === 'forgot' ? await api.forgotPassword(email.trim()) : await api.requestEmailOtp(email.trim(), needsPhone ? localPhone(phone) : undefined);
      setCode('');
      setDevOtp(res.devOtp);
      setResendIn(res.resendInSeconds);
      focusCode();
    });
  };

  const submit = (otpCode = code) => {
    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) return setError('Please enter a valid email address');

    if (mode === 'password') {
      if (!password) return setError('Please enter your password');
      return run(() => finishLogin(() => api.loginEmail(cleanEmail, password)));
    }

    if (!/^\d{6}$/.test(otpCode)) return setError('Please enter the 6-digit code sent to your email');

    if (mode === 'forgot') {
      if (password.length < 8) return setError('Password must be at least 8 characters');
      if (password !== confirm) return setError('Passwords do not match');
      return run(() => finishLogin(() => api.resetPassword(cleanEmail, otpCode, password)));
    }

    return run(() => finishLogin(() => api.verifyEmailOtp(cleanEmail, needsPhone ? localPhone(phone) : undefined, otpCode)));
  };

  const eye = showPassword ? <EyeOff size={19} color="#8A7D70" /> : <Eye size={19} color="#8A7D70" />;
  const passwordInput = (placeholder: string, value: string, onChange: (v: string) => void, autoComplete: 'password' | 'new-password') => (
    <Input
      icon={eye}
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

  const button = (title: string, onPress: () => void) => (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.85} style={[styles.button, loading && styles.buttonBusy]} accessibilityRole="button" accessibilityState={{ busy: loading, disabled: loading }}>
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{title}</Text>}
    </TouchableOpacity>
  );

  const renderVerify = () => (
    <View>
      {!typing ? <Steps step={2} labels={[mode === 'signup' ? 'Details' : 'Email', 'Verify']} /> : null}
      <Text style={styles.title}>{mode === 'forgot' ? 'Reset password' : 'Enter the code'}</Text>
      <Text style={styles.sub}>
        We emailed a 6-digit code to <Text style={styles.bold}>{maskEmail(email)}</Text>. It can take a minute, check spam too.
      </Text>

      <OtpInput ref={codeRef} value={code} onChange={setCode} hasError={Boolean(error)} onComplete={mode === 'forgot' ? undefined : (c) => submit(c)} />
      {devOtp ? <Text style={styles.devHint}>Test code: {devOtp}</Text> : null}

      {mode === 'forgot' ? (
        <View style={[styles.fields, styles.fieldsTop]}>
          {passwordInput('New password', password, setPassword, 'new-password')}
          {passwordInput('Confirm password', confirm, setConfirm, 'new-password')}
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>{button(mode === 'forgot' ? 'Reset & login' : 'Verify & continue', () => submit())}</View>

      <View style={styles.rowCenter}>
        <TouchableOpacity onPress={resetState} style={styles.inlineLink}>
          <ArrowLeft size={14} color={THEME.colors.primarySaffron} />
          <Text style={styles.link}>Change email</Text>
        </TouchableOpacity>
        <Text style={styles.dotSep}>•</Text>
        <TouchableOpacity onPress={resend} disabled={resendIn > 0 || loading}>
          <Text style={[styles.link, resendIn > 0 && styles.linkOff]}>{resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const noAccount = mode === 'login' && Boolean(error?.toLowerCase().startsWith('no account'));

  const renderForm = () => (
    <View>
      {mode === 'login' || mode === 'signup' ? (
        <View style={styles.tabs}>
          {(['login', 'signup'] as const).map((t) => {
            const active = mode === t;
            return (
              <TouchableOpacity key={t} style={[styles.tab, active && styles.tabOn]} onPress={() => switchMode(t)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
                <Text style={[styles.tabText, active && styles.tabTextOn]}>{t === 'login' ? 'Login' : 'Sign up'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <TouchableOpacity style={styles.inlineLinkRow} onPress={() => switchMode('login')} accessibilityRole="button">
          <ArrowLeft size={15} color={THEME.colors.primarySaffron} />
          <Text style={styles.link}>Back to login</Text>
        </TouchableOpacity>
      )}

      {(mode === 'login' || mode === 'signup') && !typing ? <Steps step={1} labels={[mode === 'signup' ? 'Details' : 'Email', 'Verify']} /> : null}

      <Text style={styles.title}>
        {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : mode === 'password' ? 'Login with password' : 'Reset password'}
      </Text>
      <Text style={styles.sub}>
        {mode === 'login'
          ? 'Enter your email. We will send you a code to log in.'
          : mode === 'signup'
            ? 'Add your email and mobile number. We will email you a code to confirm.'
            : mode === 'password'
              ? 'Use the email and password of your account.'
              : 'Enter your email and we will send you a code.'}
      </Text>

      <View style={styles.fields}>
        <Input
          icon={<Mail size={19} color="#8A7D70" />}
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        {needsPhone ? (
          <Input
            icon={<Smartphone size={19} color="#8A7D70" />}
            prefix="+91"
            value={phone}
            onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
            placeholder="Mobile number"
            keyboardType="phone-pad"
            autoComplete="tel"
            maxLength={10}
          />
        ) : null}
        {mode === 'password' ? passwordInput('Password', password, setPassword, 'password') : null}
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorPlain}>{error}</Text>
          {noAccount ? (
            <TouchableOpacity onPress={() => switchMode('signup')}>
              <Text style={styles.link}>Create an account instead</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>{mode === 'password' ? button('Login', () => submit()) : button(mode === 'signup' ? 'Continue' : 'Send code', sendCode)}</View>

      {mode === 'login' || mode === 'password' ? (
        <View style={styles.rowCenter}>
          <TouchableOpacity style={styles.inlineLink} onPress={() => switchMode(mode === 'login' ? 'password' : 'login')}>
            <Lock size={13} color={THEME.colors.primarySaffron} />
            <Text style={styles.link}>{mode === 'login' ? 'Use password instead' : 'Use email code instead'}</Text>
          </TouchableOpacity>
          {mode === 'password' ? (
            <>
              <Text style={styles.dotSep}>•</Text>
              <TouchableOpacity onPress={() => switchMode('forgot')}>
                <Text style={styles.linkMuted}>Forgot password?</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      ) : null}

      {(mode === 'login' || mode === 'signup') && !typing ? (
        <>
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>
          <View style={styles.googleBtn} accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityLabel="Continue with Google, coming soon">
            <GoogleIcon size={20} />
            <Text style={styles.googleText}>Continue with Google</Text>
            <View style={styles.soonPill}>
              <Text style={styles.soonText}>Coming soon</Text>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );

  return (
    <View style={styles.root}>
      <Image source={require('../../assets/images/login-mandala.png')} style={[styles.mandala, { width: width * 1.5, height: width * 1.5, left: -width * 0.25 }]} resizeMode="contain" />
      <SafeAreaView style={styles.flex}>
        <View style={[styles.body, { paddingBottom: typing ? inset + 8 : 56 }]}>
          {!typing ? (
            <View style={styles.greeting}>
              <Text style={styles.greetHindi}>स्वागतम्</Text>
              <Text style={styles.greetSub}>Puja, appointments and kundli with Pandit Ji</Text>
            </View>
          ) : null}
          <View style={styles.card}>{verifying ? renderVerify() : renderForm()}</View>
        </View>
        {!typing ? (
          <Text style={styles.legal}>
            By continuing you agree to our{' '}
            <Text style={styles.boldLink} onPress={() => Linking.openURL(`${WEBSITE_URL}/privacy-policy`)}>
              Privacy Policy
            </Text>
          </Text>
        ) : null}
      </SafeAreaView>
    </View>
  );
};

const C = THEME.colors;
const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: '#FFF8EE' },
  mandala: { position: 'absolute', top: -140, opacity: 0.55 },
  body: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  greeting: { alignItems: 'center', marginBottom: 22 },
  greetHindi: { fontSize: 38, fontWeight: '800', color: C.primarySaffron, lineHeight: 52 },
  greetSub: { fontSize: 14, color: C.bodyText, marginTop: 2, textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1.5, borderColor: '#EFE3D0', padding: 20 },
  tabs: { flexDirection: 'row', backgroundColor: '#F7EFE3', borderRadius: 14, padding: 4, marginBottom: 18 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 11 },
  tabOn: { backgroundColor: C.primarySaffron },
  tabText: { fontSize: 14, fontWeight: '800', color: C.bodyText },
  tabTextOn: { color: '#FFFFFF' },
  steps: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  stepDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#DCCDB8', alignItems: 'center', justifyContent: 'center' },
  stepDotOn: { borderColor: C.primarySaffron, backgroundColor: C.primarySaffron },
  stepNum: { fontSize: 11, fontWeight: '800', color: '#9A8D80' },
  stepNumOn: { color: '#FFFFFF' },
  stepLabel: { fontSize: 12.5, fontWeight: '700', color: '#9A8D80' },
  stepLabelOn: { color: C.heading },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E8DCC9', marginHorizontal: 10, borderRadius: 1 },
  stepLineOn: { backgroundColor: C.primarySaffron },
  title: { fontSize: 24, fontWeight: '800', color: C.heading, letterSpacing: -0.3 },
  sub: { fontSize: 13.5, lineHeight: 19, color: C.bodyText, marginTop: 4, marginBottom: 18 },
  bold: { fontWeight: '800', color: C.heading },
  fields: { gap: 12 },
  fieldsTop: { marginTop: 16 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8DCC9',
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 14,
    gap: 10,
  },
  fieldFocused: { borderColor: C.primarySaffron, backgroundColor: '#FFFFFF' },
  prefix: { color: C.heading, fontSize: 15, fontWeight: '800' },
  input: { flex: 1, color: C.heading, fontSize: 15.5, paddingVertical: 0, height: '100%' },
  actions: { marginTop: 18 },
  button: { height: 54, borderRadius: 14, backgroundColor: C.primarySaffron, alignItems: 'center', justifyContent: 'center' },
  buttonBusy: { opacity: 0.75 },
  buttonText: { color: '#FFFFFF', fontSize: 16.5, fontWeight: '800' },
  errorWrap: { marginTop: 12, gap: 6 },
  errorPlain: { color: '#B91C1C', fontSize: 13.5, fontWeight: '600' },
  error: { color: '#B91C1C', fontSize: 13.5, fontWeight: '600', marginTop: 12 },
  devHint: { fontSize: 12.5, color: C.bilvaGreen, marginTop: 10 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16 },
  inlineLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  inlineLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: 14 },
  dotSep: { color: '#C9BBA8' },
  link: { color: C.primarySaffron, fontWeight: '800', fontSize: 14 },
  linkMuted: { color: C.mutedText, fontWeight: '700', fontSize: 14 },
  linkOff: { color: C.mutedText },
  boldLink: { color: C.primarySaffron, fontWeight: '800' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  orLine: { flex: 1, height: 1, backgroundColor: '#EFE3D0' },
  orText: { color: C.mutedText, fontSize: 13, fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8DCC9',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    opacity: 0.85,
  },
  googleText: { color: C.heading, fontSize: 15, fontWeight: '700' },
  soonPill: { backgroundColor: '#FDF3E7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  soonText: { color: C.primarySaffron, fontSize: 10.5, fontWeight: '800' },
  legal: { position: 'absolute', left: 0, right: 0, bottom: 16, textAlign: 'center', fontSize: 12.5, color: C.mutedText, paddingHorizontal: 20 },
});
