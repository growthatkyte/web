async function fetchConfigAndInit() {
    try {
        const landingPagesConfigUrl = 'https://growthatkyte.github.io/web/scripts/landing-pages-list.json';
        const response = await fetch(landingPagesConfigUrl);
        if (!response.ok) throw new Error('Failed to load landing pages configuration');
        const landingPagesConfig = await response.json();
        document.addEventListener('DOMContentLoaded', () => {
            applyRedirectClasses(landingPagesConfig);
            loadScript('https://cdn.kyteapp.com/$web/kyte-analytics-short-unique-id.js', () => console.log('Tracking initialized'));
        });
        document.addEventListener('click', (event) => handleRedirection(event, landingPagesConfig));
    } catch (error) {
        console.error('Error initializing landing pages:', error);
    }
}

function loadScript(src, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = callback;
    script.src = src;
    document.head.appendChild(script);
}

function applyRedirectClasses(landingPagesConfig) {
    const currentPage = window.location.pathname;

    const submitButtons = document.querySelectorAll('input[type="submit"], button[type="submit"]');

    // Normalize current page path to ensure correct matching with JSON keys
    const normalizedCurrentPage = currentPage.endsWith('/') ? currentPage : `${currentPage}/`;

    const pageConfig = landingPagesConfig[currentPage] || landingPagesConfig[normalizedCurrentPage.slice(0, -1)];

    if (pageConfig && pageConfig.redirectClass) {
        submitButtons.forEach(button => {
            button.classList.add(pageConfig.redirectClass);
        });
    }
}

function handleRedirection(event, landingPagesConfig) {
    const target = event.target;
    if (target.matches('.catalog-redir, .control-redir, .cpp-redir')) {
        event.preventDefault();
        const currentPage = window.location.pathname;
        const pageConfig = landingPagesConfig[currentPage] || landingPagesConfig[currentPage.endsWith('/') ? currentPage.slice(0, -1) : currentPage + '/'];
        if (!pageConfig) return;

        let utmParams = extractAndStoreUTMParams();
        constructAndRedirect(pageConfig, utmParams, target.classList.contains('cpp-redir'));
    }
}

function extractAndStoreUTMParams() {
    let utmParams = {
        utm_source: document.referrer ? new URL(document.referrer).hostname : 'direct',
        utm_medium: 'web',
        utm_campaign: window.location.pathname.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '_'),
        utm_content: '',
        utm_term: ''
    };

    const queryParams = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        if (queryParams.has(param)) {
            utmParams[param] = queryParams.get(param);
        }
    });

    Object.keys(utmParams).forEach(key => localStorage.setItem(key, utmParams[key]));

    return utmParams;
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function constructAndRedirect(pageConfig, utmParams, isCPPRedir) {
    const loginPageURL = "https://web.kyteapp.com/login";
    const queryParams = `utm_source=${utmParams.utm_source}&utm_medium=${utmParams.utm_medium}&utm_campaign=${utmParams.utm_campaign}`;
    const encodedQueryParams = encodeURIComponent(queryParams);
    const baseURL = "https://kyteapp.page.link/";

    let finalURL;

    if (isCPPRedir) {
        if (isMobileDevice()) {
            window.location.href = isIOSDevice() ? pageConfig.ios : pageConfig.android;
            return;
        } else {
            finalURL = `${loginPageURL}?${queryParams}`;
        }
    } else {
        let redirectClass = pageConfig.redirectClass;
        let apn, ibi, isi, ct;

        switch (redirectClass) {
            case 'control-redir':
                apn = 'com.kytecontrol';
                ibi = 'com.kytecontrol';
                isi = '6472947922';
                ct = `control_${utmParams.utm_campaign}`;
                break;
            case 'catalog-redir':
                apn = 'com.kyte.catalog';
                ibi = 'com.kytecatalog';
                isi = '6462521196';
                ct = `catalog_${utmParams.utm_campaign}`;
                break;
            default:
                apn = 'com.kyte';
                ibi = 'com.kytepos';
                isi = '1345983058';
                ct = `default_${utmParams.utm_campaign}`;
                break;
        }

        finalURL = `${baseURL}?link=${encodedQueryParams}&apn=${apn}&ibi=${ibi}&isi=${isi}&utm_source=${utmParams.utm_source}&utm_medium=${utmParams.utm_medium}&utm_campaign=${utmParams.utm_campaign}&pt=120346822&ct=${ct}&mt=8`;
    }

    window.location.href = finalURL;
}

fetchConfigAndInit();
