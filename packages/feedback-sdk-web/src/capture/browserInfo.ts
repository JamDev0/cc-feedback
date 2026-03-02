import type { BrowserInfo } from "@cc-feedback/sdk-core";

export function collectBrowserInfo(): BrowserInfo {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
