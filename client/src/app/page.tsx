import Image from "next/image";
import { CalendarCheck, Languages, Lock, Mail, ScrollText, ShoppingBag, UserCheck, Users, Video } from "lucide-react";
import { SUPPORT_EMAIL } from "../components/SiteFooter";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Book a puja",
    text: "Choose your puja, pick a time from Pandit Ji's available slots, and have it performed online or at your home.",
  },
  {
    icon: Video,
    title: "Appointments with Pandit Ji",
    text: "Book a call, video or in-person appointment for guidance, muhurat and your questions.",
  },
  {
    icon: ShoppingBag,
    title: "Puja kits & samagri",
    text: "Complete, carefully packed kits for your puja, delivered to your door.",
  },
  {
    icon: ScrollText,
    title: "Kundli & Jyotish",
    text: "Share your birth details for a personal kundli reading, kundli milan or dosha guidance.",
  },
  {
    icon: Users,
    title: "Family sankalp",
    text: "Save your family members' names and gotra once, and use them for every puja.",
  },
  {
    icon: Mail,
    title: "Simple, secure sign in",
    text: "Sign in with your email and a one-time code. No passwords to remember unless you want one.",
  },
];

const STEPS = [
  { n: "1", title: "Sign in", text: "Enter your email and mobile number and confirm with a 6-digit code." },
  { n: "2", title: "Choose a service", text: "Pick a puja, an appointment, a puja kit or a kundli reading." },
  { n: "3", title: "Pandit Ji takes care of the rest", text: "Pay securely, get your confirmation, and track everything in the app." },
];

const TRUST = [
  { icon: UserCheck, label: "Personal reading by Pandit Ji" },
  { icon: Lock, label: "Your details stay private" },
  { icon: Languages, label: "Hindi and English" },
];

export default function HomePage() {
  return (
    <main>
      <section className="overflow-hidden bg-gradient-to-b from-[#FFF3E0] via-bg to-bg">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-2 md:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-xs font-bold text-saffron ring-1 ring-line">
              <span className="h-2 w-2 rounded-full bg-saffron" /> Launching soon on Google Play
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-heading sm:text-5xl">
              Pandit Ji, now <span className="text-saffron">one tap away</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-body">
              Book pujas and appointments, order puja kits and send your kundli details to Pandit Ji, all from one simple app.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span
                aria-disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-heading/90 px-6 py-3.5 text-sm font-bold text-white"
              >
                Coming soon on Google Play
              </span>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=VedRit%20early%20access`}
                className="inline-flex items-center rounded-full border border-line bg-surface px-6 py-3.5 text-sm font-bold text-heading transition-colors hover:border-saffron hover:text-saffron"
              >
                Get early access
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-body">
              {TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-saffron" aria-hidden /> {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-[#F6D9BF]/50 blur-2xl" aria-hidden />
            <Image
              src="/og.png"
              alt="VedRit - Coming soon"
              width={1024}
              height={500}
              priority
              className="relative w-full rounded-3xl border border-line shadow-xl shadow-[#C65D24]/10"
            />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-bold tracking-wide text-saffron">What you can do</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-heading">Everything for your puja and guidance</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-soft text-saffron">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold text-heading">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-wide text-saffron">How it works</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-heading">Three simple steps</h2>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-2xl border border-line bg-bg p-6">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-saffron text-sm font-extrabold text-white">{s.n}</span>
                <h3 className="mt-4 text-lg font-bold text-heading">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#E4702B] via-[#C65D24] to-[#8E2F12] px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Be among the first to try VedRit</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">
            The app is launching soon. Write to us and we will let you know the moment it is live, or if you have any question.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=VedRit%20early%20access`}
            className="mt-7 inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-saffron transition-transform hover:scale-[1.02]"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>
      </section>
    </main>
  );
}
