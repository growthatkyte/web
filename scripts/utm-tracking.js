const paramNames = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'gclid',
    'fbclid',
    'ttclid',
    'campaignid',
    'adgroupid'
];

function getUTMParams() {
    const params = new URLSearchParams(location.search);
    const storedParams = getStoredParams();
    const utmParams = {};

    paramNames.forEach(param => {
        utmParams[param] = params.get(param) || storedParams[param] || '';
    });

    if (!utmParams.utm_campaign) {
        utmParams.utm_campaign = window.location.pathname.slice(1) || 'home';
    }

    storeParams(utmParams);
    return utmParams;
}

function getStoredParams() {
    const storedParams = {};
    ['localStorage', 'sessionStorage'].forEach(storageType => {
        const storage = window[storageType];
        ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'fbclid', 'ttclid', 'campaignid', 'adgroupid'].forEach(param => {
            const value = storage.getItem(param);
            if (value) storedParams[param] = value;
        });
    });
    return storedParams;
}

function storeParams(params) {
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            localStorage.setItem(key, value);
            sessionStorage.setItem(key, value);
        }
    });
}

function appendUTMParams(url, utmParams) {
    try {
        const urlObj = new URL(url);
        Object.entries(utmParams).forEach(([key, value]) => {
            if (value) {
                urlObj.searchParams.set(key, value);
            }
        });
        return urlObj.toString();
    } catch (error) {
        console.warn('Error processing URL:', url, error);
        return url;
    }
}

function appendUTMParamsToLinks() {
    const utmParams = getUTMParams();
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        try {
            if (link.href && link.href.startsWith('http')) {
                link.href = appendUTMParams(link.href, utmParams);
            }
        } catch (error) {
            console.warn('Error processing link:', link.href, error);
        }
    });
}


const observeDOM = () => {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                    const links = node.matches('a') ? [node] : node.querySelectorAll('a');
                    links.forEach(link => {
                        try {
                            if (link.href && link.href.startsWith('http')) {
                                link.href = appendUTMParams(link.href, getUTMParams());
                            }
                        } catch (error) {
                            console.warn('Error processing dynamic link:', link.href, error);
                        }
                    });
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    return observer;
};


let domObserver;
document.addEventListener('DOMContentLoaded', () => {
    appendUTMParamsToLinks();
    domObserver = observeDOM();
}, { passive: true });


function cleanup() {
    if (domObserver) {
        domObserver.disconnect();
    }
    document.removeEventListener('DOMContentLoaded', appendUTMParamsToLinks);
}

window.addEventListener('unload', cleanup, { passive: true });