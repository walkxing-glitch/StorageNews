import { pool } from '../config/database.js';
import CryptoJS from 'crypto-js';
import rules from '../config/rules.json';
import { NewsItem } from '../types/news.js';
export { NewsItem };
import { calculateScore } from '../services/scoring.js';
import { summarizeNews } from '../services/ai.js';

const { vendorKeywords: STORAGE_VENDORS, categoryKeywords: CATEGORY_KEYWORDS } = rules as any;

// 生成新闻哈希（用于去重）
export function generateHash(title: string, url?: string): string {
  const content = `${title.toLowerCase().trim()}|${url || ''}`;
  return CryptoJS.SHA256(content).toString();
}

// 自动识别厂商
export function detectVendor(title: string, content?: string): string | null {
  const text = `${title} ${content || ''}`.toLowerCase();

  for (const [vendor, keywords] of Object.entries(STORAGE_VENDORS)) {
    for (const keyword of keywords as string[]) {
      if (text.includes(keyword.toLowerCase())) {
        return vendor;
      }
    }
  }
  return null;
}

// 自动分类
export function detectCategory(title: string, content?: string): string {
  const text = `${title} ${content || ''}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords as string[]) {
      if (text.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  return 'General';
}

// 保存新闻（自动去重）
export async function saveNews(news: NewsItem): Promise<boolean> {
  const hash = generateHash(news.title, news.url);
  const vendor = news.vendor || detectVendor(news.title, news.content);
  const category = news.category || detectCategory(news.title, news.content);

  const scoredNews = calculateScore({
    ...news,
    vendor: vendor || undefined,
    category: category || undefined,
  });

  // AI Summary for high value news
  let summaryCn = news.summary_cn;
  if (!summaryCn && scoredNews.score > 40) {
    console.log(`[AI] Generating summary for: ${news.title} (Score: ${scoredNews.score})`);
    summaryCn = await summarizeNews(news.title, news.content || news.summary || '');
  }

  try {
    await pool.query(
      `INSERT INTO news (title, summary, content, url, image_url, source_name, vendor, category, language, published_at, hash, score, score_breakdown, summary_cn)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (hash)        DO UPDATE SET 
         score = EXCLUDED.score, 
         score_breakdown = EXCLUDED.score_breakdown,
         summary_cn = EXCLUDED.summary_cn,
         image_url = COALESCE(EXCLUDED.image_url, news.image_url)`,
      [
        news.title,
        news.summary,
        news.content,
        news.url,
        news.image_url,
        news.source_name,
        vendor,
        category,
        news.language || 'en',
        news.published_at || new Date(),
        hash,
        scoredNews.score,
        JSON.stringify(scoredNews.scoreBreakdown),
        summaryCn,
      ]
    );
    return true;
  } catch (error) {
    console.error('Error saving news:', error);
    return false;
  }
}

// 获取新闻列表
export async function getNews(options: {
  limit?: number;
  offset?: number;
  vendor?: string;
  category?: string;
}): Promise<NewsItem[]> {
  const { limit = 50, offset = 0, vendor, category } = options;

  let query = 'SELECT * FROM news WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (vendor) {
    query += ` AND vendor = $${paramIndex++}`;
    params.push(vendor);
  }

  if (category) {
    query += ` AND category = $${paramIndex++}`;
    params.push(category);
  }

  query += ` ORDER BY score DESC, published_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
}

// 获取今日新闻（用于评分和推送）
export async function getTodayNews(): Promise<NewsItem[]> {
  const result = await pool.query(
    `SELECT * FROM news 
     WHERE published_at > NOW() - INTERVAL '24 hours'
     ORDER BY published_at DESC`
  );
  return result.rows;
}

// 获取统计数据
export async function getStats(): Promise<{
  total: number;
  today: number;
  byVendor: Record<string, number>;
  byCategory: Record<string, number>;
}> {
  const totalResult = await pool.query('SELECT COUNT(*) FROM news');
  const todayResult = await pool.query(
    "SELECT COUNT(*) FROM news WHERE created_at > CURRENT_DATE"
  );
  const vendorResult = await pool.query(
    'SELECT vendor, COUNT(*) as count FROM news WHERE vendor IS NOT NULL GROUP BY vendor ORDER BY count DESC'
  );
  const categoryResult = await pool.query(
    'SELECT category, COUNT(*) as count FROM news WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC'
  );

  return {
    total: parseInt(totalResult.rows[0].count),
    today: parseInt(todayResult.rows[0].count),
    byVendor: Object.fromEntries(vendorResult.rows.map(r => [r.vendor, parseInt(r.count)])),
    byCategory: Object.fromEntries(categoryResult.rows.map(r => [r.category, parseInt(r.count)])),
  };
}
