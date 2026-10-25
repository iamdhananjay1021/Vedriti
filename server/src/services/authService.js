import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { VEDIC_CONSTANTS } from '../config/constants.js';
import { User } from '../models/User.js';
import { AppError } from '../middlewares/errorHandler.js';
import { isDatabaseConnected } from '../config/db.js';
import { inMemoryStore } from './inMemoryStore.js';

/**
 * Clean and format 10-digit Indian phone numbers
 * @param {string} phone
 * @returns {string}
 */
export const formatPhoneNumber = (phone) => {
  const cleanDigits = phone.replace(/[^0-9]/g, '');
  if (cleanDigits.length < 10) {
    throw new AppError('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें (Invalid 10-digit mobile number)', 400);
  }
  const last10 = cleanDigits.slice(-10);
  return `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`;
};

/**
 * Generate JWT Authentication Token
 * @param {string} userId
 * @param {string} [phone]
 * @param {string} [email]
 * @returns {string}
 */
export const generateToken = (userId, phone, email) => {
  return jwt.sign({ userId, phone, email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Request Vedic OTP for phone authentication
 * @param {string} phone
 */
export const requestOtp = async (phone) => {
  const formattedPhone = formatPhoneNumber(phone);
  const otpCode = VEDIC_CONSTANTS.STATIC_SACRED_OTP;
  const expiresAt = new Date(Date.now() + VEDIC_CONSTANTS.OTP_EXPIRY_MINUTES * 60 * 1000);

  if (isDatabaseConnected()) {
    let user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      user = new User({
        phone: formattedPhone,
        name: 'धर्मनिष्ठ यजमान',
        gotra: 'Kashyap Gotra',
        punyaPoints: VEDIC_CONSTANTS.WELCOME_PUNYA_POINTS,
      });
    }
    user.otp = { code: otpCode, expiresAt };
    await user.save();
  } else {
    let memUser = inMemoryStore.users.get(formattedPhone);
    if (!memUser) {
      memUser = {
        _id: 'usr_mem_' + Date.now(),
        phone: formattedPhone,
        name: 'धर्मनिष्ठ यजमान',
        gotra: 'Kashyap Gotra',
        kuldevi: 'Mata Shakambhari Devi',
        city: 'Varanasi (Kashi)',
        punyaPoints: VEDIC_CONSTANTS.WELCOME_PUNYA_POINTS,
        isVip: false,
        familyMembers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    memUser.otp = { code: otpCode, expiresAt };
    inMemoryStore.users.set(formattedPhone, memUser);
  }

  return {
    success: true,
    phone: formattedPhone,
    message: `वैदिक सुरक्षा कोड (OTP) तैयार है। अभी स्थिर OTP "${otpCode}" से तुरंत प्रवेश करें।`,
    isStaticOtp: !config.enableSmsGateway,
    staticOtp: otpCode,
  };
};

/**
 * Verify Vedic OTP (accepts static OTP 1080 or 1234 or database OTP)
 * @param {string} phone
 * @param {string} otp
 * @param {string} [name]
 * @param {string} [gotra]
 */
export const verifyOtp = async (phone, otp, name, gotra) => {
  const formattedPhone = formatPhoneNumber(phone);
  const cleanOtp = otp.trim();

  // Validate OTP against static test codes
  const isStaticValid =
    cleanOtp === VEDIC_CONSTANTS.STATIC_SACRED_OTP || cleanOtp === VEDIC_CONSTANTS.STATIC_TEST_OTP_FALLBACK;

  if (isDatabaseConnected()) {
    let user = await User.findOne({ phone: formattedPhone });

    if (!isStaticValid) {
      if (!user || !user.otp || user.otp.code !== cleanOtp || new Date() > user.otp.expiresAt) {
        throw new AppError(
          `अमान्य या समाप्त OTP! कृपया वैदिक OTP "${VEDIC_CONSTANTS.STATIC_SACRED_OTP}" दर्ज करें।`,
          400
        );
      }
    }

    if (!user) {
      user = new User({
        phone: formattedPhone,
        name: name && name.trim().length > 0 ? name.trim() : 'धर्मनिष्ठ यजमान',
        gotra: gotra && gotra.trim().length > 0 ? gotra.trim() : 'Kashyap Gotra',
        punyaPoints: VEDIC_CONSTANTS.WELCOME_PUNYA_POINTS,
      });
    } else {
      if (name && name.trim().length > 0) user.name = name.trim();
      if (gotra && gotra.trim().length > 0) user.gotra = gotra.trim();
    }

    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id.toString(), user.phone);

    return {
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name,
        gotra: user.gotra,
        kuldevi: user.kuldevi,
        city: user.city,
        punyaPoints: user.punyaPoints,
        isVip: user.isVip,
        familyMembers: user.familyMembers,
      },
      token,
      message: `वैदिक गर्भगृह में आपका स्वागत है, ${user.name}! ॐ`,
    };
  } else {
    // In-memory fallback
    if (!isStaticValid) {
      throw new AppError(
        `अमान्य OTP! कृपया स्थिर वैदिक OTP "${VEDIC_CONSTANTS.STATIC_SACRED_OTP}" दर्ज करें।`,
        400
      );
    }

    let memUser = inMemoryStore.users.get(formattedPhone);
    if (!memUser) {
      memUser = {
        _id: 'usr_mem_' + Date.now(),
        phone: formattedPhone,
        name: name && name.trim().length > 0 ? name.trim() : 'धर्मनिष्ठ यजमान',
        gotra: gotra && gotra.trim().length > 0 ? gotra.trim() : 'Kashyap Gotra',
        kuldevi: 'Mata Shakambhari Devi',
        city: 'Varanasi (Kashi)',
        punyaPoints: VEDIC_CONSTANTS.WELCOME_PUNYA_POINTS,
        isVip: false,
        familyMembers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      if (name && name.trim().length > 0) memUser.name = name.trim();
      if (gotra && gotra.trim().length > 0) memUser.gotra = gotra.trim();
    }

    memUser.otp = undefined;
    inMemoryStore.users.set(formattedPhone, memUser);

    const token = generateToken(memUser._id, memUser.phone);

    return {
      user: {
        id: memUser._id,
        phone: memUser.phone,
        name: memUser.name,
        gotra: memUser.gotra,
        kuldevi: memUser.kuldevi,
        city: memUser.city,
        punyaPoints: memUser.punyaPoints,
        isVip: memUser.isVip,
        familyMembers: memUser.familyMembers,
      },
      token,
      message: `वैदिक गर्भगृह में आपका स्वागत है, ${memUser.name}! ॐ`,
    };
  }
};

/**
 * Devotee Profile Management
 */
export const getUserProfile = async (userId) => {
  if (isDatabaseConnected()) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('भक्त प्रोफ़ाइल नहीं मिली (Devotee record not found)', 404);
    }
    return user;
  } else {
    for (const u of inMemoryStore.users.values()) {
      if (u._id === userId) return u;
    }
    throw new AppError('भक्त प्रोफ़ाइल नहीं मिली (Devotee record not found)', 404);
  }
};

export const updateUserProfile = async (userId, updates) => {
  if (isDatabaseConnected()) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new AppError('भक्त प्रोफ़ाइल नहीं मिली (Devotee record not found)', 404);
    }
    return user;
  } else {
    for (const u of inMemoryStore.users.values()) {
      if (u._id === userId) {
        Object.assign(u, updates, { updatedAt: new Date() });
        return u;
      }
    }
    throw new AppError('भक्त प्रोफ़ाइल नहीं मिली', 404);
  }
};

export const addFamilyMember = async (userId, memberData) => {
  if (isDatabaseConnected()) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('भक्त प्रोफ़ाइल नहीं मिली', 404);
    user.familyMembers.push(memberData);
    await user.save();
    return user.familyMembers;
  } else {
    for (const u of inMemoryStore.users.values()) {
      if (u._id === userId) {
        const newMember = { ...memberData, _id: 'fm-' + Date.now() };
        u.familyMembers.push(newMember);
        return u.familyMembers;
      }
    }
    throw new AppError('भक्त प्रोफ़ाइल नहीं मिली', 404);
  }
};

export const removeFamilyMember = async (userId, memberId) => {
  if (isDatabaseConnected()) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('भक्त प्रोफ़ाइल नहीं मिली', 404);
    user.familyMembers = user.familyMembers.filter(
      (m) => m._id?.toString() !== memberId
    );
    await user.save();
    return user.familyMembers;
  } else {
    for (const u of inMemoryStore.users.values()) {
      if (u._id === userId) {
        u.familyMembers = u.familyMembers.filter((m) => m._id !== memberId);
        return u.familyMembers;
      }
    }
    throw new AppError('भक्त प्रोफ़ाइल नहीं मिली', 404);
  }
};

/**
 * Direct Email Sign Up
 * @param {string} email
 * @param {string} password
 * @param {string} [name]
 * @param {string} [gotra]
 * @param {string} [phone]
 */
export const signupWithEmail = async (email, password, name, gotra, phone) => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new AppError('कृपया मान्य ईमेल पता दर्ज करें (Invalid email address)', 400);
  }
  if (!password || password.length < 6) {
    throw new AppError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (Password must be at least 6 characters)', 400);
  }

  let formattedPhone = undefined;
  if (phone && phone.trim().length >= 10) {
    try {
      formattedPhone = formatPhoneNumber(phone);
    } catch (e) {
      // Proceed without phone if formatting fails
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const devoteeName = name && name.trim().length > 0 ? name.trim() : 'धर्मनिष्ठ यजमान';
  const devoteeGotra = gotra && gotra.trim().length > 0 ? gotra.trim() : 'Kashyap Gotra';

  if (isDatabaseConnected()) {
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      throw new AppError('यह ईमेल पहले से पंजीकृत है! कृपया लॉगिन करें (Email already registered, please login)', 409);
    }

    const newUser = new User({
      email: cleanEmail,
      password: hashedPassword,
      phone: formattedPhone,
      authProvider: 'email',
      name: devoteeName,
      gotra: devoteeGotra,
      punyaPoints: VEDIC_CONSTANTS.WELCOME_PUNYA_POINTS,
      familyMembers: [],
    });

    await newUser.save();
    const token = generateToken(newUser._id.toString(), newUser.phone, newUser.email);

    return {
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        phone: newUser.phone,
        name: newUser.name,
        gotra: newUser.gotra,
        kuldevi: newUser.kuldevi,
        city: newUser.city,
        punyaPoints: newUser.punyaPoints,
        isVip: newUser.isVip,
        familyMembers: newUser.familyMembers,
        authProvider: 'email',
      },
      token,
      message: `वेदरीति गर्भगृह में आपका स्वागत है, ${devoteeName}! ॐ`,
    };
  } else {
    // In-memory fallback
    for (const u of inMemoryStore.users.values()) {
      if (u.email === cleanEmail) {
        throw new AppError('यह ईमेल पहले से पंजीकृत है! कृपया लॉगिन करें (Email already registered, please login)', 409);
      }
    }

    const memUser = {
      _id: 'usr_mem_email_' + Date.now(),
      email: cleanEmail,
      password: hashedPassword,
      phone: formattedPhone || '',
      authProvider: 'email',
      name: devoteeName,
      gotra: devoteeGotra,
      kuldevi: 'Mata Shakambhari Devi',
      city: 'Varanasi (Kashi)',
      punyaPoints: VEDIC_CONSTANTS.WELCOME_PUNYA_POINTS,
      isVip: false,
      familyMembers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryStore.users.set(cleanEmail, memUser);
    const token = generateToken(memUser._id, memUser.phone, memUser.email);

    return {
      user: {
        id: memUser._id,
        email: memUser.email,
        phone: memUser.phone,
        name: memUser.name,
        gotra: memUser.gotra,
        kuldevi: memUser.kuldevi,
        city: memUser.city,
        punyaPoints: memUser.punyaPoints,
        isVip: memUser.isVip,
        familyMembers: memUser.familyMembers,
        authProvider: 'email',
      },
      token,
      message: `वेदरीति गर्भगृह में आपका स्वागत है, ${devoteeName}! ॐ`,
    };
  }
};

/**
 * Direct Email Sign In
 * @param {string} email
 * @param {string} password
 */
export const loginWithEmail = async (email, password) => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new AppError('कृपया मान्य ईमेल पता दर्ज करें (Invalid email address)', 400);
  }
  if (!password) {
    throw new AppError('कृपया पासवर्ड दर्ज करें (Password required)', 400);
  }

  if (isDatabaseConnected()) {
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      throw new AppError('यह ईमेल पंजीकृत नहीं है! कृपया पहले खाता बनाएं (Email not found. Please sign up)', 401);
    }

    if (!user.password) {
      throw new AppError('इस खाते में केवल मोबाइल OTP प्रमाणीकरण सक्रिय है।', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('अमान्य पासवर्ड! कृपया पुनः प्रयास करें (Invalid password)', 401);
    }

    const token = generateToken(user._id.toString(), user.phone, user.email);

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        phone: user.phone,
        name: user.name,
        gotra: user.gotra,
        kuldevi: user.kuldevi,
        city: user.city,
        punyaPoints: user.punyaPoints,
        isVip: user.isVip,
        familyMembers: user.familyMembers,
        authProvider: user.authProvider || 'email',
      },
      token,
      message: `पुनः स्वागत है, ${user.name}! ॐ`,
    };
  } else {
    // In-memory fallback
    let memUser = null;
    for (const u of inMemoryStore.users.values()) {
      if (u.email === cleanEmail) {
        memUser = u;
        break;
      }
    }

    if (!memUser) {
      throw new AppError('यह ईमेल पंजीकृत नहीं है! कृपया पहले खाता बनाएं (Email not found. Please sign up)', 401);
    }

    const isMatch = await bcrypt.compare(password, memUser.password);
    if (!isMatch) {
      throw new AppError('अमान्य पासवर्ड! कृपया पुनः प्रयास करें (Invalid password)', 401);
    }

    const token = generateToken(memUser._id, memUser.phone, memUser.email);

    return {
      user: {
        id: memUser._id,
        email: memUser.email,
        phone: memUser.phone,
        name: memUser.name,
        gotra: memUser.gotra,
        kuldevi: memUser.kuldevi,
        city: memUser.city,
        punyaPoints: memUser.punyaPoints,
        isVip: memUser.isVip,
        familyMembers: memUser.familyMembers,
        authProvider: memUser.authProvider || 'email',
      },
      token,
      message: `पुनः स्वागत है, ${memUser.name}! ॐ`,
    };
  }
};
