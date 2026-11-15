import type { Metadata } from "next";
import { LegalPage } from "../../components/LegalPage";
import { SUPPORT_EMAIL } from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you use the VedRit app and website.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="15 November 2026">
      <p>
        These terms apply when you use the VedRit mobile app and vedrit.in (together, the &quot;Service&quot;). By creating an account or using the Service you
        agree to them.
      </p>

      <h2>Using VedRit</h2>
      <ul>
        <li>You must be 18 or older, or use the Service with the involvement of a parent or guardian.</li>
        <li>Give accurate details, including your name, email, mobile number, address and birth details. We use them to perform the services you request.</li>
        <li>Keep your login secure. You are responsible for activity on your account.</li>
        <li>Do not misuse the Service, attempt to disrupt it, or use it for anything unlawful.</li>
      </ul>

      <h2>Pujas, appointments and kundli</h2>
      <ul>
        <li>Pujas and appointments are scheduled in the time slots shown in the app. A booking is confirmed once payment is received, or once Pandit Ji accepts a pay-later request.</li>
        <li>Please be available at the booked time and keep your phone reachable. For home pujas, provide a correct address.</li>
        <li>Kundli readings and guidance are given by Pandit Ji on the details you provide. Accuracy of birth details affects the reading.</li>
        <li>
          Pujas, astrology and spiritual guidance are matters of faith and personal belief. We do not guarantee any particular result, and the Service is not a
          substitute for medical, legal or financial advice.
        </li>
      </ul>

      <h2>Orders</h2>
      <ul>
        <li>Puja kits and products are delivered to the address you provide. Delivery times shown in the app are estimates.</li>
        <li>Prices are shown in Indian rupees and may change from time to time. The price at the time you place an order applies.</li>
      </ul>

      <h2>Payments, cancellation and refunds</h2>
      <ul>
        <li>Payments are processed securely by Razorpay. We do not store your card, UPI or bank details.</li>
        <li>You can cancel a booking from the app before it is performed. If a refund applies, it is returned to the original payment method.</li>
        <li>If we are unable to perform a puja or appointment, we will reschedule it or refund you in full.</li>
        <li>For any payment issue, contact us at the email below with your booking or order number.</li>
      </ul>

      <h2>Your content</h2>
      <p>
        You keep ownership of the details and photo you provide. You allow us to use them only to run the Service and perform the services you request. See our{" "}
        <a href="/privacy-policy">Privacy Policy</a>.
      </p>

      <h2>Suspension and deletion</h2>
      <p>
        We may suspend an account that breaks these terms or misuses the Service. You can delete your account at any time, see{" "}
        <a href="/delete-account">Delete account</a>.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        The Service is provided as is. To the extent allowed by law, we are not liable for indirect or consequential losses, or for delays caused by events beyond
        our control, such as network failures or natural events.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India, and the courts of India have jurisdiction over any dispute.</p>

      <h2>Changes</h2>
      <p>We may update these terms. The updated version applies from the date shown above, and continued use means you accept it.</p>

      <h2>Contact</h2>
      <p>
        Questions: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalPage>
  );
}
