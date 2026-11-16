import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Linking, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Smartphone, User } from 'lucide-react-native';
import { OtpInput } from '../components/ui/OtpInput';
import { GoogleIcon } from '../components/common/GoogleIcon';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { THEME } from '../constants/theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPhone, localPhone } from '../utils/format';
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

  const [mode, setMode] = useState<Mode>('start');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [options, setOptions] = useState({ email: true, sms: true, password: true });

  const [identifier, setIdentifier] = useState('');
  const [needs, setNeeds] = useState<Missing | null>(null);
  const [extra, setExtra] = useState('');
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isEmail = looksLikeEmail(identifier);
  const cleanId = isEmail ? identifier.trim() : toDigits(identifier);
  const inputType: 'empty' | 'email' | 'phone' = !identifier.trim() ? 'empty' : isEmail ? 'email' : 'phone';

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

  const resetState = () => {
    setError(null);
    setDevOtp(undefined);
    setResendIn(0);
    setCode('');
    setPassword('');
    setConfirm('');
  };

  const goto = (next: Mode) => {
    resetState();
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

  const checkIdentifier = () => {
    if (!cleanId) return 'Enter your email or mobile number';
    if (isEmail ? !isValidEmail(cleanId) : !isValidPhone(cleanId)) return isEmail ? 'Please enter a valid email address' : 'Please enter a valid 10-digit mobile number';
    if (!isEmail && !options.sms) return 'Mobile OTP login is not available right now. Please use your email.';
    if (isEmail && !options.email && mode !== 'password' && mode !== 'forgot') return 'Email login is not available right now. Please use your mobile number.';
    return null;
  };

  const detailsPayload = () => {
    if (!needs) return {};
    const value = needs === 'phone' ? toDigits(extra) : extra.trim();
    return needs === 'phone' ? { phone: value } : { email: value };
  };

  const sendCode = () => {
    if (mode === 'forgot') {
      if (!isValidEmail(cleanId)) return setError('Enter the email of your account');
      return run(async () => {
        const res = await api.forgotPassword(cleanId);
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
      if (needs === 'phone' && !isValidPhone(toDigits(extra))) return setError('Please enter a valid 10-digit mobile number');
      if (needs === 'email' && !isValidEmail(extra)) return setError('Please enter a valid email address');
    }
    run(async () => {
      const res = await api.requestLoginOtp({ identifier: cleanId, ...(mode === 'details' ? detailsPayload() : {}) });
      if (res.needsDetails) {
        setNeeds(res.needsDetails);
        setExtra('');
        setMode('details');
        return;
      }
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
      const res = needsReset()
        ? await api.forgotPassword(cleanId)
        : await api.requestLoginOtp({ identifier: cleanId, ...(needs ? detailsPayload() : {}) });
      setCode('');
      setDevOtp(res.devOtp);
      setResendIn(res.resendInSeconds || 30);
      focusCode();
    });
  };

  const needsReset = () => forgotFlow;
  const [forgotFlow, setForgotFlow] = useState(false);

  const submit = (otpCode = code) => {
    if (mode === 'password') {
      if (!isValidEmail(cleanId)) return setError('Use your email address with a password');
      if (!password) return setError('Please enter your password');
      return run(() => finishLogin(() => api.loginEmail(cleanId, password)));
    }
    if (!/^\d{6}$/.test(otpCode)) return setError('Please enter the 6-digit code');
    if (forgotFlow) {
      if (password.length < 8) return setError('Password must be at least 8 characters');
      if (password !== confirm) return setError('Passwords do not match');
      return run(() => finishLogin(() => api.resetPassword(cleanId, otpCode, password)));
    }
    return run(() =>
      finishLogin(() => api.verifyLoginOtp({ identifier: cleanId, otp: otpCode, ...(needs ? detailsPayload() : {}), ...(name.trim() ? { name: name.trim() } : {}) }))
    );
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

  const errorBlock = error ? <Text style={styles.errorPlain}>{error}</Text> : null;

  const identifierInput = (
    <Input
      icon={inputType === 'phone' ? <Smartphone size={19} color="#8A7D70" /> : <Mail size={19} color="#8A7D70" />}
      prefix={inputType === 'phone' ? '+91' : undefined}
      value={identifier}
      onChangeText={(v) => {
        setIdentifier(v);
        setError(null);
      }}
      placeholder="Email or mobile number"
      keyboardType={inputType === 'phone' ? 'phone-pad' : 'email-address'}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="username"
    />
  );

  const renderVerify = () => {
    const viaEmail = channel === 'email';
    return (
      <View>
        {!typing ? <Steps step={2} labels={[forgotFlow ? 'Email' : 'Details', 'Verify']} /> : null}
        <Text style={styles.title}>{forgotFlow ? 'Reset password' : 'Enter the code'}</Text>
        <Text style={styles.sub}>
          We {viaEmail ? 'emailed' : 'texted'} a 6-digit code to <Text style={styles.bold}>{mask(cleanId, viaEmail)}</Text>.{' '}
          {viaEmail ? 'It can take a minute, check spam too.' : 'It usually arrives within a few seconds.'}
        </Text>

        <OtpInput ref={codeRef} value={code} onChange={setCode} hasError={Boolean(error)} onComplete={forgotFlow ? undefined : (c) => submit(c)} />
        {devOtp ? <Text style={styles.devHint}>Test code: {devOtp}</Text> : null}

        {mode === 'verify' && !forgotFlow && isNewAccount ? (
          <View style={[styles.fields, styles.fieldsTop]}>
            <Input icon={<User size={19} color="#8A7D70" />} value={name} onChangeText={setName} placeholder="Your name (optional)" autoComplete="name" />
          </View>
        ) : null}

        {forgotFlow ? (
          <View style={[styles.fields, styles.fieldsTop]}>
            {passwordInput('New password', password, setPassword, 'new-password')}
            {passwordInput('Confirm password', confirm, setConfirm, 'new-password')}
          </View>
        ) : null}

        {errorBlock}

        <View style={styles.actions}>{button(forgotFlow ? 'Reset & login' : 'Verify & continue', () => submit())}</View>

        <View style={styles.rowCenter}>
          <TouchableOpacity
            onPress={() => {
              setForgotFlow(false);
              setNeeds(null);
              goto('start');
            }}
            style={styles.inlineLink}
          >
            <ArrowLeft size={14} color={THEME.colors.primarySaffron} />
            <Text style={styles.link}>{viaEmail ? 'Change email' : 'Change number'}</Text>
          </TouchableOpacity>
          <Text style={styles.dotSep}>•</Text>
          <TouchableOpacity onPress={resend} disabled={resendIn > 0 || loading}>
            <Text style={[styles.link, resendIn > 0 && styles.linkOff]}>{resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const [isNewAccount, setIsNewAccount] = useState(false);
  useEffect(() => {
    setIsNewAccount(Boolean(needs));
  }, [needs]);

  const renderDetails = () => (
    <View>
      {!typing ? <Steps step={1} labels={['Details', 'Verify']} /> : null}
      <TouchableOpacity style={styles.inlineLinkRow} onPress={() => goto('start')} accessibilityRole="button">
        <ArrowLeft size={15} color={THEME.colors.primarySaffron} />
        <Text style={styles.link}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.sub}>
        New to VedRit. Add your {needs === 'phone' ? 'mobile number' : 'email'} too. We will send the code to your {inputType === 'email' ? 'email' : 'mobile'}.
      </Text>
      <View style={styles.fields}>
        <View style={styles.lockedRow}>
          {inputType === 'phone' ? <Smartphone size={18} color="#8A7D70" /> : <Mail size={18} color="#8A7D70" />}
          <Text style={styles.lockedText} numberOfLines={1}>
            {inputType === 'phone' ? `+91 ${cleanId}` : cleanId}
          </Text>
        </View>
        {needs === 'phone' ? (
          <Input icon={<Smartphone size={19} color="#8A7D70" />} prefix="+91" value={extra} onChangeText={(v) => setExtra(v.replace(/\D/g, '').slice(0, 10))} placeholder="Mobile number" keyboardType="phone-pad" autoComplete="tel" maxLength={10} />
        ) : (
          <Input icon={<Mail size={19} color="#8A7D70" />} value={extra} onChangeText={setExtra} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        )}
      </View>
      {errorBlock}
      <View style={styles.actions}>{button('Send code', sendCode)}</View>
    </View>
  );

  const renderStart = () => (
    <View>
      {!typing && mode === 'start' ? <Steps step={1} labels={['Email or mobile', 'Verify']} /> : null}
      {mode === 'forgot' ? (
        <TouchableOpacity style={styles.inlineLinkRow} onPress={() => goto('password')} accessibilityRole="button">
          <ArrowLeft size={15} color={THEME.colors.primarySaffron} />
          <Text style={styles.link}>Back to login</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={styles.title}>{mode === 'start' ? 'Login or sign up' : mode === 'password' ? 'Login with password' : 'Reset password'}</Text>
      <Text style={styles.sub}>
        {mode === 'start'
          ? 'Enter your email or mobile number. We will send you a one-time code. New here? We will create your account.'
          : mode === 'password'
            ? 'Use the email and password of your account.'
            : 'Enter your email and we will send you a code.'}
      </Text>

      <View style={styles.fields}>
        {identifierInput}
        {mode === 'password' ? passwordInput('Password', password, setPassword, 'password') : null}
      </View>

      {errorBlock}

      <View style={styles.actions}>
        {mode === 'password'
          ? button('Login', () => submit())
          : button(mode === 'forgot' ? 'Send code' : 'Continue', () => {
              setForgotFlow(mode === 'forgot');
              setNeeds(null);
              sendCode();
            })}
      </View>

      {mode === 'start' || mode === 'password' ? (
        <View style={styles.rowCenter}>
          {mode === 'password' || options.password ? (
            <TouchableOpacity style={styles.inlineLink} onPress={() => goto(mode === 'start' ? 'password' : 'start')}>
              <Lock size={13} color={THEME.colors.primarySaffron} />
              <Text style={styles.link}>{mode === 'start' ? 'Use password instead' : 'Use a one-time code'}</Text>
            </TouchableOpacity>
          ) : null}
          {mode === 'password' ? (
            <>
              <Text style={styles.dotSep}>•</Text>
              <TouchableOpacity onPress={() => goto('forgot')}>
                <Text style={styles.linkMuted}>Forgot password?</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      ) : null}

      {mode === 'start' && !typing ? (
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
          {!typing && mode !== 'verify' ? (
            <View style={styles.greeting}>
              <Text style={styles.greetHindi}>स्वागतम्</Text>
              <Text style={styles.greetSub}>Puja, appointments and kundli with Pandit Ji</Text>
            </View>
          ) : null}
          <View style={styles.card}>{mode === 'verify' ? renderVerify() : mode === 'details' ? renderDetails() : renderStart()}</View>
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
  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, borderRadius: 14, backgroundColor: '#F7EFE3', paddingHorizontal: 14 },
  lockedText: { flex: 1, color: C.heading, fontSize: 15, fontWeight: '700' },
  prefix: { color: C.heading, fontSize: 15, fontWeight: '800' },
  input: { flex: 1, color: C.heading, fontSize: 15.5, paddingVertical: 0, height: '100%' },
  actions: { marginTop: 18 },
  button: { height: 54, borderRadius: 14, backgroundColor: C.primarySaffron, alignItems: 'center', justifyContent: 'center' },
  buttonBusy: { opacity: 0.75 },
  buttonText: { color: '#FFFFFF', fontSize: 16.5, fontWeight: '800' },
  errorPlain: { color: '#B91C1C', fontSize: 13.5, fontWeight: '600', marginTop: 12 },
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
