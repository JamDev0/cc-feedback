export function collectBrowserInfo() {
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
//# sourceMappingURL=browserInfo.js.map