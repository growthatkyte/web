const getMobileOperatingSystem = () => {
    const userAgent = navigator.userAgent;
    const isiPad13 = userAgent.includes("Mac") && "ontouchend" in document;
    return /android/i.test(userAgent)
        ? "android"
        : /iPad|iPhone|iPod/.test(userAgent) || isiPad13
            ? "ios"
            : "unknown";
};

const getUserFingerPrint = () => {
    const screen = window.screen;
    const lang = navigator.language.slice(0, 2);
    const isIOS = getMobileOperatingSystem() === "ios";
    return `${getMobileOperatingSystem()}-${screen.width}${isIOS ? "-" + screen.height : ""
        }-${lang}`.toLowerCase();
};

// ✅ Capture params on load
(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gclid")) localStorage.setItem("gclid", params.get("gclid"));
    if (params.get("gbraid")) localStorage.setItem("gbraid", params.get("gbraid"));
    if (params.get("_gl")) localStorage.setItem("_gl", params.get("_gl"));
})();

// ✅ Enhanced redirect with param injection
const redirect = (redirUrl, attributions) => {
    if (!attributions.promo && attributions.flow === "s") {
        const target = attributions.promo
            ? "kyte-subscription-dev.azurewebsites.net"
            : "checkout.kyteapp.com/api/auth";
        redirUrl.searchParams.set("_redir", redirUrl.href);
        redirUrl.hostname = target;
        redirUrl.pathname = target.substring(target.indexOf("/"));
    }

    if (redirUrl.searchParams.get("console")) {
        redirUrl.searchParams.delete("console");
    }

    const storedGclid = localStorage.getItem("gclid") || getCookie("gclid");
    const storedGbraid = localStorage.getItem("gbraid") || getCookie("gbraid");
    const storedGl = localStorage.getItem("_gl") || getCookie("_gl");

    if (storedGclid && !redirUrl.searchParams.has("gclid")) {
        redirUrl.searchParams.set("gclid", storedGclid);
    }
    if (storedGbraid && !redirUrl.searchParams.has("gbraid")) {
        redirUrl.searchParams.set("gbraid", storedGbraid);
    }
    if (storedGl && !redirUrl.searchParams.has("_gl")) {
        redirUrl.searchParams.set("_gl", storedGl);
    }

    window.location.href = redirUrl.href;
};

function getCookie(name) {
    const match = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
    return match ? match.pop() : null;
}

(function () {
    const APP_URLS = {
        pos: "https://pos.auth.kyteapp.com/en/download",
        control: "https://control.auth.kyteapp.com/en/download",
        web: "https://web.kyteapp.com",
        default: "https://web.auth.kyteapp.com/en/download",
        subscription: "https://subscription.kyteapp.com/en/register",
    };

    window.addEventListener("load", function () {
        if (!window.emailIsValid) throw Error("kyte-shared.js not found");

        const defaultFetch = (url, params) =>
            fetch(url, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(params),
            });

        document
            .querySelectorAll('[data-kyte-form-auth="true"]')
            .forEach((form, k) => {
                form.id ||= "kyte-form-auth-" + k;

                form.onsubmit = (e) => {
                    e.preventDefault();

                    let originalBtnContent =
                        form.querySelector('[type="submit"]').innerHTML;
                    form.querySelector('[type="submit"]').innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_S1WN{animation:spinner_MGfb .8s linear infinite;animation-delay:-.8s}.spinner_Km9P{animation - delay:-.65s}.spinner_JApP{animation - delay:-.5s}@keyframes spinner_MGfb{93.75 %, 100 % { opacity: .2 }}</style><circle class="spinner_S1WN" cx="4" cy="12" r="3" /><circle class="spinner_S1WN spinner_Km9P" cx="12" cy="12" r="3" /><circle class="spinner_S1WN spinner_JApP" cx="20" cy="12" r="3" /></svg>`;

                    const lang = form.getAttribute("data-kyte-lang") || "en";
                    const attributions = {};

                    location.search
                        .substring(1)
                        .split("&")
                        .forEach((v) => {
                            const pair = v.split("=");
                            if (
                                window.KYTE_ATT_PARAMS.includes(pair[0]) &&
                                pair[1] &&
                                pair[1] !== "undefined"
                            ) {
                                attributions[pair[0]] = pair[1];
                            }
                        });

                    let email, promo;
                    const os = form.getAttribute("data-kyte-os")?.toLowerCase();
                    let flow =
                        form.getAttribute("data-kyte-flow")?.toLowerCase() || "product";
                    if (flow === "subscription") flow = "s";
                    const app =
                        form.getAttribute("data-kyte-app")?.toLowerCase() || "web";

                    attributions.os = os;
                    attributions.app = app;
                    attributions.flow = flow;

                    form.querySelectorAll("input, select").forEach((input) => {
                        if (input.name === "email") email = input.value;
                        if (input.name === "promo") promo = input.value;
                        attributions[input.name] = input.value;
                    });

                    let redirUrl = new URL(APP_URLS[app] || APP_URLS.default);
                    redirUrl.searchParams.set("promo", promo);
                    redirUrl.searchParams.set("lang", lang);
                    redirUrl.searchParams.set(
                        "plan",
                        form.getAttribute("data-kyte-plan")
                    );
                    redirUrl.searchParams.set(
                        "recurrence",
                        form.getAttribute("data-kyte-recurrence")
                    );

                    const currSearchParams = new URLSearchParams(window.location.search);
                    for (const key of currSearchParams.keys()) {
                        redirUrl.searchParams.set(key, currSearchParams.get(key));
                    }

                    let newUser = null;

                    defaultFetch(
                        "https://kyte-auth-api.azurewebsites.net/create-user-only-email",
                        {
                            email,
                            os,
                            flow,
                            app,
                            lang,
                        }
                    )
                        .then((res) =>
                            res.ok
                                ? res.json()
                                : res.json().then((v) => {
                                    const err = new Error(v.message);
                                    err.statusCode = v.statusCode;
                                    throw err;
                                })
                        )
                        .then((res) => {
                            newUser = res;
                            redirUrl.searchParams.set("token", newUser.token);
                            redirUrl.searchParams.set("aid", newUser.account.aid);
                            attributions.aid = newUser.account.aid;
                        })
                        .then(() =>
                            defaultFetch(
                                "https://kyte-api-gateway.azure-api.net/attribution-save",
                                attributions
                            )
                        )
                        .then(() =>
                            defaultFetch(
                                "https://kyte-admin-services.azurewebsites.net/clipboard?id=" +
                                getUserFingerPrint(),
                                { accessToken: newUser.token }
                            )
                        )
                        .then(() => {
                            form.querySelector('[type="submit"]').innerHTML =
                                originalBtnContent;
                            redirect(redirUrl, attributions);
                        })
                        .catch((err) => {
                            form.querySelector('[type="submit"]').innerHTML =
                                originalBtnContent;

                            if (err.message === "User already registered") {
                                const errorText = {
                                    pt: "Seu e-mail já é cadastrado. Tente entrar e recuperar sua senha, ao invés de criar uma nova conta.",
                                    es: "Tu correo electrónico ya está registrado. Intente iniciar sesión y recuperar su contraseña, en lugar de crear una cuenta nueva.",
                                    en: "Your email is already registered. Try logging in and recovering your password, rather than creating a new account.",
                                };

                                const parag = document.createElement("p");
                                parag.setAttribute("class", "error");

                                const span = document.createElement("span");
                                span.textContent = errorText[lang] || errorText.en;

                                parag.appendChild(span);
                                const emailInput = form.querySelector('input[name="email"]');
                                emailInput.parentNode.insertBefore(parag, emailInput.nextSibling);

                                if (window.kyteFunc_steps_reset)
                                    window.kyteFunc_steps_reset(form);
                            } else {
                                console.log("ERROR", err.message);
                                redirect(redirUrl, attributions);
                            }
                        });
                };
            });
    });
})();
