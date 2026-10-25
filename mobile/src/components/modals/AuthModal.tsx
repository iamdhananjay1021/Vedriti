import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Phone,
  Mail,
  Lock,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Flame,
  User,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useAuth, STATIC_OTP } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithStaticOtp,
    quickLoginWithPhone,
    signupWithEmail,
    loginWithEmail,
  } = useAuth();

  // Auth Method: 'phone' | 'email'
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  // Phone Flow States
  const [phoneStep, setPhoneStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [phoneGotra, setPhoneGotra] = useState('');
  const [otp, setOtp] = useState(STATIC_OTP);

  // Email Flow States: 'signup' | 'signin'
  const [emailMode, setEmailMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailName, setEmailName] = useState('');
  const [emailGotra, setEmailGotra] = useState('');
  const [emailPhone, setEmailPhone] = useState('');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Phone: Request OTP
  const handleSendOtp = () => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setErrorMessage('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।');
      return;
    }
    setErrorMessage('');
    setOtp(STATIC_OTP);
    setPhoneStep('otp');
  };

  // Phone: 1-Click Quick Login
  const handleQuickLogin = () => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setErrorMessage('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।');
      return;
    }
    const result = quickLoginWithPhone(phone, phoneName, phoneGotra);
    if (result.success) {
      Alert.alert('प्रवेश सफल! 🕉️', result.message);
      handleReset();
    } else {
      setErrorMessage(result.message);
    }
  };

  // Phone: Verify OTP
  const handleVerifyOtp = () => {
    const result = loginWithStaticOtp(phone, otp, phoneName, phoneGotra);
    if (result.success) {
      Alert.alert('प्रवेश सफल! 🕉️', result.message);
      handleReset();
    } else {
      setErrorMessage(result.message);
    }
  };

  // Email: Sign Up
  const handleEmailSignUp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('कृपया मान्य ईमेल पता दर्ज करें।');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    const result = await signupWithEmail(email, password, emailName, emailGotra, emailPhone);
    setIsLoading(false);

    if (result.success) {
      Alert.alert('साधना खाता निर्मित! 🕉️', result.message);
      handleReset();
    } else {
      setErrorMessage(result.message);
    }
  };

  // Email: Sign In
  const handleEmailSignIn = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('कृपया मान्य ईमेल पता दर्ज करें।');
      return;
    }
    if (!password) {
      setErrorMessage('कृपया पासवर्ड दर्ज करें।');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    const result = await loginWithEmail(email, password);
    setIsLoading(false);

    if (result.success) {
      Alert.alert('प्रवेश सफल! 🕉️', result.message);
      handleReset();
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleReset = () => {
    setPhoneStep('phone');
    setPhone('');
    setPhoneName('');
    setPhoneGotra('');
    setOtp(STATIC_OTP);
    setEmail('');
    setPassword('');
    setEmailName('');
    setEmailGotra('');
    setEmailPhone('');
    setErrorMessage('');
    setIsLoading(false);
    closeAuthModal();
  };

  return (
    <Modal visible={isAuthModalOpen} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.brandRow}>
              <View style={styles.logoCircle}>
                <Flame size={18} color="#C65D24" />
              </View>
              <View>
                <Text style={styles.brandTitle}>वेदरीति गर्भगृह प्रवेश</Text>
                <Text style={styles.brandSub}>Sanatan Devotee Authentication</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleReset} style={styles.closeBtn}>
              <X size={18} color="#4A3428" />
            </TouchableOpacity>
          </View>

          {/* Segmented Tab: Phone vs Email */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              onPress={() => {
                setAuthMethod('phone');
                setErrorMessage('');
              }}
              style={[
                styles.segmentedTab,
                authMethod === 'phone' && styles.segmentedTabActive,
              ]}
              activeOpacity={0.8}
            >
              <Phone
                size={14}
                color={authMethod === 'phone' ? '#FFFFFF' : '#786B60'}
              />
              <Text
                style={[
                  styles.segmentedTabText,
                  authMethod === 'phone' && styles.segmentedTabTextActive,
                ]}
              >
                Mobile OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setAuthMethod('email');
                setErrorMessage('');
              }}
              style={[
                styles.segmentedTab,
                authMethod === 'email' && styles.segmentedTabActive,
              ]}
              activeOpacity={0.8}
            >
              <Mail
                size={14}
                color={authMethod === 'email' ? '#FFFFFF' : '#786B60'}
              />
              <Text
                style={[
                  styles.segmentedTabText,
                  authMethod === 'email' && styles.segmentedTabTextActive,
                ]}
              >
                Direct Email
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.bodyPad} keyboardShouldPersistTaps="handled">
            {/* Banner */}
            <View style={styles.infoBanner}>
              <ShieldCheck size={14} color="#C65D24" />
              <Text style={styles.infoBannerText}>
                100% सुरक्षित वैदिक प्रमाणीकरण • संकल्प पत्र व BlueDart प्रसाद ट्रैकिंग
              </Text>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* ========================================================= */}
            {/* TAB 1: MOBILE PHONE + OTP                                  */}
            {/* ========================================================= */}
            {authMethod === 'phone' && phoneStep === 'phone' && (
              <View>
                <Text style={styles.fieldLabel}>मोबाइल नंबर (Mobile Number) *</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeBox}>
                    <Text style={styles.flagIcon}>🇮🇳</Text>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    value={phone}
                    onChangeText={(val) => {
                      setPhone(val);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="98765 43210"
                    placeholderTextColor="#A89E94"
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={styles.phoneInput}
                  />
                </View>

                <Text style={styles.fieldLabel}>यजमान का पूरा नाम (Full Name)</Text>
                <TextInput
                  value={phoneName}
                  onChangeText={setPhoneName}
                  placeholder="उदा. आनंद शर्मा / रमेश वर्मा"
                  placeholderTextColor="#A89E94"
                  style={styles.textInput}
                />

                <Text style={styles.fieldLabel}>गोत्र (Gotra Lineage)</Text>
                <TextInput
                  value={phoneGotra}
                  onChangeText={setPhoneGotra}
                  placeholder="उदा. कश्यप / भारद्वाज / वशिष्ठ"
                  placeholderTextColor="#A89E94"
                  style={styles.textInput}
                />

                {/* Primary Get OTP */}
                <TouchableOpacity
                  onPress={handleSendOtp}
                  activeOpacity={0.88}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>OTP प्राप्त करें (Get Vedic OTP) →</Text>
                </TouchableOpacity>

                {/* Secondary 1-Click Quick Login */}
                <TouchableOpacity
                  onPress={handleQuickLogin}
                  activeOpacity={0.85}
                  style={styles.quickLoginButton}
                >
                  <Sparkles size={13} color="#C65D24" />
                  <Text style={styles.quickLoginButtonText}>
                    ⚡ 1-क्लिक प्रवेश (स्थिर OTP {STATIC_OTP} सहित)
                  </Text>
                </TouchableOpacity>

                <Text style={styles.noticeText}>
                  ✨ *परीक्षण हेतु स्थिर OTP{' '}
                  <Text style={{ fontWeight: '800', color: '#C65D24' }}>"{STATIC_OTP}"</Text>{' '}
                  मान्य है।
                </Text>
              </View>
            )}

            {/* TAB 1: OTP VERIFY STEP */}
            {authMethod === 'phone' && phoneStep === 'otp' && (
              <View>
                <View style={styles.otpHeaderBox}>
                  <Sparkles size={16} color="#C65D24" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.otpHdrTitle}>सुरक्षा कोड (Vedic OTP) दर्ज करें</Text>
                    <Text style={styles.otpHdrSub}>+91 {phone} पर भेजा गया सुरक्षा कोड</Text>
                  </View>
                </View>

                {/* Auto-fill Pill */}
                <View style={styles.staticOtpHidPill}>
                  <Text style={styles.staticOtpHidLabel}>
                    स्थिर टेस्ट OTP: <Text style={styles.staticOtpHidValue}>{STATIC_OTP}</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setOtp(STATIC_OTP)}
                    style={styles.autofillBtn}
                  >
                    <Text style={styles.autofillBtnText}>Auto-fill ({STATIC_OTP})</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  value={otp}
                  onChangeText={(val) => {
                    setOtp(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  keyboardType="numeric"
                  maxLength={4}
                  style={styles.otpInput}
                  placeholder={STATIC_OTP}
                  placeholderTextColor="#A89E94"
                  textAlign="center"
                />

                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  activeOpacity={0.88}
                  style={styles.primaryButton}
                >
                  <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryButtonText}>सत्यापित कर प्रवेश करें (Enter)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPhoneStep('phone')}
                  style={{ alignSelf: 'center', marginTop: 14 }}
                >
                  <Text style={styles.changeModeText}>← मोबाइल नंबर बदलें</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ========================================================= */}
            {/* TAB 2: DIRECT EMAIL SIGNUP & LOGIN                         */}
            {/* ========================================================= */}
            {authMethod === 'email' && (
              <View>
                {/* Mode Switch: Sign Up vs Sign In */}
                <View style={styles.emailSubSwitchRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setEmailMode('signup');
                      setErrorMessage('');
                    }}
                    style={[
                      styles.emailSubTab,
                      emailMode === 'signup' && styles.emailSubTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.emailSubTabText,
                        emailMode === 'signup' && styles.emailSubTabTextActive,
                      ]}
                    >
                      ✍️ नया खाता बनाएं (Sign Up)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setEmailMode('signin');
                      setErrorMessage('');
                    }}
                    style={[
                      styles.emailSubTab,
                      emailMode === 'signin' && styles.emailSubTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.emailSubTabText,
                        emailMode === 'signin' && styles.emailSubTabTextActive,
                      ]}
                    >
                      🔑 लॉगिन करें (Sign In)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Email Field */}
                <Text style={styles.fieldLabel}>ईमेल पता (Email Address) *</Text>
                <View style={styles.iconInputRow}>
                  <Mail size={16} color="#A89E94" style={{ marginRight: 8 }} />
                  <TextInput
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="devotee@vedriti.org"
                    placeholderTextColor="#A89E94"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.iconInput}
                  />
                </View>

                {/* Password Field */}
                <Text style={styles.fieldLabel}>पासवर्ड (Password) *</Text>
                <View style={styles.iconInputRow}>
                  <Lock size={16} color="#A89E94" style={{ marginRight: 8 }} />
                  <TextInput
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="न्यूनतम 6 अक्षर"
                    placeholderTextColor="#A89E94"
                    secureTextEntry={!showPassword}
                    style={styles.iconInput}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ padding: 4 }}
                  >
                    {showPassword ? (
                      <EyeOff size={16} color="#786B60" />
                    ) : (
                      <Eye size={16} color="#786B60" />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Additional Sign Up Fields */}
                {emailMode === 'signup' && (
                  <View>
                    <Text style={styles.fieldLabel}>यजमान का पूरा नाम (Full Name)</Text>
                    <View style={styles.iconInputRow}>
                      <User size={16} color="#A89E94" style={{ marginRight: 8 }} />
                      <TextInput
                        value={emailName}
                        onChangeText={setEmailName}
                        placeholder="उदा. राजेश कुमार त्रिपाठी"
                        placeholderTextColor="#A89E94"
                        style={styles.iconInput}
                      />
                    </View>

                    <Text style={styles.fieldLabel}>गोत्र (Gotra Lineage)</Text>
                    <TextInput
                      value={emailGotra}
                      onChangeText={setEmailGotra}
                      placeholder="उदा. भारद्वाज / कश्यप"
                      placeholderTextColor="#A89E94"
                      style={styles.textInput}
                    />

                    <Text style={styles.fieldLabel}>मोबाइल नंबर (प्रसाद ट्रैकिंग हेतु - ऐच्छिक)</Text>
                    <TextInput
                      value={emailPhone}
                      onChangeText={setEmailPhone}
                      placeholder="98765 43210"
                      placeholderTextColor="#A89E94"
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={styles.textInput}
                    />
                  </View>
                )}

                {/* Action Button */}
                <TouchableOpacity
                  onPress={emailMode === 'signup' ? handleEmailSignUp : handleEmailSignIn}
                  disabled={isLoading}
                  activeOpacity={0.88}
                  style={styles.primaryButton}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>
                        {emailMode === 'signup'
                          ? 'दिव्य खाता बनाएं (Sign Up) →'
                          : 'प्रवेश करें (Sign In) →'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Toggle Mode Hint */}
                <TouchableOpacity
                  onPress={() => {
                    setEmailMode(emailMode === 'signup' ? 'signin' : 'signup');
                    setErrorMessage('');
                  }}
                  style={{ alignSelf: 'center', marginTop: 14 }}
                >
                  <Text style={styles.changeModeText}>
                    {emailMode === 'signup'
                      ? 'पहले से खाता है? यहाँ लॉगिन करें'
                      : 'नया यजमान खाता बनाना चाहते हैं? यहाँ साइन अप करें'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 16, 9, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#EFE7DD',
    maxHeight: '92%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5ECE1',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FDF2E9',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2A170F',
  },
  brandSub: {
    fontSize: 10,
    color: '#786B60',
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DD',
  },
  segmentedTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11,
    gap: 6,
  },
  segmentedTabActive: {
    backgroundColor: '#C65D24',
  },
  segmentedTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#786B60',
  },
  segmentedTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  bodyPad: {
    padding: 20,
    paddingBottom: 36,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2E9',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    marginBottom: 12,
    gap: 6,
  },
  infoBannerText: {
    fontSize: 10.5,
    color: '#C65D24',
    fontWeight: '700',
    flex: 1,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2A170F',
    marginBottom: 4,
    marginTop: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginRight: 8,
  },
  flagIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  countryCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2A170F',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#2A170F',
  },
  textInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#2A170F',
    marginBottom: 8,
  },
  iconInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  iconInput: {
    flex: 1,
    fontSize: 12,
    color: '#2A170F',
    padding: 0,
  },
  primaryButton: {
    backgroundColor: '#C65D24',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  quickLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF2E9',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 8,
    gap: 6,
  },
  quickLoginButtonText: {
    color: '#C65D24',
    fontSize: 11.5,
    fontWeight: '800',
  },
  noticeText: {
    fontSize: 10,
    color: '#786B60',
    textAlign: 'center',
    marginTop: 10,
  },
  otpHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2E9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    marginBottom: 12,
  },
  otpHdrTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2A170F',
  },
  otpHdrSub: {
    fontSize: 10,
    color: '#786B60',
    marginTop: 1,
  },
  staticOtpHidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: 10,
  },
  staticOtpHidLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  staticOtpHidValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 1,
  },
  autofillBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  autofillBtnText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  otpInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#C65D24',
    borderRadius: 12,
    paddingVertical: 10,
    fontSize: 22,
    fontWeight: '900',
    color: '#2A170F',
    letterSpacing: 6,
    marginBottom: 10,
  },
  emailSubSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2',
    padding: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EFE7DD',
    marginBottom: 12,
  },
  emailSubTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  emailSubTabActive: {
    backgroundColor: '#FFFFFF',
  },
  emailSubTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#786B60',
  },
  emailSubTabTextActive: {
    color: '#C65D24',
    fontWeight: '800',
  },
  changeModeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C65D24',
  },
});
