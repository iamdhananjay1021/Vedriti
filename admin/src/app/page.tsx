import Link from 'next/link';
import { CalendarCheck, Package, ScrollText, Video } from 'lucide-react';

const FEATURES = [
  { icon: CalendarCheck, title: 'Book a puja', text: 'Choose a puja, package and a live slot from Pandit Ji’s calendar — online or at your home.' },
  { icon: Video, title: 'Appointment', text: 'Talk to Pandit Ji on call, video or in person for muhurat and guidance.' },
  { icon: ScrollText, title: 'Kundli', text: 'Send your birth details. Pandit Ji replies with analysis and remedies in the app.' },
  { icon: Package, title: 'Puja kits', text: 'Order complete samagri kits delivered to your home.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[var(--saffron)] text-6xl text-white shadow-xl">ॐ</div>
        <h1 className="mt-6 text-4xl font-bold sm:text-5xl">VedRit</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--text-secondary)]">
          Book pujas, appointments and kundli consultations directly with Pandit Ji.
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">श्रद्धा • संकल्प • सिद्धि</p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-16 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            <Icon className="h-6 w-6 text-[var(--saffron)]" />
            <h2 className="mt-3 text-lg font-bold">{title}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{text}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-[var(--border-color)] py-8 text-center text-sm text-[var(--text-muted)]">
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/privacy-policy" className="hover:text-[var(--saffron)]">
            Privacy Policy
          </Link>
          <Link href="/delete-account" className="hover:text-[var(--saffron)]">
            Delete Account
          </Link>
          <a href="mailto:support@vedrit.in" className="hover:text-[var(--saffron)]">
            support@vedrit.in
          </a>
        </div>
        <p className="mt-4">© VedRit</p>
      </footer>
    </main>
  );
}
