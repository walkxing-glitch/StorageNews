import { NewsItem, ScoredNewsItem } from '../types/news.js';
import rules from '../config/rules.json' with { type: 'json' };

const {
  sourceWeights: SOURCE_WEIGHTS,
  categoryWeights: CATEGORY_WEIGHTS,
  vendorWeights: VENDOR_WEIGHTS,
  highValueKeywords: HIGH_VALUE_KEYWORDS,
} = rules as any;

/**
 * 计算新闻价值分数
 * 评分维度：
 * 1. 基础分 (10分)
 * 2. 来源权重 (0.8-1.5倍)
 * 3. 分类权重 (0.8-1.5倍)
 * 4. 厂商权重 (1.0-1.3倍)
 * 5. 关键词加分 (最多+5分)
 * 6. 时效性分数 (0-10分，24小时内满分)
 */
export function calculateScore(news: NewsItem): ScoredNewsItem {
  const text = `${news.title} ${news.summary || ''} ${news.content || ''}`.toLowerCase();

  // 1. 基础分
  const baseScore = 10;

  // 2. 来源权重
  const sourceWeight = SOURCE_WEIGHTS[news.source_name || ''] || 1.0;

  // 3. 分类权重
  const categoryWeight = CATEGORY_WEIGHTS[news.category || 'General'] || 0.8;

  // 4. 厂商权重
  const vendorWeight = news.vendor ? (VENDOR_WEIGHTS[news.vendor] || 1.0) : 0.9;

  // 5. 关键词加分
  let keywordBonus = 0;
  for (const keyword of HIGH_VALUE_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      keywordBonus += 0.5;
    }
  }
  keywordBonus = Math.min(keywordBonus, 5); // 最多+5分

  // 6. 时效性分数 (24小时内满分10分，逐渐衰减)
  const publishedAt = news.published_at ? new Date(news.published_at) : new Date();
  const hoursAgo = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60);
  let freshnessScore: number;
  if (hoursAgo <= 24) {
    freshnessScore = 10;
  } else if (hoursAgo <= 48) {
    freshnessScore = 8;
  } else if (hoursAgo <= 72) {
    freshnessScore = 6;
  } else if (hoursAgo <= 168) { // 一周内
    freshnessScore = 4;
  } else {
    freshnessScore = 2;
  }

  // 计算总分
  const score = (baseScore + keywordBonus + freshnessScore) * sourceWeight * categoryWeight * vendorWeight;

  return {
    ...news,
    score: Math.round(score * 100) / 100, // 保留2位小数
    scoreBreakdown: {
      baseScore,
      sourceWeight,
      categoryWeight,
      vendorWeight,
      keywordBonus,
      freshnessScore,
    },
  };
}

/**
 * 获取今日Top N新闻
 */
export function getTopNews(newsList: NewsItem[], topN: number = 10): ScoredNewsItem[] {
  const scoredNews = newsList.map(news => calculateScore(news));

  // 按分数降序排序
  scoredNews.sort((a, b) => b.score - a.score);

  // 去重：同一厂商最多保留3条
  const vendorCount: Record<string, number> = {};
  const result: ScoredNewsItem[] = [];

  for (const news of scoredNews) {
    const vendor = news.vendor || 'Unknown';
    vendorCount[vendor] = (vendorCount[vendor] || 0) + 1;

    // 同一厂商最多3条，保证多样性
    if (vendorCount[vendor] <= 3) {
      result.push(news);
    }

    if (result.length >= topN) {
      break;
    }
  }

  return result;
}

/**
 * 格式化Top新闻为推送消息
 */
export function formatTopNewsMessage(topNews: ScoredNewsItem[]): string {
  const date = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let message = `## 📰 IT存储新闻日报 - ${date}\n\n`;
  message += `> 今日精选 Top ${topNews.length} 条高价值新闻\n\n`;

  topNews.forEach((news, index) => {
    const vendorTag = news.vendor ? `[${news.vendor}]` : '';
    const categoryTag = news.category ? `[${news.category}]` : '';
    message += `**${index + 1}. ${news.title}**\n`;
    message += `${vendorTag} ${categoryTag} | 来源: ${news.source_name} | 评分: ${news.score}\n`;
    if (news.url) {
      message += `[查看详情](${news.url})\n`;
    }
    message += '\n';
  });

  message += '---\n*IT存储新闻监控系统*';

  return message;
}
