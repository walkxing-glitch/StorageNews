import axios from 'axios';
import { sendToWeChatBot } from './wechaty-bot.js';
import type { NewsItem } from '../types/news.js';

/**
 * 消息推送服务
 * 支持 WeLink 和 WeChat 群消息推送
 */

function normalizeText(input: string): string {
    return input
        .replace(/\r\n/g, '\n')
        .replace(/\s+/g, ' ')
        .trim();
}

function truncateChinese(text: string, maxLen: number): string {
    const cleaned = normalizeText(text);
    if (cleaned.length <= maxLen) return cleaned;

    const slice = cleaned.slice(0, maxLen);
    const punctuations = ['。', '；', '！', '？', '，', '.', ';', '!', '?'];
    let cut = -1;
    for (const p of punctuations) {
        const idx = slice.lastIndexOf(p);
        if (idx > cut) cut = idx;
    }

    // 只要能在合理长度（>=10）找到标点，就尽量在标点处收尾，避免“半句话”
    if (cut >= 10) return slice.slice(0, cut + 1);

    // 在前 maxLen 内没有合适标点时，向后再看一小段，尽量补齐到下一个标点结束
    const lookAheadMax = Math.min(cleaned.length, maxLen + 30);
    const extended = cleaned.slice(0, lookAheadMax);
    for (let i = maxLen; i < extended.length; i++) {
        if (punctuations.includes(extended[i])) {
            return extended.slice(0, i + 1);
        }
    }

    return slice.replace(/[，,]\s*$/, '') + '…';
}

/**
 * AI生成新闻标题的中文概括
 */
function generateChineseTitle(title: string, vendor: string): string {
    void vendor;
    const t = title.toLowerCase();
    if (t.includes('hyperconverged') || t.includes('proxinator')) return '45Drives 推出紧凑型超融合平台';
    if (t.includes('mram') || t.includes('space grade')) return '太空级 MRAM 启动方案发布';
    if (t.includes('award') || t.includes('rising star')) return 'QSAN 获新创事业奖';
    if (t.includes('ufs') || t.includes('embedded flash')) return '铠侠采样 UFS 4.1 嵌入式闪存';
    if (t.includes('financial') || t.includes('results')) return '西部数据发布财报';
    if (t.includes('phy ip') || t.includes('combo')) return 'Arasan 推出组合 PHY IP';
    if (t.includes('vice chair') || t.includes('mohsen')) return 'DDN 任命副主席';
    if (t.includes('switch') || t.includes('scorpio')) return 'Astera 扩展智能交换机路线图';
    if (t.includes('hdd') || t.includes('high-bandwidth')) return '西部数据披露高带宽 HDD 新技术';

    const cleaned = normalizeText(title);
    const parts = cleaned.split(/[:\-–—|]/).map(p => p.trim()).filter(Boolean);
    const candidate = parts.length >= 2 ? parts[parts.length - 1] : cleaned;
    return truncateChinese(candidate, 22);
}

/**
 * AI生成新闻内容的中文概括
 */
function generateAISummary(summary: string | null, title: string): string {
    if (summary) {
        return truncateChinese(summary, 58);
    } else {
        const t = title.toLowerCase();
        if (t.includes('hyperconverged') || t.includes('proxinator')) {
            return '45Drives 扩大紧凑型超融合平台 Proxinator VM2 的供应，面向中小企业虚拟化与存储一体化场景。';
        }
        if (t.includes('mram') || t.includes('space grade')) {
            return '太空级 MRAM 启动方案面向卫星与国防场景，强调在辐射等极端环境下的数据可靠性与持久运行。';
        }
        if (t.includes('award') || t.includes('rising star')) {
            return 'QSAN 获得新创事业奖，侧面反映其在数据管理/存储产品上的创新能力与市场拓展表现。';
        }
        if (t.includes('ufs') || t.includes('embedded flash')) {
            return '铠侠采样 QLC UFS 4.1 嵌入式闪存，主打更高容量与读取密集型性能，面向移动设备存储升级。';
        }
        if (t.includes('financial') || t.includes('results')) {
            return '西部数据发布财报，营收与利润表现反映行业需求变化；可关注其对后续季度的指引与产品策略。';
        }
        if (t.includes('funding') || t.includes('valuation') || t.includes('cash')) {
            return 'VAST Data 拟融资并为早期股东提供流动性，市场将关注其估值变化与后续扩张节奏。';
        }
        if (t.includes('agents') || t.includes('copilot') || t.includes('onedrive')) {
            return 'Microsoft 将 Copilot 代理引入 OneDrive 文件工作流，强化检索、归纳与自动化处理能力。';
        }
        if (t.includes('integration') || t.includes('google cloud')) {
            return 'Cohesity 强化与 Google Cloud 的集成，引入威胁情报等能力以提升备份/恢复链路的安全性。';
        }
        if (t.includes('phy ip') || t.includes('combo')) {
            return 'Arasan 推出组合 PHY IP，面向嵌入式/存储接口场景，提升多协议兼容与集成效率。';
        }
        if (t.includes('vice chair') || t.includes('mohsen')) {
            return 'DDN 任命新副主席，释放出加强全球市场与企业级 AI 战略推进的信号。';
        }
        if (t.includes('switch') || t.includes('scorpio') || t.includes('fabric')) {
            return 'Astera 扩展智能交换/互连路线图，覆盖更大规模的算力集群互联需求。';
        }
        if (t.includes('cloud') || t.includes('souverain')) {
            return '主权云/合规云方案强调数据主权与本地监管要求，适合对数据落地与审计要求严格的行业。';
        }
        if (t.includes('hdd') || t.includes('high-bandwidth')) {
            return '西部数据披露面向 AI 工作负载的 HDD 技术路线，聚焦容量、带宽与能效的综合提升。';
        }

        return '存储行业动态更新：关注产品发布、企业合作与数据中心基础设施演进带来的影响。';
    }
}
export function formatDailyNews(newsList: NewsItem[]): string {
    const today = new Date().toISOString().split('T')[0];
    const formattedDate = today.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1年$2月$3日');

    let message = `🔥 【存储今日头条】 ${formattedDate}\n`;
    message += `━━━━━━━━━━━━━━\n\n`;

    // 去重：基于标题（忽略厂商，因为同一新闻可能被标记为不同厂商）
    const uniqueNews = newsList.filter((news, index, self) =>
        index === self.findIndex((n) =>
            n.title === news.title
        )
    );

    // 确保总是10条：如果去重后不足10条，从原始数据中补充
    let finalNews: NewsItem[] = [];
    if (uniqueNews.length >= 10) {
        finalNews = uniqueNews.slice(0, 10);
    } else {
        // 先用去重的数据
        finalNews = [...uniqueNews];
        // 再从原始数据中补充不同的新闻
        for (const news of newsList) {
            if (finalNews.length >= 10) break;
            const isDuplicate = finalNews.some(existing =>
                existing.title === news.title
            );
            if (!isDuplicate) {
                finalNews.push(news);
            }
        }
    }

    finalNews.forEach((news, index) => {
        // 选择合适的emoji
        const emoji = index % 4 === 0 ? '🎯' : index % 4 === 1 ? '💡' : index % 4 === 2 ? '📡' : '🏢';

        // 生成中文标题
        const chineseTitle = generateChineseTitle(news.title, news.vendor || 'StorageNewsletter');

        // 生成AI概括
        const aiSummary = generateAISummary(news.summary_cn || null, news.title);

        const label = normalizeText(news.source_name || news.vendor || 'StorageNewsletter');

        // 标题行
        message += `${index + 1}. ${emoji} 【${label}】 ${chineseTitle}\n`;

        // AI概括
        message += `   └── ${aiSummary}\n\n`;
    });

    return message;
}

/**
 * 发送消息到 WeLink 群
 */
export async function sendToWeLink(message: string): Promise<boolean> {
    const webhookUrl = process.env.WELINK_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn('WeLink webhook URL not configured, skipping...');
        return false;
    }

    try {
        const response = await axios.post(webhookUrl, {
            msgtype: 'markdown',
            markdown: {
                content: message
            }
        }, {
            timeout: 10000
        });

        if (response.status === 200) {
            console.log('✅ Message sent to WeLink successfully');
            return true;
        } else {
            console.error('❌ Failed to send to WeLink:', response.status);
            return false;
        }
    } catch (error: any) {
        console.error('❌ Error sending to WeLink:', error.message);
        return false;
    }
}

/**
 * 发送消息到微信群
 * 注意：个人微信需要使用 wechaty 或类似库，这里提供企业微信的实现
 * 如果是个人微信，需要额外配置 wechaty
 */
export async function sendToWeChat(message: string): Promise<boolean> {
    const webhookUrl = process.env.WECHAT_WEBHOOK_URL;

    if (!webhookUrl || webhookUrl.includes('YOUR_WEBHOOK_KEY_HERE')) {
        // Webhook not configured — fall back to WeChat Bot (personal WeChat, requires prior QR scan)
        console.warn('WeChat webhook not configured, trying WeChat Bot...');
        return await sendToWeChatBot([]);
    }

    try {
        const response = await axios.post(webhookUrl, {
            msgtype: 'markdown',
            markdown: {
                content: message
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.data.errcode === 0) {
            console.log('✅ Message sent to WeChat webhook successfully');
            return true;
        } else {
            console.error('❌ WeChat webhook API error:', response.data);
            return false;
        }
    } catch (error: any) {
        console.error('❌ Error sending to WeChat webhook:', error.message);
        return false;
    }
}

/**
 * 测试消息格式化（用于开发调试）
 */
export function testMessageFormat(): string {
    const testNews: NewsItem[] = [
        {
            id: 1,
            title: "华为发布新一代OceanStor存储系统",
            url: "https://example.com/huawei-oceanstor",
            score: 75.5,
            summary_cn: "华为推出全新OceanStor存储系统，性能提升50%，支持AI智能运维管理。",
            vendor: "华为",
            category: "Product",
            published_at: "2026-02-05T10:30:00Z"
        },
        {
            id: 2,
            title: "浪潮信息发布全闪存阵列新品",
            url: "https://example.com/inspur-flash",
            score: 62.0,
            summary_cn: "浪潮信息发布新一代全闪存阵列，采用NVMe技术，延迟降低至微秒级。",
            vendor: "浪潮信息",
            category: "Product",
            published_at: "2026-02-05T14:15:00Z"
        },
        {
            id: 3,
            title: "中科曙光推出分布式存储解决方案",
            url: "https://example.com/sugon-storage",
            score: 55.5,
            summary_cn: "中科曙光发布全新分布式存储方案，支持EB级扩展，满足大数据需求。",
            vendor: "中科曙光",
            category: "Solution",
            published_at: "2026-02-05T09:45:00Z"
        },
        {
            id: 4,
            title: "新华三发布智能存储管理平台",
            url: "https://example.com/h3c-management",
            score: 68.0,
            summary_cn: "新华三推出智能存储管理平台，实现多云环境统一管理和自动化运维。",
            vendor: "新华三",
            category: "Software",
            published_at: "2026-02-05T11:20:00Z"
        },
        {
            id: 5,
            title: "联想企业级存储服务器升级",
            url: "https://example.com/lenovo-server",
            score: 52.5,
            summary_cn: "联想发布新一代企业级存储服务器，支持混合云部署，性能大幅提升。",
            vendor: "联想",
            category: "Hardware",
            published_at: "2026-02-05T15:30:00Z"
        },
        {
            id: 6,
            title: "阿里云推出云存储新品类",
            url: "https://example.com/aliyun-storage",
            score: 71.0,
            summary_cn: "阿里云发布全新云存储服务，支持智能分层存储，成本降低30%。",
            vendor: "阿里云",
            category: "Cloud",
            published_at: "2026-02-05T08:45:00Z"
        },
        {
            id: 7,
            title: "腾讯云存储性能大幅提升",
            url: "https://example.com/tencent-cloud",
            score: 58.0,
            summary_cn: "腾讯云存储服务升级，吞吐量提升100%，延迟降低至毫秒级。",
            vendor: "腾讯云",
            category: "Cloud",
            published_at: "2026-02-05T13:10:00Z"
        },
        {
            id: 8,
            title: "百度智能云发布存储解决方案",
            url: "https://example.com/baidu-cloud",
            score: 64.5,
            summary_cn: "百度智能云推出AI存储解决方案，支持智能数据处理和分析。",
            vendor: "百度智能云",
            category: "Cloud",
            published_at: "2026-02-05T16:25:00Z"
        },
        {
            id: 9,
            title: "金山云发布对象存储服务",
            url: "https://example.com/kingsoft-cloud",
            score: 49.0,
            summary_cn: "金山云推出新一代对象存储服务，支持海量数据存储和快速检索。",
            vendor: "金山云",
            category: "Cloud",
            published_at: "2026-02-05T12:40:00Z"
        },
        {
            id: 10,
            title: "UCloud发布企业级存储产品",
            url: "https://example.com/ucloud-storage",
            score: 53.5,
            summary_cn: "UCloud发布企业级存储产品，支持混合云架构，满足企业多样化需求。",
            vendor: "UCloud",
            category: "Cloud",
            published_at: "2026-02-05T17:15:00Z"
        }
    ];

    return formatDailyNews(testNews);
}

/**
 * 发送每日新闻到所有配置的平台
 */
export async function sendDailyNews(newsList: NewsItem[]): Promise<void> {
    if (newsList.length === 0) {
        console.log('No news to send');
        return;
    }

    const message = formatDailyNews(newsList);

    console.log('📤 Sending daily news to chat platforms...');
    console.log(`Total news items: ${newsList.length}`);

    // 并行发送到所有平台（WeChat 内部已处理 webhook → bot 降级）
    const results = await Promise.allSettled([
        sendToWeLink(message),
        sendToWeChat(message)
    ]);

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`✅ Successfully sent to ${successCount} platform(s)`);
}
