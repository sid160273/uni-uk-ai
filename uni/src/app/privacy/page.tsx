import Link from "next/link";
import { Metadata } from "next";
import { MainNavigation } from "@/components/MainNavigation";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
    title: "Privacy Policy | GDPR Compliance & Data Protection",
    description: "uni-uk.ai privacy policy. Learn how we handle your data, protect your privacy and comply with GDPR and UK data protection laws.",
    alternates: {
        canonical: "/privacy",
    },
    openGraph: {
        title: "Privacy Policy | uni-uk.ai",
        description: "Learn how uni-uk.ai handles your data and protects your privacy in compliance with GDPR and UK data protection laws.",
        type: "website",
        url: "https://uni-uk.ai/privacy",
        siteName: "uni-uk.ai",
    },
    twitter: {
        card: "summary",
        title: "Privacy Policy | uni-uk.ai",
        description: "Learn how uni-uk.ai handles your data and protects your privacy in compliance with GDPR.",
    },
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <MainNavigation />

            {/* Content */}
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Welcome to uni-uk.ai. We are committed to protecting your privacy and ensuring transparency about how we handle data.
                            This privacy policy explains our practices regarding data collection, use, and protection in compliance with the
                            General Data Protection Regulation (GDPR) and UK data protection laws.
                        </p>
                    </section>

                    {/* Data Controller */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Data Controller</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            uni-uk.ai operates as the data controller for any personal data processed through this website.
                            If you have any questions about this privacy policy or our data practices, please contact us through the website.
                        </p>
                    </section>

                    {/* Personal Data We Collect */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Personal Data We Collect</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We are committed to minimizing data collection. The personal data we may process includes:
                        </p>

                        <div className="bg-card border rounded-lg p-6 space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Clearing Adviser Conversations</h3>
                                <p className="text-muted-foreground">
                                    Our Clearing adviser is an AI chat feature. When you send it a message, we process and
                                    <strong className="text-foreground"> store</strong> the following:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                                    <li>The full text of the messages you send</li>
                                    <li>The full text of the adviser&apos;s replies</li>
                                    <li>Details the adviser infers from your messages in order to give better advice — the subject you want to study, the grades you mention, whether you are a UK or international applicant, your home country, and your preferred location</li>
                                    <li>A timestamp and a message number</li>
                                </ul>
                                <p className="text-muted-foreground mt-3">
                                    These transcripts are sent to OpenAI to generate a reply, and are recorded in a private
                                    Google Sheet that we use to understand what students are asking and improve the adviser.
                                    They are not linked to your name, email address or account, because we do not ask for any
                                    of those.
                                </p>
                                <div className="mt-3 border-l-2 border-destructive pl-4">
                                    <p className="text-muted-foreground">
                                        <strong className="text-foreground">Please do not type personal details into the adviser.</strong> It
                                        does not need your full name, address, date of birth, UCAS Personal ID, Clearing number or
                                        contact details to help you, and you should not share them. If you do include such details,
                                        they will be stored in the transcript — contact us and we will delete it.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Analytics Data</h3>
                                <p className="text-muted-foreground">
                                    We use Google Analytics to understand how visitors use our site. This includes anonymized data such as:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                                    <li>Pages visited and time spent on pages</li>
                                    <li>Browser type and device information</li>
                                    <li>General geographic location (country/city level)</li>
                                    <li>Referral sources</li>
                                </ul>
                                <p className="text-muted-foreground mt-2">
                                    We have configured Google Analytics to anonymize IP addresses and do not collect personally identifiable information through analytics.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Technical Data</h3>
                                <p className="text-muted-foreground">
                                    Our hosting provider (Vercel) may collect technical data such as IP addresses in server logs for security and performance purposes.
                                    This data is automatically deleted after a short retention period.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Legal Basis for Processing */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Legal Basis for Processing</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Under GDPR, we process data based on the following legal grounds:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-2 text-muted-foreground">
                            <li><strong className="text-foreground">Consent:</strong> By choosing to send a message to the Clearing adviser, you consent to your messages being processed and stored as described in section 3. You do not have to use the adviser — every university page, ranking and Clearing guide on this site works without it</li>
                            <li><strong className="text-foreground">Legitimate Interests:</strong> We process analytics data to improve our service and understand user needs</li>
                            <li><strong className="text-foreground">Legal Obligation:</strong> We may process data to comply with legal requirements</li>
                        </ul>
                    </section>

                    {/* How We Use Data */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. How We Use Your Data</h2>
                        <p className="text-muted-foreground leading-relaxed mb-2">We use collected data solely for:</p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>Generating replies from the Clearing adviser and matching your grades and subject against our university database</li>
                            <li>Reviewing adviser transcripts to find where its answers were wrong, unhelpful or incomplete, and improving them</li>
                            <li>Improving website functionality and user experience</li>
                            <li>Understanding usage patterns through anonymized analytics</li>
                            <li>Ensuring website security and preventing abuse</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            <strong className="text-foreground">We do not:</strong> Sell your data, share it with third parties for marketing purposes,
                            pass your details to universities or agents, or use it for any purpose other than those listed above.
                            We do not use your conversations to train our own AI models, and OpenAI does not use API data to train
                            theirs.
                        </p>
                    </section>

                    {/* Third-Party Services */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Third-Party Services</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We use the following third-party services that may process data:
                        </p>

                        <div className="space-y-4">
                            <div className="bg-card border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">Google Analytics</h3>
                                <p className="text-muted-foreground text-sm">
                                    For anonymized usage analytics. View their{' '}
                                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        privacy policy
                                    </a>.
                                </p>
                            </div>

                            <div className="bg-card border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">Google AdSense</h3>
                                <p className="text-muted-foreground text-sm">
                                    For displaying relevant advertisements. Ads are contextual and based on page content, not personal data.
                                    View their{' '}
                                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        privacy policy
                                    </a>.
                                </p>
                            </div>

                            <div className="bg-card border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">OpenAI</h3>
                                <p className="text-muted-foreground text-sm">
                                    Powers our Clearing adviser and generates our articles.{' '}
                                    <strong className="text-foreground">The messages you send to the adviser are transmitted to OpenAI&apos;s API</strong>{' '}
                                    in order to produce a reply. OpenAI does not use data submitted through its API to train its
                                    models, and states that API data is retained for up to 30 days for abuse monitoring before
                                    deletion. View their{' '}
                                    <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        privacy policy
                                    </a>.
                                </p>
                            </div>

                            <div className="bg-card border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">Google Sheets</h3>
                                <p className="text-muted-foreground text-sm">
                                    We store Clearing adviser transcripts and our article content in a private Google Sheet,
                                    accessible only to us via a service account. View Google&apos;s{' '}
                                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        privacy policy
                                    </a>.
                                </p>
                            </div>

                            <div className="bg-card border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">Vercel</h3>
                                <p className="text-muted-foreground text-sm">
                                    Our hosting provider. May collect technical logs for security purposes.
                                    View their{' '}
                                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        privacy policy
                                    </a>.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We use minimal cookies and tracking technologies:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li><strong className="text-foreground">Essential Cookies:</strong> Required for website functionality</li>
                            <li><strong className="text-foreground">Analytics Cookies:</strong> Google Analytics cookies for understanding site usage (anonymized)</li>
                            <li><strong className="text-foreground">Advertising Cookies:</strong> Google AdSense cookies for serving relevant ads</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            You can control cookie preferences through your browser settings. Note that disabling cookies may affect website functionality.
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li><strong className="text-foreground">Clearing Adviser Transcripts:</strong> Retained for 12 months from the date of the conversation, then deleted. You can ask us to delete yours sooner — see section 9</li>
                            <li><strong className="text-foreground">Analytics Data:</strong> Retained for 26 months (Google Analytics default)</li>
                            <li><strong className="text-foreground">Server Logs:</strong> Automatically deleted after 30 days</li>
                        </ul>
                    </section>

                    {/* Your Rights Under GDPR */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Your Rights Under GDPR</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            As a user in the UK or EU, you have the following rights:
                        </p>

                        <div className="bg-card border rounded-lg p-6 space-y-3">
                            <div>
                                <h3 className="font-semibold">Right to Access</h3>
                                <p className="text-muted-foreground text-sm">Request a copy of the personal data we hold about you</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Right to Rectification</h3>
                                <p className="text-muted-foreground text-sm">Request correction of inaccurate personal data</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Right to Erasure</h3>
                                <p className="text-muted-foreground text-sm">Request deletion of your personal data</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Right to Restrict Processing</h3>
                                <p className="text-muted-foreground text-sm">Request limitation of how we process your data</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Right to Data Portability</h3>
                                <p className="text-muted-foreground text-sm">Request your data in a portable format</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Right to Object</h3>
                                <p className="text-muted-foreground text-sm">Object to processing of your personal data</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Right to Withdraw Consent</h3>
                                <p className="text-muted-foreground text-sm">Withdraw consent for data processing at any time</p>
                            </div>
                        </div>

                        <div className="bg-card border rounded-lg p-6 mt-4">
                            <h3 className="font-semibold text-lg mb-2">Deleting your Clearing adviser conversation</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Because we do not ask for your name or email, we cannot look up your conversation from your
                                identity alone. To have a transcript deleted, contact us via our{' '}
                                <Link href="/contact" className="text-primary hover:underline">contact page</Link> with the
                                approximate date and time you used the adviser and roughly what you asked about. That is
                                normally enough for us to find and delete it. We will confirm once it is done.
                            </p>
                        </div>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            Outside of adviser transcripts we hold very little that identifies you — our analytics are
                            anonymized and we operate no user accounts. To exercise any of these rights, please contact us.
                        </p>
                    </section>

                    {/* Data Security */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We implement appropriate technical and organizational measures to protect your data:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-2 text-muted-foreground">
                            <li>HTTPS encryption for all data transmission</li>
                            <li>Secure hosting infrastructure with Vercel</li>
                            <li>API keys and sensitive data stored securely with environment variables</li>
                            <li>Regular security updates and monitoring</li>
                            <li>Minimal data collection principle - we only collect what's necessary</li>
                        </ul>
                    </section>

                    {/* International Transfers */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Some of our service providers (Google, OpenAI) may process data outside the UK/EU. These transfers are protected by:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-2 text-muted-foreground">
                            <li>Standard Contractual Clauses (SCCs)</li>
                            <li>Adequacy decisions where applicable</li>
                            <li>Appropriate safeguards as required by GDPR</li>
                        </ul>
                    </section>

                    {/* Children's Privacy */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">12. Under-18s</h2>
                        <p className="text-muted-foreground leading-relaxed mb-3">
                            Most people using this site are 16 to 18 years old, and we design it on that basis. We do not
                            operate accounts, we never ask for a name, email address, phone number or date of birth, and we
                            do not build profiles of individual users or use their data for targeted advertising.
                        </p>
                        <p className="text-muted-foreground leading-relaxed mb-3">
                            The Clearing adviser is the one place where a young person could type something identifying, which
                            is why we ask them not to, and why we store transcripts without any identity attached and delete
                            them after 12 months.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Parents and guardians: if you believe your child has shared personal details with the adviser and
                            you want the conversation deleted, contact us with the approximate date and topic and we will
                            remove it. You do not need to prove anything to us to have a transcript deleted.
                        </p>
                    </section>

                    {/* Changes to Privacy Policy */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">13. Changes to This Privacy Policy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.
                            We encourage you to review this policy periodically. Continued use of the website after changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    {/* Contact & Complaints */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">14. Contact Us & Complaints</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            If you have questions about this privacy policy or wish to exercise your data protection rights, please contact us through the website.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            You also have the right to lodge a complaint with the Information Commissioner's Office (ICO),
                            the UK's supervisory authority for data protection issues:
                        </p>
                        <div className="bg-card border rounded-lg p-4 mt-4">
                            <p className="text-sm">
                                <strong className="text-foreground">Information Commissioner's Office</strong><br/>
                                Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a><br/>
                                Phone: 0303 123 1113
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">15. Advertising & Third-Party Services</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            We use Google AdSense and other third-party advertising services to display ads on our website.
                            These services may use cookies and similar technologies to collect information about your browsing activity.
                        </p>
                    </section>

                    {/* Summary */}
                    <section className="bg-primary/5 border-l-4 border-primary rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4">Summary</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">In simple terms:</strong> Browsing this site is anonymous —
                            no account, no name, no email. If you use the Clearing adviser, we do keep what you typed and what
                            it replied, for 12 months, so we can make it better; it is sent to OpenAI to generate the answer,
                            it is not linked to your identity, and you can ask us to delete it at any time. We never sell your
                            data or pass your details to universities or agents. Please do not type personal details into the
                            adviser — it does not need them.
                        </p>
                    </section>
                </div>
            </div>

            <SiteFooter />
        </div>
    );
}
