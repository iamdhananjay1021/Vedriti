import type { Metadata } from 'next';
import { LegalPage, SUPPORT_EMAIL } from '../../components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy • VedRit',
  description: 'How the VedRit app collects, uses and protects your information.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="30 October 2026">
      <p>
        This policy explains how VedRit (&quot;we&quot;, &quot;us&quot;), operator of the VedRit mobile app and
        vedrit.in, collects, uses and protects your information when you book pujas, request kundli
        consultations, buy spiritual products or use our Vedic AI assistant.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account details:</strong> name, mobile number, email address and password (stored hashed).</li>
        <li><strong>Profile photo (optional):</strong> a picture you choose from your gallery. It is resized on your device and stored on our servers; you can remove it any time in the app.</li>
        <li><strong>Puja &amp; sankalp details:</strong> names of family members, gotra, relationship and the occasion you provide for a ritual.</li>
        <li><strong>Kundli details:</strong> date, time and place of birth, and the questions you ask our acharyas.</li>
        <li><strong>Delivery details:</strong> postal address and pincode for prasad and product delivery.</li>
        <li><strong>Order &amp; payment records:</strong> what you booked or bought, amounts and payment status. Card, UPI and bank details are entered directly with our payment partner Razorpay and are never stored by us.</li>
        <li><strong>AI assistant messages:</strong> questions you type into the Vedic AI chat.</li>
        <li><strong>Technical data:</strong> basic device and network information needed to run the app and prevent abuse.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To create your account and verify your login.</li>
        <li>To perform pujas, prepare kundli reports and deliver orders you request.</li>
        <li>To process payments and refunds.</li>
        <li>To send booking confirmations and updates, including over WhatsApp when you choose to contact us there.</li>
        <li>To answer your questions in the AI assistant.</li>
        <li>To keep the service secure and comply with legal obligations.</li>
      </ul>
      <p>We do not sell your personal information and we do not use it for third-party advertising.</p>

      <h2>Who we share it with</h2>
      <ul>
        <li><strong>Acharyas / pandits</strong> performing your puja or preparing your kundli receive the details needed for that service.</li>
        <li><strong>Razorpay</strong> processes payments under its own privacy policy.</li>
        <li><strong>Google (Gemini API)</strong> processes AI assistant questions to generate answers.</li>
        <li><strong>Resend</strong> (email) and our SMS provider deliver one-time login codes to your email or mobile.</li>
        <li><strong>Courier partners</strong> receive your name, phone and address to deliver orders.</li>
        <li><strong>Hosting and database providers</strong> that store data on our behalf.</li>
        <li>Authorities, when required by law.</li>
      </ul>

      <h2>Security and retention</h2>
      <p>
        Data is sent over encrypted HTTPS connections and passwords are stored hashed. We keep account data
        while your account is active. Order and payment records may be retained as required by Indian tax and
        accounting law even after account deletion.
      </p>

      <h2>Your choices</h2>
      <p>
        You can view and update your profile in the app, and you can request deletion of your account and data
        at any time — see <a href="/delete-account">vedrit.in/delete-account</a>.
      </p>

      <h2>Children</h2>
      <p>VedRit is not directed at children under 13. Bookings should be made by an adult.</p>

      <h2>Changes</h2>
      <p>We will update this page when our practices change and revise the date above.</p>

      <h2>Contact</h2>
      <p>
        Questions or grievances: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalPage>
  );
}
