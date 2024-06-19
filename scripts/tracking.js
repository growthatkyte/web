async function initializeLandingPageRedirection() {
    try {
        const config = await fetchConfig();
        $().ready(() => initialize(config));
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
    storeUTMParams();
    appendUTMParamsToLinks();
    setupClickHandler(config);
}

function applyButtonClasses(config) {
    const path = normalizePath(window.location.pathname);
    $('input[type="submit"], button[type="submit"]').each(function (button) {
        if (shouldApplyClass(button, config, path)) {
            $(button).addClass(config[path].redirectClass);
            console.log(`Applied '${config[path].redirectClass}' to buttons for path: ${path}`);
        }
    });
}

function shouldApplyClass(button, config, path) {
    return !$(button).hasClass('mauticform-button') &&
        !$(button).hasClass('direct-button') &&
        config[path];
}

function setupClickHandler(config) {
    $(document).on('click', event => {
        const target = event.target.closest('input[type="submit"], button[type="submit"]');
        if (shouldHandleRedirection(target)) {
            event.preventDefault();
            handleRedirection(config, getStoredUTMParams(), target);
        }
    });
}

function shouldHandleRedirection(target) {
    return target &&
        !$(target).hasClass('mauticform-button') &&
        !$(target).hasClass('direct-button');
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
    if ($(target).hasClass('cpp-redir')) return 'cpp-redir';
    if ($(target).hasClass('catalog-redir')) return 'catalog-redir';
    if ($(target).hasClass('control-redir')) return 'control-redir';
    return 'default';
}

function handleMobileRedirection(redirectClass, pageConfig, utmParams) {
    if (redirectClass === 'cpp-redir') return handleCPPRedirection(pageConfig, utmParams);
    return createStaticLink(redirectClass, utmParams);
}

function handleCPPRedirection(pageConfig, utmParams) {
    const queryParams = new URLSearchParams(utmParams).toString();
    if (isIOSDevice()) {
        return pageConfig.ios ? `${pageConfig.ios}&${queryParams}` : createRedirectUrl('https://web.auth.kyteapp.com/signup', utmParams);
    } else if (isAndroidDevice()) {
        return pageConfig.android ? `${pageConfig.android}&${queryParams}` : createRedirectUrl('https://web.auth.kyteapp.com/signup', utmParams);
    }
    return createRedirectUrl('https://web.auth.kyteapp.com/signup', utmParams);
}

function createStaticLink(redirectClass, utmParams) {
    const baseLinks = {
        'default': 'https://pos.auth.kyteapp.com',
        'catalog-redir': 'https://catalog.auth.kyteapp.com',
        'control-redir': 'https://control.auth.kyteapp.com'
    };

    const baseLink = baseLinks[redirectClass] || baseLinks['default'];
    const queryParams = mergeQueryParams(new URLSearchParams(new URL(baseLink).search), utmParams).toString();
    return `${baseLink}?${queryParams}`;
}

function createRedirectUrl(baseLink, utmParams) {
    const queryParams = mergeQueryParams(new URLSearchParams(new URL(baseLink).search), utmParams).toString();
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
        if (document.referrer) {
            const referrer = new URL(document.referrer);
            return referrer.hostname.split('.').filter(part => part !== 'www');
        } else {
            return [];
        }
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

function storeUTMParams() {
    const utmParams = getUTMParams();
    const storedUTMParams = getStoredUTMParams();

    Object.entries(utmParams).forEach(([key, value]) => {
        if (!storedUTMParams[key]) {
            storedUTMParams[key] = value;
        }
    });

    localStorage.setItem('utm_params', JSON.stringify(storedUTMParams));
}

function getStoredUTMParams() {
    return JSON.parse(localStorage.getItem('utm_params')) || {};
}

function appendUTMParamsToLinks() {
    const utmParams = getStoredUTMParams();

    $('a').each(function (link) {
        const url = new URL(link.href);
        const currentParams = mergeQueryParams(new URLSearchParams(url.search), utmParams);

        url.search = currentParams.toString();
        link.href = url.toString();
    });
}

function mergeQueryParams(existingParams, newParams) {
    const mergedParams = new URLSearchParams(existingParams);

    Object.entries(newParams).forEach(([key, value]) => {
        if (!mergedParams.has(key)) {
            mergedParams.set(key, value);
        }
    });

    return mergedParams;
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isAndroidDevice() {
    return /Android/.test(navigator.userAgent);
}

initializeLandingPageRedirection();