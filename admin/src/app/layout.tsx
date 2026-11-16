import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VedRit • Sacred Temple & Devotee Administration',
  description: 'Bookings, rituals, devotees, kundli, and spiritual store management platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${outfit.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
