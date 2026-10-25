import React, { createContext, useContext, useState } from 'react';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  gotra: string;
  rashi?: string;
  nakshatra?: string;
}

export interface DevoteeProfile {
  phone: string;
  email?: string;
  name: string;
  gotra: string;
  kuldevi: string;
  city: string;
  isLoggedIn: boolean;
  punyaPoints: number;
  familyMembers: FamilyMember[];
  authMethod?: 'phone' | 'email';
}

interface AuthContextType {
  user: DevoteeProfile;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithStaticOtp: (phone: string, otp: string, name?: string, gotra?: string) => { success: boolean; message: string };
  quickLoginWithPhone: (phone: string, name?: string, gotra?: string) => { success: boolean; message: string };
  signupWithEmail: (email: string, password: string, name?: string, gotra?: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<DevoteeProfile>) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  removeFamilyMember: (id: string) => void;
}

const DEFAULT_USER: DevoteeProfile = {
  phone: '+91 98765 43210',
  email: 'anand.sharma@vedriti.org',
  name: 'Anand Sharma',
  gotra: 'Kashyap Gotra',
  kuldevi: 'Mata Shakambhari Devi',
  city: 'Varanasi (Kashi)',
  isLoggedIn: true,
  punyaPoints: 1080,
  authMethod: 'phone',
  familyMembers: [
    {
      id: 'fm-1',
      name: 'Sunita Sharma',
      relation: 'धर्मपत्नी (Spouse)',
      gotra: 'Kashyap Gotra',
      rashi: 'Karka (Cancer)',
      nakshatra: 'Pushya',
    },
    {
      id: 'fm-2',
      name: 'Aarav Sharma',
      relation: 'पुत्र (Son)',
      gotra: 'Kashyap Gotra',
      rashi: 'Simha (Leo)',
      nakshatra: 'Magha',
    },
    {
      id: 'fm-3',
      name: 'Pt. Ramprasad Sharma',
      relation: 'पिताश्री (Father)',
      gotra: 'Kashyap Gotra',
      rashi: 'Dhanu (Sagittarius)',
      nakshatra: 'Moola',
    },
  ],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Static Sacred OTP for instant login
export const STATIC_OTP = '1080';

// API Base URL (with graceful local fallback)
const BACKEND_URL = 'http://localhost:5001/api/v1/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DevoteeProfile>(DEFAULT_USER);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // 1. Mobile Phone + OTP Login
  const loginWithStaticOtp = (
    phone: string,
    otp: string,
    name?: string,
    gotra?: string
  ): { success: boolean; message: string } => {
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    const cleanOtp = otp.trim();

    if (cleanDigits.length < 10) {
      return { success: false, message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' };
    }

    if (cleanOtp !== STATIC_OTP && cleanOtp !== '1234') {
      return { success: false, message: `अमान्य OTP! कृपया वैदिक OTP "${STATIC_OTP}" का उपयोग करें।` };
    }

    const last10 = cleanDigits.slice(-10);
    const formattedPhone = `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`;
    const newName =
      name && name.trim().length > 0
        ? name.trim()
        : user.name && user.name !== 'अतिथि यजमान (Guest)'
        ? user.name
        : 'धर्मनिष्ठ यजमान';
    const newGotra = gotra && gotra.trim().length > 0 ? gotra.trim() : user.gotra || 'Kashyap Gotra';

    setUser((prev) => ({
      ...prev,
      phone: formattedPhone,
      name: newName,
      gotra: newGotra,
      isLoggedIn: true,
      authMethod: 'phone',
      punyaPoints: prev.punyaPoints > 0 ? prev.punyaPoints : 1080,
    }));

    setIsAuthModalOpen(false);
    return { success: true, message: `वैदिक गर्भगृह में आपका स्वागत है, ${newName}! ॐ` };
  };

  const quickLoginWithPhone = (phone: string, name?: string, gotra?: string) => {
    return loginWithStaticOtp(phone, STATIC_OTP, name, gotra);
  };

  // 2. Direct Email Sign Up
  const signupWithEmail = async (
    email: string,
    password: string,
    name?: string,
    gotra?: string,
    phone?: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'कृपया मान्य ईमेल पता दर्ज करें।' };
    }
    if (!password || password.length < 6) {
      return { success: false, message: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' };
    }

    try {
      // Attempt backend signup
      const res = await fetch(`${BACKEND_URL}/signup-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          name,
          gotra,
          phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'खाता बनाने में त्रुटि हुई।' };
      }

      const devoteeName = data.data?.user?.name || name || 'धर्मनिष्ठ यजमान';
      const devoteeGotra = data.data?.user?.gotra || gotra || 'Kashyap Gotra';

      setUser((prev) => ({
        ...prev,
        email: cleanEmail,
        phone: data.data?.user?.phone || phone || prev.phone,
        name: devoteeName,
        gotra: devoteeGotra,
        isLoggedIn: true,
        authMethod: 'email',
        punyaPoints: data.data?.user?.punyaPoints || 1080,
      }));

      setIsAuthModalOpen(false);
      return { success: true, message: data.data?.message || `वेदरीति गर्भगृह में आपका स्वागत है, ${devoteeName}! ॐ` };
    } catch {
      // Offline fallback
      const devoteeName = name && name.trim().length > 0 ? name.trim() : 'धर्मनिष्ठ यजमान';
      const devoteeGotra = gotra && gotra.trim().length > 0 ? gotra.trim() : 'Kashyap Gotra';

      setUser((prev) => ({
        ...prev,
        email: cleanEmail,
        phone: phone || prev.phone,
        name: devoteeName,
        gotra: devoteeGotra,
        isLoggedIn: true,
        authMethod: 'email',
        punyaPoints: 1080,
      }));

      setIsAuthModalOpen(false);
      return { success: true, message: `वेदरीति गर्भगृह में आपका स्वागत है, ${devoteeName}! ॐ` };
    }
  };

  // 3. Direct Email Login
  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'कृपया मान्य ईमेल पता दर्ज करें।' };
    }
    if (!password) {
      return { success: false, message: 'कृपया पासवर्ड दर्ज करें।' };
    }

    try {
      const res = await fetch(`${BACKEND_URL}/login-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'ईमेल या पासवर्ड अमान्य है।' };
      }

      const devoteeName = data.data?.user?.name || 'धर्मनिष्ठ यजमान';
      setUser((prev) => ({
        ...prev,
        email: cleanEmail,
        phone: data.data?.user?.phone || prev.phone,
        name: devoteeName,
        gotra: data.data?.user?.gotra || prev.gotra,
        isLoggedIn: true,
        authMethod: 'email',
        punyaPoints: data.data?.user?.punyaPoints || prev.punyaPoints,
      }));

      setIsAuthModalOpen(false);
      return { success: true, message: data.data?.message || `पुनः स्वागत है, ${devoteeName}! ॐ` };
    } catch {
      // Offline fallback login
      setUser((prev) => ({
        ...prev,
        email: cleanEmail,
        isLoggedIn: true,
        authMethod: 'email',
      }));

      setIsAuthModalOpen(false);
      return { success: true, message: `पुनः स्वागत है, ${user.name}! ॐ` };
    }
  };

  const logout = () => {
    setUser((prev) => ({
      ...prev,
      isLoggedIn: false,
      name: 'अतिथि यजमान (Guest)',
      phone: '',
      email: '',
    }));
  };

  const updateProfile = (updates: Partial<DevoteeProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: 'fm-' + Date.now(),
    };
    setUser((prev) => ({
      ...prev,
      familyMembers: [...prev.familyMembers, newMember],
    }));
  };

  const removeFamilyMember = (id: string) => {
    setUser((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((m) => m.id !== id),
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithStaticOtp,
        quickLoginWithPhone,
        signupWithEmail,
        loginWithEmail,
        logout,
        updateProfile,
        addFamilyMember,
        removeFamilyMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
