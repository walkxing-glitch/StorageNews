import { calculateScore, getTopNews } from '../../src/services/scoring.js';
import { NewsItem } from '../../src/types/news.js';

describe('Scoring Service', () => {
  const mockNews: NewsItem = {
    id: 1,
    title: 'Dell EMC announces new storage solution',
    summary: 'Dell EMC has released a new enterprise storage solution with advanced features.',
    url: 'https://example.com/news1',
    published_at: new Date().toISOString(),
    language: 'en',
  };

  describe('calculateScore', () => {
    it('should calculate score for news with vendor and category', () => {
      const result = calculateScore(mockNews);

      expect(result.score).toBeGreaterThan(0);
      expect(result.scoreBreakdown).toBeDefined();
      expect(result.scoreBreakdown.baseScore).toBe(10);
      expect(result.scoreBreakdown.vendorWeight).toBeGreaterThan(0);
      expect(result.scoreBreakdown.categoryWeight).toBeGreaterThan(0);
    });

    it('should apply keyword bonuses', () => {
      const newsWithKeywords: NewsItem = {
        ...mockNews,
        title: 'Revolutionary AI-powered storage breakthrough',
        summary: 'New AI technology transforms data storage capabilities.',
      };

      const result = calculateScore(newsWithKeywords);
      expect(result.score).toBeGreaterThan(10); // Should have keyword bonus
    });

    it('should handle news without vendor or category', () => {
      const newsWithoutMetadata: NewsItem = {
        ...mockNews,
        vendor: undefined,
        category: undefined,
      };

      const result = calculateScore(newsWithoutMetadata);
      expect(result.score).toBeGreaterThan(0);
      expect(result.scoreBreakdown.vendorWeight).toBe(0.9); // Default weight
    });

    it('should apply recency bonus for recent news', () => {
      const recentNews: NewsItem = {
        ...mockNews,
        published_at: new Date().toISOString(), // Very recent
      };

      const result = calculateScore(recentNews);
      expect(result.scoreBreakdown.freshnessScore).toBe(10); // Max freshness score
    });
  });

  describe('getTopNews', () => {
    const mockNewsList: NewsItem[] = [
      { ...mockNews, id: 1, title: 'Dell EMC Acquisition', vendor: 'Dell EMC', category: 'Acquisition' },
      { ...mockNews, id: 2, title: 'NetApp Product Launch', vendor: 'NetApp', category: 'Product' },
      { ...mockNews, id: 3, title: 'Pure Storage AI Revolution', vendor: 'Pure Storage', category: 'Technology' },
      { ...mockNews, id: 4, title: 'Micron Quarter Results', vendor: 'Micron', category: 'Financial' },
    ];

    it('should return top N news sorted by score', async () => {
      const topNews = await getTopNews(mockNewsList, 3);

      expect(topNews).toHaveLength(3);
      // Verify sorting: score should be descending
      expect(topNews[0].score).toBeGreaterThanOrEqual(topNews[1].score);
      expect(topNews[1].score).toBeGreaterThanOrEqual(topNews[2].score);
    });

    it('should return all news if N is larger than available', async () => {
      const topNews = await getTopNews(mockNewsList, 10);

      expect(topNews).toHaveLength(4);
    });

    it('should handle empty news list', async () => {
      const topNews = await getTopNews([], 5);

      expect(topNews).toHaveLength(0);
    });
  });
});
