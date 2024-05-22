async function initializeLandingPageRedirection() {
    try {
        const config = await fetchConfig();

        document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => applyClasses(config)) : applyClasses(config);
        setupClickHandler(config);
    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

async function fetchConfig() {
    const response = await fetch('https://growthatkyte.github.io/web/scripts/landing-pages-list.json');
    if (!response.ok) throw new Error('Failed to fetch landing pages configuration');
    return response.json();
}

function applyClasses(config) {
    const path = normalizePath(window.location.pathname);
    document.querySelectorAll('input[type="submit"], button[type="submit"]').forEach(button => {
        if (!button.classList.contains('mauticform-button') && !button.classList.contains('direct-button') && config[path]) {
            button.classList.add(config[path].redirectClass);
            console.log(`Applied '${config[path].redirectClass}' to buttons for path: ${path}`);
        }
    });
}

function setupClickHandler(config) {
    document.addEventListener('click', event => {
        const target = event.target.closest('input[type="submit"], button[type="submit"]');
        if (target && !target.classList.contains('mauticform-button') && !target.classList.contains('direct-button')) {
            event.preventDefault();
            handleRedirection(config, getUTMParams(), target);
        }
    });
}

function handleRedirection(config, utmParams, target) {
    const path = normalizePath(window.location.pathname);
    const pageConfig = config[path] || {};
    const redirectClass = target.classList.contains('cpp-redir') ? 'cpp-redir' :
        target.classList.contains('catalog-redir') ? 'catalog-redir' :
            target.classList.contains('control-redir') ? 'control-redir' :
                'default';

    const redirectUrl = !isMobileDevice() ? handleDesktopRedirection(utmParams) :
        redirectClass === 'cpp-redir' ? handleCPPRedirection(pageConfig, utmParams) :
            createStaticLink(redirectClass, utmParams);

    window.location.href = redirectUrl;
}

function handleDesktopRedirection(utmParams) {
    const baseLink = 'https://web.auth.kyteapp.com/signup';
    const encodedQueryParams = new URLSearchParams(utmParams).toString();
    return `${baseLink}?${encodedQueryParams}`;
}

function createStaticLink(redirectClass, utmParams) {
    const baseLinks = {
        'default': 'https://pos.auth.kyteapp.com',
        'catalog-redir': 'https://catalog.auth.kyteapp.com',
        'control-redir': 'https://control.auth.kyteapp.com'
    };

    const baseLink = baseLinks[redirectClass] || baseLinks['default'];
    const encodedQueryParams = new URLSearchParams(utmParams).toString();
    return `${baseLink}?${encodedQueryParams}`;
}

function handleCPPRedirection(pageConfig, utmParams) {
    const encodedUTMParams = new URLSearchParams(utmParams).toString();
    return isIOSDevice() ? `${pageConfig.ios}?${encodedUTMParams}` : `${pageConfig.android}?${encodedUTMParams}`;
}

function normalizePath(path) {
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

function getUTMParams() {
    const params = new URLSearchParams(location.search);
    const utmParams = {};
    const path = normalizePath(window.location.pathname.substring(1));
    let referrerHostnameParts = [];

    try {
        const referrer = new URL(document.referrer);
        referrerHostnameParts = referrer.hostname.split('.').filter(part => part !== 'www');
    } catch (error) {
        console.warn('Invalid or empty referrer:', error);
    }

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'].forEach(param => {
        if (param === 'utm_source') {
            utmParams[param] = params.get(param) || referrerHostnameParts[0] || '';
        } else if (param === 'utm_campaign') {
            utmParams[param] = params.get(param) || (path ? path : 'home');
        } else {
            utmParams[param] = params.get(param) || '';
        }
    });
    return utmParams;
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