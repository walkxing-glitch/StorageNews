import axios from 'axios';

interface WeChatMessage {
  msgtype: 'text' | 'markdown';
  text?: {
    content: string;
    mentioned_list?: string[];
    mentioned_mobile_list?: string[];
  };
  markdown?: {
    content: string;
  };
}

export async function sendWeChatMessage(message: string, isMarkdown: boolean = true): Promise<boolean> {
  const webhookUrl = process.env.WECHAT_WEBHOOK_URL;
  
  if (!webhookUrl || webhookUrl.includes('YOUR_WEBHOOK_KEY_HERE')) {
    console.log('WeChat webhook not configured, skipping...');
    return false;
  }
  
  try {
    const payload: WeChatMessage = isMarkdown 
      ? {
          msgtype: 'markdown',
          markdown: {
            content: message
          }
        }
      : {
          msgtype: 'text',
          text: {
            content: message
          }
        };
    
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data.errcode === 0) {
      console.log('WeChat message sent successfully');
      return true;
    } else {
      console.error('WeChat API error:', response.data);
      return false;
    }
  } catch (error: any) {
    console.error('Failed to send WeChat message:', error.message);
    return false;
  }
}

export async function sendNewsNotification(title: string, source: string, url?: string): Promise<boolean> {
  const message = `## 📰 新闻推送\n\n**${title}**\n\n来源: ${source}${url ? `\n[查看详情](${url})` : ''}\n\n---\n*企业存储新闻监控平台*`;
  
  return await sendWeChatMessage(message, true);
}