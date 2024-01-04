import gplay from 'google-play-scraper';
import store from 'app-store-scraper';
import path from 'path';
import fs from 'fs';

// Utility function for delaying execution
const delay = ms => new Promise(res => setTimeout(res, ms));

// Function to fetch app details, reviews, and rankings
export async function fetchAppDetails(platform, appId, country, languageCode) {
    try {
        let appDetails, reviews, ranking;
        if (platform === 'Android') {
            appDetails = await gplay.app({ appId, country, lang: languageCode }).catch(() => null);
        } else {
            appDetails = await store.app({ id: appId, country, lang: languageCode }).catch(() => null);
        }

        if (!appDetails) {
            console.warn(`App with ID ${appId} not found for ${platform} in country ${country}`);
            return null;
        }


        return { ...appDetails };
    } catch (error) {
        console.error(`Error fetching details for ${platform} app with ID ${appId}:`, error);
        return null;
    }
}


// Function to find top competitors
export async function findTopCompetitors(resultsDir, keyword, country, platform, languageCode) {
    const filePath = path.join(resultsDir, 'initial_competitors.json');
    if (!fs.existsSync(filePath)) {
        throw new Error('initial_competitors.json not found');
    }

    const competitorsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const topCompetitors = [];

    // Iterate over each category in the JSON file
    for (const category in competitorsData) {
        if (Array.isArray(competitorsData[category])) {
            for (const appId of competitorsData[category]) {
                const details = await fetchAppDetails(platform, appId, country, languageCode, keyword);
                if (details) {
                    topCompetitors.push({ appId, ...details });
                } else {
                    console.warn(`Skipping app ID ${appId} as it could not be fetched`);
                }
                await delay(5000);
            }
        }
    }

    return topCompetitors;
}



export async function fetchReviews(platform, appId, country, languageCode) {
    let reviews = [];
    let options;

    if (platform === 'Android') {
        options = {
            appId: appId,  // For Android, use appId
            country: country,
            sort: gplay.sort.RATING,
            num: 10,
            paginate: true,
            lang: languageCode
        };
        reviews = await gplay.reviews(options).then(response => response.data || []);
    } else {
        options = {
            id: appId,  // For iOS, use id since you have the numerical ID
            country: country,
            sort: store.sort.RATING,
            num: 10,
            paginate: true,
            lang: languageCode
        };
        reviews = await store.reviews(options).then(response => response.data || []);
    }

    return reviews;
}


export async function checkRank(platform, appId, keyword, country, languageCode) {
    const options = {
        term: keyword,
        country: country,
        num: 30,
        lang: languageCode
    };

    try {
        const results = await (platform === 'Android' ? gplay.search(options) : store.search(options));
        const rankedApp = results.find(app => app.appId === appId || app.id === appId);
        return rankedApp ? results.indexOf(rankedApp) + 1 : '30+';
    } catch (error) {
        console.error(`Error fetching rank for keyword '${keyword}':`, error);
        return 'Error';
    }
}

