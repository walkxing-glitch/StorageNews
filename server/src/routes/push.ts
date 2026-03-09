import { Router } from 'express';
import { sendNewsNotification } from '../services/wechat.js';
import { getNews } from '../models/News.js';
import { triggerDailyPush } from '../jobs/scheduler.js';

const router = Router();

// 推送最新新闻到微信群
router.post('/wechat/latest', async (req, res) => {
  try {
    const news = await getNews({ limit: 1 });
    if (news.length === 0) {
      return res.json({ success: false, message: 'No news available' });
    }
    
    const latestNews = news[0];
    const success = await sendNewsNotification(
      latestNews.title,
      latestNews.source_name || 'Unknown',
      latestNews.url
    );
    
    if (success) {
      res.json({ success: true, message: 'News sent to WeChat group' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send to WeChat' });
    }
  } catch (error) {
    console.error('Error sending to WeChat:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 推送指定新闻
router.post('/wechat/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const news = await getNews({});
    const newsItem = news.find(item => item.id === parseInt(id));
    
    if (!newsItem) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    
    const success = await sendNewsNotification(
      newsItem.title,
      newsItem.source_name || 'Unknown',
      newsItem.url
    );
    
    if (success) {
      res.json({ success: true, message: 'News sent to WeChat group' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send to WeChat' });
    }
  } catch (error) {
    console.error('Error sending to WeChat:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// 手动触发每日Top10推送
router.post('/wechat/daily-top', async (req, res) => {
  try {
    const result = await triggerDailyPush();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        topNewsCount: result.topNews?.length || 0,
      });
    } else {
      res.json({
        success: false,
        message: result.message,
        topNews: result.topNews,
      });
    }
  } catch (error) {
    console.error('Error triggering daily push:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;