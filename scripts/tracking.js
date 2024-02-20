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

function applyRedirectClasses(landingPagesConfig) {
    const currentPage = window.location.pathname;
    const normalizedPage = currentPage.endsWith('/') ? currentPage : `${currentPage}/`;
    const submitButtons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
    Object.keys(landingPagesConfig).forEach((path) => {
        if (path === normalizedPage) {
            const redirectClass = landingPagesConfig[path].redirectClass;
            submitButtons.forEach(button => button.classList.add(redirectClass));
            console.log(`Redirect class ${redirectClass} applied to buttons on ${normalizedPage}`);
        }
    });
}

function handleRedirection(event, landingPagesConfig) {
    const target = event.target;
    if (target.matches('.catalog-redir, .control-redir, .cpp-redir')) {
        event.preventDefault();
        const currentPage = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`;
        const pageConfig = landingPagesConfig[currentPage];

        if (!pageConfig) {
            console.error('No config found for this page.');
            return;
        }

        let utmParams = extractAndStoreUTMParams();
        constructAndRedirect(pageConfig, utmParams, target.classList.contains('cpp-redir'));
    }
}

function extractAndStoreUTMParams() {
    let utmParams = {
        utm_source: document.referrer ? new URL(document.referrer).hostname : 'direct',
        utm_medium: 'landing-pages',
        utm_campaign: window.location.pathname.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '_'),
        utm_content: '',
        utm_term: ''
    };

    const queryParams = new URLSearchParams(window.location.search);
    for (let param of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
        if (queryParams.has(param)) {
            utmParams[param] = queryParams.get(param);
        }
    }

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
    const encodedQueryParams = encodeURIComponent(`${loginPageURL}?${queryParams}`);

    const baseURL = "https://kyteapp.page.link/";
    let finalURL;

    if (isCPPRedir) {
        if (isMobileDevice()) {
            window.location.href = isIOSDevice() ? pageConfig.ios : pageConfig.android;
        } else {
            finalURL = `${loginPageURL}?${queryParams}`;
        }
    } else {
        let redirectClass = pageConfig.redirectClass;
        let apn = redirectClass === 'control-redir' ? 'com.kytecontrol' : redirectClass === 'catalog-redir' ? 'com.kyte.catalog' : 'com.kyte';
        let ibi = redirectClass === 'control-redir' ? 'com.kytecontrol' : redirectClass === 'catalog-redir' ? 'com.kytecatalog' : 'com.kytepos';
        let isi = redirectClass === 'control-redir' ? '6472947922' : redirectClass === 'catalog-redir' ? '6462521196' : '1345983058';
        let ct = `${redirectClass}_${utmParams.utm_campaign}`;

        finalURL = `${baseURL}?link=${encodedQueryParams}&apn=${apn}&ibi=${ibi}&isi=${isi}&utm_source=${utmParams.utm_source}&utm_medium=${utmParams.utm_medium}&utm_campaign=${utmParams.utm_campaign}&pt=120346822&ct=${ct}&mt=8`;
    }

    window.location.href = finalURL;
}

fetchConfigAndInit();
