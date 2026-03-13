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
  title: {
    default: "Trending News Today | What's Trending Right Now | uni-uk.ai",
    template: "%s | uni-uk.ai",
  },
  description: "Discover what's trending right now with AI-powered stories updated every 10 minutes. Breaking news, trending topics, sports, politics, entertainment and tech.",
  keywords: ["trending news", "what's trending", "trending topics", "trending stories today", "current events", "breaking news", "news today", "AI news", "trending now", "what's happening today"],
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
    title: "Trending News Today | What's Trending Right Now | uni-uk.ai",
    description: "AI-powered trending news platform. Discover what everyone is searching for with clear, insightful stories updated every 10 minutes.",
    type: "website",
    locale: "en_GB",
    url: "https://uni-uk.ai",
    siteName: "uni-uk.ai",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "uni-uk.ai - Trending News & Stories Updated Every 30 Minutes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trending News Today | What's Trending Right Now | uni-uk.ai",
    description: "AI-powered trending news. Discover what everyone is searching for, updated every 10 minutes.",
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
