import request from 'supertest';
import express from 'express';
import newsRoutes from '../../src/routes/news.js';
import { pool } from '../../src/config/database.js';

// Pool is already mocked in setup.ts, but we override it here for specific route tests
// Use mockImplementation to ensure it always returns a valid object structure
(pool.query as jest.Mock).mockImplementation(() => Promise.resolve({ rows: [] }));

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
    });

    it('should handle vendor and category filters', async () => {
      (pool.query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const response = await request(app)
        .get('/api/news')
        .query({ vendor: 'Dell EMC', category: 'Product' });

      expect(response.status).toBe(200);
      // Implementation adds limit (50) and offset (0) as parameters 3 and 4
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('vendor = $1'),
        expect.arrayContaining(['Dell EMC', 'Product', 50, 0])
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
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '100' }] }) // total
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })  // today
        .mockResolvedValueOnce({ rows: [{ vendor: 'Dell EMC', count: '20' }] }) // vendor
        .mockResolvedValueOnce({ rows: [{ category: 'Product', count: '30' }] }); // category

      const response = await request(app)
        .get('/api/news/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(100);
      expect(response.body.data.today).toBe(10);
    });
  });

  describe('GET /api/news/analytics', () => {
    it('should return analytics successfully', async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ date: '2026-02-06', count: '10', avg_score: '45.5' }] })
        .mockResolvedValueOnce({ rows: [{ vendor: 'Dell EMC', count: '15', avg_score: '48.0', latest_news: '2026-02-06T10:00:00Z' }] })
        .mockResolvedValueOnce({ rows: [{ category: 'Product', count: '5', avg_score: '40.0' }] })
        .mockResolvedValueOnce({ rows: [{ source_name: 'Source', count: '3', avg_score: '35.0' }] });

      const response = await request(app)
        .get('/api/news/analytics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trends).toBeDefined();
    });
  });

  describe('GET /api/news/top', () => {
    it('should return top news', async () => {
      const mockTopNews = [
        { id: 1, title: 'Top News', score: 60, score_breakdown: {} },
      ];

      (pool.query as jest.Mock).mockResolvedValue({
        rows: mockTopNews,
      });

      const response = await request(app)
        .get('/api/news/top')
        .query({ limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});
