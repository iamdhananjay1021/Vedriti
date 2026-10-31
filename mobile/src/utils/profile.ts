import type { UserProfile } from '../types/api';

const CHECKS: { key: keyof UserProfile; label: string }[] = [
  { key: 'name', label: 'name' },
  { key: 'phone', label: 'mobile number' },
  { key: 'email', label: 'email' },
  { key: 'gender', label: 'gender' },
  { key: 'dateOfBirth', label: 'date of birth' },
  { key: 'timeOfBirth', label: 'birth time' },
  { key: 'placeOfBirth', label: 'birth place' },
  { key: 'gotra', label: 'gotra' },
  { key: 'rashi', label: 'rashi' },
  { key: 'address', label: 'address' },
  { key: 'city', label: 'city' },
  { key: 'state', label: 'state' },
  { key: 'pinCode', label: 'PIN code' },
  { key: 'avatarUrl', label: 'profile photo' },
];

export const profileCompleteness = (user: UserProfile | null) => {
  if (!user) return { percent: 0, missing: [] as string[] };
  const missing = CHECKS.filter(({ key }) => !String(user[key] ?? '').trim()).map((c) => c.label);
  const percent = Math.round(((CHECKS.length - missing.length) / CHECKS.length) * 100);
  return { percent, missing };
};
