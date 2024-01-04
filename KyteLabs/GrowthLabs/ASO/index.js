import express from 'express';
import bodyParser from 'body-parser';
import { fetchAppDetails, findTopCompetitors, fetchReviews, checkRank } from './src/appInfo.js';
import { fetchGoogleAdsKeywordIdeas } from './src/keywordAnalysis.js';

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.post('/fetch-app-details', async (req, res) => {
    const { platform, appId, country, languageCode } = req.body;
    try {
        const appDetails = await fetchAppDetails(platform, appId, country, languageCode);
        res.json(appDetails);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.post('/fetch-keywords', async (req, res) => {
    const { userKeywords, languageCode, country } = req.body;
    try {
        const keywords = await fetchGoogleAdsKeywordIdeas(userKeywords, languageCode, country);
        res.json(keywords);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.post('/fetch-reviews', async (req, res) => {
    const { platform, appId, country, languageCode } = req.body;
    try {
        const reviews = await fetchReviews(platform, appId, country, languageCode);
        res.json(reviews);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.post('/find-top-competitors', async (req, res) => {
    const { resultsDir, keyword, country, platform, languageCode } = req.body;
    try {
        const competitors = await findTopCompetitors(resultsDir, keyword, country, platform, languageCode);
        res.json(competitors);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.post('/check-rank', async (req, res) => {
    const { platform, appId, keywords, country, languageCode } = req.body;
    try {
        let ranks = {};
        for (const keyword of keywords) {
            const rank = await checkRank(platform, appId, keyword, country, languageCode);
            ranks[keyword] = rank;
        }
        res.json({ ranks });
    } catch (error) {
        res.status(500).send(error.toString());
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
