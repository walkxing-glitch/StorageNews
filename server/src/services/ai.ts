import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 使用 AI 生成新闻摘要和中文翻译
 * 目前为 Mock 实现，准备好集成到主流程
 */
export async function summarizeNews(title: string, content: string): Promise<string> {
    const AI_API_KEY = process.env.AI_API_KEY;
    const AI_API_URL = process.env.AI_API_URL || 'https://api.deepseek.com/v1/chat/completions';

    if (!AI_API_KEY) {
        console.log('[AI] Skipping summary: AI_API_KEY not set.');
        return '';
    }

    try {
        const prompt = `
你是一位专业的 IT 存储架构师和行业分析师。
请针对以下存储行业新闻，用三句话总结其核心要点，并翻译为中文：

标题: ${title}
内容: ${content.substring(0, 2000)}

要求：
1. 第一句话：发生了什么（What happened）。
2. 第二句话：技术或市场影响（Impact）。
3. 第三句话：对读者的建议或后续关注点（Insight）。
请直接输出中文总结，不要包含其他文字。
`;

        const response = await axios.post(AI_API_URL, {
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${AI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        return response.data.choices[0].message.content.trim();
    } catch (error: any) {
        console.error('[AI] Error generating summary:', error.message);
        return '';
    }
}
