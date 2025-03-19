// Initialize dataLayer
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

// Set default consent state
gtag('consent', 'default', {
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'wait_for_update': 500
});

// Initialize GA
gtag('js', new Date());
gtag('config', 'G-41YGQTYJJS');

// Load GA script efficiently
const loadGAScript = () => {
    if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;
    
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-41YGQTYJJS';
    document.head.appendChild(script);
};

// Handle consent using event delegation
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing consent
    if (localStorage.getItem('consentGranted') === 'true') {
        updateConsent();
    }

    // Add event listener using event delegation
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'accept') {
            localStorage.setItem('consentGranted', 'true');
            updateConsent();
        }
    }, { passive: true });

    // Load GA script
    loadGAScript();
});

// Update consent state
function updateConsent() {
    gtag('consent', 'update', {
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'ad_storage': 'granted',
        'analytics_storage': 'granted'
    });
}