import { Router } from 'express';
import { getNews, getStats, getTodayNews } from '../models/News.js';
import rules from '../config/rules.json' with { type: 'json' };
const { vendorKeywords: STORAGE_VENDORS } = rules;
import { getTopNews, formatTopNewsMessage } from '../services/scoring.js';
import { pool } from '../config/database.js';

const router = Router();

// 获取新闻列表
router.get('/', async (req, res) => {
  try {
    const { limit, offset, vendor, category } = req.query;

    const rawNews = await getNews({
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
      vendor: vendor as string,
      category: category as string,
    });

    const news = rawNews.map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      url: item.url,
      image_url: item.image_url,
      source_name: item.source_name,
      vendor: item.vendor,
      category: item.category,
      published_at: item.published_at,
      score: item.score,
      score_breakdown: typeof item.score_breakdown === 'string' ? JSON.parse(item.score_breakdown) : item.score_breakdown,
      summary_cn: item.summary_cn
    }));

    res.json({ success: true, data: news });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch news' });
  }
});

// 获取统计数据
router.get('/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// 获取厂商列表
router.get('/vendors', (req, res) => {
  const vendors = Object.keys(STORAGE_VENDORS);
  res.json({ success: true, data: vendors });
});

// 获取今日Top新闻（带评分）
router.get('/top', async (req, res) => {
  try {
    const { limit } = req.query;
    const topN = limit ? parseInt(limit as string) : 10;

    const todayNews = await getTodayNews();
    const topNews = getTopNews(todayNews, topN);

    res.json({
      success: true,
      data: topNews,
      message: formatTopNewsMessage(topNews),
    });
  } catch (error) {
    console.error('Error fetching top news:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top news' });
  }
});

// 获取分析数据
router.get('/analytics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startDateStr = startDate.toISOString().split('T')[0];

    // Get news trends (daily counts)
    const trendsQuery = `
      SELECT
        DATE(published_at) as date,
        COUNT(*) as count,
        AVG(score) as avg_score
      FROM news
      WHERE DATE(published_at) >= $1
      GROUP BY DATE(published_at)
      ORDER BY date DESC
    `;

    const trendsResult = await pool.query(trendsQuery, [startDateStr]);

    // Get vendor analysis
    const vendorQuery = `
      SELECT
        vendor,
        COUNT(*) as count,
        AVG(score) as avg_score,
        MAX(published_at) as latest_news
      FROM news
      WHERE vendor IS NOT NULL AND DATE(published_at) >= $1
      GROUP BY vendor
      ORDER BY count DESC
      LIMIT 20
    `;

    const vendorResult = await pool.query(vendorQuery, [startDateStr]);

    // Get category analysis
    const categoryQuery = `
      SELECT
        category,
        COUNT(*) as count,
        AVG(score) as avg_score
      FROM news
      WHERE category IS NOT NULL AND DATE(published_at) >= $1
      GROUP BY category
      ORDER BY count DESC
    `;

    const categoryResult = await pool.query(categoryQuery, [startDateStr]);

    // Get source analysis
    const sourceQuery = `
      SELECT
        source_name,
        COUNT(*) as count,
        AVG(score) as avg_score
      FROM news
      WHERE source_name IS NOT NULL AND DATE(published_at) >= $1
      GROUP BY source_name
      ORDER BY count DESC
      LIMIT 15
    `;

    const sourceResult = await pool.query(sourceQuery, [startDateStr]);

    const analytics = {
      period,
      trends: trendsResult.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count),
        avgScore: parseFloat(row.avg_score || 0)
      })),
      vendors: vendorResult.rows.map(row => ({
        name: row.vendor,
        count: parseInt(row.count),
        avgScore: parseFloat(row.avg_score || 0),
        latestNews: row.latest_news
      })),
      categories: categoryResult.rows.map(row => ({
        name: row.category,
        count: parseInt(row.count),
        avgScore: parseFloat(row.avg_score || 0)
      })),
      sources: sourceResult.rows.map(row => ({
        name: row.source_name,
        count: parseInt(row.count),
        avgScore: parseFloat(row.avg_score || 0)
      }))
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

export default router;
