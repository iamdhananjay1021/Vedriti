import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { OtpInput } from '../components/ui/OtpInput';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { THEME } from '../constants/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPhone } from '../utils/format';
import { WEBSITE_URL } from '../config/api';

type Mode = 'start' | 'details' | 'verify' | 'password' | 'forgot';
type Missing = 'email' | 'phone';

const REMEMBER_KEY = 'vedrit.login.remember';

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

const looksLikeEmail = (value: string) => /[@a-z]/i.test(value);

const toDigits = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length > 10 && digits.startsWith('91') ? digits.slice(-10) : digits.slice(0, 10);
};

const mask = (value: string, isEmail: boolean) => {
  if (isEmail) {
    const [user, domain] = value.trim().split('@');
    if (!domain) return value;
    const visible = user.length <= 2 ? user.slice(0, 1) : user.slice(0, 2);
    return `${visible}${'•'.repeat(Math.max(2, user.length - visible.length))}@${domain}`;
  }
  return `+91 ${value.slice(0, 2)}••••••${value.slice(-2)}`;
};

const Input = React.forwardRef<TextInput, TextInputProps & { prefix?: string }>(({ prefix, style, ...input }, ref) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#9A8F84"
        selectionColor={THEME.colors.primarySaffron}
        style={[styles.input, style]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...input}
      />
    </View>
  );
});
Input.displayName = 'Input';

export const LoginScreen: React.FC = () => {
  const { completeLogin } = useAuth();
  const { inset } = useKeyboardInset();
  const typing = inset > 0;
  const codeRef = useRef<TextInput>(null);

  const [mode, setMode] = useState<Mode>('start');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [options, setOptions] = useState({ email: true, sms: true, password: true });

  const [identifier, setIdentifier] = useState('');
  const [needs, setNeeds] = useState<Missing | null>(null);
  const [extra, setExtra] = useState('');
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [forgotFlow, setForgotFlow] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const isEmail = looksLikeEmail(identifier);
  const cleanId = isEmail ? identifier.trim() : toDigits(identifier);
  const isPhoneInput = Boolean(identifier.trim()) && !isEmail;

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

  const goto = (next: Mode) => {
    setError(null);
    setDevOtp(undefined);
    setResendIn(0);
    setCode('');
    setPassword('');
    setConfirm('');
    setMode(next);
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
    SecureStore.setItemAsync(REMEMBER_KEY, cleanId).catch(() => undefined);
    await completeLogin(result);
  };

  const focusCode = () => setTimeout(() => codeRef.current?.focus(), 350);

  const detailsPayload = () => (needs === 'phone' ? { phone: toDigits(extra) } : needs === 'email' ? { email: extra.trim() } : {});

  const checkIdentifier = () => {
    if (!cleanId) return 'Enter your email or mobile number';
    if (isEmail ? !isValidEmail(cleanId) : !isValidPhone(cleanId)) return isEmail ? 'Enter a valid email address' : 'Enter a valid 10-digit mobile number';
    if (!isEmail && !options.sms) return 'Mobile OTP is not available right now. Please use your email.';
    if (isEmail && !options.email && mode !== 'password' && mode !== 'forgot') return 'Email login is not available right now. Please use your mobile number.';
    return null;
  };

  const sendCode = (forgot = false) => {
    if (forgot) {
      if (!isValidEmail(cleanId)) return setError('Enter the email of your account');
      return run(async () => {
        const res = await api.forgotPassword(cleanId);
        setForgotFlow(true);
        setChannel('email');
        setDevOtp(res.devOtp);
        setResendIn(res.resendInSeconds);
        setMode('verify');
        focusCode();
      });
    }
    const problem = checkIdentifier();
    if (problem) return setError(problem);
    if (mode === 'details') {
      if (needs === 'phone' && !isValidPhone(toDigits(extra))) return setError('Enter a valid 10-digit mobile number');
      if (needs === 'email' && !isValidEmail(extra)) return setError('Enter a valid email address');
    }
    run(async () => {
      const res = await api.requestLoginOtp({ identifier: cleanId, ...(mode === 'details' ? detailsPayload() : {}) });
      if (res.needsDetails) {
        setNeeds(res.needsDetails);
        setExtra('');
        setMode('details');
        return;
      }
      setForgotFlow(false);
      setChannel(res.channel);
      setDevOtp(res.devOtp);
      setResendIn(res.resendInSeconds || 30);
      setMode('verify');
      focusCode();
    });
  };

  const resend = () => {
    if (resendIn > 0 || loading) return;
    run(async () => {
      const res = forgotFlow ? await api.forgotPassword(cleanId) : await api.requestLoginOtp({ identifier: cleanId, ...detailsPayload() });
      setCode('');
      setDevOtp(res.devOtp);
      setResendIn(res.resendInSeconds || 30);
      focusCode();
    });
  };

  const submit = (otpCode = code) => {
    if (mode === 'password') {
      if (!isValidEmail(cleanId)) return setError('Use your email address with a password');
      if (!password) return setError('Enter your password');
      return run(() => finishLogin(() => api.loginEmail(cleanId, password)));
    }
    if (!/^\d{6}$/.test(otpCode)) return setError('Enter the 6-digit code');
    if (forgotFlow) {
      if (password.length < 8) return setError('Password must be at least 8 characters');
      if (password !== confirm) return setError('Passwords do not match');
      return run(() => finishLogin(() => api.resetPassword(cleanId, otpCode, password)));
    }
    return run(() => finishLogin(() => api.verifyLoginOtp({ identifier: cleanId, otp: otpCode, ...detailsPayload() })));
  };

  const button = (title: string, onPress: () => void) => (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.85} style={[styles.button, loading && styles.buttonBusy]} accessibilityRole="button" accessibilityState={{ busy: loading, disabled: loading }}>
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{title}</Text>}
    </TouchableOpacity>
  );

  const errorBlock = error ? <Text style={styles.error}>{error}</Text> : null;

  const renderVerify = () => {
    const viaEmail = channel === 'email';
    return (
      <>
        <Text style={styles.title}>{forgotFlow ? 'Reset password' : 'Enter code'}</Text>
        <Text style={styles.sub}>
          Sent to <Text style={styles.bold}>{mask(cleanId, viaEmail)}</Text>
        </Text>
        <OtpInput ref={codeRef} value={code} onChange={setCode} hasError={Boolean(error)} onComplete={forgotFlow ? undefined : (c) => submit(c)} />
        {devOtp ? <Text style={styles.devHint}>Test code: {devOtp}</Text> : null}
        {forgotFlow ? (
          <View style={styles.stack}>
            <Input value={password} onChangeText={setPassword} placeholder="New password" secureTextEntry autoCapitalize="none" />
            <Input value={confirm} onChangeText={setConfirm} placeholder="Confirm password" secureTextEntry autoCapitalize="none" />
          </View>
        ) : null}
        {errorBlock}
        <View style={styles.actions}>{button(forgotFlow ? 'Reset password' : 'Verify', () => submit())}</View>
        <View style={styles.links}>
          <TouchableOpacity onPress={resend} disabled={resendIn > 0 || loading}>
            <Text style={[styles.link, resendIn > 0 && styles.linkOff]}>{resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setNeeds(null); setForgotFlow(false); goto('start'); }}>
            <Text style={styles.linkMuted}>{viaEmail ? 'Change email' : 'Change number'}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderDetails = () => (
    <>
      <Text style={styles.title}>One more detail</Text>
      <Text style={styles.sub}>Add your {needs === 'phone' ? 'mobile number' : 'email'} to create your account.</Text>
      <View style={styles.stack}>
        <Input value={isPhoneInput ? cleanId : identifier} editable={false} prefix={isPhoneInput ? '+91' : undefined} style={styles.locked} />
        {needs === 'phone' ? (
          <Input value={extra} onChangeText={(v) => setExtra(v.replace(/\D/g, '').slice(0, 10))} prefix="+91" placeholder="Mobile number" keyboardType="phone-pad" maxLength={10} autoFocus />
        ) : (
          <Input value={extra} onChangeText={setExtra} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" autoFocus />
        )}
      </View>
      {errorBlock}
      <View style={styles.actions}>{button('Send code', () => sendCode())}</View>
      <View style={styles.links}>
        <TouchableOpacity onPress={() => goto('start')}>
          <Text style={styles.linkMuted}>Back</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStart = () => (
    <>
      <Text style={styles.title}>{mode === 'password' ? 'Login with password' : mode === 'forgot' ? 'Reset password' : 'Login'}</Text>
      <View style={styles.stack}>
        <Input
          value={identifier}
          onChangeText={(v) => {
            setIdentifier(v);
            setError(null);
          }}
          prefix={isPhoneInput ? '+91' : undefined}
          placeholder={mode === 'start' ? 'Mobile number or email' : 'Email address'}
          keyboardType={isPhoneInput ? 'phone-pad' : 'email-address'}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
        />
        {mode === 'password' ? <Input value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry autoCapitalize="none" autoComplete="password" /> : null}
      </View>
      {errorBlock}
      <View style={styles.actions}>
        {mode === 'password' ? button('Login', () => submit()) : mode === 'forgot' ? button('Send code', () => sendCode(true)) : button('Continue', () => sendCode())}
      </View>
      <View style={styles.links}>
        {mode === 'start' && options.password ? (
          <TouchableOpacity onPress={() => goto('password')}>
            <Text style={styles.link}>Use password</Text>
          </TouchableOpacity>
        ) : null}
        {mode === 'password' ? (
          <>
            <TouchableOpacity onPress={() => goto('forgot')}>
              <Text style={styles.linkMuted}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goto('start')}>
              <Text style={styles.link}>Use a code instead</Text>
            </TouchableOpacity>
          </>
        ) : null}
        {mode === 'forgot' ? (
          <TouchableOpacity onPress={() => goto('password')}>
            <Text style={styles.linkMuted}>Back</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={[styles.body, { paddingBottom: typing ? inset + 8 : 72 }]}>
        {mode === 'verify' ? renderVerify() : mode === 'details' ? renderDetails() : renderStart()}
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
  );
};

const C = THEME.colors;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  body: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: C.heading, letterSpacing: -0.5, marginBottom: 6 },
  sub: { fontSize: 14.5, color: C.bodyText, marginBottom: 22 },
  bold: { fontWeight: '800', color: C.heading },
  stack: { gap: 12, marginTop: 18 },
  field: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: 12, borderWidth: 1.5, borderColor: '#E3D9CC', paddingHorizontal: 16, gap: 10, backgroundColor: '#FFFFFF' },
  fieldFocused: { borderColor: C.primarySaffron },
  prefix: { color: C.heading, fontSize: 16, fontWeight: '700' },
  input: { flex: 1, color: C.heading, fontSize: 16.5, paddingVertical: 0, height: '100%' },
  locked: { color: C.mutedText },
  actions: { marginTop: 18 },
  button: { height: 56, borderRadius: 12, backgroundColor: C.primarySaffron, alignItems: 'center', justifyContent: 'center' },
  buttonBusy: { opacity: 0.75 },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  error: { color: '#B91C1C', fontSize: 14, fontWeight: '600', marginTop: 12 },
  devHint: { fontSize: 13, color: C.bilvaGreen, marginTop: 10 },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginTop: 20 },
  link: { color: C.primarySaffron, fontWeight: '800', fontSize: 14.5 },
  linkMuted: { color: C.mutedText, fontWeight: '700', fontSize: 14.5 },
  linkOff: { color: C.mutedText },
  boldLink: { color: C.primarySaffron, fontWeight: '800' },
  legal: { position: 'absolute', left: 0, right: 0, bottom: 18, textAlign: 'center', fontSize: 12.5, color: C.mutedText, paddingHorizontal: 24 },
});
