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


function constructDynamicLink(pageConfig, baseURL, encodedFinalLink, classList, kyteParams, utmCampaign) {
    let dynamicLink = `${baseURL}?link=${encodedFinalLink}`;
    const isIOS = isIOSDevice();
    const isDesktopUser = isDesktop();

    const queryParams = `utm_source=${encodeURIComponent(kyteParams.utm_source)}&utm_medium=${encodeURIComponent(kyteParams.utm_medium)}&utm_campaign=${encodeURIComponent(utmCampaign)}`;

    if (classList.contains("cpp-redir")) {
        if (isDesktopUser) {
            dynamicLink = "https://web.kyteapp.com/login";
        } else {
            const platformURL = isIOS ? pageConfig.ios : `https://${pageConfig.android}`;
            dynamicLink = `${platformURL}?${queryParams}`;
        }
    } else {
        dynamicLink += `&apn=${classList.contains("catalog-redir") ? "com.kyte.catalog" : classList.contains("control-redir") ? "com.kytecontrol" : "com.kyte"}&ibi=${classList.contains("catalog-redir") ? "com.kytecatalog" : classList.contains("control-redir") ? "com.kytecontrol" : "com.kytepos"}&isi=${classList.contains("catalog-redir") ? "6462521196" : classList.contains("control-redir") ? "6472947922" : "1345983058"}`;
    }

    dynamicLink += `&pt=120346822&ct=${classList.contains("catalog-redir") ? "catalog" : classList.contains("control-redir") ? "control" : "default"}_${utmCampaign}&mt=8`;

    return dynamicLink;
}
