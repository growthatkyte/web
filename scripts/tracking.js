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

    const submitButtons = document.querySelectorAll('input[type="submit"], button[type="submit"]');

    const pageConfig = landingPagesConfig[currentPage];

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
        const pageConfig = landingPagesConfig[currentPage];
        if (!pageConfig) return;

        let utmParams = extractAndStoreUTMParams();
        constructAndRedirect(pageConfig, utmParams, target.classList.contains('cpp-redir'));
    }
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

        const campaignTag = utmParams.utm_campaign.replace(/\/$/, '');
        let redirectClass = pageConfig.redirectClass;
        let apn = 'com.kyte';
        let ibi = 'com.kytepos';
        let isi = '1345983058';
        let ct = `default_${campaignTag}`;

        if (redirectClass === 'control-redir') {
            apn = 'com.kytecontrol';
            ibi = 'com.kytecontrol';
            isi = '6472947922';
            ct = `control_${campaignTag}`;
        } else if (redirectClass === 'catalog-redir') {
            apn = 'com.kyte.catalog';
            ibi = 'com.kytecatalog';
            isi = '6462521196';
            ct = `catalog_${campaignTag}`;
        }

        finalURL = `${baseURL}?link=${encodedQueryParams}&apn=${apn}&ibi=${ibi}&isi=${isi}&utm_source=${utmParams.utm_source}&utm_medium=${utmParams.utm_medium}&utm_campaign=${utmParams.utm_campaign}&pt=120346822&ct=${ct}&mt=8`;
    }

    window.location.href = finalURL;
}

fetchConfigAndInit();
