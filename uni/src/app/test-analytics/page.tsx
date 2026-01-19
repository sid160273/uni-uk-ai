"use client";

import { useEffect } from "react";
import { trackAdClick, trackAdImpression } from "@/lib/analytics";

export default function TestAnalyticsPage() {
  useEffect(() => {
    // Send a test event on page load
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag('event', 'test_page_view', {
        event_category: 'testing',
        event_label: 'analytics_test',
        value: 1,
      });
      console.log("✅ Test event sent: test_page_view");
    } else {
      console.error("❌ gtag not available");
    }
  }, []);

  const handleTestAdClick = () => {
    console.log("🖱️ Testing ad click event...");
    trackAdClick("test-slot-123", "test");
    alert("Ad click event sent! Check console and GA4 real-time reports.");
  };

  const handleTestImpression = () => {
    console.log("👁️ Testing ad impression event...");
    trackAdImpression("test-slot-456", "test");
    alert("Ad impression event sent! Check console and GA4 real-time reports.");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analytics Testing Page</h1>

        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Events</h2>
          <div className="space-y-4">
            <button
              onClick={handleTestAdClick}
              className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              🖱️ Test Ad Click Event
            </button>

            <button
              onClick={handleTestImpression}
              className="w-full bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
            >
              👁️ Test Ad Impression Event
            </button>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Open your browser's Developer Console (F12)</li>
            <li>Click the buttons above to send test events</li>
            <li>Check the console for confirmation messages</li>
            <li>Go to Google Analytics → Reports → Realtime</li>
            <li>You should see events appear in real-time</li>
          </ol>
        </div>

        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm">
            <strong>Note:</strong> Events may take a few seconds to appear in GA4.
            Make sure you're logged into Google Analytics at{" "}
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              analytics.google.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
