import { initWeChatBot, sendToWeChatBot, getWeChatBotStatus } from '../src/services/wechaty-bot';

// Mock wechaty dependencies
jest.mock('wechaty', () => ({
  Wechaty: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('qrcode-terminal', () => ({
  generate: jest.fn(),
}));

describe('WeChat Bot Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton instance
    jest.resetModules();
  });

  describe('initWeChatBot', () => {
    it('should initialize bot when enabled', async () => {
      // Mock environment variable
      process.env.WECHAT_BOT_ENABLED = 'true';

      const { initWeChatBot } = await import('../src/services/wechaty-bot');
      const bot = await initWeChatBot();

      expect(bot).toBeDefined();
    });

    it('should skip initialization when disabled', async () => {
      process.env.WECHAT_BOT_ENABLED = 'false';

      const { initWeChatBot } = await import('../src/services/wechaty-bot');
      const bot = await initWeChatBot();

      expect(bot).toBeDefined(); // Still returns instance but doesn't start
    });
  });

  describe('sendToWeChatBot', () => {
    beforeEach(() => {
      process.env.WECHAT_BOT_ENABLED = 'true';
    });

    it('should return false when bot is not initialized', async () => {
      const { sendToWeChatBot } = await import('../src/services/wechaty-bot');
      const result = await sendToWeChatBot([]);

      expect(result).toBe(false);
    });

    it('should return false when bot is not ready', async () => {
      const { initWeChatBot, sendToWeChatBot } = await import('../src/services/wechaty-bot');
      await initWeChatBot();

      const result = await sendToWeChatBot([]);
      expect(result).toBe(false);
    });
  });

  describe('getWeChatBotStatus', () => {
    it('should return false when bot is not initialized', () => {
      const { getWeChatBotStatus } = require('../src/services/wechaty-bot');
      const status = getWeChatBotStatus();

      expect(status).toBe(false);
    });
  });
});
