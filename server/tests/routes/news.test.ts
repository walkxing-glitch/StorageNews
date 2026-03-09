import request from 'supertest';
import express from 'express';
import newsRoutes from '../src/routes/news';
import { pool } from '../src/config/database';

// Mock the database
jest.mock('../src/config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/news', newsRoutes);

describe('News API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/news', () => {
    it('should return news list successfully', async () => {
      const mockNews = [
        {
          id: 1,
          title: 'Test News',
          summary: 'Test summary',
          url: 'https://example.com',
          source_name: 'Test Source',
          vendor: 'Test Vendor',
          category: 'Product',
          published_at: '2026-02-06T10:00:00Z',
          score: 50,
          score_breakdown: { baseScore: 10, keywordBonus: 0 },
          summary_cn: '测试摘要',
        },
      ];

      (pool.query as jest.Mock).mockResolvedValue({
        rows: mockNews,
      });

      const response = await request(app)
        .get('/api/news')
        .query({ limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Test News');
    });

    it('should handle vendor and category filters', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const response = await request(app)
        .get('/api/news')
        .query({ vendor: 'Dell EMC', category: 'Product' });

      expect(response.status).toBe(200);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('vendor = $1'),
        ['Dell EMC']
      );
    });

    it('should handle database errors', async () => {
      (pool.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/news');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/news/stats', () => {
    it('should return stats successfully', async () => {
      const mockStats = {
        total: 100,
        today: 10,
        byVendor: { 'Dell EMC': 20, 'NetApp': 15 },
        byCategory: { 'Product': 30, 'Financial': 25 },
      };

      (pool.query as jest.Mock).mockResolvedValue({
        rows: [mockStats],
      });

      const response = await request(app)
        .get('/api/news/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(100);
    });
  });

  describe('GET /api/news/analytics', () => {
    it('should return analytics for 7 days by default', async () => {
      const mockTrends = [
        { date: '2026-02-06', count: 10, avg_score: 45.5 },
        { date: '2026-02-05', count: 8, avg_score: 42.0 },
      ];

      const mockVendors = [
        { vendor: 'Dell EMC', count: 15, avg_score: 48.0, latest_news: '2026-02-06T10:00:00Z' },
      ];

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: mockTrends })
        .mockResolvedValueOnce({ rows: mockVendors })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/news/analytics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('7d');
      expect(response.body.data.trends).toHaveLength(2);
      expect(response.body.data.vendors).toHaveLength(1);
    });

    it('should support different time periods', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/news/analytics')
        .query({ period: '30d' });

      expect(response.status).toBe(200);
      expect(response.body.data.period).toBe('30d');
    });
  });

  describe('GET /api/news/top', () => {
    it('should return top news', async () => {
      const mockTopNews = [
        { id: 1, title: 'Top News', score: 60 },
        { id: 2, title: 'Second News', score: 55 },
      ];

      (pool.query as jest.Mock).mockResolvedValue({
        rows: mockTopNews,
      });

      const response = await request(app)
        .get('/api/news/top')
        .query({ limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });
});
