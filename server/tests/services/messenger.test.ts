import { formatDailyNews } from '../../src/services/messenger';
import { NewsItem } from '../../src/types/news';

describe('Messenger Service', () => {
  const mockNews: NewsItem[] = [
    {
      id: 1,
      title: 'Dell EMC launches new storage solution',
      url: 'https://example.com/news1',
      score: 55,
      summary_cn: 'Dell EMC发布了全新的企业级存储解决方案，性能提升50%，支持AI智能运算。',
      vendor: 'Dell EMC',
      category: 'Product',
      published_at: '2026-02-06T10:00:00Z',
      source_name: 'StorageNewsletter',
    },
    {
      id: 2,
      title: 'Western Digital reports Q2 earnings',
      url: 'https://example.com/news2',
      score: 45,
      summary_cn: '西部数据公布第二季度财报，营收同比增长25%，数据中心需求强劲。',
      vendor: 'Western Digital',
      category: 'Financial',
      published_at: '2026-02-06T14:00:00Z',
      source_name: 'Blocks and Files',
    },
    {
      id: 3,
      // 'ufs' keyword triggers Chinese title mapping
      title: 'Kioxia samples UFS 4.1 embedded flash memory',
      url: 'https://example.com/news3',
      score: 40,
      summary_cn: null, // Test fallback summary generation
      vendor: 'Kioxia',
      category: 'Product',
      published_at: '2026-02-06T16:00:00Z',
      source_name: 'StorageNewsletter',
    },
  ];

  describe('formatDailyNews', () => {
    it('should format news list into proper message structure', () => {
      const message = formatDailyNews(mockNews);

      // Check header
      expect(message).toContain('🔥 【存储今日头条】');
      expect(message).toContain('━━━━━━━━━━━━━━');

      // Check source labels are present in output
      expect(message).toContain('【StorageNewsletter】');
      expect(message).toContain('【Blocks and Files】');

      // Check summaries (from summary_cn)
      expect(message).toContain('Dell EMC发布了全新的企业级存储解决方案');
      expect(message).toContain('西部数据公布第二季度财报');

      // UFS keyword triggers mapped title
      expect(message).toContain('📡 【StorageNewsletter】 铠侠采样 UFS 4.1 嵌入式闪存');
    });

    it('should limit to 10 news items', () => {
      // Use 15 items with distinct titles to avoid deduplication
      const manyNews: NewsItem[] = Array.from({ length: 15 }, (_, i) => ({
        ...mockNews[0],
        id: i + 1,
        title: `Unique storage news item number ${i + 1}`,
      }));

      const message = formatDailyNews(manyNews);
      const lines = message.split('\n');
      const newsLines = lines.filter((line: string) => /^\d+\./.test(line));

      expect(newsLines).toHaveLength(10);
    });

    it('should handle news without source_name', () => {
      const newsWithoutSource = mockNews.map(item => ({
        ...item,
        source_name: undefined,
      }));

      const message = formatDailyNews(newsWithoutSource);
      expect(message).toContain('【Dell EMC】');
      expect(message).toContain('【Western Digital】');
    });

    it('should generate fallback summaries for news without summary_cn', () => {
      // Use a UFS/embedded flash title to trigger known fallback
      const newsWithoutSummary = [{
        ...mockNews[2], // 'Kioxia samples UFS 4.1 embedded flash memory'
        summary_cn: null,
      }];

      const message = formatDailyNews(newsWithoutSummary);
      // ufs/embedded flash keyword triggers this specific fallback
      expect(message).toContain('铠侠采样 QLC UFS 4.1 嵌入式闪存');
    });

    it('should handle empty news list', () => {
      const message = formatDailyNews([]);
      expect(message).toContain('存储今日头条');
      // Should still have basic structure even with no news
    });

    it('should deduplicate news with same title', () => {
      const duplicateNews = [
        mockNews[0],
        { ...mockNews[0], id: 999 }, // Same title, different ID
        mockNews[1],
      ];

      const message = formatDailyNews(duplicateNews);
      const lines = message.split('\n');
      const newsLines = lines.filter((line: string) => /^\d+\./.test(line));

      expect(newsLines).toHaveLength(2); // Should deduplicate
    });
  });
});
