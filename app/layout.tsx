import { AuthProvider } from "@/components/session-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { getLocale } from "@/lib/i18n-server";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
// Bangla glyphs (Plus Jakarta Sans has none), used as a fallback font.
const bangla = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-bangla", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "KM Holidays | Tour Packages, Hotels, Visa & eSIM from Bangladesh",
    template: "%s | KM Holidays",
  },
  description:
    "Book tour packages, hotels, visa processing, travel eSIM, air tickets and more at the best price with KM Holidays. Easy booking and real support from our travel experts.",
};

export const viewport: Viewport = {
  themeColor: "#1b1d55",
  width: "device-width",
  initialScale: 1,
  // Lets env(safe-area-inset-*) work on notched phones (bottom tab bar, sticky CTA).
  viewportFit: "cover",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${jakarta.variable} ${bangla.variable}`}>
      <body>
        <I18nProvider locale={locale}>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
