function loadScript(src, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = callback;
    script.src = src;
    document.head.appendChild(script);
}

function loadLandingPagesConfig(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => console.error('There has been a problem with your fetch operation:', error));
}

let landingPagesConfig;

document.addEventListener('DOMContentLoaded', function () {
    loadLandingPagesConfig('https://growthatkyte.github.io/web/scripts/landing-pages-list.json')
        .then(landingPages => {
            landingPagesConfig = landingPages;
            applyRedirectClasses();
        });
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

    const kyteParams = {
        utm_campaign: window.location.pathname,
        referrer: document.referrer,
        utm_source: document.referrer ? new URL(document.referrer).hostname : '',
        utm_medium: 'web'
    };

    const baseURL = "https://kyteapp.page.link/";
    let utmCampaign = kyteParams.utm_campaign.replace(/\//g, '_');
    const loginPageURL = "https://web.kyteapp.com/login";
    const queryParams = `utm_source=${kyteParams.utm_source}&utm_medium=${kyteParams.utm_medium}&utm_campaign=${utmCampaign}`;
    let finalLink = `${loginPageURL}?${queryParams}`;
    let dynamicLink = constructDynamicLink(pageConfig, baseURL, finalLink, target.classList, kyteParams);

    if (dynamicLink) {
        const formElement = target.closest('form');
        if (formElement) {
            const redirInput = formElement.querySelector('input[name="_redir"]');
            redirInput.value = dynamicLink;
            formElement.submit();
        }
    }
}

function constructDynamicLink(pageConfig, baseURL, finalLink, classList, kyteParams) {
    let dynamicLink = `${baseURL}?link=${encodeURIComponent(finalLink)}`;
    const userAgent = navigator.userAgent || window.opera;

    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

    if (classList.contains("cpp-redir")) {
        return isIOS ? pageConfig.ios : pageConfig.android;
    }

    dynamicLink += `&apn=${classList.contains("catalog-redir") ? "com.kyte.catalog" : classList.contains("control-redir") ? "com.kytecontrol" : "com.kyte"}&ibi=${classList.contains("catalog-redir") ? "com.kytecatalog" : classList.contains("control-redir") ? "com.kytecontrol" : "com.kytepos"}&isi=${classList.contains("catalog-redir") ? "6462521196" : classList.contains("control-redir") ? "6472947922" : "1345983058"}`;
    dynamicLink += `&utm_source=${kyteParams.utm_source}&utm_medium=${kyteParams.utm_medium}&utm_campaign=${kyteParams.utm_campaign.replace(/\//g, '_')}&pt=120346822&ct=${classList.contains("catalog-redir") ? "catalog" : classList.contains("control-redir") ? "control" : "default"}_${kyteParams.utm_campaign.replace(/\//g, '_')}&mt=8`;

    return dynamicLink;
}
