import axios from 'axios';
import { saveNews, NewsItem } from '../models/News.js';
import rules from '../config/rules.json';

const { newsApiQueries: NEWSAPI_QUERIES } = rules;

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2/everything';

interface NewsAPIArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string;
  source: { name: string };
  publishedAt: string;
}

export async function fetchFromNewsAPI(): Promise<number> {
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey || apiKey === 'your_newsapi_key_here') {
    console.log('NewsAPI: No API key configured (NEWSAPI_KEY), skipping...');
    return 0;
  }

  let totalSaved = 0;

  for (const query of NEWSAPI_QUERIES) {
    try {
      console.log(`NewsAPI: Fetching "${query}"...`);

      const response = await axios.get(NEWSAPI_BASE_URL, {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 20,
          apiKey,
        },
      });

      const articles: NewsAPIArticle[] = response.data.articles || [];

      for (const article of articles) {
        if (!article.title || article.title === '[Removed]') continue;

        const newsItem: NewsItem = {
          title: article.title,
          summary: article.description,
          content: article.content,
          url: article.url,
          image_url: article.urlToImage,
          source_name: article.source?.name || 'NewsAPI',
          published_at: new Date(article.publishedAt),
          language: 'en',
        };

        const saved = await saveNews(newsItem);
        if (saved) totalSaved++;
      }

      // 避免频繁请求
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
      if (error.response?.status === 426) {
        console.log('NewsAPI: Free tier requires HTTPS in production');
      } else if (error.response?.status === 401) {
        console.log('NewsAPI: Invalid API key');
      } else {
        console.error(`NewsAPI error for query "${query}":`, error.message);
      }
    }
  }

  console.log(`NewsAPI: Saved ${totalSaved} new articles`);
  return totalSaved;
}
