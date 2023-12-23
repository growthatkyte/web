import gplay from 'google-play-scraper';
import store from 'app-store-scraper';
import path from 'path';
import fs from 'fs';

const delay = ms => new Promise(res => setTimeout(res, ms));


// Format date to YYYY-MM-DD

function formatDate(dateString) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Unknown' : date.toISOString().split('T')[0];
}

function formatAppDetails(appDetails, platform) {
    const {
        descriptionHTML, minInstalls, maxInstalls, scoreText, price, currency, priceText,
        available, offersIAP, androidVersion, androidVersionText, androidMaxVersion,
        developerEmail, developerWebsite, developerAddress, privacyPolicy, developerInternalID,
        genreId, contentRating, adSupported, preregister, earlyAccessEnabled, ...filteredAppDetails
    } = appDetails;

    let formattedDetails = {
        ...filteredAppDetails,
        screenshots: appDetails.screenshots,
        screenshotsCount: appDetails.screenshots ? appDetails.screenshots.length : 0,
        headerImage: !!appDetails.headerImage,
        videoPresent: !!appDetails.video,
        descriptionCount: appDetails.description ? appDetails.description.length : 0,
        updated: formatDate(appDetails.updated),
        released: formatDate(appDetails.released),
        appAge: appDetails.released ? Math.floor((new Date() - new Date(appDetails.released)) / (365 * 24 * 60 * 60 * 1000)) : 'Unknown'
    };

    // iOS-specific adjustments (if needed)
    if (platform === 'iOS') {
        // Combine screenshots from different sources for iOS
        const iosScreenshots = [
            ...(appDetails.ipadScreenshots || []),
            ...(appDetails.appletvScreenshots || [])
        ];
        formattedDetails.screenshots = iosScreenshots; // Use screenshots for URLs
        formattedDetails.screenshotsCount = iosScreenshots.length; // Update count

        // Remove unnecessary fields for iOS
        delete formattedDetails.supportedDevices;
        delete formattedDetails.icon;
        delete formattedDetails.genreIds;
        delete formattedDetails.primaryGenreId;
        delete formattedDetails.contentRating;
        delete formattedDetails.developerId;
        delete formattedDetails.developerUrl;
        delete formattedDetails.requiredOsVersion;
    }

    return formattedDetails;
}


export async function fetchAppDetails(platform, appId, country, languageCode) {
    let appDetails;
    if (platform === 'Android') {
        appDetails = await gplay.app({ appId, country, lang: languageCode });
    } else {
        appDetails = await store.app({ id: appId, country });
    }

    return formatAppDetails(appDetails, platform);
}

export async function findTopCompetitors(resultsDir) {
    const filePath = path.join(resultsDir, 'initial_competitors.json');
    if (!fs.existsSync(filePath)) {
        throw new Error('initial_competitors.json not found');
    }

    const competitorsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const appIdCounts = {};

    Object.values(competitorsData).flat().forEach(appId => {
        appIdCounts[appId] = (appIdCounts[appId] || 0) + 1;
    });

    return Object.entries(appIdCounts)
        .sort((a, b) => b[1] - a[1]) // Sort by frequency
        .slice(0, 10)               // Top 10
        .map(entry => entry[0]);    // Extract app IDs
}

export async function fetchReviews(platform, appId, country) {
    let reviews;
    if (platform === 'Android') {
        reviews = await gplay.reviews({ appId, sort: gplay.sort.RATING, num: 10, country });
    } else if (platform === 'iOS') {
        const response = await store.reviews({ id: appId, sort: store.sort.HELPFUL, page: 1, country });
        reviews = response.reviews || [];
    }

    if (reviews && Array.isArray(reviews) && reviews.length > 0) {
        return reviews.map(review => {
            const { id, userName, userImage, scoreText, replyDate, replyText, ...filteredReview } = review;
            return filteredReview;
        });
    } else {
        console.warn(`No reviews found for ${platform} app with ID ${appId}`);
        return [];
    }
}

export async function checkRank(platform, appId, keyword, country) {
    let searchFunc;
    if (platform === 'Android') {
        searchFunc = gplay.search;
    } else {
        searchFunc = store.search;
    }

    try {
        const results = await searchFunc({
            term: keyword,
            country,
            num: 30
        });
        const rankedApp = results.find(app => platform === 'Android' ? app.appId === appId : app.id === appId);
        return rankedApp ? results.indexOf(rankedApp) + 1 : '30+';
    } catch (error) {
        console.error(`Error fetching rank for keyword '${keyword}':`, error);
        return 'Error';
    }
}

export async function fetchReviewsForApps(platform, apps, country) {
    let reviewsForApps = {};
    for (const app of apps) {
        const appId = platform === 'Android' ? app.appId : app.id;
        reviewsForApps[appId] = await fetchReviews(platform, appId, country);
    }
    return reviewsForApps;
}

export async function calculateKeywordDensity(title, description, keyword) {
    const calculateDensity = (text) => {
        const words = text.match(/\w+/g) || [];
        const keywordCount = text.toLowerCase().split(keyword.toLowerCase()).length - 1;
        return (keywordCount / words.length) * 100;
    };

    const titleDensity = calculateDensity(title);
    const descriptionDensity = calculateDensity(description);

    return {
        titleDensity: titleDensity.toFixed(2),
        descriptionDensity: descriptionDensity.toFixed(2)
    };
}

export async function getRankingsAndDensityForCompetitorApps(platform, apps, keywords, country) {
    let results = {};
    for (const appId of apps) {
        results[appId] = {};
        const appDetails = await fetchAppDetails(platform, appId, country, 'en');

        if (Array.isArray(keywords)) {
            for (const keyword of keywords) {
                const ranking = await checkRank(platform, appId, keyword, country);
                const { titleDensity, descriptionDensity } = calculateKeywordDensity(appDetails.title, appDetails.description, keyword);
                results[appId][keyword] = { ranking, titleDensity, descriptionDensity };

                await delay(5000); // Adding a 5-second pause
            }
        } else {
            console.error("Error: 'keywords' is not an array.");
        }
    }
    return results;
}