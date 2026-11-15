import Link from "next/link";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="VedRit home">
          <Logo size={38} />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-body md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-saffron">
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="rounded-full bg-soft px-3.5 py-1.5 text-xs font-bold text-saffron ring-1 ring-line">Coming soon</span>
      </div>
    </header>
  );
}
