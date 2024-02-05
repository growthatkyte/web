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
    document.addEventListener('DOMContentLoaded', function () {
        loadLandingPagesConfig('https://growthatkyte.github.io/web/scripts/landing-pages-list.json', function (landingPages) {
            const currentPage = window.location.pathname;
            const submitButtons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
            submitButtons.forEach(button => {
                if (landingPages[currentPage]) {
                    const pageConfig = landingPages[currentPage];
                    if (pageConfig.redirectClass) {
                        button.classList.add(pageConfig.redirectClass);
                    } else if (pageConfig.ios || pageConfig.android) {
                        button.classList.add("cpp-redir");
                    }
                }
            });
        });
    });

    document.addEventListener('click', function (event) {
        const target = event.target;
        if (target.matches('.catalog-redir, .control-redir, .cpp-redir')) {
            event.preventDefault();
            loadLandingPagesConfig('https://growthatkyte.github.io/web/scripts/landing-pages-list.json', function (landingPages) {
                const currentPage = window.location.pathname;
                if (landingPages[currentPage]) {
                    const pageConfig = landingPages[currentPage];
                    let dynamicLink = '#';
                    if (target.classList.contains('cpp-redir')) {
                        dynamicLink = createDynamicLinkForCPP(pageConfig);
                    } else {
                        dynamicLink = createAppStoreLink(pageConfig);
                    }
                    setActionURL(target, dynamicLink);
                }
            });
        }
    });
});

function createDynamicLinkForCPP(pageConfig) {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return pageConfig.ios;
    } else if (/android/i.test(userAgent)) {
        return pageConfig.android;
    } else {
        return "https://web.kyteapp.com/login";
    }
}

function setActionURL(target, dynamicLink) {
    const formElement = target.closest('form');
    if (formElement) {
        const redirInput = formElement.querySelector('input[name="_redir"]');
        if (redirInput) {
            redirInput.value = dynamicLink;
        }
        formElement.submit();
    }
}
