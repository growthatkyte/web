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
            event.preventDefault(); // Prevent form submission

            const utmParams = getUTMParams(); // Get UTM and form params
            handleRedirection(config, utmParams); // Redirect
        });
    }
}

function handleRedirection(config, utmParams) {
    const path = normalizePath(window.location.pathname);
    const pageConfig = config[path] || {};
    const redirectClass = 'default';

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
    const formValues = getFormValues();

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid', 'campaignid', 'adgroupid', 'exp_email_only_signup'].forEach(param => {
        if (params.has(param)) {
            utmParams[param] = params.get(param);
        } else if (formValues[param]) {
            utmParams[param] = formValues[param];
        }
    });

    return utmParams;
}

function getFormValues() {
    const formElements = document.forms['LeadForm'].elements;
    const formParams = {};

    Array.from(formElements).forEach(element => {
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
                const url = new URL(link.href);
                const currentParams = mergeQueryParams(new URLSearchParams(url.search), utmParams);

                url.search = currentParams.toString();
                link.href = url.toString();
            } else {
                console.warn('Invalid or unsupported link href:', link.href);
            }
        } catch (error) {
            console.warn('Error processing link:', link.href, error);
        }
    });
}

function mergeQueryParams(existingParams, newParams) {
    const mergedParams = new URLSearchParams(existingParams);

    Object.entries(newParams).forEach(([key, value]) => {
        if (value) { // Only add if the value is not empty
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