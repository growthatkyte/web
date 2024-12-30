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
    setupFormHandler(config);
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
        !button.classList.contains('auth-submit') &&
        config[path];
}

function setupFormHandler(config) {
    const leadForm = document.getElementById('LeadForm');

    if (leadForm) {
        leadForm.addEventListener('submit', event => {
            event.preventDefault();
            const utmParams = getUTMParams();
            handleRedirection(config, utmParams);
        });
    }
}

function handleRedirection(config, utmParams) {
    const path = normalizePath(window.location.pathname);
    const pageConfig = config[path] || {};
    const redirectClass = pageConfig.redirectClass || 'default';

    const redirectUrl = !isMobileDevice() ?
        createRedirectUrl('https://web.auth.kyteapp.com/signup', utmParams) :
        handleMobileRedirection(redirectClass, pageConfig, utmParams);

    window.location.href = redirectUrl;
}

function handleMobileRedirection(redirectClass, pageConfig, utmParams) {
    if (redirectClass === 'cpp-redir') return handleCPPRedirection(pageConfig, utmParams);
    return createStaticLink(redirectClass, utmParams);
}

function handleCPPRedirection(pageConfig, utmParams) {
    if (isIOSDevice() && pageConfig.ios) {
        return appendUTMParams(pageConfig.ios, utmParams);
    } else if (isAndroidDevice() && pageConfig.android) {
        return appendUTMParams(pageConfig.android, utmParams);
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
    return appendUTMParams(baseLink, utmParams);
}

function createRedirectUrl(baseLink, utmParams) {
    return appendUTMParams(baseLink, utmParams);
}

function appendUTMParams(url, utmParams) {
    const urlObj = new URL(url);
    Object.entries(utmParams).forEach(([key, value]) => {
        if (value) {
            urlObj.searchParams.set(key, value);
        }
    });
    return urlObj.toString();
}

function normalizePath(path) {
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

function getUTMParams() {
    const params = new URLSearchParams(location.search);
    const storedParams = getStoredParams();
    const formValues = getFormValues();
    const utmParams = {};

    const paramNames = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid', 'campaignid', 'adgroupid', 'exp_email_only_signup'];

    paramNames.forEach(param => {
        utmParams[param] = params.get(param) || storedParams[param] || formValues[param] || '';
    });

    // Fallback for utm_campaign
    if (!utmParams.utm_campaign) {
        utmParams.utm_campaign = normalizePath(window.location.pathname).slice(1) || 'homepage';
    }

    // Store the params
    storeParams(utmParams);

    return utmParams;
}

function getStoredParams() {
    const storedParams = {};
    ['localStorage', 'sessionStorage'].forEach(storageType => {
        const storage = window[storageType];
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid', 'campaignid', 'adgroupid'].forEach(param => {
            const value = storage.getItem(param);
            if (value) storedParams[param] = value;
        });
    });
    return storedParams;
}

function storeParams(params) {
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            localStorage.setItem(key, value);
            sessionStorage.setItem(key, value);
        }
    });
}

function getFormValues() {
    const form = document.forms['LeadForm'];
    if (!form) return {};

    const formParams = {};
    Array.from(form.elements).forEach(element => {
        if (element.name && element.value) {
            formParams[element.name] = element.value;
        }
    });
    return formParams;
}

function appendUTMParamsToLinks() {
    const utmParams = getUTMParams();

    document.querySelectorAll('a').forEach(link => {
        try {
            if (link.href && link.href.startsWith('http')) {
                link.href = appendUTMParams(link.href, utmParams);
            }
        } catch (error) {
            console.warn('Error processing link:', link.href, error);
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
