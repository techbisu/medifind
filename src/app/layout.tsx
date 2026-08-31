import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://medifind.app"),
  title: {
    default: "MediFind — Find Trusted Healthcare Near You",
    template: "%s | MediFind",
  },
  description:
    "Discover verified doctors, pharmacies, clinics and diagnostic labs near you. Book appointments, order medicines, get lab tests done — all in one place. Free for patients.",
  keywords: [
    "doctor appointment",
    "find doctor near me",
    "medical shop",
    "pharmacy near me",
    "diagnostic lab",
    "lab tests",
    "healthcare India",
    "book appointment online",
    "MediFind",
  ],
  authors: [{ name: "MediFind" }],
  creator: "MediFind",
  publisher: "MediFind",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MediFind — Find Trusted Healthcare Near You",
    description:
      "Discover verified doctors, pharmacies, clinics and diagnostic labs near you. Book appointments online — free for patients.",
    url: "https://medifind.app",
    siteName: "MediFind",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MediFind — Healthcare Network",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediFind — Find Trusted Healthcare Near You",
    description:
      "Discover verified doctors, pharmacies, clinics and diagnostic labs near you.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  category: "health",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0F766E" },
    { media: "(prefers-color-scheme: dark)", color: "#0D9488" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "MediFind",
              url: "https://medifind.app",
              logo: "https://medifind.app/logo.png",
              description: "India's comprehensive medical marketplace connecting patients with verified doctors, pharmacies, and diagnostic labs.",
              sameAs: [
                "https://github.com/techbisu/medifind",
              ],
            }),
          }}
        />
        {/* JSON-LD: WebSite with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "MediFind",
              url: "https://medifind.app",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://medifind.app/?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
