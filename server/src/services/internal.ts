import axios from 'axios';

/**
 * 内部工作软件推送服务
 * 支持：飞书、钉钉或其他 webhook 接口
 */

interface InternalMessage {
  title: string;
  content: string;
  timestamp: string;
}

// 飞书 webhook 推送
export async function sendFeishuMessage(message: string): Promise<boolean> {
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
  
  if (!webhookUrl || webhookUrl.includes('YOUR_WEBHOOK_KEY_HERE')) {
    console.log('Feishu webhook not configured, skipping...');
    return false;
  }
  
  try {
    const payload = {
      msg_type: 'interactive',
      card: {
        header: {
          title: {
            tag: 'plain_text',
            content: '📰 IT存储新闻日报'
          },
          template: 'blue'
        },
        elements: [
          {
            tag: 'markdown',
            content: message
          }
        ]
      }
    };
    
    const response = await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    if (response.data.code === 0 || response.data.StatusCode === 0) {
      console.log('Feishu message sent successfully');
      return true;
    } else {
      console.error('Feishu API error:', response.data);
      return false;
    }
  } catch (error: any) {
    console.error('Failed to send Feishu message:', error.message);
    return false;
  }
}

// 钉钉 webhook 推送
export async function sendDingTalkMessage(message: string): Promise<boolean> {
  const webhookUrl = process.env.DINGTALK_WEBHOOK_URL;
  
  if (!webhookUrl || webhookUrl.includes('YOUR_WEBHOOK_KEY_HERE')) {
    console.log('DingTalk webhook not configured, skipping...');
    return false;
  }
  
  try {
    const payload = {
      msgtype: 'markdown',
      markdown: {
        title: 'IT存储新闻日报',
        text: message
      }
    };
    
    const response = await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    if (response.data.errcode === 0) {
      console.log('DingTalk message sent successfully');
      return true;
    } else {
      console.error('DingTalk API error:', response.data);
      return false;
    }
  } catch (error: any) {
    console.error('Failed to send DingTalk message:', error.message);
    return false;
  }
}

// 统一推送到所有已配置的内部软件
export async function sendToInternalSoftware(message: string): Promise<{ feishu: boolean; dingtalk: boolean }> {
  const [feishu, dingtalk] = await Promise.all([
    sendFeishuMessage(message),
    sendDingTalkMessage(message),
  ]);
  
  return { feishu, dingtalk };
}
