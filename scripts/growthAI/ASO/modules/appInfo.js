import gplay from 'google-play-scraper';
import store from 'app-store-scraper';

function formatDate(dateString) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Unknown' : date.toISOString().split('T')[0];
}

function formatAppDetails(appDetails, platform) {
    let formattedDetails = {
        ...appDetails,
        screenshots: appDetails.screenshots ? appDetails.screenshots.length : 0,
        headerImage: !!appDetails.headerImage,
        video: !!appDetails.video,
        descriptionCount: appDetails.description ? appDetails.description.length : 0,
        updated: formatDate(appDetails.updated),
        released: formatDate(appDetails.released),
        appAge: appDetails.released ? Math.floor((new Date() - new Date(appDetails.released)) / (365 * 24 * 60 * 60 * 1000)) : 'Unknown'
    };

    if (platform === 'iOS') {
        // Calculate total screenshots for iOS
        const screenshots = (appDetails.ipadScreenshots ? appDetails.ipadScreenshots.length : 0) +
            (appDetails.appletvScreenshots ? appDetails.appletvScreenshots.length : 0);

        formattedDetails = {
            ...formattedDetails,
            screenshots: screenshots, // Update screenshots count
            supportedDevices: undefined,
            icon: undefined,
            genreIds: undefined,
            primaryGenreId: undefined,
            contentRating: undefined,
            developerId: undefined,
            developerUrl: undefined,
            requiredOsVersion: undefined,
            ipadScreenshots: undefined,
            appletvScreenshots: undefined
        };
    }

    return formattedDetails;
}


export async function fetchAppDetails(platform, appId, country) {
    let appDetails;
    if (platform === 'Android') {
        appDetails = await gplay.app({ appId, country });
    } else {
        appDetails = await store.app({ id: appId, country });
    }

    return formatAppDetails(appDetails, platform);
}

export async function fetchCompetitorAppsByKeyword(platform, keyword, country, languageCode, numApps = 5) {
    const searchOptions = {
        term: keyword,
        num: numApps,
        country: country
    };

    if (languageCode && languageCode.trim() !== '') {
        searchOptions.lang = languageCode;
    }

    if (platform === 'Android') {
        return gplay.search(searchOptions);
    } else if (platform === 'iOS') {
        return store.search(searchOptions);
    } else {
        throw new Error("Invalid platform");
    }
}

export async function fetchCompetitorAppDetails(platform, appId, country) {
    // Function to fetch and format competitor app details
    let appDetails;
    if (platform === 'Android') {
        appDetails = await gplay.app({ appId, country });
    } else {
        appDetails = await store.app({ id: appId, country });
    }

    return formatAppDetails(appDetails, platform);
}

export async function fetchReviews(platform, appId, country) {
    if (platform === 'Android') {
        return gplay.reviews({
            appId,
            sort: gplay.sort.RATING,
            num: 10,
            country
        });
    } else {
        return store.reviews({
            id: appId,
            sort: store.sort.HELPFUL,
            page: 1,
            country
        });
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

export async function getRankingsForCompetitorApps(platform, apps, keywords, country) {
    let rankings = {};
    for (const app of apps) {
        const appId = platform === 'Android' ? app.appId : app.id;
        rankings[appId] = {};
        if (Array.isArray(keywords)) {
            for (const keyword of keywords) {
                rankings[appId][keyword] = await checkRank(platform, appId, keyword, country);
            }
        } else {
            console.error("Error: 'keywords' is not an array.");
        }
    }
    return rankings;
}
