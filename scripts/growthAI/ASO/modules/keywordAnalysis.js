import gplay from 'google-play-scraper';
import store from 'app-store-scraper';
import * as R from 'ramda';
import * as calc from './calc.js';


const MAX_KEYWORD_LENGTH = 25;


export async function fetchTopAppsByKeyword(platform, keyword, country) {
    if (!Array.isArray(keyword)) {
        throw new Error("'keyword' must be an array");
    }
    try {
        const searchFunc = platform === 'Android' ? gplay.search : store.search;
        const results = await searchFunc({
            term: [keyword],
            country,
            num: 10,
            fullDetail: true
        });

        return results.map(app => {
            app.screenshots = app.screenshots ? app.screenshots.length : 0;
            app.headerImage = !!app.headerImage;
            app.video = !!app.video;
            return app;
        });
    } catch (error) {
        console.error(`Error fetching apps for keyword '${keyword}':`, error);
        return [];
    }
}

export function getAdvancedKeywordScore(keyword) {
    const getSuggestLength = (keyword, length = 1) => {
        if (length > Math.min(keyword.length, MAX_KEYWORD_LENGTH)) {
            return Promise.resolve({ length: undefined, index: undefined, suggestions: [] });
        }

        const prefix = keyword.slice(0, length);
        return gplay.suggest({ term: [keyword] }).then(suggestions => {
            if (!Array.isArray(suggestions)) {
                console.error(`Error fetching suggestions for prefix '${keyword}'`);
                return { length: undefined, index: undefined, suggestions: [] };
            }

            const index = suggestions.indexOf(keyword);
            if (index === -1) {
                return getSuggestLength(keyword, length + 1);
            }
            return { length, index, suggestions };
        }).catch(error => {
            console.error(`Error fetching suggestions for prefix '${prefix}':`, error);
            return { length: undefined, index: undefined, suggestions: [] };
        });
    };

    return getSuggestLength(keyword).then(({ length, index, suggestions }) => {
        let score;
        if (length === undefined) {
            score = calculatePartialMatchScore(suggestions, keyword);
        } else {
            // Scoring for exact matches
            const lengthScore = calc.iScore(1, MAX_KEYWORD_LENGTH, length);
            const indexScore = calc.izScore(suggestions.length, index);
            score = calc.aggregate([10, 1], [lengthScore, indexScore]);
        }
        return { keyword, score, suggestions };
    });
}

export function calculatePartialMatchScore(suggestions, keyword) {
    // Find the closest match and its index
    const closestMatch = suggestions.find(suggestion => suggestion.includes([keyword]));
    const index = closestMatch ? suggestions.indexOf(closestMatch) : -1;
    const closenessScore = closestMatch ? keyword.length / closestMatch.length : 0;
    const positionScore = index >= 0 ? calc.izScore(suggestions.length, index) : 0;

    return calc.aggregate([1, 1], [closenessScore, positionScore]);
}

export function getKeywordScore(keyword, app) {
    const keywordLower = [keyword].toLowerCase();
    const titleMatch = app.title.toLowerCase().includes(keywordLower[0]);
    const summaryMatch = app.summary && app.summary.toLowerCase().includes(keywordLower[0]);
    const descriptionMatch = app.description && app.description.toLowerCase().includes(keywordLower[0]);

    return titleMatch + summaryMatch + descriptionMatch;
}

export function getSuggestLength(gplay, keyword, length = 1) {
    if (length > Math.min(keyword.length, MAX_KEYWORD_LENGTH)) {
        return Promise.resolve({ length: undefined, index: undefined });
    }

    const prefix = keyword.slice(0, length);
    return gplay.suggest({ term: prefix })
        .then(function (suggestions) {
            const index = suggestions.indexOf(keyword);
            if (index === -1) {
                return getSuggestLength(gplay, keyword, length + 1);
            }
            return { length, index };
        });
}

export function getSuggestScore(gplay, keyword) {
    return getSuggestLength(gplay, keyword)
        .then(function (lengthStats) {
            let score;
            if (!lengthStats.length) {
                score = 1;
            } else {
                const lengthScore = calc.iScore(1, MAX_KEYWORD_LENGTH, lengthStats.length);
                const indexScore = calc.izScore(4, lengthStats.index);
                score = calc.aggregate([10, 1], [lengthScore, indexScore]);
            }
            return R.assoc('score', score, lengthStats);
        });
}