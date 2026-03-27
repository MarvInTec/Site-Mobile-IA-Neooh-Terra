/**
 * Google Analytics Utilities
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Tracks a page view
 * @param path The path of the page
 */
export const trackPageView = (path: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
};

/**
 * Tracks a custom event
 * @param action The action performed
 * @param category The category of the event
 * @param label The label of the event
 * @param value The value of the event
 */
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

/**
 * Tracks a section view
 * @param sectionName The name of the section viewed
 */
export const trackSectionView = (sectionName: string) => {
  trackEvent('section_view', 'engagement', sectionName);
};
