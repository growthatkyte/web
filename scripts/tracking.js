async function initializeLandingPageRedirection() {
    try {
        const config = await fetchConfig();
        document.addEventListener('DOMContentLoaded', () => applyClassesAndSetupRedirection(config));
    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

async function fetchConfig() {
    const response = await fetch('https://growthatkyte.github.io/web/scripts/landing-pages-list.json');
    if (!response.ok) throw new Error('Failed to fetch landing pages configuration');
    return response.json();
}

function applyClassesAndSetupRedirection(config) {
    applyClasses(config);
    setupClickHandler(config);
}

function applyClasses(config) {
    const path = normalizePath(window.location.pathname);
    document.querySelectorAll('input[type="submit"], button[type="submit"]').forEach(button => {
        if (config[path]) {
            button.classList.add(config[path].redirectClass);
        }
    });
}

function setupClickHandler(config) {
    document.addEventListener('click', event => {
        const target = event.target.closest('input[type="submit"], button[type="submit"]');
        if (target) {
            event.preventDefault();
            handleRedirection(config, getUTMParams(), target);
        }
    });
}

function handleRedirection(config, utmParams, target) {
    const path = normalizePath(window.location.pathname);
    const pageConfig = config[path] || config['default'];
    const redirectUrl = isMobileDevice() ?
        (isIOSDevice() ? pageConfig.ios : pageConfig.android) :
        createDynamicLink(pageConfig, utmParams);
    window.location.href = redirectUrl;
}

function createDynamicLink(pageConfig, utmParams) {
    const baseLink = "https://web.auth.kyteapp.com/signup";
    const encodedParams = new URLSearchParams(utmParams).toString();
    const link = `${baseLink}?${encodeURIComponent(encodedParams)}`;
    const dynamicParams = new URLSearchParams({
        link,
        apn: pageConfig.apn,
        ibi: pageConfig.ibi,
        isi: pageConfig.isi,
        ct: pageConfig.utm_campaign,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        gclid: utmParams.gclid
    });
    return `https://kyteapp.page.link/?${dynamicParams.toString()}`;
}

function getUTMParams() {
    const params = new URLSearchParams(location.search);
    const utmParams = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'gclid'].forEach(param => {
        utmParams[param] = params.get(param) || '';
    });
    return utmParams;
}

function normalizePath(path) {
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

initializeLandingPageRedirection();
