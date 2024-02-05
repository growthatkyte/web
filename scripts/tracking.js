function loadScript(src, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = callback;
    script.src = src;
    document.head.appendChild(script);
}

function loadLandingPagesConfig(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            callback(JSON.parse(xhr.responseText));
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

loadScript('https://cdn.kyteapp.com/$web/kyte-analytics-short-unique-id.js', function () {
    const kyteParams = {
        utm_campaign: window.location.pathname,
        referrer: document.referrer
    };

    function extractUTMParams() {
        const queryParams = new URLSearchParams(window.location.search);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
            if (queryParams.has(param)) {
                kyteParams[param] = queryParams.get(param);
            }
        });
    }

    function loadParamsFromStorage() {
        const kyteAnalyticsKeys = ['aid', 'kid', 'pkid', 'cid', 'email', 'fbclid', 'gclid'];
        kyteAnalyticsKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) kyteParams[key] = value;
        });
    }

    function updateStorageFromParams() {
        Object.keys(kyteParams).forEach(key => {
            localStorage.setItem(key, kyteParams[key]);
        });
    }

    extractUTMParams();
    loadParamsFromStorage();

    function addParams(url, keys) {
        try {
            const urlObj = new URL(url);
            keys.forEach(key => {
                if (kyteParams[key]) {
                    urlObj.searchParams.set(key, kyteParams[key]);
                }
            });
            urlObj.searchParams.set('cacheBust', Date.now());
            return urlObj.toString();
        } catch (e) {
            console.error('Error in addParams:', e);
            return url;
        }
    }

    function createDynamicLink(pageConfig) {
        const baseURL = "https://kyteapp.page.link/";
        let finalLink = "https://web.kyteapp.com/login";
        if (pageConfig.default) {
            finalLink = pageConfig.default;
        }
        finalLink = addParams(finalLink, Object.keys(kyteParams));
        let dynamicLink = `${baseURL}?link=${encodeURIComponent(finalLink)}`;
        return dynamicLink;
    }

    function setActionURL(formElement) {
        loadLandingPagesConfig('https://growthatkyte.github.io/web/scripts/landing-pages-list.json', function (landingPagesConfig) {
            const pathname = window.location.pathname;
            const pageConfig = landingPagesConfig[pathname] || {};
            const dynamicLink = createDynamicLink(pageConfig);
            const redirInput = formElement.querySelector('input[name="_redir"]');
            if (redirInput) {
                redirInput.value = dynamicLink;
            }
        });
    }

    document.addEventListener('click', function (event) {
        const target = event.target;
        if (target.matches('.catalog-redir, .control-redir')) {
            event.preventDefault();
            const formElement = target.closest('form');
            if (formElement) {
                setActionURL(formElement);
                formElement.submit();
            }
        }
    });

    updateStorageFromParams();
});
