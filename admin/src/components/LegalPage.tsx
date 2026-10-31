import React from 'react';

export const SUPPORT_EMAIL = 'support@vedrit.in';

interface LegalPageProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-sm font-semibold tracking-wide text-[var(--saffron)]">VedRit</p>
        <h1 className="mt-2 text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Last updated: {updated}</p>
        <div className="mt-8 space-y-6 leading-relaxed text-[var(--text-secondary)] [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[var(--text-primary)] [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_a]:text-[var(--saffron)] [&_a]:underline">
          {children}
        </div>
      </article>
    </main>
  );
}
