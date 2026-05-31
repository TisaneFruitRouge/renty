import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Renty",
  description: "The all-in-one tool for the landlords",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <ConvexClientProvider>
              {children}
              <Toaster />
            </ConvexClientProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
