import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediFind — Find Doctors, Pharmacies & Labs Near You",
  description: "India's comprehensive medical marketplace. Book appointments with verified doctors, find 24/7 pharmacies, and get lab tests done. Free for patients, simple for providers.",
  keywords: ["doctor", "appointment", "pharmacy", "lab test", "medical shop", "healthcare", "India", "MediFind"],
  authors: [{ name: "MediFind" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
