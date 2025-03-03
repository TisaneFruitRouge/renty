import type { Metadata } from "next";
import "./globals.css";

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';


export const metadata: Metadata = {
  title: "Renty | Gestion locative simplifiée",
  description: "Renty est une solution tout-en-un pour simplifier la gestion locative, automatiser les quittances de loyer et faciliter la communication entre propriétaires et locataires.",
  keywords: "gestion locative, quittance de loyer, propriétaire, locataire, immobilier",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const locale = await getLocale();
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
