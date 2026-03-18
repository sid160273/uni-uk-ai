import { MainNavigation } from "@/components/MainNavigation";
import { BreadcrumbSchema } from "@/components/StructuredData";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | uni-uk.ai",
  description: "Get in touch with the uni-uk.ai team. Report corrections, send feedback, or reach out about partnerships.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us | uni-uk.ai",
    description: "Get in touch with the uni-uk.ai team.",
    type: "website",
    url: "https://uni-uk.ai/contact",
    siteName: "uni-uk.ai",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbSchema items={[
        { name: "Home", url: "https://uni-uk.ai" },
        { name: "Contact", url: "https://uni-uk.ai/contact" },
      ]} />
      <MainNavigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">

          <header className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4">
              Contact Us
            </h1>
            <p className="font-body-serif text-lg text-muted-foreground leading-relaxed">
              We read every message. Reach out about corrections, feedback, or anything else.
            </p>
          </header>

          <div className="space-y-10">

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Email</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed space-y-4">
                <p>
                  The best way to reach us is by email:
                </p>
                <p className="text-xl font-semibold">
                  <a href="mailto:team@uni-uk.ai" className="underline underline-offset-4 decoration-2">team@uni-uk.ai</a>
                </p>
                <p>
                  We aim to respond within 24 hours on weekdays.
                </p>
              </div>
            </section>

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Corrections &amp; Feedback</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed space-y-4">
                <p>
                  Spotted an error in one of our articles? We take accuracy seriously and want to fix mistakes quickly. Please email us with:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>The URL or title of the article</li>
                  <li>What you believe is incorrect</li>
                  <li>A source or reference if available</li>
                </ul>
                <p>
                  We will investigate and publish a correction as soon as possible. See our <Link href="/editorial-policy" className="font-semibold underline underline-offset-2">Editorial Policy</Link> for more details on how we handle corrections.
                </p>
              </div>
            </section>

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Social Media</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed space-y-3">
                <p>Follow us for the latest trending stories:</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                  <li><strong>Twitter / X</strong> — <a href="https://x.com/uniukai" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">@uniukai</a></li>
                  <li><strong>Bluesky</strong> — Coming soon</li>
                  <li><strong>Threads</strong> — Coming soon</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="border-b-2 border-foreground pb-2 mb-4">
                <h2 className="text-[11px] font-bold uppercase tracking-editorial">Partnerships &amp; Press</h2>
              </div>
              <div className="font-body-serif text-foreground/90 leading-relaxed">
                <p>
                  For partnership enquiries, syndication requests, or press contact, email <a href="mailto:team@uni-uk.ai" className="font-semibold underline underline-offset-2">team@uni-uk.ai</a> with the subject line "Partnership" and we will get back to you.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>

      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="font-display text-xl font-bold">
            uni-uk<span className="text-destructive">.ai</span>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/editorial-policy" className="hover:text-foreground transition-colors">Editorial Policy</Link>
            <Link href="/contact" className="text-foreground font-semibold">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} uni-uk.ai &middot; Universal News Intelligence
          </p>
        </div>
      </footer>
    </main>
  );
}
