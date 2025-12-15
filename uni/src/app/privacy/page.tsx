import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | uni-uk.ai",
    description: "Privacy policy for uni-uk.ai - Learn how we handle your data and protect your privacy in compliance with GDPR.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/logo.png"
                            alt="uni-uk.ai Logo"
                            width={200}
                            height={40}
                            className="h-8 md:h-10 w-auto"
                            priority
                        />
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <Link href="/#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
                        <Link href="/universities" className="hover:text-foreground transition-colors">Universities</Link>
                        <Link href="/#about" className="hover:text-foreground transition-colors">About</Link>
                    </div>
                    <Link
                        href="/#search"
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors inline-block"
                    >
                        Back to Chat
                    </Link>
                </div>
            </nav>

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
                                <h3 className="font-semibold text-lg mb-2">Chat Conversations</h3>
                                <p className="text-muted-foreground">
                                    When you use our AI chat feature, your messages are processed temporarily to provide university recommendations.
                                    <strong className="text-foreground"> We do not store your chat history or personal information from conversations.</strong>
                                    Conversations are processed in real-time and are not retained after your session ends.
                                </p>
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
                            <li><strong className="text-foreground">Legitimate Interests:</strong> We process analytics data to improve our service and understand user needs</li>
                            <li><strong className="text-foreground">Consent:</strong> By using our website and chat feature, you consent to the processing described in this policy</li>
                            <li><strong className="text-foreground">Legal Obligation:</strong> We may process data to comply with legal requirements</li>
                        </ul>
                    </section>

                    {/* How We Use Data */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. How We Use Your Data</h2>
                        <p className="text-muted-foreground leading-relaxed mb-2">We use collected data solely for:</p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            <li>Providing university recommendations through our AI chat service</li>
                            <li>Improving website functionality and user experience</li>
                            <li>Understanding usage patterns through anonymized analytics</li>
                            <li>Ensuring website security and preventing abuse</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            <strong className="text-foreground">We do not:</strong> Sell your data, share it with third parties for marketing purposes,
                            or use it for any purpose other than those listed above.
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
                                    Powers our AI chat feature. Your chat messages are processed by OpenAI's API but are not used to train their models.
                                    View their{' '}
                                    <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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
                            <li><strong className="text-foreground">Chat Data:</strong> Not retained - processed in real-time only</li>
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

                        <p className="text-muted-foreground leading-relaxed mt-4">
                            Given that we collect minimal personal data and do not retain chat histories, there is typically very little personal data to access or delete.
                            However, if you wish to exercise any of these rights, please contact us.
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
                        <h2 className="text-2xl font-semibold mb-4">12. Children's Privacy</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Our service is intended for prospective university students and may be used by individuals under 18.
                            We do not knowingly collect personal information from children. The minimal data we process (anonymized analytics)
                            does not identify individuals. Parents or guardians who believe their child has used our chat service should contact us.
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

                    {/* Summary */}
                    <section className="bg-primary/5 border-l-4 border-primary rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4">Summary</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">In simple terms:</strong> We collect minimal data, don't store your chat conversations,
                            use anonymized analytics to improve the site, and never sell your data. We're committed to your privacy and comply with GDPR regulations.
                        </p>
                    </section>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t py-12 bg-muted/50 mt-12">
                <div className="container mx-auto px-4 text-center space-y-4">
                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                        <Link href="/privacy" className="hover:text-foreground transition-colors font-medium">
                            Privacy Policy
                        </Link>
                        <Link href="/#about" className="hover:text-foreground transition-colors">
                            About
                        </Link>
                        <Link href="/universities" className="hover:text-foreground transition-colors">
                            Universities
                        </Link>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        &copy; {new Date().getFullYear()} uni-uk.ai. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
