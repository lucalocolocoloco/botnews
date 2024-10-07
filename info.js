const axios = require('axios');
const moment = require('moment');

// API Key for NewsAPI
const apiKey = '8c829b1bdcfe4f12ada6688a781e12cc';

async function getNews(queries, language = 'en', fromDate = null, pageSize = 10) {
    const articles = [];
    if (!fromDate) {
        fromDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    }

    for (const query of queries) {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDate}&language=${language}&pageSize=${pageSize}&apiKey=${apiKey}`;
        
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                articles.push(...response.data.articles);
            } else {
                console.error(`Error fetching data for ${query}: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error fetching data for ${query}: ${error.message}`);
        }
    }
    return articles;
}

function isRelevantArticle(article, keywords) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    return keywords.some(keyword => title.includes(keyword.toLowerCase()) || description.includes(keyword.toLowerCase()));
}

function rankArticlesByDate(articles) {
    // Sort articles by published date (newest to oldest)
    return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

// Using relevant keywords related to technology
const keywords = ["technology", "AI", "artificial intelligence", "machine learning", "software update", 
                  "programming", "innovation", "tech news", "cybersecurity", "gadgets", "tech trends"];

(async function fetchNews() {
    while (true) {
        const articles = await getNews(keywords, 'en', null, 10);
        
        if (articles.length) {
            const relevantArticles = articles.filter(article => isRelevantArticle(article, keywords));
            
            if (relevantArticles.length) {
                // Ranking articles by published date
                const rankedArticles = rankArticlesByDate(relevantArticles);

                // Displaying articles ranked by publication date
                rankedArticles.forEach((article, idx) => {
                    const title = article.title;
                    const description = article.description || "";
                    const source = article.source.name;
                    const publishedAt = article.publishedAt;
                    const url = article.url || 'No URL Available';

                    console.log(`Rank ${idx + 1}:`);
                    console.log(`Title: ${title}`);
                    console.log(`Description: ${description}`);
                    console.log(`Source: ${source}`);
                    console.log(`Published At: ${publishedAt}`);
                    console.log(`Read more: ${url}`);
                    console.log("---");
                });
            } else {
                console.log("No relevant articles found.");
            }
        } else {
            console.log("No articles found.");
        }

        await new Promise(resolve => setTimeout(resolve, 3600000)); // Sleep for 1 hour
    }
})();
