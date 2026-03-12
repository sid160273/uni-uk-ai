import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { EzoicRouteHandler } from "@/components/EzoicRouteHandler";
import { OrganizationSchema, WebSiteSchema } from "@/components/StructuredData";
import { AdScripts } from "@/components/AdScripts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://uni-uk.ai"),
  title: "uni-uk.ai - Learn What's Happening Right Now",
  description: "Your one-stop shop to understand what's trending. AI-powered stories on the topics everyone is searching for — sports, politics, entertainment, tech, and more. Updated every 30 minutes.",
  keywords: ["trending news", "what's trending", "trending topics", "current events", "breaking news", "trending stories", "news today", "AI news"],
  authors: [{ name: "uni-uk.ai" }],
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
    title: "uni-uk.ai - Learn What's Happening Right Now",
    description: "AI-powered trending news platform. Understand what the world is searching for with clear, insightful stories updated every 30 minutes.",
    type: "website",
    locale: "en_GB",
    siteName: "uni-uk.ai",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "uni-uk.ai Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "uni-uk.ai - Learn What's Happening Right Now",
    description: "AI-powered trending news. Understand what the world is searching for, updated every 30 minutes.",
    images: ["/logo.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Ezoic GateKeeper Consent Management */}
        <Script
          src="https://cmp.gatekeeperconsent.com/min.js"
          strategy="beforeInteractive"
          data-cfasync="false"
        />
        <Script
          src="https://the.gatekeeperconsent.com/cmp.min.js"
          strategy="beforeInteractive"
          data-cfasync="false"
        />

        {/* Ezoic Header Script */}
        <Script
          async
          src="//www.ezojs.com/ezoic/sa.min.js"
          strategy="beforeInteractive"
        />
        <Script id="ezoic-standalone" strategy="beforeInteractive">
          {`
            window.ezstandalone = window.ezstandalone || {};
            ezstandalone.cmd = ezstandalone.cmd || [];
          `}
        </Script>

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OrganizationSchema />
        <WebSiteSchema />
        <EzoicRouteHandler />
        <AdScripts />
        {children}
      </body>
    </html>
  );
}
