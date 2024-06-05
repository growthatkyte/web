async function initializeLandingPageRedirection() {
    try {
        const config = await fetchConfig();
        document.readyState === 'loading' ?
            document.addEventListener('DOMContentLoaded', () => initialize(config)) :
            initialize(config);
    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

async function fetchConfig() {
    const response = await fetch('https://growthatkyte.github.io/web/scripts/landing-pages-list.json');
    if (!response.ok) throw new Error('Failed to fetch landing pages configuration');
    return response.json();
}

function initialize(config) {
    applyButtonClasses(config);
    appendUTMParamsToLinks();
    setupClickHandler(config);
}

function applyButtonClasses(config) {
    const path = normalizePath(window.location.pathname);
    const buttons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
    buttons.forEach(button => {
        if (shouldApplyClass(button, config, path)) {
            button.classList.add(config[path].redirectClass);
            console.log(`Applied '${config[path].redirectClass}' to buttons for path: ${path}`);
        }
    });
}

function shouldApplyClass(button, config, path) {
    return !button.classList.contains('mauticform-button') &&
        !button.classList.contains('direct-button') &&
        config[path];
}

function setupClickHandler(config) {
    document.addEventListener('click', event => {
        const target = event.target.closest('input[type="submit"], button[type="submit"]');
        if (shouldHandleRedirection(target)) {
            event.preventDefault();
            handleRedirection(config, getUTMParams(), target);
        }
    });
}

function shouldHandleRedirection(target) {
    return target &&
        !target.classList.contains('mauticform-button') &&
        !target.classList.contains('direct-button');
}

function handleRedirection(config, utmParams, target) {
    const path = normalizePath(window.location.pathname);
    const pageConfig = config[path] || {};
    const redirectClass = getRedirectClass(target);

    const redirectUrl = !isMobileDevice() ?
        createRedirectUrl('https://web.auth.kyteapp.com/signup', utmParams) :
        handleMobileRedirection(redirectClass, pageConfig, utmParams);

    window.location.href = redirectUrl;
}

function getRedirectClass(target) {
    if (target.classList.contains('cpp-redir')) return 'cpp-redir';
    if (target.classList.contains('catalog-redir')) return 'catalog-redir';
    if (target.classList.contains('control-redir')) return 'control-redir';
    return 'default';
}

function handleMobileRedirection(redirectClass, pageConfig, utmParams) {
    if (redirectClass === 'cpp-redir') return handleCPPRedirection(pageConfig, utmParams);
    return createStaticLink(redirectClass, utmParams);
}

function handleCPPRedirection(pageConfig, utmParams) {
    const queryParams = new URLSearchParams(utmParams).toString();
    return isIOSDevice() ? `${pageConfig.ios}?${queryParams}` : `${pageConfig.android}?${queryParams}`;
}

function createStaticLink(redirectClass, utmParams) {
    const baseLinks = {
        'default': 'https://pos.auth.kyteapp.com',
        'catalog-redir': 'https://catalog.auth.kyteapp.com',
        'control-redir': 'https://control.auth.kyteapp.com'
    };

    const baseLink = baseLinks[redirectClass] || baseLinks['default'];
    const queryParams = new URLSearchParams(utmParams).toString();
    return `${baseLink}?${queryParams}`;
}

function createRedirectUrl(baseLink, utmParams) {
    const queryParams = new URLSearchParams(utmParams).toString();
    return `${baseLink}?${queryParams}`;
}

function normalizePath(path) {
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

function getUTMParams() {
    const params = new URLSearchParams(location.search);
    const utmParams = {};
    const path = normalizePath(window.location.pathname.substring(1));
    const referrerHostnameParts = getReferrerHostnameParts();

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'].forEach(param => {
        utmParams[param] = getUTMParamValue(params, param, referrerHostnameParts, path);
    });
    return utmParams;
}

function getReferrerHostnameParts() {
    try {
        const referrer = new URL(document.referrer);
        return referrer.hostname.split('.').filter(part => part !== 'www');
    } catch (error) {
        console.warn('Invalid or empty referrer:', error);
        return [];
    }
}

function getUTMParamValue(params, param, referrerHostnameParts, path) {
    if (param === 'utm_source') {
        return params.get(param) || referrerHostnameParts[0] || '';
    } else if (param === 'utm_campaign') {
        return params.get(param) || (path ? path : 'home');
    } else {
        return params.get(param) || '';
    }
}

function appendUTMParamsToLinks() {
    const utmParams = getUTMParams();

    document.querySelectorAll('a').forEach(link => {
        const url = new URL(link.href);
        const currentParams = new URLSearchParams(url.search);

        // Merge existing parameters with new UTM parameters
        Object.entries(utmParams).forEach(([key, value]) => {
            currentParams.set(key, value);
        });

        url.search = currentParams.toString();
        link.href = url.toString();
    });
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isIOSDevice() {
    if (navigator.userAgentData) {
        return navigator.userAgentData.platform === 'iOS';
    }
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

initializeLandingPageRedirection();