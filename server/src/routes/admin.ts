import { Router } from 'express';
import { getDailyPushNewsList, triggerDailyPush } from '../jobs/scheduler.js';
import { testMessageFormat } from '../services/messenger.js';
import { formatDailyNews } from '../services/messenger.js';

const router = Router();

/**
 * 手动触发每日推送
 * POST /api/admin/trigger-daily-push
 */
router.post('/trigger-daily-push', async (req, res) => {
    try {
        const result = await triggerDailyPush();

        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                data: {
                    newsCount: result.topNews?.length || 0,
                    topNews: result.topNews
                }
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.message
            });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 预览消息格式
 * GET /api/admin/preview-message
 */
router.get('/preview-message', (req, res) => {
    try {
        const message = testMessageFormat();
        
        res.json({
            success: true,
            message: 'Message format preview generated successfully',
            data: {
                message: message,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 预览真实每日推送内容（不发送）
 * GET /api/admin/preview-daily-push
 */
router.get('/preview-daily-push', async (req, res) => {
    try {
        const rows = await getDailyPushNewsList();
        const items = rows.map((r) => ({
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

        const message = formatDailyNews(items);

        res.json({
            success: true,
            message: 'Daily push preview generated successfully',
            data: {
                newsCount: rows.length,
                message,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
