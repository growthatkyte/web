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
    fillAttributionFields();
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
            handleRedirection(config, getAttributionParams(), target);
        }
    });
}

function shouldHandleRedirection(target) {
    return target &&
        !target.classList.contains('mauticform-button') &&
        !target.classList.contains('direct-button');
}

function handleRedirection(config, attributionParams, target) {
    const path = normalizePath(window.location.pathname);
    const pageConfig = config[path] || {};
    const redirectClass = getRedirectClass(target);

    const redirectUrl = !isMobileDevice() ?
        createRedirectUrl('https://web.auth.kyteapp.com/signup', attributionParams) :
        handleMobileRedirection(redirectClass, pageConfig, attributionParams);

    window.location.href = redirectUrl;
}

function getRedirectClass(target) {
    if (target.classList.contains('cpp-redir')) return 'cpp-redir';
    if (target.classList.contains('catalog-redir')) return 'catalog-redir';
    if (target.classList.contains('control-redir')) return 'control-redir';
    return 'default';
}

function handleMobileRedirection(redirectClass, pageConfig, attributionParams) {
    if (redirectClass === 'cpp-redir') return handleCPPRedirection(pageConfig, attributionParams);
    return createStaticLink(redirectClass, attributionParams);
}

function handleCPPRedirection(pageConfig, attributionParams) {
    const queryParams = new URLSearchParams(attributionParams).toString();
    if (isIOSDevice()) {
        return pageConfig.ios ? `${pageConfig.ios}&${queryParams}` : createRedirectUrl('https://web.auth.kyteapp.com/signup', attributionParams);
    } else if (isAndroidDevice()) {
        return pageConfig.android ? `${pageConfig.android}&${queryParams}` : createRedirectUrl('https://web.auth.kyteapp.com/signup', attributionParams);
    }
    return createRedirectUrl('https://web.auth.kyteapp.com/signup', attributionParams);
}

function createStaticLink(redirectClass, attributionParams) {
    const baseLinks = {
        'default': 'https://pos.auth.kyteapp.com',
        'catalog-redir': 'https://catalog.auth.kyteapp.com',
        'control-redir': 'https://control.auth.kyteapp.com'
    };

    const baseLink = baseLinks[redirectClass] || baseLinks['default'];
    const queryParams = mergeQueryParams(new URLSearchParams(new URL(baseLink).search), attributionParams).toString();
    return `${baseLink}?${queryParams}`;
}

function createRedirectUrl(baseLink, attributionParams) {
    const queryParams = mergeQueryParams(new URLSearchParams(new URL(baseLink).search), attributionParams).toString();
    return `${baseLink}?${queryParams}`;
}

function normalizePath(path) {
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

function getAttributionParams() {
    const params = new URLSearchParams(location.search);
    const localStorageParams = getParamsFromLocalStorage();
    const attributionParams = {};

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid', 'cid', 'aid', 'ref', 'referrer', 'campaignid', 'adgroupid', 'keyword', 'gadid', 'fbadid', 'ttadid'].forEach(param => {
        if (params.has(param)) {
            attributionParams[param] = params.get(param);
        } else if (localStorageParams[param]) {
            attributionParams[param] = localStorageParams[param];
        }
    });

    return attributionParams;
}

function getParamsFromLocalStorage() {
    const params = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid', 'cid', 'aid', 'ref', 'referrer', 'campaignid', 'adgroupid', 'keyword', 'gadid', 'fbadid', 'ttadid'].forEach(param => {
        const value = localStorage.getItem(param);
        if (value) {
            params[param] = value;
        }
    });
    return params;
}

function appendUTMParamsToLinks() {
    const attributionParams = getAttributionParams();

    document.querySelectorAll('a').forEach(link => {
        const url = new URL(link.href);
        const currentParams = mergeQueryParams(new URLSearchParams(url.search), attributionParams);

        url.search = currentParams.toString();
        link.href = url.toString();
    });
}

function mergeQueryParams(existingParams, newParams) {
    const mergedParams = new URLSearchParams(existingParams);

    Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
            mergedParams.set(key, value);
        }
    });

    return mergedParams;
}

function fillAttributionFields() {
    const attributionParams = getAttributionParams();
    Object.keys(attributionParams).forEach(param => {
        const field = document.querySelector(`input[name="${param}"]`);
        if (field) {
            field.value = attributionParams[param];
        }
    });
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