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
            if (event.target.closest('.catalog-redir, .cpp-redir, .control-redir')) {
                event.preventDefault();
                handleRedirection(event.target, config);
            }
        });
    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

function applyClasses(config) {
    const path = window.location.pathname;
    const buttons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
    const configEntry = config[path] || config[`${path}/`];
    if (configEntry) {
        buttons.forEach(button => button.classList.add(configEntry.redirectClass));
    }
}

function handleRedirection(target, config) {
    const path = window.location.pathname;
    const pageConfig = config[path] || config[`${path}/`];
    if (!pageConfig) return console.error('Configuration missing for this page');

    const utmParams = getUTMParams();
    const isCPPRedir = target.classList.contains('cpp-redir');
    redirectUser(pageConfig, utmParams, isCPPRedir);
}

function getUTMParams() {
    const params = new URLSearchParams(location.search);
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    return utmParams.reduce((acc, param) => {
        acc[param] = params.get(param) || '';
        return acc;
    }, {});
}

function redirectUser(config, utmParams, isCPPRedir) {
    if (isMobileDevice()) {
        if (isCPPRedir) {
            const url = isIOSDevice() ? config.ios : config.android;
            window.location.href = url;
        } else {
            const queryParams = new URLSearchParams(utmParams).toString();
            const dynamicLink = createDynamicLink(config.redirectClass, queryParams);
            window.location.href = dynamicLink;
        }
    } else {
        const queryParams = new URLSearchParams(utmParams).toString();
        const loginUrl = `https://web.kyteapp.com/login?${queryParams}`;
        window.location.href = loginUrl;
    }
}

function createDynamicLink(redirectClass, queryParams) {
    const base = 'https://kyteapp.page.link/';
    const link = `https://web.kyteapp.com/login?${queryParams}`;
    const apn = redirectClass === 'control-redir' ? 'com.kytecontrol' : redirectClass === 'catalog-redir' ? 'com.kyte.catalog' : 'com.kyte';
    const ibi = redirectClass === 'control-redir' ? 'com.kytecontrol' : redirectClass === 'catalog-redir' ? 'com.kytecatalog' : 'com.kytepos';
    const isi = redirectClass === 'control-redir' ? '6472947922' : redirectClass === 'catalog-redir' ? '6462521196' : '1345983058';
    const ct = `${redirectClass}_${utmParams.utm_campaign}`;
    return `${base}?link=${encodeURIComponent(link)}&apn=${apn}&ibi=${ibi}&isi=${isi}&utm_source=${utmParams.utm_source}&utm_medium=${utmParams.utm_medium}&utm_campaign=${utmParams.utm_campaign}&pt=120346822&ct=${ct}&mt=8`;
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
