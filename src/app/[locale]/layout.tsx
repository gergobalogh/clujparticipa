import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Inter } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SessionProvider } from "@/components/auth/session-provider";
import { isAppLocale, locales } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function getUmamiScriptSrc(umamiUrl: string): string {
  return `${umamiUrl.replace(/\/+$/, "")}/script.js`;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  return <LocaleLayoutContent params={params}>{children}</LocaleLayoutContent>;
}

async function LocaleLayoutContent({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {umamiUrl && umamiWebsiteId && (
          <Script
            src={getUmamiScriptSrc(umamiUrl)}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        )}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
