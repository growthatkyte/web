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

    const kyteAnalyticsKeys = ['aid', 'kid', 'pkid', 'cid', 'email', 'fbclid', 'gclid'];

    function addParams(url, keys) {
        try {
            const urlObj = new URL(url);
            Object.keys(keys).forEach(key => urlObj.searchParams.set(key, keys[key]));
            urlObj.searchParams.set('cacheBust', Date.now());
            return urlObj.toString();
        } catch (e) {
            console.error('Error in addParams:', e);
            return url;
        }
    }

    function createDynamicLink(submitButton) {
        const baseURL = "https://kyteapp.page.link/";
        const loginPageURL = "https://web.kyteapp.com/login";

        const utmSource = kyteParams.utm_source || '';
        const utmMedium = kyteParams.utm_medium || '';
        let utmCampaign = kyteParams.utm_campaign || '';
        utmCampaign = utmCampaign.replace(/\//g, '_');

        const queryParams = new URLSearchParams({
            'utm_source': utmSource,
            'utm_medium': utmMedium,
            'utm_campaign': utmCampaign
        }).toString();

        let encodedQueryParams = encodeURIComponent(queryParams);
        let finalLink = `${loginPageURL}?${encodedQueryParams}`;

        let dynamicLink;
        if (submitButton.classList.contains("catalog-redir")) {
            dynamicLink = `${baseURL}?link=${finalLink}&apn=com.kyte.catalog&ibi=com.kytecatalog&isi=6462521196&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&pt=120346822&ct=${utmSource}_${utmMedium}_${utmCampaign}&mt=8`;
        } else if (submitButton.classList.contains("control-redir")) {
            dynamicLink = `${baseURL}?link=${finalLink}&apn=com.kytecontrol&ibi=com.kytecontrol&isi=6472947922&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&pt=120346822&ct=${utmSource}_${utmMedium}_${utmCampaign}&mt=8`;
        } else {
            dynamicLink = `${baseURL}?link=${finalLink}&apn=com.kyte&ibi=com.kytepos&isi=1345983058&utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}&pt=120346822&ct=${utmSource}_${utmMedium}_${utmCampaign}&mt=8`;
        }

        return dynamicLink;
    }

    function setActionURL(formElement, submitButton) {
        const dynamicLink = createDynamicLink(submitButton);
        const redirInput = formElement.querySelector('input[name="_redir"]');
        if (redirInput) {
            redirInput.value = dynamicLink;
        }
    }

    function getKid(params = {}, onLoad = function () { }) {
        try {
            Object.keys(params).forEach(k => {
                kyteParams[k] = params[k];
                localStorage.setItem(k, params[k]);
            });

            kyteAnalyticsKeys.forEach(k => {
                if (!kyteParams[k]) {
                    const value = localStorage.getItem(k);
                    if (value) kyteParams[k] = value;
                }
            });

            document.cookie.split(';').forEach(v => {
                const [key, value] = v.trim().split('=');
                const k = (key === '_ga' ? 'cid' : key);
                if (kyteAnalyticsKeys.includes(k) && !kyteParams[k] && value) kyteParams[k] = value;
            });

            if (kyteAnalyticsKeys.every(k => !kyteParams[k])) {
                const uid = new ShortUniqueId({
                    length: 15
                });
                kyteParams.pkid = uid.rnd() + Date.now();
                localStorage.setItem('pkid', kyteParams.pkid);
            }

            const aidMatchDate = localStorage.getItem('aidMatchDate');
            if (aidMatchDate) kyteParams.aidMatchDate = aidMatchDate;

            Object.keys(kyteParams).forEach(k => {
                localStorage.setItem(`k_${k}`, kyteParams[k]);
            });

            if (typeof dataLayer === 'object') dataLayer.push({
                event: "AttributionDataUpdated"
            });

            if (aidMatchDate && kyteParams.kid) {
                onLoad(kyteParams.kid);
                return;
            }

            const xhrReceive = new XMLHttpRequest();
            xhrReceive.open('post', 'https://kyte-api-gateway.azure-api.net/get-kyte-id');
            xhrReceive.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhrReceive.onreadystatechange = function () {
                if (xhrReceive.readyState === XMLHttpRequest.DONE && xhrReceive.responseText) {
                    const kidResult = JSON.parse(xhrReceive.responseText);
                    const kid = kidResult.kid;
                    if (localStorage.getItem('kid') !== kid) {
                        kyteParams.kid = kid;
                        localStorage.setItem('kid', kid);
                        if (typeof dataLayer === 'object') dataLayer.push({
                            event: "KidIdentify",
                            kid: kid
                        });
                    }
                    if (kidResult.aidMatchDate) {
                        localStorage.setItem('aidMatchDate', kidResult.aidMatchDate);
                    }
                    onLoad(kid);
                }
            };
            xhrReceive.send(JSON.stringify(kyteParams));
        } catch (e) {
            console.error('Error in getKid:', e);
        }
    }

    (function () {
        if (typeof ShortUniqueId !== 'function') {
            console.error('ShortUniqueId module failed to load');
            return;
        }

        document.addEventListener('click', function (event) {
            const target = event.target;
            if (target.matches('.catalog-redir, .control-redir')) {
                event.preventDefault();
                const formElement = target.closest('form');
                if (formElement) {
                    setActionURL(formElement, target);
                    formElement.submit();
                }
            }
        });

        getKid({
            url: window.location.href
        }, function () {
            const inputElements = document.querySelectorAll('input');
            for (const input of inputElements) {
                const name = input.getAttribute('name');
                if (name && kyteParams[name]) {
                    input.value = kyteParams[name];
                }
            }

            const linkElements = document.getElementsByTagName('a');
            for (const link of linkElements) {
                if (link.href.indexOf(window.location.href) === -1) {
                    link.href = addParams(link.href, kyteParams);
                }
            }
        });

        loadLandingPagesConfig('/path/to/landingPages.json', function (landingPages) {
            const currentPage = window.location.pathname;
            const submitButtons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
            if (landingPages[currentPage]) {
                submitButtons.forEach(button => {
                    button.classList.add(landingPages[currentPage]);
                });
            }
        });
    })();
});
