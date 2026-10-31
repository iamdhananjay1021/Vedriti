import type { Metadata } from 'next';
import { LegalPage, SUPPORT_EMAIL } from '../../components/LegalPage';

export const metadata: Metadata = {
  title: 'Delete Your Account • VedRit',
  description: 'How to request deletion of your VedRit account and associated data.',
};

const MAIL_SUBJECT = encodeURIComponent('Delete my VedRit account');
const MAIL_BODY = encodeURIComponent('Registered mobile number:\nRegistered email (if any):\n\nPlease delete my VedRit account and data.');

export default function DeleteAccountPage() {
  return (
    <LegalPage title="Delete Your VedRit Account" updated="30 October 2026">
      <p>You can ask us to delete your VedRit account and the personal data linked to it at any time.</p>

      <h2>Delete from the app</h2>
      <p>Open the VedRit app → Account → Delete account. Your account is deleted immediately.</p>

      <h2>Request deletion by email</h2>
      <ul>
        <li>
          Email <a href={`mailto:${SUPPORT_EMAIL}?subject=${MAIL_SUBJECT}&body=${MAIL_BODY}`}>{SUPPORT_EMAIL}</a>{' '}
          with the subject &quot;Delete my VedRit account&quot;.
        </li>
        <li>Send it from your registered email, or include your registered mobile number so we can verify you.</li>
        <li>We will confirm and complete the deletion within 30 days.</li>
      </ul>

      <h2>What gets deleted</h2>
      <ul>
        <li>Your profile: name, mobile number, email and password.</li>
        <li>Saved family members, gotra and sankalp details.</li>
        <li>Kundli birth details and consultation questions.</li>
        <li>Saved addresses and AI assistant chat history.</li>
      </ul>

      <h2>What we keep</h2>
      <p>
        Invoices and payment/transaction records for completed orders and bookings are retained for up to 8 years
        to meet Indian tax and accounting requirements. They are not used for any other purpose.
      </p>
    </LegalPage>
  );
}
