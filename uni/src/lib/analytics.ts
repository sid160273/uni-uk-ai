// Google Analytics 4 Event Tracking

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track ad click as conversion
export const trackAdClick = (adSlot?: string, adUnit?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('📊 Tracking ad click:', { adSlot, adUnit });

    window.gtag('event', 'ad_click', {
      event_category: 'advertisement',
      event_label: adSlot || adUnit || 'unknown',
      value: 1,
      // Mark as conversion
      send_to: 'G-ZYE3BGM8BM',
    });

    // Also track as a conversion event
    window.gtag('event', 'conversion', {
      event_category: 'monetization',
      event_label: 'ad_click',
      value: 1,
    });

    console.log('✅ Ad click events sent to GA4');
  } else {
    console.warn('⚠️ gtag not available for tracking');
  }
};

// Track ad impression
export const trackAdImpression = (adSlot?: string, adUnit?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('👁️ Tracking ad impression:', { adSlot, adUnit });

    window.gtag('event', 'ad_impression', {
      event_category: 'advertisement',
      event_label: adSlot || adUnit || 'unknown',
      value: 0.1,
    });

    console.log('✅ Ad impression event sent to GA4');
  }
};

// Track AdSense ad loaded
export const trackAdSenseLoaded = (adSlot: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('📊 Tracking AdSense ad loaded:', adSlot);

    window.gtag('event', 'adsense_loaded', {
      event_category: 'advertisement',
      event_label: adSlot,
      value: 0.1,
    });

    console.log('✅ AdSense ad loaded event sent to GA4');
  }
};
