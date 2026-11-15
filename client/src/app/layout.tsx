import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://vedrit.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VedRit • Puja, Appointments & Kundli with Pandit Ji",
    template: "%s • VedRit",
  },
  description:
    "Book pujas, appointments and kundli consultations with Pandit Ji, and order puja kits online. VedRit is coming soon to Google Play.",
  applicationName: "VedRit",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "VedRit",
    title: "VedRit • Puja, Appointments & Kundli with Pandit Ji",
    description: "Book pujas, appointments and kundli consultations with Pandit Ji. Coming soon on Google Play.",
    images: [{ url: "/og.png", width: 1024, height: 500, alt: "VedRit" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#C65D24",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
