async function initializeLandingPageRedirection() {
    try {
        const configUrl = 'https://growthatkyte.github.io/web/scripts/landing-pages-list.json';
        const response = await fetch(configUrl);
        if (!response.ok) throw new Error('Failed to fetch landing pages configuration');
        const config = await response.json();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => applyClasses(config));
        } else {
            applyClasses(config);
        }

        document.addEventListener('click', (event) => {
            const target = event.target.closest('input[type="submit"], button[type="submit"]');
            if (target && (target.classList.contains('catalog-redir') || target.classList.contains('cpp-redir') || target.classList.contains('control-redir'))) {
                event.preventDefault();
                handleRedirection(target, config);
            }
        });
    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

function normalizePath(path) {
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

function applyClasses(config) {
    const path = normalizePath(window.location.pathname);
    const buttons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
    Object.keys(config).forEach(key => {
        if (normalizePath(key) === path) {
            const redirectClass = config[key].redirectClass;
            buttons.forEach(button => button.classList.add(redirectClass));
            console.log(`Applied '${redirectClass}' to buttons for path: ${path}`);
        }
    });
}

function handleRedirection(target, config) {
    const path = normalizePath(window.location.pathname);
    const pageConfig = config[normalizePath(path)];

    console.log(`Current path: ${path}`);
    console.log(`Configuration found:`, pageConfig);

    if (!pageConfig) {
        console.error('Configuration missing for this page:', path);
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

const appConfig = {
    'catalog-redir': { apn: 'com.kyte.catalog', ibi: 'com.kytecontrol', isi: '6472947922' },
    'control-redir': { apn: 'com.kytecontrol', ibi: 'com.kytecatalog', isi: '6462521196' },
    'default': { apn: 'com.kyte', ibi: 'com.kytepos', isi: '1345983058' }
};

function createDynamicLink(redirectClass, utmParams) {
    const base = 'https://kyteapp.page.link/';
    const loginPageURL = "https://web.kyteapp.com/login";
    const queryParams = new URLSearchParams(utmParams).toString();
    const link = `${loginPageURL}?${queryParams}`;
    const { apn, ibi, isi } = appConfig[redirectClass] || appConfig['default'];
    const dynamicParams = `link=${encodeURIComponent(link)}&apn=${apn}&ibi=${ibi}&isi=${isi}&ct=${redirectClass}_${utmParams.utm_campaign}`;
    return `${base}?${dynamicParams}`;
}

function handleCPPRedirection(config, isMobile) {
    if (config.redirectClass === 'cpp-redir') {
        if (!isMobile) {
            const queryParams = new URLSearchParams(getUTMParams()).toString();
            return `https://web.kyteapp.com/login?${queryParams}`;
        }
        return isIOSDevice() ? config.ios : config.android;
    } else {
        return createDynamicLink(config.redirectClass, getUTMParams());
    }
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