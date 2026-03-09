import cron from 'node-cron';
import { fetchFromNewsAPI } from '../services/newsapi.js';
import { fetchFromRSS } from '../services/rss.js';
import { pool } from '../config/database.js';
import { sendDailyNews } from '../services/messenger.js';
import { initWeChatBot } from '../services/wechaty-bot.js';

export type PushNewsRow = {
  id: number;
  title: string;
  url: string;
  score: number;
  summary_cn: string | null;
  source_name: string | null;
  vendor: string | null;
  category: string | null;
  published_at: string;
};

function toMessengerNewsItems(rows: PushNewsRow[]) {
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    score: r.score,
    summary_cn: r.summary_cn ?? undefined,
    source_name: r.source_name ?? undefined,
    vendor: r.vendor ?? undefined,
    category: r.category ?? undefined,
    published_at: r.published_at,
  }));
}

export function startScheduler() {
  console.log('Starting news fetch scheduler...');

  // 立即执行一次
  runAllFetchers();

  // Initialize WeChat Bot
  initWeChatBot().catch(error => {
    console.error('[Scheduler] Failed to initialize WeChat Bot:', error);
  });

  // NewsAPI: 每30分钟
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Scheduler] Running NewsAPI fetch...');
    await fetchFromNewsAPI();
  });

  // RSS: 每15分钟
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Scheduler] Running RSS fetch...');
    await fetchFromRSS();
  });

  // 每日推送: 每天早上9:00推送Top10新闻
  const pushTime = process.env.DAILY_PUSH_TIME || '09:00';
  const [hour, minute] = pushTime.split(':');
  cron.schedule(`${minute} ${hour} * * *`, async () => {
    console.log('[Scheduler] Running daily top news push...');
    await pushDailyTopNews();
  });

  console.log(`Scheduler started: NewsAPI every 30min, RSS every 15min, Daily push at ${pushTime}, WeChat Bot initialized`);
}

export async function getDailyPushNewsList(): Promise<PushNewsRow[]> {
  // 先尝试获取今天的 Top 10 新闻
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const todayResult = await pool.query(
    `SELECT id, title, url, score, summary_cn, source_name, vendor, category, published_at
     FROM news
     WHERE DATE(published_at) = $1
     ORDER BY score DESC
     LIMIT 10`,
    [todayStr]
  );

  let rows: PushNewsRow[] = todayResult.rows;

  // 如果今天新闻不足10条，获取最新的新闻补充
  if (rows.length < 10) {
    const latestResult = await pool.query(
      `SELECT id, title, url, score, summary_cn, source_name, vendor, category, published_at
       FROM news
       WHERE DATE(published_at) != $1
       ORDER BY published_at DESC, score DESC
       LIMIT ${10 - rows.length}`,
      [todayStr]
    );
    rows = [...rows, ...latestResult.rows];
  }

  return rows;
}

async function runAllFetchers() {
  console.log('[Scheduler] Initial fetch starting...');

  try {
    await Promise.all([
      fetchFromNewsAPI(),
      fetchFromRSS(),
    ]);
    console.log('[Scheduler] Initial fetch completed');
  } catch (error) {
    console.error('[Scheduler] Initial fetch error:', error);
  }
}

/**
 * 推送每日Top10新闻
 */
async function pushDailyTopNews() {
  try {
    const rows = await getDailyPushNewsList();

    if (rows.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      console.log(`[Scheduler] No news from ${todayStr} to push`);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    console.log(`[Scheduler] Pushing ${rows.length} top news from ${todayStr}...`);

    await sendDailyNews(toMessengerNewsItems(rows));

  } catch (error) {
    console.error('[Scheduler] Error pushing daily top news:', error);
  }
}

/**
 * 手动触发推送（供API调用）
 */
export async function triggerDailyPush(): Promise<{
  success: boolean;
  message: string;
  topNews?: any[];
}> {
  try {
    const rows = await getDailyPushNewsList();

    if (rows.length === 0) {
      return {
        success: false,
        message: `No news available`
      };
    }

    const items = toMessengerNewsItems(rows);
    await sendDailyNews(items);

    return {
      success: true,
      message: `Successfully sent ${items.length} news items`,
      topNews: items,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
}
