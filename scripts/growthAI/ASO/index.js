import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { fetchAppDetails, fetchReviews, fetchReviewsForApps, getRankingsForCompetitorApps, fetchCompetitorAppsByKeyword } from './modules/appInfo.js';
import { delay, removeDuplicates, filterData } from './modules/utils.js';
import { generateReport, loadJsonData } from './modules/generateReport.js';

const sectionSeparator = `
**************************************************
*                                                *
*           ~ APP STORE OPTIMZATION ~            *
*                                                *
**************************************************
`;


async function getUserInputs() {
    const questions = [{
        type: 'list',
        name: 'platform',
        message: 'Choose the platform:',
        choices: ['Android', 'iOS']
    },
    {
        type: 'input',
        name: 'appId',
        message: 'Enter the app package name/id:'
    },
    {
        type: 'input',
        name: 'keywords',
        message: 'Enter your targeted keywords (comma separated):',
        default: ''
    },
    {
        type: 'input',
        name: 'country',
        message: 'Enter the country code:',
        default: 'us'
    },
    {
        type: 'input',
        name: 'languageCode',
        message: 'Enter language code:',
        default: ''
    },
    {
        type: 'confirm',
        name: 'fetchCompetitors',
        message: 'Do you want me to look for competitors?',
        default: true
    },
    {
        type: 'input',
        name: 'competitorAppIds',
        message: 'List the app IDs of your competitors separated by comma:',
        when: (answers) => !answers.fetchCompetitors,
        default: ''
    }
    ];
    return inquirer.prompt(questions);
}

async function main() {
    console.log(sectionSeparator);
    console.log("Hello 👋\nWelcome to the Growth ASO Module");
    const userInputs = await getUserInputs();
    const { platform, appId, keywords, country, languageCode } = userInputs;

    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

    if (keywordList.length === 0) {
        console.error("No keywords provided. Exiting process.");
        return;
    }

    spinner.start(`Fetching app details for ${appId}`);
    const appDetails = await fetchAppDetails(platform, appId, country, languageCode);
    spinner.succeed(`App details fetched`);

    const spinner = ora({ text: 'Setting up...', spinner: 'dots' }).start();

    let competitorApps = [];

    for (const keyword of keywordList) {
        spinner.text = `🔍 Looking for competitors with keyword '${keyword}'`;
        try {
            const competitors = await fetchCompetitorAppsByKeyword(platform, keyword, country, languageCode);
            if (competitors.length === 0) {
                console.log(`No competitors found for keyword '${keyword}'`);
            } else {
                competitorApps.push(...competitors);
                console.log(`Fetched competitor apps for keyword '${keyword}'`);
            }
        } catch (error) {
            spinner.fail(`Error fetching competitor apps for '${keyword}': ${error.message}`);
        }

        spinner.succeed(`Processed keyword: ${keyword}`);
        await delay(30000);
    }

    spinner.start("Total competitor apps fetched (before removing duplicates): " + competitorApps.length);
    competitorApps = removeDuplicates(competitorApps, 'appId');
    spinner.succeed("🧹 Total competitor apps fetched (after removing duplicates): " + competitorApps.length);

    spinner.start("Fetching reviews for the main app");
    const reviews = await fetchReviews(platform, appId, country);
    spinner.succeed("Reviews for the main app fetched");

    spinner.start("Fetching reviews for competitor apps");
    const reviewsForCompetitorApps = await fetchReviewsForApps(platform, competitorApps, country);
    spinner.succeed("Reviews for competitor apps fetched");

    console.log("keywordList type:", typeof keywordList, Array.isArray(keywordList) ? "Array" : "Not an Array");

    spinner.start("Getting rankings for each competitor app");
    const rankingsForCompetitorApps = await getRankingsForCompetitorApps(platform, competitorApps, keywordList, country);
    spinner.succeed("Rankings for competitor apps obtained");

    const results = {
        appDetails,
        competitorApps,
        keywords,
        keywordList,
        rankingsForCompetitorApps,
        reviews,
        reviewsForCompetitorApps,
    };

    const resultsDir = path.join(new URL(import.meta.url).pathname, '..', 'results');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }

    // Generate filename with appId and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // ISO string with ':' and '.' replaced with '-'
    const filename = `${appId}_${timestamp}.json`;
    const filePath = path.join(resultsDir, filename);

    // Write data to JSON file in 'results' folder
    spinner.start("Writing data to JSON file...");
    const filteredResults = filterData(results); // using default keys to exclude
    fs.writeFileSync(filePath, JSON.stringify(filteredResults, null, 2));
    spinner.succeed(`Data saved to ${filename}`);

    // Automatically select the most recent JSON file
    const files = fs.readdirSync(resultsDir);
    const recentJsonFile = files
        .filter(file => file.endsWith('.json') && file.startsWith(appId))
        .sort()
        .pop();

    // Generate Markdown Report
    if (recentJsonFile) {
        try {
            spinner.start("Generating Markdown report...");
            const jsonDataPath = path.join(resultsDir, recentJsonFile);
            const jsonData = loadJsonData(jsonDataPath); // Assuming loadJsonData is exported from generateReport.js
            const markdownTemplatePath = './results/report_template.md'; // Replace with your actual markdown template path
            const reportOutputPath = path.join(resultsDir, `${appId}_report_${timestamp}.md`);

            // Pass the 'country' variable explicitly
            generateReport(jsonData, markdownTemplatePath, reportOutputPath, platform, country);

            spinner.succeed(`Markdown report generated: ${appId}_report_${timestamp}.md`);
        } catch (error) {
            spinner.fail("Failed to generate Markdown report");
            console.error("Error in report generation:", error);
        }
    } else {
        console.error("No recent JSON file found for report generation.");
    }

    console.log("Process completed successfully");
}

main().catch(error => {
    console.error("An error occurred in the main function:", error);
});
