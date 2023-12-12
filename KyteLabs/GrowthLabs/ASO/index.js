import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import { fetchAppDetails, fetchReviews, fetchReviewsForApps, getRankingsForCompetitorApps, fetchCompetitorAppsByKeyword } from './modules/appInfo.js';
import { delay, removeDuplicates, filterData } from './modules/utils.js';
import { generateReport, loadJsonData } from './modules/generateReport.js';

const sectionSeparator = chalk.cyanBright(
    figlet.textSync('APP STORE OPTIMIZATION', { font: 'Small' })
);

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
        validate: (input) => {
            if (!input) {
                return 'Please enter at least one keyword.';
            }
            return true;
        }
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
        if (typeof answers.keywords === 'string') {
            answers.keywords = answers.keywords.split(',').map(kw => kw.trim());
        }
        return answers;
    });
}

async function main() {
    console.log(sectionSeparator);

    console.log(chalk.yellow("Hello 👋 \nWelcome to the Growth ASO Module"));


    const userInputs = await getUserInputs();
    const { platform, appId, keywords, country, languageCode } = userInputs;
    const spinner = ora({ text: 'Setting up...', spinner: 'dots' }).start();

    const keywordList = keywords;

    if (!Array.isArray(keywordList)) {
        keywordList = Array.from(keywordList);
    }
    spinner.start(chalk.blue(`Fetching app details for ${appId}`));
    const appDetails = await fetchAppDetails(platform, appId, country, languageCode);
    spinner.succeed(chalk.green(`App details fetched`));

    let competitorApps = [];
    for (const keyword of keywordList) {
        spinner.text = ` Looking for competitors with keyword ${keyword}'`;
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
    spinner.succeed(" Total competitor apps fetched (after removing duplicates): " + competitorApps.length);

    spinner.start("Fetching reviews for the main app");
    const reviews = await fetchReviews(platform, appId, country);
    spinner.succeed("Reviews for the main app fetched");

    spinner.start("Fetching reviews for competitor apps");
    const reviewsForCompetitorApps = await fetchReviewsForApps(platform, competitorApps, country);
    spinner.succeed("Reviews for competitor apps fetched");

    spinner.start("Getting rankings for each competitor app");
    const rankingsForCompetitorApps = await getRankingsForCompetitorApps(platform, competitorApps, keywordList, country);
    spinner.succeed("Rankings for competitor apps obtained");

    const results = {
        appDetails,
        competitorApps,
        keywords,
        rankingsForCompetitorApps,
        reviews,
        reviewsForCompetitorApps,
    };

    const resultsDir = path.join(new URL(import.meta.url).pathname, '..', 'results');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }

    // Generate filename with appId and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
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
            const jsonData = loadJsonData(jsonDataPath);
            const markdownTemplatePath = './results/report_template.md';
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

    console.log(chalk.magenta("Process completed successfully"));
}

main().catch(error => {
    console.error(chalk.red("An error occurred in the main function:"), error);
});
