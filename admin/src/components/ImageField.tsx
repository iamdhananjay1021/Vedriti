'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { adminApi, errorMessage } from '../lib/api';
import { Button, Label } from './ui';

const MAX_SIDE = 1600;

const downscale = (file: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not process this image'));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not process this image'))), 'image/jpeg', 0.86);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This file is not a readable image'));
    };
    img.src = url;
  });

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  aspect?: string;
}

export function ImageField({ label, value, onChange, hint, aspect = 'aspect-[16/9]' }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file?: File) => {
    if (!file) return;
    setError(null);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError('Choose a JPEG, PNG or WebP image');
    setBusy(true);
    try {
      const blob = await downscale(file);
      const res = await adminApi.uploadImage(blob);
      onChange(res.url);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div>
      <Label hint={hint}>{label}</Label>
      <div className="flex items-start gap-3">
        <div className={`relative w-40 shrink-0 overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-hover)] ${aspect}`}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
              <ImagePlus className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          <Button type="button" variant="outline" loading={busy} onClick={() => input.current?.click()}>
            {value ? 'Replace image' : 'Upload image'}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" onClick={() => onChange('')}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          ) : null}
          <p className="text-xs text-[var(--text-muted)]">JPEG, PNG or WebP. Large images are resized automatically.</p>
          {error ? <p className="text-xs text-[var(--red)]">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
