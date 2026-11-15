import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/#pujas", label: "Pujas" },
  { href: "/#kundli", label: "Kundli" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/" aria-label="VedRit home">
          <Logo size={34} />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-body md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-saffron">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-soft px-3 py-1.5 text-xs font-bold text-saffron ring-1 ring-line">Coming soon</span>
          <details className="group relative md:hidden">
            <summary
              aria-label="Menu"
              className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-surface text-heading [&::-webkit-details-marker]:hidden"
            >
              <Menu className="h-[18px] w-[18px]" aria-hidden />
            </summary>
            <nav
              aria-label="Mobile"
              className="absolute right-0 top-11 w-52 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lg shadow-black/5"
            >
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="block rounded-xl px-3.5 py-2.5 text-sm font-semibold text-heading active:bg-soft">
                  {l.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
