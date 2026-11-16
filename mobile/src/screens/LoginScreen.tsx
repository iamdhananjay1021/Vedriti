import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { ArrowLeft, Check, Mail, MessageSquare, Smartphone } from 'lucide-react-native';
import { KeyboardAwareScrollView } from '../components/ui/KeyboardAwareScrollView';
import { OtpInput } from '../components/ui/OtpInput';
import { THEME } from '../constants/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPhone } from '../utils/format';
import { WEBSITE_URL } from '../config/api';

type Tab = 'signup' | 'login';
type Step = 'form' | 'verify' | 'password' | 'forgot';

const REMEMBER_KEY = 'vedrit.login.remember';

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

const looksLikeEmail = (value: string) => /[@a-z]/i.test(value);

const toDigits = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length > 10 && digits.startsWith('91') ? digits.slice(-10) : digits.slice(0, 10);
};

const maskEmail = (value: string) => {
  const [user, domain] = value.trim().split('@');
  if (!domain) return value;
  const visible = user.length <= 2 ? user.slice(0, 1) : user.slice(0, 2);
  return `${visible}${'•'.repeat(Math.max(2, user.length - visible.length))}@${domain}`;
};

const maskPhone = (value: string) => `+91 ${value.slice(0, 2)}••••••${value.slice(-2)}`;

interface FieldProps extends TextInputProps {
  label: string;
  icon: React.ReactNode;
  prefix?: string;
}

const Field = React.forwardRef<TextInput, FieldProps>(({ label, icon, prefix, style, ...input }, ref) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.fieldFocused]}>
        {icon}
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor="#A39787"
          selectionColor={THEME.colors.primarySaffron}
          style={[styles.input, style]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...input}
        />
      </View>
    </View>
  );
});
Field.displayName = 'Field';

export const LoginScreen: React.FC = () => {
  const { completeLogin } = useAuth();
  const codeRef = useRef<TextInput>(null);

  const [tab, setTab] = useState<Tab>('signup');
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [options, setOptions] = useState({ email: true, sms: true, password: true });

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [sentTo, setSentTo] = useState<('email' | 'sms')[]>([]);
  const [loginChannel, setLoginChannel] = useState<'email' | 'sms'>('email');
  const [forgotFlow, setForgotFlow] = useState(false);

  const idIsEmail = looksLikeEmail(identifier);
  const cleanId = idIsEmail ? identifier.trim() : toDigits(identifier);
  const idIsPhone = Boolean(identifier.trim()) && !idIsEmail;
  const signupMode = tab === 'signup';

  useEffect(() => {
    api.loginConfig().then(setOptions).catch(() => undefined);
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
        if (value) setIdentifier(value);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const reset = () => {
    setError(null);
    setNotice(null);
    setDevOtp(undefined);
    setResendIn(0);
    setCode('');
    setPassword('');
    setConfirm('');
  };

  const switchTab = (next: Tab) => {
    reset();
    setForgotFlow(false);
    setTab(next);
    setStep('form');
  };

  const backToForm = () => {
    reset();
    setForgotFlow(false);
    setStep('form');
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

  const finishLogin = async (task: () => Promise<Awaited<ReturnType<typeof api.loginEmail>>>, remember: string) => {
    const result = await task();
    SecureStore.setItemAsync(REMEMBER_KEY, remember).catch(() => undefined);
    await completeLogin(result);
  };

  const focusCode = () => setTimeout(() => codeRef.current?.focus(), 350);

  const sendSignup = () => {
    if (!isValidEmail(email)) return setError('Enter a valid email address');
    if (!isValidPhone(toDigits(phone))) return setError('Enter a valid 10-digit mobile number');
    run(async () => {
      const res = await api.requestSignupOtp({ email: email.trim(), phone: toDigits(phone) });
      setSentTo(res.channels);
      setDevOtp(res.devOtp);
      setResendIn(res.resendInSeconds || 30);
      setStep('verify');
      focusCode();
    });
  };

  const sendLogin = () => {
    if (!cleanId) return setError('Enter your mobile number or email');
    if (idIsEmail ? !isValidEmail(cleanId) : !isValidPhone(cleanId)) return setError(idIsEmail ? 'Enter a valid email address' : 'Enter a valid 10-digit mobile number');
    run(async () => {
      const res = await api.requestLoginOtp({ identifier: cleanId });
      if (res.needsDetails) {
        if (idIsEmail) setEmail(cleanId);
        else setPhone(cleanId);
        setTab('signup');
        setNotice('No account found. Create one to continue.');
        return;
      }
      setLoginChannel(res.channel);
      setDevOtp(res.devOtp);
      setResendIn(res.resendInSeconds || 30);
      setStep('verify');
      focusCode();
    });
  };

  const sendForgot = () => {
    if (!isValidEmail(cleanId)) return setError('Enter the email of your account');
    run(async () => {
      const res = await api.forgotPassword(cleanId);
      setForgotFlow(true);
      setLoginChannel('email');
      setDevOtp(res.devOtp);
      setResendIn(res.resendInSeconds);
      setStep('verify');
      focusCode();
    });
  };

  const resend = () => {
    if (resendIn > 0 || loading) return;
    run(async () => {
      let res: { devOtp?: string; resendInSeconds?: number };
      if (forgotFlow) res = await api.forgotPassword(cleanId);
      else if (signupMode) res = await api.requestSignupOtp({ email: email.trim(), phone: toDigits(phone) });
      else res = await api.requestLoginOtp({ identifier: cleanId });
      setCode('');
      setDevOtp(res.devOtp);
      setResendIn(res.resendInSeconds || 30);
      focusCode();
    });
  };

  const submit = (otpCode = code) => {
    if (step === 'password') {
      if (!isValidEmail(cleanId)) return setError('Use your email address with a password');
      if (!password) return setError('Enter your password');
      return run(() => finishLogin(() => api.loginEmail(cleanId, password), cleanId));
    }
    if (!/^\d{6}$/.test(otpCode)) return setError('Enter the 6-digit code');
    if (forgotFlow) {
      if (password.length < 8) return setError('Password must be at least 8 characters');
      if (password !== confirm) return setError('Passwords do not match');
      return run(() => finishLogin(() => api.resetPassword(cleanId, otpCode, password), cleanId));
    }
    if (signupMode) {
      return run(() => finishLogin(() => api.verifySignupOtp({ email: email.trim(), phone: toDigits(phone), otp: otpCode }), email.trim()));
    }
    return run(() => finishLogin(() => api.verifyLoginOtp({ identifier: cleanId, otp: otpCode }), cleanId));
  };

  const button = (title: string, onPress: () => void) => (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.85} style={[styles.button, loading && styles.buttonBusy]} accessibilityRole="button" accessibilityState={{ busy: loading, disabled: loading }}>
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{title}</Text>}
    </TouchableOpacity>
  );

  const banner = error ? <Text style={styles.error}>{error}</Text> : notice ? <Text style={styles.notice}>{notice}</Text> : null;

  const renderVerify = () => {
    const viaLoginEmail = loginChannel === 'email';
    return (
      <>
        <TouchableOpacity onPress={backToForm} style={styles.back} accessibilityRole="button">
          <ArrowLeft size={16} color={C.primarySaffron} />
          <Text style={styles.link}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>{forgotFlow ? 'Reset password' : 'Verify'}</Text>
        {forgotFlow ? (
          <Text style={styles.sub}>
            We sent a code to <Text style={styles.bold}>{maskEmail(cleanId)}</Text>.
          </Text>
        ) : signupMode ? (
          <>
            <Text style={styles.sub}>Enter the 6-digit code from your email or your SMS. Either one is enough.</Text>
            <View style={styles.chips}>
              {sentTo.includes('email') ? (
                <View style={styles.chip}>
                  <Mail size={15} color={C.primarySaffron} />
                  <Text style={styles.chipText} numberOfLines={1}>{maskEmail(email)}</Text>
                  <Check size={14} color={C.bilvaGreen} />
                </View>
              ) : null}
              {sentTo.includes('sms') ? (
                <View style={styles.chip}>
                  <MessageSquare size={15} color={C.primarySaffron} />
                  <Text style={styles.chipText} numberOfLines={1}>{maskPhone(toDigits(phone))}</Text>
                  <Check size={14} color={C.bilvaGreen} />
                </View>
              ) : null}
            </View>
          </>
        ) : (
          <Text style={styles.sub}>
            We {viaLoginEmail ? 'emailed' : 'texted'} a code to <Text style={styles.bold}>{viaLoginEmail ? maskEmail(cleanId) : maskPhone(cleanId)}</Text>.
          </Text>
        )}

        <OtpInput ref={codeRef} value={code} onChange={setCode} hasError={Boolean(error)} onComplete={forgotFlow ? undefined : (c) => submit(c)} />
        {devOtp ? <Text style={styles.devHint}>Test code: {devOtp}</Text> : null}

        {forgotFlow ? (
          <View style={styles.stack}>
            <Field label="New password" icon={null} value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry autoCapitalize="none" />
            <Field label="Confirm password" icon={null} value={confirm} onChangeText={setConfirm} placeholder="Re-enter password" secureTextEntry autoCapitalize="none" />
          </View>
        ) : null}

        {banner}
        <View style={styles.actions}>{button(forgotFlow ? 'Reset password' : 'Verify & continue', () => submit())}</View>
        <View style={styles.rowCenter}>
          <TouchableOpacity onPress={resend} disabled={resendIn > 0 || loading}>
            <Text style={[styles.link, resendIn > 0 && styles.linkOff]}>{resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderForm = () => (
    <>
      <View style={styles.tabs}>
        {(['signup', 'login'] as const).map((t) => {
          const active = tab === t;
          return (
            <TouchableOpacity key={t} style={[styles.tab, active && styles.tabOn]} onPress={() => switchTab(t)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
              <Text style={[styles.tabText, active && styles.tabTextOn]}>{t === 'signup' ? 'Sign up' : 'Login'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {signupMode ? (
        <>
          <Text style={styles.sub}>Create your account. Both details are required.</Text>
          <View style={styles.stack}>
            <Field label="Email" icon={<Mail size={19} color="#8A7D70" />} value={email} onChangeText={(v) => { setEmail(v); setError(null); }} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
            <Field label="Mobile number" icon={<Smartphone size={19} color="#8A7D70" />} prefix="+91" value={phone} onChangeText={(v) => { setPhone(v.replace(/\D/g, '').slice(0, 10)); setError(null); }} placeholder="10-digit number" keyboardType="phone-pad" autoComplete="tel" maxLength={10} />
          </View>
          <View style={styles.info}>
            <Check size={15} color={C.bilvaGreen} />
            <Text style={styles.infoText}>We send a code to both. Entering either one verifies you.</Text>
          </View>
          {banner}
          <View style={styles.actions}>{button('Continue', sendSignup)}</View>
        </>
      ) : (
        <>
          <Text style={styles.sub}>Welcome back. Enter your mobile number or email.</Text>
          <View style={styles.stack}>
            <Field
              label="Mobile number or email"
              icon={idIsPhone ? <Smartphone size={19} color="#8A7D70" /> : <Mail size={19} color="#8A7D70" />}
              prefix={idIsPhone ? '+91' : undefined}
              value={identifier}
              onChangeText={(v) => { setIdentifier(v); setError(null); }}
              placeholder="Mobile number or email"
              keyboardType={idIsPhone ? 'phone-pad' : 'email-address'}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
            />
          </View>
          {banner}
          <View style={styles.actions}>{button('Send code', sendLogin)}</View>
        </>
      )}
    </>
  );

  const renderPassword = () => (
    <>
      <TouchableOpacity onPress={backToForm} style={styles.back} accessibilityRole="button">
        <ArrowLeft size={16} color={C.primarySaffron} />
        <Text style={styles.link}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>Login with password</Text>
      <View style={styles.stack}>
        <Field label="Email" icon={<Mail size={19} color="#8A7D70" />} value={identifier} onChangeText={(v) => { setIdentifier(v); setError(null); }} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        {step === 'password' ? <Field label="Password" icon={null} value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry autoCapitalize="none" autoComplete="password" /> : null}
      </View>
      {banner}
      <View style={styles.actions}>{button('Login', () => submit())}</View>
      <View style={styles.rowCenter}>
        <TouchableOpacity onPress={() => { reset(); setStep('forgot'); }}>
          <Text style={styles.linkMuted}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderForgot = () => (
    <>
      <TouchableOpacity onPress={() => { reset(); setStep('password'); }} style={styles.back} accessibilityRole="button">
        <ArrowLeft size={16} color={C.primarySaffron} />
        <Text style={styles.link}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>Reset password</Text>
      <Text style={styles.sub}>Enter your email and we will send you a code.</Text>
      <View style={styles.stack}>
        <Field label="Email" icon={<Mail size={19} color="#8A7D70" />} value={identifier} onChangeText={(v) => { setIdentifier(v); setError(null); }} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
      </View>
      {banner}
      <View style={styles.actions}>{button('Send code', sendForgot)}</View>
    </>
  );

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAwareScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable onLongPress={() => options.password && (reset(), setStep('password'))} delayLongPress={900} accessibilityRole="header">
          <Text style={styles.title}>Login or Sign up</Text>
        </Pressable>
        <View style={styles.titleBar} />

        {step === 'verify' ? renderVerify() : step === 'password' ? renderPassword() : step === 'forgot' ? renderForgot() : renderForm()}

        <Text style={styles.legal}>
          By continuing you agree to our{' '}
          <Text style={styles.boldLink} onPress={() => Linking.openURL(`${WEBSITE_URL}/privacy-policy`)}>
            Privacy Policy
          </Text>
        </Text>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const C = THEME.colors;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFBF5' },
  scroll: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 },
  title: { fontSize: 32, fontWeight: '800', color: C.heading, letterSpacing: -0.6 },
  titleBar: { width: 44, height: 5, borderRadius: 3, backgroundColor: C.primarySaffron, marginTop: 10, marginBottom: 26 },
  heading: { fontSize: 24, fontWeight: '800', color: C.heading, letterSpacing: -0.3, marginBottom: 6 },
  sub: { fontSize: 14.5, lineHeight: 21, color: C.bodyText, marginBottom: 18 },
  bold: { fontWeight: '800', color: C.heading },
  tabs: { flexDirection: 'row', backgroundColor: '#F3E9DB', borderRadius: 14, padding: 4, marginBottom: 20 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 11 },
  tabOn: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: C.primarySaffron },
  tabText: { fontSize: 15, fontWeight: '800', color: C.mutedText },
  tabTextOn: { color: C.primarySaffron },
  stack: { gap: 16 },
  fieldWrap: { gap: 7 },
  label: { fontSize: 13, fontWeight: '800', color: C.heading, letterSpacing: 0.2 },
  field: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: 14, borderWidth: 1.5, borderColor: '#E6DACB', paddingHorizontal: 15, gap: 10, backgroundColor: '#FFFFFF' },
  fieldFocused: { borderColor: C.primarySaffron },
  prefix: { color: C.heading, fontSize: 16, fontWeight: '800' },
  input: { flex: 1, color: C.heading, fontSize: 16.5, paddingVertical: 0, height: '100%' },
  info: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, backgroundColor: '#EEF8F0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  infoText: { flex: 1, fontSize: 13, color: '#2F6B3F', fontWeight: '600', lineHeight: 18 },
  actions: { marginTop: 20 },
  button: { height: 56, borderRadius: 14, backgroundColor: C.primarySaffron, alignItems: 'center', justifyContent: 'center' },
  buttonBusy: { opacity: 0.75 },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  error: { color: '#B91C1C', fontSize: 14, fontWeight: '600', marginTop: 14 },
  notice: { color: C.primarySaffron, fontSize: 14, fontWeight: '700', marginTop: 14 },
  devHint: { fontSize: 13, color: C.bilvaGreen, marginTop: 10 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: 14 },
  chips: { gap: 8, marginBottom: 18 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#EFE3D0', borderRadius: 12, paddingHorizontal: 12, height: 42 },
  chipText: { flex: 1, fontSize: 14, fontWeight: '700', color: C.heading },
  rowCenter: { alignItems: 'center', marginTop: 18 },
  link: { color: C.primarySaffron, fontWeight: '800', fontSize: 14.5 },
  linkMuted: { color: C.mutedText, fontWeight: '700', fontSize: 14.5 },
  linkOff: { color: C.mutedText },
  boldLink: { color: C.primarySaffron, fontWeight: '800' },
  legal: { textAlign: 'center', fontSize: 12.5, color: C.mutedText, marginTop: 36 },
});
