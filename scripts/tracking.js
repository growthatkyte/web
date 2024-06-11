function landingPage() {
    return {
        config: null,

        async init() {
            try {
                this.config = await this.fetchConfig();
            } catch (error) {
                console.error('Initialization failed:', error);
            }
        },

        async fetchConfig() {
            const response = await fetch('https://growthatkyte.github.io/web/scripts/landing-pages-list.json');
            if (!response.ok) throw new Error('Failed to fetch landing pages configuration');
            return response.json();
        },

        applyButtonClasses() {
            const path = this.normalizePath(window.location.pathname);
            const buttons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
            buttons.forEach(button => {
                if (this.shouldApplyClass(button, path)) {
                    button.classList.add(this.config[path].redirectClass);
                    console.log(`Applied '${this.config[path].redirectClass}' to buttons for path: ${path}`);
                }
            });
        },

        shouldApplyClass(button, path) {
            return !button.classList.contains('mauticform-button') &&
                !button.classList.contains('direct-button') &&
                this.config[path];
        },

        handleRedirection(event) {
            const target = event.target.closest('input[type="submit"], button[type="submit"]');
            if (target && this.shouldHandleRedirection(target)) {
                event.preventDefault();
                const utmParams = this.getUTMParams();
                const path = this.normalizePath(window.location.pathname);
                const pageConfig = this.config[path] || {};
                const redirectClass = this.getRedirectClass(target);
                const redirectUrl = !this.isMobileDevice() ?
                    this.createRedirectUrl('https://web.auth.kyteapp.com/signup', utmParams) :
                    this.handleMobileRedirection(redirectClass, pageConfig, utmParams);
                window.location.href = redirectUrl;
            }
        },

        shouldHandleRedirection(target) {
            return !target.classList.contains('mauticform-button') &&
                !target.classList.contains('direct-button');
        },

        getRedirectClass(target) {
            if (target.classList.contains('cpp-redir')) return 'cpp-redir';
            if (target.classList.contains('catalog-redir')) return 'catalog-redir';
            if (target.classList.contains('control-redir')) return 'control-redir';
            return 'default';
        },

        handleMobileRedirection(redirectClass, pageConfig, utmParams) {
            if (redirectClass === 'cpp-redir') return this.handleCPPRedirection(pageConfig, utmParams);
            return this.createStaticLink(redirectClass, utmParams);
        },

        handleCPPRedirection(pageConfig, utmParams) {
            const queryParams = new URLSearchParams(utmParams).toString();
            if (this.isIOSDevice()) {
                return pageConfig.ios ? `${pageConfig.ios}&${queryParams}` : this.createRedirectUrl('https://web.auth.kyteapp.com/signup', utmParams);
            } else if (this.isAndroidDevice()) {
                return pageConfig.android ? `${pageConfig.android}&${queryParams}` : this.createRedirectUrl('https://web.auth.kyteapp.com/signup', utmParams);
            }
            return this.createRedirectUrl('https://web.auth.kyteapp.com/signup', utmParams);
        },

        createStaticLink(redirectClass, utmParams) {
            const baseLinks = {
                'default': 'https://pos.auth.kyteapp.com',
                'catalog-redir': 'https://catalog.auth.kyteapp.com',
                'control-redir': 'https://control.auth.kyteapp.com'
            };

            const baseLink = baseLinks[redirectClass] || baseLinks['default'];
            const queryParams = this.mergeQueryParams(new URLSearchParams(new URL(baseLink).search), utmParams).toString();
            return `${baseLink}?${queryParams}`;
        },

        createRedirectUrl(baseLink, utmParams) {
            const queryParams = this.mergeQueryParams(new URLSearchParams(new URL(baseLink).search), utmParams).toString();
            return `${baseLink}?${queryParams}`;
        },

        normalizePath(path) {
            return path.endsWith('/') ? path.slice(0, -1) : path;
        },

        getUTMParams() {
            const params = new URLSearchParams(location.search);
            const utmParams = {};
            const path = this.normalizePath(window.location.pathname.substring(1));
            const referrerHostnameParts = this.getReferrerHostnameParts();

            ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'].forEach(param => {
                utmParams[param] = this.getUTMParamValue(params, param, referrerHostnameParts, path);
            });
            return utmParams;
        },

        getReferrerHostnameParts() {
            try {
                const referrer = new URL(document.referrer);
                return referrer.hostname.split('.').filter(part => part !== 'www');
            } catch (error) {
                console.warn('Invalid or empty referrer:', error);
                return [];
            }
        },

        getUTMParamValue(params, param, referrerHostnameParts, path) {
            if (param === 'utm_source') {
                return params.get(param) || referrerHostnameParts[0] || '';
            } else if (param === 'utm_campaign') {
                return params.get(param) || (path ? path : 'home');
            } else {
                return params.get(param) || '';
            }
        },

        mergeQueryParams(existingParams, newParams) {
            const mergedParams = new URLSearchParams(existingParams);

            Object.entries(newParams).forEach(([key, value]) => {
                if (!mergedParams.has(key)) {
                    mergedParams.set(key, value);
                }
            });

            return mergedParams;
        },

        isMobileDevice() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        isIOSDevice() {
            return /iPad|iPhone|iPod/.test(navigator.userAgent);
        },

        isAndroidDevice() {
            return /Android/.test(navigator.userAgent);
        }
    }
}

document.addEventListener('alpine:init', () => {
    Alpine.data('landingPage', landingPage);
});