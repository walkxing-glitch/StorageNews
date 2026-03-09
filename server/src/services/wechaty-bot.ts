import { WechatyBuilder, ScanStatus, Contact, Message, Room } from 'wechaty';
import type { Wechaty } from 'wechaty';
import * as QRCode from 'qrcode-terminal';
import { NewsItem } from '../types/news.js';

class WeChatBot {
  private bot: Wechaty;
  private targetGroupName: string;
  private isReady = false;

  constructor() {
    this.targetGroupName = process.env.WECHAT_TARGET_GROUP || 'StorageNews情报站';

    this.bot = WechatyBuilder.build({
      name: 'StorageNewsBot',
      puppet: 'wechaty-puppet-wechat',
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.bot
      .on('scan', (qrcode: string, status: ScanStatus) => {
        console.log(`[WeChat Bot] Scan QR Code to login: ${status}`);
        if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
          QRCode.generate(qrcode, { small: true });
          console.log('[WeChat Bot] QR Code generated. Please scan with WeChat app.');
        }
      })
      .on('login', (user: Contact) => {
        console.log(`[WeChat Bot] User ${user.name()} logged in`);
        this.isReady = true;
      })
      .on('logout', (user: Contact) => {
        console.log(`[WeChat Bot] User ${user.name()} logged out`);
        this.isReady = false;
      })
      .on('message', async (message: Message) => {
        await this.handleMessage(message);
      })
      .on('error', (error: unknown) => {
        console.error('[WeChat Bot] Error:', error);
      });
  }

  private async handleMessage(message: Message) {
    const text = message.text();
    const room = message.room();
    const from = message.from();

    if (text === 'ping' && from && !room) {
      await message.say('pong - StorageNews Bot is online');
    }
  }

  public async start(): Promise<void> {
    if (!process.env.WECHAT_BOT_ENABLED || process.env.WECHAT_BOT_ENABLED !== 'true') {
      console.log('[WeChat Bot] Bot disabled in configuration, skipping...');
      return;
    }

    try {
      console.log('[WeChat Bot] Starting WeChat Bot...');
      await this.bot.start();
    } catch (error) {
      console.error('[WeChat Bot] Failed to start:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (this.bot) {
      console.log('[WeChat Bot] Stopping WeChat Bot...');
      await this.bot.stop();
      this.isReady = false;
    }
  }

  public async sendDailyNews(newsItems: NewsItem[]): Promise<boolean> {
    if (!this.isReady) {
      console.log('[WeChat Bot] Bot not ready, skipping message send');
      return false;
    }

    try {
      const rooms = await this.bot.Room.findAll();
      const targetRoom = rooms.find((room: Room) => room.payload?.topic === this.targetGroupName);

      if (!targetRoom) {
        console.error(`[WeChat Bot] Target group "${this.targetGroupName}" not found`);
        console.log('[WeChat Bot] Available groups:', rooms.map((r: Room) => r.payload?.topic).filter(Boolean));
        return false;
      }

      const message = this.formatMessageForWeChat(newsItems);
      await targetRoom.say(message);
      console.log(`[WeChat Bot] Daily news sent to group "${this.targetGroupName}"`);
      return true;

    } catch (error) {
      console.error('[WeChat Bot] Failed to send message:', error);
      return false;
    }
  }

  private formatMessageForWeChat(newsItems: NewsItem[]): string {
    const today = new Date().toISOString().split('T')[0];
    const formattedDate = today.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1年$2月$3日');

    let message = `🔥 【存储今日头条】 ${formattedDate}\n━━━━━━━━━━━━━━\n\n`;

    newsItems.slice(0, 10).forEach((news, index) => {
      const emoji = index % 4 === 0 ? '🎯' : index % 4 === 1 ? '💡' : index % 4 === 2 ? '📡' : '🏢';
      const chineseTitle = this.generateChineseTitle(news.title, news.vendor || 'StorageNewsletter');
      const aiSummary = this.generateAISummary(news.summary_cn || null, news.title);

      message += `${index + 1}. ${emoji} 【${news.source_name || news.vendor || 'StorageNewsletter'}】 ${chineseTitle}\n`;
      message += `   └── ${aiSummary}\n\n`;
    });

    message += '📱 StorageNews 智能聚合平台\n让存储资讯触手可及';

    return message;
  }

  private generateChineseTitle(title: string, vendor: string): string {
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

    const cleaned = title.replace(/\s+/g, ' ').trim();
    const parts = cleaned.split(/[:\-–—|]/).map(p => p.trim()).filter(Boolean);
    const candidate = parts.length >= 2 ? parts[parts.length - 1] : cleaned;
    return candidate.length > 22 ? candidate.substring(0, 22) + '...' : candidate;
  }

  private generateAISummary(summary: string | null, title: string): string {
    if (summary) {
      const cleaned = summary.replace(/\s+/g, ' ').trim();
      if (cleaned.length <= 58) return cleaned;

      const slice = cleaned.slice(0, 58);
      const punctuations = ['。', '；', '！', '？', '，', '.', ';', '!', '?'];
      let cut = -1;
      for (const p of punctuations) {
        const idx = slice.lastIndexOf(p);
        if (idx > cut) cut = idx;
      }

      if (cut >= 10) return slice.slice(0, cut + 1);

      const lookAheadMax = Math.min(cleaned.length, 58 + 30);
      const extended = cleaned.slice(0, lookAheadMax);
      for (let i = 58; i < extended.length; i++) {
        if (punctuations.includes(extended[i])) {
          return extended.slice(0, i + 1);
        }
      }

      return slice.replace(/[，,]\s*$/, '') + '…';
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

  public get isBotReady(): boolean {
    return this.isReady;
  }
}

let wechatBotInstance: WeChatBot | null = null;

export async function initWeChatBot(): Promise<WeChatBot> {
  if (!wechatBotInstance) {
    wechatBotInstance = new WeChatBot();
    await wechatBotInstance.start();
  }
  return wechatBotInstance;
}

export async function sendToWeChatBot(newsItems: NewsItem[]): Promise<boolean> {
  if (!wechatBotInstance) {
    console.log('[WeChat Bot] Bot not initialized');
    return false;
  }

  return await wechatBotInstance.sendDailyNews(newsItems);
}

export function getWeChatBotStatus(): boolean {
  return wechatBotInstance?.isBotReady || false;
}
