function loadScript(src, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = callback;
    script.src = src;
    document.head.appendChild(script);
}

async function loadLandingPagesConfig(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        return console.error('There has been a problem with your fetch operation:', error);
    }
}

let landingPagesConfig;

document.addEventListener('DOMContentLoaded', function () {
    loadLandingPagesConfig('https://growthatkyte.github.io/web/scripts/landing-pages-list.json')
        .then(landingPages => {
            landingPagesConfig = landingPages;
            applyRedirectClasses();
        });
    loadScript('https://cdn.kyteapp.com/$web/kyte-analytics-short-unique-id.js', initializeTracking);
});

function applyRedirectClasses() {
    const currentPage = window.location.pathname;
    const submitButtons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
    const pageConfig = landingPagesConfig[currentPage];
    if (pageConfig && pageConfig.redirectClass) {
        submitButtons.forEach(button => {
            button.classList.add(pageConfig.redirectClass);
        });
    }
}

document.addEventListener('click', function (event) {
    const target = event.target;
    if (target.matches('.catalog-redir, .control-redir, .cpp-redir')) {
        event.preventDefault();
        handleRedirection(target);
    }
});

function handleRedirection(target) {
    const currentPage = window.location.pathname;
    const pageConfig = landingPagesConfig[currentPage];
    if (!pageConfig) return;

    let kyteParams = extractAndStoreUTMParams();

    let utmCampaign = kyteParams.utm_campaign.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '_');

    const baseURL = "https://kyteapp.page.link/";

    const loginPageURL = "https://web.kyteapp.com/login";
    const queryParams = `utm_source=${encodeURIComponent(kyteParams.utm_source)}&utm_medium=${encodeURIComponent(kyteParams.utm_medium)}&utm_campaign=${encodeURIComponent(utmCampaign)}`;
    let finalLink = `${loginPageURL}?${queryParams}`;
    let encodedFinalLink = encodeURIComponent(finalLink);

    let dynamicLink = constructDynamicLink(pageConfig, baseURL, encodedFinalLink, target.classList, kyteParams, utmCampaign);

    if (dynamicLink) {
        const formElement = target.closest('form');
        if (formElement) {
            const redirInput = formElement.querySelector('input[name="_redir"]');
            redirInput.value = dynamicLink;
            formElement.submit();
        }
    }
}

function extractAndStoreUTMParams() {
    let kyteParams = {
        utm_campaign: window.location.pathname.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '_'),
        referrer: document.referrer,
        utm_source: document.referrer ? new URL(document.referrer).hostname : '',
        utm_medium: 'web'
    };

    const queryParams = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
        if (queryParams.has(param)) {
            kyteParams[param] = queryParams.get(param);
        }
    });

    const kyteAnalyticsKeys = ['aid', 'kid', 'pkid', 'cid', 'email', 'fbclid', 'gclid', ...Object.keys(kyteParams)];
    kyteAnalyticsKeys.forEach(key => {
        const value = localStorage.getItem(key) || kyteParams[key];
        if (value) {
            localStorage.setItem(key, value);
            kyteParams[key] = value;
        }
    });

    return kyteParams;
}

function initializeTracking() {
    console.log('Tracking script loaded and initialized');
}

function isMobileDevice() {
    const userAgent = navigator.userAgent;
    return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || (userAgent.includes('Macintosh') && 'ontouchend' in document);
}

function isIOSDevice() {
    const userAgent = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isDesktop() {
    return !isMobileDevice();
}

function constructDynamicLink(pageConfig, baseURL, classList, kyteParams, utmCampaign) {
    const isIOS = isIOSDevice();
    const isDesktopUser = isDesktop();

    const webQueryParams = `origin=link&utm_source=${encodeURIComponent(kyteParams.utm_source)}&utm_medium=${encodeURIComponent(kyteParams.utm_medium)}&utm_campaign=${encodeURIComponent(utmCampaign)}&utm_content=${encodeURIComponent(kyteParams.utm_content || '')}`;
    const campaignTag = `${kyteParams.utm_source}_${kyteParams.utm_medium}_${utmCampaign}`;

    let dynamicLink = baseURL;

    if (classList.contains("cpp-redir")) {
        if (isDesktopUser) {
            dynamicLink += `?link=${encodeURIComponent(`https://web.kyteapp.com/login?${webQueryParams}`)}`;
        } else {
            const platformURL = isIOS ? pageConfig.ios : pageConfig.android;
            dynamicLink = platformURL.startsWith('http') ? platformURL : `https://${platformURL}`;
        }
    } else {
        const encodedWebLoginURL = encodeURIComponent(`https://web.kyteapp.com/login?${webQueryParams}`);
        dynamicLink += `?apn=${classList.contains("catalog-redir") ? "com.kyte.catalog" : classList.contains("control-redir") ? "com.kytecontrol" : "com.kyte"}&ibi=${classList.contains("catalog-redir") ? "com.kytecatalog" : classList.contains("control-redir") ? "com.kytecontrol" : "com.kytepos"}&isi=1345983058&mt=8&pt=120346822&link=${encodedWebLoginURL}&utm_source=${kyteParams.utm_source}&utm_medium=${kyteParams.utm_medium}&utm_campaign=${utmCampaign}&utm_content=${kyteParams.utm_content || ''}&ct=${campaignTag}`;
    }

    return dynamicLink;
}
