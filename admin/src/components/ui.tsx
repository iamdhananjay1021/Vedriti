'use client';

import React, { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

const buttonClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--saffron)] text-white hover:opacity-90',
  outline: 'border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
  ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
  danger: 'bg-[var(--red)] text-white hover:opacity-90',
};

export function Button({
  variant = 'primary',
  loading,
  className = '',
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonClasses[variant]} ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

const fieldClass =
  'w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--saffron)] placeholder:text-[var(--text-muted)]';

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-1 block text-xs font-semibold text-[var(--text-secondary)]">
      {children}
      {hint ? <span className="ml-1 font-normal text-[var(--text-muted)]">{hint}</span> : null}
    </span>
  );
}

export function Input({ label, hint, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  return (
    <label className={`block ${className}`}>
      {label ? <Label hint={hint}>{label}</Label> : null}
      <input {...props} className={fieldClass} />
    </label>
  );
}

export function Textarea({ label, hint, className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }) {
  return (
    <label className={`block ${className}`}>
      {label ? <Label hint={hint}>{label}</Label> : null}
      <textarea {...props} className={`${fieldClass} min-h-[84px]`} />
    </label>
  );
}

export function Select({
  label,
  options,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[] }) {
  return (
    <label className={`block ${className}`}>
      {label ? <Label>{label}</Label> : null}
      <select {...props} className={fieldClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-primary)]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--saffron)]" />
      {label}
    </label>
  );
}

const toneClasses = {
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  green: 'bg-green-500/15 text-green-700 dark:text-green-400',
  blue: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  gray: 'bg-gray-500/15 text-[var(--text-secondary)]',
  red: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

export function Badge({ tone = 'gray', children }: { tone?: keyof typeof toneClasses; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${toneClasses[tone]}`}>{children}</span>;
}

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 ${className}`}>{children}</div>;
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-center py-10 ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-[var(--saffron)]" />
    </div>
  );
}

export function Empty({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="py-12 text-center">
      <div className="text-4xl text-[var(--gold)]">ॐ</div>
      <p className="mt-2 font-semibold">{title}</p>
      {subtitle ? <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p> : null}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-[var(--red-bg)] p-3 text-sm text-[var(--red)]">
      <span>{message}</span>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-[var(--bg-surface)] shadow-2xl sm:rounded-2xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-5 py-3">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--bg-hover)]" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border-color)] px-5 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Pagination({ page, total, limit, onPage }: { page: number; total: number; limit: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-secondary)]">
      <span>
        Page {page} of {pages} • {total} records
      </span>
      <div className="flex gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = React.useState<{ message: string; tone: 'ok' | 'error' } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  const node = toast ? (
    <div
      className={`fixed bottom-4 right-4 z-[60] rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-xl ${toast.tone === 'ok' ? 'bg-green-600' : 'bg-red-600'}`}
    >
      {toast.message}
    </div>
  ) : null;
  return {
    node,
    ok: (message: string) => setToast({ message, tone: 'ok' }),
    error: (message: string) => setToast({ message, tone: 'error' }),
  };
}
