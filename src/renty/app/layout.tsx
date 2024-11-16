import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Renty",
  description: "The all-in-one tool for the landlords",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
