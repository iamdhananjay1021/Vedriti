import React from "react";

interface LegalPageProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <main>
      <div className="border-b border-line bg-gradient-to-b from-[#FFF3E0] to-bg">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <p className="text-sm font-bold tracking-wide text-saffron">VedRit</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>
        </div>
      </div>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="space-y-5 leading-relaxed text-body [&_a]:font-semibold [&_a]:text-saffron [&_a]:underline [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-heading [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
          {children}
        </div>
      </article>
    </main>
  );
}
