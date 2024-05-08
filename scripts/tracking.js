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
        if (config[path]) {
            button.classList.add(config[path].redirectClass);
            console.log(`Applied '${config[path].redirectClass}' to buttons for path: ${path}`);
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
    const pageConfig = config[path] || appConfig['default'];
    const redirectClass = target.classList.contains('cpp-redir') ? 'cpp-redir' :
        target.classList.contains('catalog-redir') ? 'catalog-redir' :
            target.classList.contains('control-redir') ? 'control-redir' :
                'default';

    const redirectUrl = redirectClass === 'cpp-redir' ? handleCPPRedirection(pageConfig, utmParams) :
        createDynamicLink(redirectClass, utmParams);

    window.location.href = redirectUrl;
}

function createDynamicLink(redirectClass, utmParams) {
    const { apn, ibi, isi } = appConfig[redirectClass];
    const baseLink = "https://web.auth.kyteapp.com/signup";
    const encodedQueryParams = new URLSearchParams(utmParams).toString();

    const link = `${baseLink}?${encodeURIComponent(encodedQueryParams)}`;
    const dynamicParams = new URLSearchParams({
        link: link,
        apn: apn,
        ibi: ibi,
        isi: isi,
        ct: `${redirectClass}_${utmParams.utm_campaign}`
    });

    if (utmParams.utm_source) dynamicParams.append('utm_source', utmParams.utm_source);
    if (utmParams.utm_medium) dynamicParams.append('utm_medium', utmParams.utm_medium);
    if (utmParams.utm_campaign) dynamicParams.append('utm_campaign', utmParams.utm_campaign);
    if (utmParams.gclid) dynamicParams.append('gclid', utmParams.gclid);

    return `https://kyteapp.page.link/?${dynamicParams.toString()}`;
}



function handleCPPRedirection(pageConfig, utmParams) {
    if (!isMobileDevice()) {
        return `https://web.auth.kyteapp.com?${new URLSearchParams(utmParams).toString()}`;
    }
    return isIOSDevice() ? pageConfig.ios : pageConfig.android;
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