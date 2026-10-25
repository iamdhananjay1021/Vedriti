# 🕉️ VedRiti (वेदरीति) - Vedic Spiritual Ecosystem & E-Commerce

> **Sacred Rituals, Divine Pujas, Vedic Wisdom & Spiritual Store**  
> A multi-platform spiritual platform offering online puja bookings, sacred prasad delivery, Vedic AI consultation (**वेदऋषि AI**), Hindu Panchang (2024–2028), and an enterprise admin management suite.

---

## 🏛️ System Architecture

VedRiti is architected as a full-stack, multi-platform solution:

```text
VedRiti/
├── mobile/      # React Native + Expo App (Android APK & iOS)
├── server/      # Node.js + Express + MongoDB REST API
└── admin/       # Next.js 16 (App Router) Admin Web Dashboard
```

| Component | Framework & Tools | Role |
| :--- | :--- | :--- |
| **Mobile App** | Expo (SDK 53) + React Native + TypeScript + NativeWind | Devotee app for puja booking, Vedic AI consultation, Panchang, and spiritual orders. |
| **Backend API** | Node.js + Express.js + MongoDB (Mongoose) + JWT | Secure REST API handling Dual Auth, Orders, Bookings, Payments, and Catalog. |
| **Admin Portal**| Next.js 16 + TypeScript + Tailwind CSS 4 + Dark/Light Mode | Operations portal for managing pujas, devotees, analytics, orders, and payouts. |

---

## ✨ Key Features

### 1. 📱 Mobile Devotee App (`mobile/`)
- **Luxury White Aesthetic**: Clean, modern cards (`#FFFFFF`, `18px radius`, subtle hairline border `#EFE7DD`), distraction-free single language interface.
- **Dual Authentication**:
  - 📱 **Mobile Phone OTP** (Fast instant sign-in with SMS verification)
  - 📧 **Direct Email & Password** (With Gotra & Full Name onboarding)
- **वेदऋषि AI (Vedic AI Assistant)**:
  - Personalized astrological & spiritual consultation.
  - Multi-year Hindu calendar knowledge base (**2024 – 2028**) covering Dhanteras, Diwali, Mahashivratri, Navratri, Ekadashis, Gotras, and Kundali doshas.
- **Sacred Puja & Ritual Bookings**:
  - Live ritual participation, sankalp tracking, and direct pandit coordination.
- **Spiritual Store**:
  - Authentic idols, rudrakshas, gangajal, pure havan samagri, and temple prasad.
- **Devotional Utilities**:
  - Interactive Mantra Japa Counter, Daily Panchang & Choghadiya, Temple Audio Chants.

### 2. ⚡ Backend REST API (`server/`)
- Express.js architecture with clean controller-service-repository patterns.
- MongoDB data modeling for Users, Pujas, Orders, Transactions, and Pandits.
- Dual Auth endpoints:
  - `/api/v1/auth/signup-email` & `/api/v1/auth/login-email`
  - `/api/v1/auth/send-otp` & `/api/v1/auth/verify-otp`
- Welcome bonus of 1,080 Punya points automatically credited on new devotee registration.
- Razorpay payment order creation and cryptographic webhook signature verification.

### 3. 🖥️ Admin Web Dashboard (`admin/`)
- Built with **Next.js 16 App Router** and **Tailwind CSS 4**.
- **Dark Mode & Light Mode**: Instant, flicker-free theme switching.
- **Devotee Management**: Live devotion list with badges (`📧 Email Auth` / `📱 Mobile OTP`), Gotra filtering, and Punya points auditing.
- **Analytics & Operations**: Daily bookings, revenue reports, puja catalog manager, order fulfillment, and payout tracking.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/go) or Android Studio (for mobile emulation/builds)

---

### 1. Backend Server Setup
```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MONGODB_URI, JWT_SECRET, RAZORPAY credentials, etc.

# Start development server
npm run dev
# Server runs on http://localhost:5001
```

---

### 2. Admin Web Dashboard Setup
```bash
# Navigate to admin
cd admin

# Install dependencies
npm install

# Start development server
npm run dev
# Admin dashboard opens on http://localhost:3000 (or 3001)
```

---

### 3. Mobile App Setup
```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Start Expo dev server
npx expo start
```
- Press `a` to run on Android emulator or connected device.
- Scan the QR code using the Expo Go app on your physical device.

---

## 📦 Building Standalone Mobile Binaries

### Android APK (Direct Install)
```bash
cd mobile/android
./gradlew.bat assembleDebug --no-daemon
# Generated APK: mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

### Production Build via Expo EAS
```bash
cd mobile
npm install -g eas-cli

# Build Android APK / Play Store AAB
eas build --platform android --profile production

# Build iOS App Store IPA
eas build --platform ios --profile production
```

---

## 📜 License & Copyright

© 2026 **VedRiti Technologies**. All rights reserved.  
Sacred traditions engineered with modern technology.
