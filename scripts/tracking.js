async function initializeLandingPageRedirection() {
    try {
        const config = await fetchConfig();
        const utmParams = getUTMParams();

        if (utmParams['utm_campaign'].includes('slg')) {
            redirectToCheckout(utmParams);
            return;
        }

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

function redirectToCheckout(utmParams) {
    const checkoutUrl = "https://checkout.auth.kyteapp.com";
    window.location.href = `${checkoutUrl}?${new URLSearchParams(utmParams).toString()}`;
}

function applyClasses(config) {
    const path = normalizePath(window.location.pathname);
    document.querySelectorAll('input[type="submit"], button[type="submit"]').forEach(button => {
        if (config[path]) {
            button.classList.add(config[path].redirectClass);
            console.log(`Applied '${config[path].redirectClass}' to buttons for path: ${path}`);
        }
    });
}

function setupClickHandler(config) {
    document.addEventListener('click', event => {
        const target = event.target.closest('input[type="submit"], button[type="submit"]');
        if (target && config[normalizePath(window.location.pathname)]) {
            event.preventDefault();
            redirectUser(config, getUTMParams(), target);
        }
    });
}

function redirectUser(config, utmParams, target) {
    const redirectType = target.classList.contains('cpp-redir') ? handleCPPRedirection : createDynamicLink;
    window.location.href = redirectType(config[normalizePath(window.location.pathname)].redirectClass, utmParams);
}

function createDynamicLink(redirectClass, utmParams) {
    const { apn, ibi, isi } = appConfig[redirectClass] || appConfig['default'];
    const dynamicParams = new URLSearchParams({
        link: encodeURIComponent(`https://web.auth.kyteapp.com?${new URLSearchParams(utmParams).toString()}`),
        apn, ibi, isi, ct: `${redirectClass}_${utmParams.utm_campaign}`
    });
    return `https://kyteapp.page.link/?${dynamicParams}`;
}

function handleCPPRedirection(redirectClass, utmParams) {
    if (!isMobileDevice()) {
        return `https://web.auth.kyteapp.com?${new URLSearchParams(utmParams).toString()}`;
    }
    return isIOSDevice() ? appConfig[redirectClass].ios : appConfig[redirectClass].android;
}

function normalizePath(path) {
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

function getUTMParams() {
    const params = new URLSearchParams(location.search);
    const utmParams = {};
    const path = normalizePath(window.location.pathname.substring(1));
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(param => {
        utmParams[param] = params.get(param) || (param === 'utm_campaign' ? path : '');
    });
    return utmParams;
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}


const appConfig = {
    'catalog-redir': { apn: 'com.kyte.catalog', ibi: 'com.kytecatalog', isi: '6462521196' },
    'control-redir': { apn: 'com.kytecontrol', ibi: 'com.kytecontrol', isi: '6472947922' },
    'default': { apn: 'com.kyte', ibi: 'com.kytepos', isi: '1345983058' }
};

initializeLandingPageRedirection();
