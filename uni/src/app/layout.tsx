import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { OrganizationSchema, WebSiteSchema } from "@/components/StructuredData";
import { AdScripts } from "@/components/AdScripts";
import { CLEARING_CYCLE } from "@/lib/clearing";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://uni-uk.ai"),
  title: {
    default: `UCAS Clearing ${CLEARING_CYCLE.year} & UK University Guide | uni-uk.ai`,
    template: "%s | uni-uk.ai",
  },
  description: `Clearing ${CLEARING_CYCLE.year} guidance and a complete guide to 140 UK universities — entry requirements, rankings, student satisfaction and cost of living, with an AI adviser to help you find a place.`,
  keywords: [
    `clearing ${CLEARING_CYCLE.year}`,
    "ucas clearing",
    "uk universities",
    "university clearing",
    "a level results day",
    "university entry requirements",
    "university rankings uk",
    "find a university place",
  ],
  authors: [{ name: "uni-uk.ai" }],
  creator: "uni-uk.ai",
  publisher: "uni-uk.ai",
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
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: `UCAS Clearing ${CLEARING_CYCLE.year} & UK University Guide | uni-uk.ai`,
    description: `Find a university place in Clearing ${CLEARING_CYCLE.year}. Search 140 UK universities, compare entry requirements and rankings, and get instant guidance.`,
    type: "website",
    locale: "en_GB",
    url: "https://uni-uk.ai",
    siteName: "uni-uk.ai",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: `uni-uk.ai — UCAS Clearing ${CLEARING_CYCLE.year} and UK university guide`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `UCAS Clearing ${CLEARING_CYCLE.year} & UK University Guide`,
    description: `Search 140 UK universities, compare entry requirements, and find a place in Clearing.`,
    images: ["/logo.png"],
    creator: "@uniukai",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* RSS Feed Discovery */}
        <link rel="alternate" type="application/rss+xml" title="uni-uk.ai Blog Feed" href="/blog/rss.xml" />

        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-ZYE3BGM8BM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZYE3BGM8BM');
          `}
        </Script>

      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${sourceSerif.variable} antialiased`}
      >
        <OrganizationSchema />
        <WebSiteSchema />
        <AdScripts />
        {children}
      </body>
    </html>
  );
}
