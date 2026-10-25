# VedRiti - Tech Stack & Architecture Architecture

This project strictly follows this multi-platform architecture:

## 1. Mobile App (`mobile/` - Primary Focus for APK/AAB)
- **Framework**: React Native with Expo (Managed Workflow)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Build System**: Expo EAS Build
  - **APK**: Direct installation, local testing & internal distribution
  - **AAB**: Google Play Store production release
- **Payments**: Razorpay React Native SDK / Checkout integration

## 2. Backend API (`server/`)
- **Runtime & Framework**: Node.js + Express.js
- **Database**: MongoDB (via Mongoose)
- **Modules**:
  - Puja & Ritual bookings
  - E-commerce spiritual products & categories
  - User authentication (JWT / OTP)
  - Order management & tracking
  - Razorpay order generation & webhook verification
  - APIs for Mobile App & Admin Dashboard

## 3. Admin Dashboard (`admin/` - Web Portal)
- **Framework**: Next.js + TypeScript (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Motion for React (`framer-motion` / `motion`)
- **Purpose**: Manage catalog, bookings, orders, users, banners, analytics, and payouts.

## 4. Folder Structure Convention
```text
VedRiti/
├── mobile/      # Expo + React Native + TypeScript + NativeWind (Target: APK / AAB)
├── server/      # Node.js + Express + MongoDB
└── admin/       # Next.js + Tailwind + shadcn/ui (Admin Web Dashboard)
```
