import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BRAND } from "@/lib/brand";
import "./globals.css";

/* Style guide §4.1 — Inter, with the documented fallback stack declared in
   globals.css. `display: swap` keeps LCP honest on slow connections. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.shortName}`,
  },
  description:
    "Computer education, franchise and training-centre management for Career Optics Computer Academy.",
  applicationName: BRAND.shortName,
  formatDetection: { telephone: false },
};

/* Style guide §9.4/§9.5 — respect device safe areas and the navy theme colour.
   `maximumScale` is deliberately unset: §14 requires 200% zoom to work. */
export const viewport: Viewport = {
  themeColor: BRAND.themeColor,
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
