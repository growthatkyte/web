import 'dotenv/config';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import { fetchAppDetails, findTopCompetitors, getRankingsAndDensityForCompetitorApps } from './modules/appInfo.js';
import { fetchGoogleAdsKeywordIdeas, processKeywords } from './modules/keywordAnalysis.js';
import { saveToJsonFile } from './modules/utils.js';

// Display Header
const sectionSeparator = chalk.cyanBright(figlet.textSync('APP STORE OPTIMIZATION', { font: 'Small' }));
console.log(sectionSeparator);
console.log(chalk.yellow("Hello 👋 \nWelcome to the Growth ASO Module"));

// Main ASO Function
async function appStoreOptimization() {
    const resultsDir = prepareResultsDirectory();
    const userInputs = await getUserInputs();
    const { platform, appId, keywords, country, languageCode } = userInputs;

    const { fetchAdditionalKeywords } = userInputs;
    const selectedKeywords = await fetchAndSelectKeywords(keywords, languageCode, country, fetchAdditionalKeywords);
    const keywordsAppsMapping = await processKeywords(selectedKeywords, languageCode, country, platform, resultsDir);

    // Save initial competitors to JSON file
    saveToJsonFile(keywordsAppsMapping, 'initial_competitors.json', resultsDir, languageCode);

    // Find top competitors from the JSON file
    const topCompetitorIds = await findTopCompetitors(resultsDir);

    // Fetch metadata for top competitors
    let topCompetitorDetails = {};
    for (const appId of topCompetitorIds) {
        topCompetitorDetails[appId] = await fetchAppDetails(platform, appId, country, languageCode);
        // Optionally save each competitor's details
        saveToJsonFile(topCompetitorDetails[appId], `competitor_${appId}_details.json`, resultsDir, languageCode);
    }

    // Retrieve rankings for each competitor app
    const rankingsDensityForCompetitorApps = await getRankingsAndDensityForCompetitorApps(platform, topCompetitorIds, selectedKeywords, country);

    // Save and display final results
    saveAndDisplayResults(appId, rankingsDensityForCompetitorApps, topCompetitorIds, selectedKeywords, resultsDir, languageCode);
}

// Function to handle user inputs
async function getUserInputs() {
    // Define questions for user input
    const questions = [
        {
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
            message: 'List at least 3 keywords that best describe your app (comma separated):',
            validate: (input) => {
                if (!input) {
                    return 'Please enter at least one keyword.';
                }
                return true;
            }
        },
        {
            type: 'confirm',
            name: 'fetchAdditionalKeywords',
            message: 'Do you want to fetch additional keywords from Google Ads?',
            default: false
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
    return inquirer.prompt(questions).then(answers => {
        // Transform country code to uppercase
        answers.country = answers.country.toUpperCase();

        if (typeof answers.keywords === 'string') {
            answers.keywords = answers.keywords.split(',').map(kw => kw.trim());
        }
        return answers;
    });
}

// Function to prepare the results directory
function prepareResultsDirectory() {
    const resultsDir = path.join(new URL(import.meta.url).pathname, '..', 'results');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    return resultsDir;
}

// Function to fetch and select keywords
async function fetchAndSelectKeywords(keywords, languageCode, country, fetchAdditionalKeywords) {
    let selectedKeywords = [...keywords]; // Keep the original keywords

    if (fetchAdditionalKeywords) {
        const spinner = ora({ text: 'Fetching keywords from Google Ads...', spinner: 'dots' }).start();

        const keywordThemeConstants = await fetchGoogleAdsKeywordIdeas(keywords, languageCode, country);
        const fetchedKeywordSuggestions = keywordThemeConstants.flat().map(kw => kw.displayName);
        const uniqueKeywordSuggestions = [...new Set(fetchedKeywordSuggestions)];

        spinner.succeed(chalk.green(`Keywords fetched`));

        const keywordSelection = await inquirer.prompt([{
            type: 'checkbox',
            name: 'selectedGoogleAdsKeywords',
            message: 'Select additional keywords from Google Ads:',
            choices: uniqueKeywordSuggestions
        }]);

        selectedKeywords = selectedKeywords.concat(keywordSelection.selectedGoogleAdsKeywords);
    }

    return selectedKeywords;
}

// Function to save and display results
function saveAndDisplayResults(appId, rankingsDensityForCompetitorApps, competitorApps, selectedKeywords, resultsDir, languageCode) {
    const allData = {
        keywordIdeas: selectedKeywords,
        topCompetitors: competitorApps,
        keywordRankingsDensity: rankingsDensityForCompetitorApps,
    };

    saveToJsonFile(allData, `${appId}_keywords_rank_density.json`, resultsDir, languageCode);
    console.log(chalk.magenta("Process completed successfully"));
}


// Running the main function
appStoreOptimization()
    .catch(error => console.error(chalk.red("An error occurred in the main function:"), error));
