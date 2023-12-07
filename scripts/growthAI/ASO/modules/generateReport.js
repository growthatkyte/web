import fs from 'fs';
import path from 'path';
import { getRankingsForCompetitorApps } from './appInfo.js';

// Function to load JSON data
function loadJsonData(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Error loading JSON data from file: ${filePath}`, error);
        return null;
    }
}
// Function to calculate app age
function calculateAppAge(releaseDate) {
    if (!releaseDate) {
        return 'Unknown';
    }
    const release = new Date(releaseDate);
    const now = new Date();
    return Math.round((now - release) / (1000 * 60 * 60 * 24 * 365));
}
// Function to replace placeholders in the template for a single app or competitor

function replacePlaceholders(template, data, mappings, prefix = '') {
    Object.keys(data).forEach(key => {
        let value = data[key];
        let placeholderKey = prefix + (mappings.hasOwnProperty(key) ? mappings[key] : key);

        if (Array.isArray(value)) {
            value = value.map(item =>
                typeof item === 'object' ? replacePlaceholders(template, item, mappings, prefix) : item
            ).join(', ');
        } else if (typeof value === 'object' && value !== null) {
            value = replacePlaceholders(template, value, mappings, prefix);
        }

        template = template.replace(new RegExp(`{{${placeholderKey}}}`, 'g'), value);
    });

    template = template.replace(/{{\w+}}/g, 'N/A');
    return template;
}

// Function to create ASCII Bar Chart for ratings distribution
function createAsciiBarChart(ratings) {
    if (!ratings) {
        return 'No ratings data available.';
    }

    let maxRatingCount = Math.max(...Object.values(ratings));
    let scaleFactor = maxRatingCount > 0 ? 50 / maxRatingCount : 0;
    let barChart = '';
    for (let i = 5; i >= 1; i--) {
        let barLength = Math.round((ratings[i] || 0) * scaleFactor);
        barChart += `**${i} stars:** ${'█'.repeat(barLength)}\n`;
    }
    return barChart;
}

function populateRatingsDistribution(template, appDetails, platform) {
    if (platform === 'Android' && appDetails.histogram) {
        let barChart = createAsciiBarChart(appDetails.histogram);
        template = template.replace(/{{ratingsDistribution}}/g, barChart);
    } else {
        template = template.replace(/{{ratingsDistribution}}/g, '');
    }
    return template;
}

async function generateCompetitorsSection(competitors, platform, data, country) {
    let allCompetitorsSection = '';

    for (const comp of competitors) {
        let ratingsBarChart = comp.ratingsDistribution ? createAsciiBarChart(comp.ratingsDistribution) : 'N/A';
        let keywordRankings = await getRankingsForCompetitorApps(platform, [comp], data.keywords, country, platform);

        let formattedComp = {
            competitor_ratingsBarChart: ratingsBarChart,
            competitor_keywordRankings: keywordRankings,

            ...comp,
            competitor_id: comp.id || 'N/A',
            competitor_title: comp.title || 'N/A',
            competitor_primaryGenre: comp.primaryGenre || 'N/A',
            competitor_developer: comp.developer || 'N/A',
            competitor_released: comp.released || 'N/A',
            competitor_updated: comp.updated || 'N/A',
            competitor_summary: comp.summary || 'N/A',
            competitor_description: comp.description || 'N/A',
            competitor_languages: comp.languages || 'N/A',
            competitor_version: comp.version || 'N/A',
            competitor_free: comp.free || 'N/A',
            competitor_url: comp.url || 'N/A',
            competitor_descriptionCount: comp.description ? comp.description.length : 0,
            competitor_appAge: calculateAppAge(comp.released),
            competitor_genres: comp.categories ? comp.categories.map(c => c.name).join(', ') : 'N/A',
            competitor_screenshots: comp.screenshots || 0,
            competitor_url: comp.url,
            competitor_numberOfReviews: comp.reviews || 0,
            // Add other fields or calculations here if needed
        };

        // Manually construct the section for each competitor
        let compSection = `
### ${formattedComp.competitor_title}

${formattedComp.competitor_title} is a ${formattedComp.competitor_primaryGenre} app developed by ${formattedComp.competitor_developer}. The app was first released on ${formattedComp.competitor_released} and the last update was published on ${formattedComp.competitor_updated}, making it ${formattedComp.competitor_appAge} years old. It has a score of ${formattedComp.competitor_score} based on ${formattedComp.competitor_numberOfReviews} reviews.

#### Details

- **App ID:** ${formattedComp.competitor_id}
- **Summary (Android only):** ${formattedComp.competitor_summary}
- **Description:** ${formattedComp.competitor_description}
- **Description Length:** ${formattedComp.competitor_descriptionCount} characters
- **Categories:** ${formattedComp.competitor_genres}
- **Available Languages:** ${formattedComp.competitor_languages}
- **Current Version:** ${formattedComp.competitor_version}
- **Free to Download:** ${formattedComp.competitor_free}
- **Languages:** ${formattedComp.competitor_languages}
- **Number Screenshots (Total):** ${formattedComp.competitor_screenshots}
- **App Store URL:** [${formattedComp.competitor_title} on App Store](${formattedComp.competitor_url})

#### Keyword Rankings
${keywordRankings}

`;

        allCompetitorsSection += compSection + '\n\n';
    }

    return allCompetitorsSection;
}

// Function to populate keyword table
function populateKeywordTable(template, keywordList, keywordAnalysisResults) {
    if (!Array.isArray(keywordList)) {
        console.error("Error: 'keywordList' is not an array.");
        return template;
    }

    let tableRows = '';
    keywordList.forEach(keyword => {
        // Check if the keyword analysis result for this keyword exists and has a 'score'
        let keywordData = keywordAnalysisResults && keywordAnalysisResults[keyword];
        let score = keywordData && keywordData.score ? keywordData.score.toFixed(2) : 'N/A';
        // Replace the placeholder values with actual data you have for 'position' and 'matches'
        let position = keywordData && keywordData.position ? keywordData.position : 'N/A';
        let matches = keywordData && keywordData.matches ? keywordData.matches : 'N/A';

        tableRows += `| ${keyword} | ${position} | ${score} | ${matches} |\n`;
    });

    template = template.replace(/{{keywordTableRows}}/g, tableRows);
    return template;
}

// Main function to populate markdown template
function populateMarkdownTemplate(data, templateFilePath, outputFilePath, platform, country) {
    const templateCopyPath = path.join(path.dirname(outputFilePath), 'copy_' + path.basename(templateFilePath));
    fs.copyFileSync(templateFilePath, templateCopyPath);

    let template = fs.readFileSync(templateCopyPath, 'utf8');

    // Replace placeholders for the main app
    template = replacePlaceholders(template, data.appDetails, mappingDictionary);

    // Handle competitors and integrate the competitors section into the template
    const competitorsSection = generateCompetitorsSection(data.competitorApps || [], platform, data, country);
    template = template.replace(/{{competitorsSection}}/g, competitorsSection);

    // Populate keyword table
    template = populateKeywordTable(template, data.keywords, data.keywordAnalysisResults);

    // Populate ratings distribution (for Android only)
    template = populateRatingsDistribution(template, data.appDetails, platform);

    fs.writeFileSync(outputFilePath, template);
}

const mappingDictionary = {
    'title': 'title',
    'primaryGenre': 'genre',
    'developer': 'developer',
    'released': 'released',
    'updated': 'updated',
    'appAge': 'appAge',
    'score': 'score',
    'reviews': 'reviews',
    'id': 'appId',
    'summary': 'summary',
    'description': 'description',
    'descriptionCount': 'descriptionCount',
    'categories': 'genres',
    'version': 'version',
    'free': 'free',
    'screenshots': 'screenshots',
    'url': 'url'
};

export { populateMarkdownTemplate as generateReport, loadJsonData };