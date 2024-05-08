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
    const redirectClass = pageConfig.redirectClass || 'default';
    const redirectUrl = createDynamicLink(redirectClass, utmParams);

    window.location.href = redirectUrl;
}

function paramsToObject(entries) {
    const result = {}
    for (const [key, value] of entries) {
        result[key] = value;
    }
    return result;
}

function createDynamicLink(redirectClass, utmParams) {
    const { apn, ibi, isi } = appConfig[redirectClass];

    const baseLink = `https://web.auth.kyteapp.com?${new URLSearchParams(utmParams)}`;

    const encodedLink = encodeURIComponent(baseLink);

    const dynamicParams = new URLSearchParams({
        link: encodedLink,
        apn: apn,
        ibi: ibi,
        isi: isi,
        ct: `${redirectClass}_${utmParams.utm_campaign}`
    });

    Object.entries(utmParams).forEach(([key, value]) => {
        if (value) {
            dynamicParams.set(key, value);
        }
    });

    return `https://kyteapp.page.link/?${dynamicParams.toString()}`;
}

function getUTMParams() {
    const params = new URLSearchParams(location.search);
    const storageParams = new URLSearchParams(localStorage.getItem('utmParams'));
    const utmParams = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'].forEach(param => {
        utmParams[param] = params.get(param) || storageParams.get(param) || '';
    });
    return utmParams;
}

function normalizePath(path) {
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

const appConfig = {
    'catalog-redir': { apn: 'com.kyte.catalog', ibi: 'com.kytecatalog', isi: '6462521196' },
    'control-redir': { apn: 'com.kytecontrol', ibi: 'com.kytecontrol', isi: '6472947922' },
    'default': { apn: 'com.kyte', ibi: 'com.kytepos', isi: '1345983058', redirectClass: 'default' }
};

initializeLandingPageRedirection();