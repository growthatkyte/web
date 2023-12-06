import puppeteer from 'puppeteer';
import fs from 'fs';
import inquirer from 'inquirer';
import OpenAI from 'openai';
import { SingleBar, Presets } from 'cli-progress';
import chalk from 'chalk';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
});

async function scrapeGoogle(query, progressBar) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    await page.waitForSelector('div#search');

    const searchResults = await page.evaluate(() => {
        const results = Array.from(document.querySelectorAll('div.g')).map(item => ({
            title: item.querySelector('h3')?.innerText || '',
            description: item.querySelector('.VwiC3b')?.innerText || '',
            url: item.querySelector('.yuRUbf a')?.href || ''
        }));

        return results;
    });

    async function extractContent(url) {
        const contentPage = await browser.newPage();
        await contentPage.goto(url, { waitUntil: 'domcontentloaded' });
        const contentData = await contentPage.evaluate(() => {
            const pageTitle = document.title;
            const bodyText = document.body.innerText;
            return { pageTitle, bodyText };
        });
        await contentPage.close();
        return contentData;
    }

    for (const result of searchResults) {
        if (result.url) {
            const contentData = await extractContent(result.url);
            result.pageTitle = contentData.pageTitle;
            result.bodyText = contentData.bodyText;
        }
    }

    const paaSelectors = await page.$$('[jsname="Q8Kwad"]');
    for (const selector of paaSelectors) {
        await selector.click();
        await new Promise(r => setTimeout(r, 3000));
    }

    const peopleAlsoAsk = await page.evaluate(() => {
        const paaNodes = document.querySelectorAll('div.related-question-pair');
        let paaData = [];
        paaNodes.forEach(node => {
            const question = node.querySelector('div')?.innerText || '';
            const answer = node.querySelector('div[data-attrid="wa:/description"]')?.innerText || '';
            if (question && answer) {
                paaData.push({ question, answer });
            }
        });
        return paaData;
    });

    progressBar.increment();

    await browser.close();
    return { searchResults, peopleAlsoAsk };
}


async function analyzeWithOpenAI(messages) {
    try {
        // Ensure all message contents are valid strings
        messages.forEach(message => {
            if (typeof message.content !== 'string') {
                throw new Error(`Invalid content in messages: expected a string, got ${typeof message.content}`);
            }
        });

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: messages,
            max_tokens: 1024
        });


        if (response && response.choices && response.choices.length > 0 && response.choices[0].message) {
            const analysisText = response.choices[0].message.content;
            return analysisText.trim();
        } else {
            console.error(chalk.red("Unexpected response structure:"), response);
            return "Error: Unexpected response structure.";
        }
    } catch (error) {
        console.error(chalk.red("Error in analyzeWithOpenAI:"), error);
        throw error;
    }
}

async function main() {
    const progressBar = new SingleBar({
        format: 'Progress |' + chalk.cyan('{bar}') + '| {percentage}% || {status}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    }, Presets.shades_classic);

    progressBar.start(100, 0, { status: 'Analyzing...' });

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'query',
            message: '👋 I\'m ready to help. What query are we running?',
            validate: input => input !== '' ? true : 'Please enter a query.'
        },
        {
            type: 'confirm',
            name: 'addPiAIQuestions',
            message: '👋 Do you want to add pi.ai questions?',
            default: false
        },
        {
            type: 'input',
            name: 'piAIQuestions',
            message: '👋 Enter your pi.ai questions, separated by commas:',
            when: (answers) => answers.addPiAIQuestions,
            filter: (input) => input.split(',').map(question => question.trim())
        }
    ]);

    progressBar.update(10, { status: 'Input received' });
    progressBar.update(15, { status: 'Scraping Google...' });
    const data = await scrapeGoogle(answers.query, progressBar);
    progressBar.update(40, { status: 'Google Scraping Complete' });

    let paaText = data.peopleAlsoAsk.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
    let piQuestionsText = answers.piAIQuestions ? answers.piAIQuestions.join('\n') : '';

    let openAIPrompt = `You'll use ${paaText} as well as ${piQuestionsText} to determine if the competitors are covering that information Google deems relevant for the subject. 
                        You'll then create a list of PROs and CONs, highlighting what they are covering in their content and what they are not.`;
    openAIPrompt = openAIPrompt.replace('{PAA}', paaText).replace('{PI}', piQuestionsText);

    let structuredData = {
        ProjectName: answers.query,
        PiAIQuestions: answers.piAIQuestions || [],
        PeopleAlsoAsk: data.peopleAlsoAsk,
        Competitors: data.searchResults.map((result, index) => ({
            Name: `Competitor ${index + 1}`,
            Details: result
        }))
    };

    let incrementPerCompetitor = 30 / structuredData.Competitors.length; // Adjust based on number of competitors
    for (let i = 0; i < structuredData.Competitors.length; i++) {
        const competitorText = structuredData.Competitors[i].Details.bodyText;
        const messages = [
            { role: "system", content: "You are a Search Engine Optimization Specialist." },
            { role: "user", content: openAIPrompt },
            { role: "assistant", content: competitorText }
        ];

        progressBar.increment(incrementPerCompetitor, { status: `Analyzing Competitor ${i + 1}` });

        const analysis = await analyzeWithOpenAI(messages, progressBar);
        structuredData.Competitors[i].AIAanalysis = analysis;
    }

    fs.writeFileSync('structuredResults.json', JSON.stringify(structuredData, null, 2));

    progressBar.update(80, { status: 'Results Saved' });


    const secondAnalysisPrompt = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'conductSecondAnalysis',
            message: 'Do you want to conduct a second AI analysis?',
            default: false
        }
    ]);

    if (secondAnalysisPrompt.conductSecondAnalysis) {
        const structuredData = JSON.parse(fs.readFileSync('structuredResults.json', 'utf8'));

        let aiAnalysisText = structuredData.Competitors.map(comp => comp.AIAanalysis).join('\n\n');
        let secondAIPrompt = `Based on ${paaText} and ${piQuestionsText} as well as the following AI analysis conducted for each Competitor:\n\n${aiAnalysisText}\n\nOutline the content structure for an optimized landing page that'll add more value to users and rank higher on Google.`;

        const messages = [
            { role: "system", content: "You are a Content Strategist." },
            { role: "user", content: secondAIPrompt }
        ];

        progressBar.update(90, { status: 'Conducting Second AI Analysis' });
        const secondAnalysis = await analyzeWithOpenAI(messages, progressBar);
        progressBar.update(100, { status: 'Process Complete' });
        progressBar.stop();

        console.log(chalk.green('Second AI Analysis:'), secondAnalysis);
    }
}

main();
