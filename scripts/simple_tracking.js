function loadScript(src, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = callback;
    script.src = src;
    document.head.appendChild(script);
}

function createDynamicLink(submitButton) {
    const utmParams = {
        utm_campaign: window.location.pathname,
        referrer: document.referrer
    };

    const baseURL = "https://kyteapp.page.link/";
    const loginPageURL = "https://web.kyteapp.com/login";

    let utmCampaign = utmParams.utm_campaign.replace(/\//g, '_');
    const queryParams = new URLSearchParams({
        'utm_source': utmParams.utm_source || '',
        'utm_medium': utmParams.utm_medium || '',
        'utm_campaign': utmCampaign
    }).toString();

    let encodedQueryParams = encodeURIComponent(queryParams);
    let finalLink = `${loginPageURL}?${encodedQueryParams}`;

    let dynamicLink;
    if (submitButton.classList.contains("catalog-redir")) {
        dynamicLink = `${baseURL}?link=${finalLink}&apn=com.kyte.catalog&ibi=com.kytecatalog&isi=6462521196&utm_source=${utmParams.utm_source}&utm_medium=${utmParams.utm_medium}&utm_campaign=${utmCampaign}&pt=120346822&ct=${utmParams.utm_source}_${utmParams.utm_medium}_${utmCampaign}&mt=8`;
    } else if (submitButton.classList.contains("control-redir")) {
        dynamicLink = `${baseURL}?link=${finalLink}&apn=com.kytecontrol&ibi=com.kytecontrol&isi=6472947922&utm_source=${utmParams.utm_source}&utm_medium=${utmParams.utm_medium}&utm_campaign=${utmCampaign}&pt=120346822&ct=${utmParams.utm_source}_${utmParams.utm_medium}_${utmCampaign}&mt=8`;
    } else {
        dynamicLink = `${baseURL}?link=${finalLink}&apn=com.kyte&ibi=com.kytepos&isi=1345983058&utm_source=${utmParams.utm_source}&utm_medium=${utmParams.utm_medium}&utm_campaign=${utmCampaign}&pt=120346822&ct=${utmParams.utm_source}_${utmParams.utm_medium}_${utmCampaign}&mt=8`;
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

(function () {
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
})();
