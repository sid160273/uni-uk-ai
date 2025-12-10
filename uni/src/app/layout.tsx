import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "Uni-UK.AI - Find Your Perfect UK University",
  description: "AI-powered university discovery platform helping students find the perfect UK university based on their interests, goals, and preferences.",
  keywords: ["UK universities", "university finder", "AI university search", "UK colleges", "university rankings", "student guide"],
  authors: [{ name: "Uni-UK.AI" }],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Uni-UK.AI - Find Your Perfect UK University",
    description: "AI-powered university discovery platform helping students find the perfect UK university based on their interests, goals, and preferences.",
    type: "website",
    locale: "en_GB",
    siteName: "Uni-UK.AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Uni-UK.AI - Find Your Perfect UK University",
    description: "AI-powered university discovery platform helping students find the perfect UK university.",
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4540315059867204"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
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
        {children}
      </body>
    </html>
  );
}
