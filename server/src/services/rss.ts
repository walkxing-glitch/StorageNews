import Parser from 'rss-parser';
import { saveNews, NewsItem } from '../models/News.js';
import rules from '../config/rules.json' with { type: 'json' };

const { rssSources: RSS_SOURCES } = rules;

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'StorageNewsMonitor/1.0',
  },
});

export async function fetchFromRSS(): Promise<number> {
  let totalSaved = 0;

  for (const source of RSS_SOURCES) {
    if (!source.enabled) continue;

    try {
      console.log(`RSS: Fetching from ${source.name} (${source.language})...`);

      const feed = await parser.parseURL(source.url);

      for (const item of feed.items) {
        if (!item.title) continue;

        // Try multiple ways to get an image
        let imageUrl = item.enclosure?.url;

        // 1. Try media:content if available (Parser adds this to the item)
        if (!imageUrl && (item as any)['media:content']) {
          imageUrl = (item as any)['media:content'].$.url;
        }

        // 2. Try to parse from HTML content if still no image
        if (!imageUrl) {
          const content = item.content || item.contentSnippet || '';
          const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
          if (imgMatch) {
            imageUrl = imgMatch[1];
          }
        }

        const newsItem: NewsItem = {
          title: item.title,
          summary: item.contentSnippet || item.content,
          content: item.content,
          url: item.link,
          image_url: imageUrl,
          source_name: source.name,
          published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
          language: source.language || 'en',
        };

        const saved = await saveNews(newsItem);
        if (saved) totalSaved++;
      }

    } catch (error: any) {
      console.error(`RSS error for ${source.name}:`, error.message);
    }
  }

  console.log(`RSS: Saved ${totalSaved} new articles`);
  return totalSaved;
}
