async function initializeLandingPageRedirection() {
    try {
        const configUrl = 'https://growthatkyte.github.io/web/scripts/landing-pages-list.json';
        const response = await fetch(configUrl);
        if (!response.ok) throw new Error('Failed to fetch landing pages configuration');
        const config = await response.json();

        document.addEventListener('DOMContentLoaded', () => {
            applyClasses(config);
            loadScript('https://cdn.kyteapp.com/$web/kyte-analytics-short-unique-id.js', () => console.log('Analytics initialized'));
        });

        document.addEventListener('click', (event) => {
            const target = event.target.closest('input[type="submit"], button[type="submit"]');
            if (target && target.classList.contains('catalog-redir') || target.classList.contains('cpp-redir') || target.classList.contains('control-redir')) {
                event.preventDefault();
                handleRedirection(target, config);
            }
        });
    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

function applyClasses(config) {
    const path = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;
    const buttons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
    Object.keys(config).forEach(key => {
        const normalizedKey = key.endsWith('/') ? key : `${key}/`;
        if (normalizedKey === path) {
            const redirectClass = config[key].redirectClass;
            buttons.forEach(button => button.classList.add(redirectClass));
        }
    });
}

function handleRedirection(target, config) {
    const path = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;
    const pageConfig = config[path];
    if (!pageConfig) {
        console.error('Configuration missing for this page');
        return;
    }

    const utmParams = getUTMParams();
    redirectUser(pageConfig, utmParams, target.classList.contains('cpp-redir'));
}

function getUTMParams() {
    const params = new URLSearchParams(location.search);
    const utmParams = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(param => {
        utmParams[param] = params.get(param) || '';
    });
    return utmParams;
}

function redirectUser(config, utmParams, isCPPRedir) {
    const dynamicLink = isCPPRedir ? handleCPPRedirection(config, isMobileDevice()) : createDynamicLink(config.redirectClass, utmParams);
    window.location.href = dynamicLink;
}

function createDynamicLink(redirectClass, utmParams) {
    const base = 'https://kyteapp.page.link/';
    const loginPageURL = "https://web.kyteapp.com/login";
    const queryParams = new URLSearchParams(utmParams).toString();
    const link = `${loginPageURL}?${queryParams}`;
    // Ensure utmParams are properly included in the dynamic link
    const dynamicParams = `link=${encodeURIComponent(link)}&apn=${redirectClass}&ibi=${redirectClass}&isi=123456789&ct=${redirectClass}_${utmParams.utm_campaign}`;
    return `${base}?${dynamicParams}`;
}

function handleCPPRedirection(config, isMobile) {
    if (!isMobile) {
        const queryParams = new URLSearchParams(getUTMParams()).toString();
        return `https://web.kyteapp.com/login?${queryParams}`;
    }
    return isIOSDevice() ? config.ios : config.android;
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

initializeLandingPageRedirection();
