import Link from "next/link";
import { Logo } from "./Logo";

export const SUPPORT_EMAIL = "support@vedrit.in";

const LEGAL = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/delete-account", label: "Delete account" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo size={34} />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Puja, appointments and kundli with Pandit Ji, made simple.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-heading">Legal</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-body transition-colors hover:text-saffron">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-heading">Contact</h3>
          <p className="mt-3 text-sm text-body">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="transition-colors hover:text-saffron">
              {SUPPORT_EMAIL}
            </a>
          </p>
          <p className="mt-1 text-sm text-muted">vedrit.in</p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">© {new Date().getFullYear()} VedRit. All rights reserved.</div>
    </footer>
  );
}
