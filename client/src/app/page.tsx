import Image from "next/image";
import {
  CalendarCheck,
  ChevronDown,
  Clock,
  Compass,
  HeartHandshake,
  Home,
  Languages,
  Lock,
  Mail,
  MessageCircleQuestion,
  Package,
  ScrollText,
  ShieldAlert,
  ShoppingBag,
  UserCheck,
  Users,
  Video,
} from "lucide-react";
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
    text: "Sign in with your email and a one-time code. Add a password too if you prefer.",
  },
];

const PUJAS = [
  { name: "Shree Ganesh Puja & Vighnaharta Yajan", note: "Obstacles, intellect and auspicious beginnings", modes: "Online or at home" },
  { name: "Griha Pravesh & Vastu Shanti", note: "Peace and positive energy in your new home", modes: "At home" },
  { name: "Maha Rudrabhishek", note: "Health, protection and inner peace", modes: "Online, at home or at a temple" },
  { name: "Shree Satyanarayan Katha", note: "Family harmony and fulfilment of sankalp", modes: "Online or at home" },
];

const PUJA_POINTS = [
  { icon: Video, title: "Online or in person", text: "Join by video from anywhere, or have Pandit Ji perform the puja at your home or a temple, depending on the puja." },
  { icon: Package, title: "With or without samagri", text: "Choose Pandit Ji only, or Pandit Ji with the complete samagri so you have nothing to arrange." },
  { icon: Clock, title: "Slots that suit you", text: "See Pandit Ji's real availability and book a time. Your slot is held for you once you book." },
];

const KUNDLI = [
  { icon: Compass, title: "Janam Kundli analysis", text: "A complete reading of your birth chart with practical remedies." },
  { icon: HeartHandshake, title: "Kundli Milan", text: "Match making for marriage with the 36 guna method." },
  { icon: ShieldAlert, title: "Dosha Nivaran", text: "Guidance on Mangal, Kaal Sarp, Pitra and Shani Sade Sati." },
  { icon: MessageCircleQuestion, title: "Ask a question", text: "Career, marriage, health, business or muhurat. Ask Pandit Ji directly." },
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

const FAQS = [
  {
    q: "When will the app be available?",
    a: "VedRit is launching soon on Google Play. Write to us at the email below and we will tell you as soon as it is live.",
  },
  {
    q: "How do I sign up?",
    a: "Enter your email and mobile number in the app. We send a 6-digit code to your email, and you are in. Your mobile number is used by Pandit Ji to contact you about your booking.",
  },
  {
    q: "Can the puja be done online?",
    a: "Yes. Many pujas can be attended by video from anywhere. Some pujas can also be performed at your home or at a temple. The options are shown on each puja in the app.",
  },
  {
    q: "How do I pay?",
    a: "Payments are made securely through Razorpay using UPI, cards or net banking. We never store your card, UPI or bank details.",
  },
  {
    q: "Can I cancel or reschedule a booking?",
    a: "You can cancel from the app before the puja is performed. If we cannot perform a puja or appointment, we reschedule it or refund you in full. See our Terms of Service for details.",
  },
  {
    q: "How does the kundli reading work?",
    a: "You send your date, time and place of birth along with your questions. Pandit Ji reviews them personally and replies in the app, in Hindi or English. A call is arranged if needed.",
  },
  {
    q: "Is my information safe?",
    a: "Your details are sent over encrypted connections and shared only with the people who need them to serve you. You can delete your account from the app at any time. Read our Privacy Policy for more.",
  },
];

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "VedRit",
      url: "https://vedrit.in",
      logo: "https://vedrit.in/icon.png",
      email: SUPPORT_EMAIL,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-bold tracking-wide text-saffron">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">{title}</h2>
      {text ? <p className="mt-3 leading-relaxed text-body">{text}</p> : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />

      <section className="overflow-hidden bg-gradient-to-b from-[#FFF3E0] via-bg to-bg">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-8 sm:px-6 sm:pb-16 md:grid-cols-2 md:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-xs font-bold text-saffron ring-1 ring-line">
              <span className="h-2 w-2 rounded-full bg-saffron" /> Launching soon on Google Play
            </span>
            <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.12] tracking-tight text-heading sm:mt-5 sm:text-5xl">
              Pandit Ji, now <span className="text-saffron">one tap away</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-body sm:mt-5 sm:text-lg">
              Book pujas and appointments, order puja kits and send your kundli details to Pandit Ji, all from one simple app.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span aria-disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-heading/90 px-6 py-3.5 text-sm font-bold text-white">
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

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16">
        <SectionHead eyebrow="What you can do" title="Everything for your puja and guidance" />
        <div className="mt-8 grid sm:mt-10 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="grid grid-cols-[auto_1fr] items-start gap-x-4 rounded-2xl border border-line bg-surface p-5 sm:block sm:p-6">
              <span className="row-span-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-soft text-saffron sm:row-span-1">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="text-base font-bold text-heading sm:mt-4 sm:text-lg">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-body sm:mt-2">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pujas" className="scroll-mt-20 bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionHead
            eyebrow="Pujas"
            title="Authentic pujas, performed by Pandit Ji"
            text="Every puja is performed with traditional vidhi and a sankalp in your name and your family's names."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-bg">
              {PUJAS.map((p) => (
                <li key={p.name} className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <div>
                    <h3 className="font-bold text-heading">{p.name}</h3>
                    <p className="mt-0.5 text-sm text-body">{p.note}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-soft px-3 py-1 text-xs font-bold text-saffron sm:self-auto">
                    <Home className="h-3.5 w-3.5" aria-hidden /> {p.modes}
                  </span>
                </li>
              ))}
            </ul>
            <div className="space-y-4">
              {PUJA_POINTS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-line bg-bg p-5">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-saffron">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-bold text-heading">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-body">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-5 text-sm text-muted">More pujas are added regularly. Availability and options are shown in the app.</p>
        </div>
      </section>

      <section id="kundli" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16">
        <SectionHead
          eyebrow="Kundli & Jyotish"
          title="A personal reading, not an automated report"
          text="Send your birth details and questions to Pandit Ji. He reviews them personally and replies inside the app."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {KUNDLI.map(({ icon: Icon, title, text }) => (
            <div key={title} className="grid grid-cols-[auto_1fr] items-start gap-x-4 rounded-2xl border border-line bg-surface p-5 sm:block sm:p-6">
              <span className="row-span-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-soft text-saffron sm:row-span-1">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="text-base font-bold text-heading sm:mt-4 sm:text-lg">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-body sm:mt-2">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted">You will need your date, time and place of birth. If you do not know the exact time, you can say so.</p>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionHead eyebrow="How it works" title="Three simple steps" />
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-2xl border border-line bg-bg p-5 sm:p-6">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-saffron text-sm font-extrabold text-white">{s.n}</span>
                <h3 className="mt-4 text-lg font-bold text-heading">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16">
        <SectionHead eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-8 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-line bg-surface px-5 py-4 open:shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-heading [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-saffron transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-body">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="rounded-3xl bg-gradient-to-br from-[#E4702B] via-[#C65D24] to-[#8E2F12] px-5 py-10 text-center text-white sm:px-12 sm:py-12">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Be among the first to try VedRit</h2>
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
