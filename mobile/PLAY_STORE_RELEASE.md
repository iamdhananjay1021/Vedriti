# VedRit — Google Play Closed Testing Release

| Item | Value |
|---|---|
| App name | VedRit |
| Package name | `in.vedrit.app` (permanent after first upload) |
| API | `https://api.vedrit.in/api/v1` |
| Website | `https://vedrit.in` |
| Admin panel | `https://vedrit.in/admin` |
| Privacy policy URL | `https://vedrit.in/privacy-policy` |
| Account deletion URL | `https://vedrit.in/delete-account` (also in app: Account → Delete account) |
| Support email | `support@vedrit.in` |
| Play track | Closed testing (`alpha`) |
| Store graphics | `mobile/store-assets/` (512×512 icon, 1024×500 feature graphic) |

## 1. Go live on vedrit.in (before submitting for review)

Google reviewers log in and use the app, so the API must be live.

1. **Database** — create a free MongoDB Atlas cluster, copy the connection string.
2. **API** — deploy `server/` (Render / Railway / VPS, Node 20+). Fill `server/.env.example` as environment variables (empty values are fine until you have the credentials):
   - `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PUBLIC_API_URL=https://api.vedrit.in`
   - Email OTP: `RESEND_API_KEY` + `EMAIL_FROM` (verify vedrit.in in the Resend dashboard first).
   - Mobile OTP: `SMS_PROVIDER=fast2sms` + `FAST2SMS_API_KEY`.
   - Reviewer/developer: `STATIC_OTP` (e.g. 123456) with `REVIEWER_PHONES` / `REVIEWER_EMAILS` always log in with that code. Set `DEV_USER_PASSWORD`.
   - Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (test keys are fine for closed testing).
     Webhook: `https://api.vedrit.in/api/v1/payments/webhook`, event `payment_link.paid`, secret → `RAZORPAY_WEBHOOK_SECRET`.
   - Point DNS `api.vedrit.in` → server with HTTPS. Check `https://api.vedrit.in/api/v1/health`.
3. **Seed pujas, kits and developer user once:** `cd server && npm run setup` (with production `MONGODB_URI`). Developer login: `dev@vedrit.in` + `DEV_USER_PASSWORD`, or phone `9999999999` + `STATIC_OTP`. Edit them later from the admin panel.
4. **Website + admin** — deploy `admin/` on Vercel with `NEXT_PUBLIC_API_URL=https://api.vedrit.in/api/v1`, attach `vedrit.in`.
5. **Admin panel → Home Screen:** add banners (with photo upload), announcement, today's panchang and section toggles. Product and puja photos are uploaded from **Pujas & Products**. Images are stored in MongoDB and served from `/api/v1/media/<id>`, so no extra storage service is needed.
6. **Admin panel → Settings:** set Pandit Ji's name, phone, WhatsApp, working hours, fees. Without this the app shows "Pandit Ji" and no call number.
7. Create the mailbox `support@vedrit.in`.

## 2. Build the AAB (Expo EAS)

```bash
cd mobile
npm install
npm install -g eas-cli
eas login
eas init
eas build -p android --profile production
```

- First build asks to **generate a new Android keystore** → **Yes** (back it up via `eas credentials`).
- `versionCode` auto-increments on every production build.
- Quick APK for your own phone: `eas build -p android --profile apk`.

## 3. Play Console setup

1. **Create app** → name `VedRit`, default language English (India) or Hindi, App, Free.
2. **Set up your app:**
   - **Privacy policy:** `https://vedrit.in/privacy-policy`
   - **App access:** "All or some functionality is restricted" → Mobile `9999999999` (your `REVIEWER_PHONES`) and OTP = your `STATIC_OTP`.
   - **Ads:** No. **News:** No. **Government:** No. **Health:** No. **Financial features:** None.
   - **Content rating:** category Lifestyle / Reference; answer No to violence, gambling etc.
   - **Target audience:** 18+.
   - **Data safety:** table below.
3. **Store listing:** short description, full description, icon `store-assets/play-store-icon-512.png`, feature graphic
   `store-assets/feature-graphic-1024x500.png`, at least 2 phone screenshots. Category: **Lifestyle**.

### Data safety answers

Collected: Yes · Shared: Yes (Razorpay for payments, Google Gemini for AI chat) · Encrypted in transit: Yes · Deletion: Yes (in app + `https://vedrit.in/delete-account`)

| Data type | Purpose | Required? |
|---|---|---|
| Name | App functionality, Account management | Required |
| Phone number | Account management, App functionality | Required |
| Email address | Account management | Optional (required for email login) |
| Address | App functionality (puja at home, kit delivery) | Required |
| Other personal info (gender, date/time/place of birth, gotra) | App functionality (sankalp, kundli) | Required (date of birth), others optional |
| Photos (profile picture, chosen from gallery) | App functionality | Optional |
| Purchase history | App functionality | Required for bookings/orders |
| Other in-app messages (kundli questions, AI chat) | App functionality | Optional |
| Financial info | **Not collected** — card/UPI is entered on Razorpay's page |

## 4. Closed testing release

1. **Testing → Closed testing → Create track** (or default "Alpha").
2. **Testers:** add Gmail IDs → save → share the opt-in link.
3. **Create new release** → upload the `.aab` → release notes → **Start rollout**.
4. **Countries/regions → India**.
5. **Publishing overview → Send changes for review.**

> New personal developer accounts need **12+ testers opted in for 14 continuous days** before production access.

### Later uploads via CLI (optional)

First AAB must be uploaded manually. Then: Play Console → API access → service account (Release manager) → save its key as
`mobile/play-service-account.json` (git-ignored) → `eas build -p android --profile production --auto-submit`.

## 5. Before public (production) launch

- Real SMS OTP (`SMS_PROVIDER=fast2sms`) and remove the open `STATIC_OTP` (keep only for `REVIEWER_PHONES`).
- Razorpay live keys + webhook.
- Strong `ADMIN_PASSWORD`, unique `JWT_SECRET`.
