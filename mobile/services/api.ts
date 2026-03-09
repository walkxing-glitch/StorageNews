import axios from 'axios';

// 优先从环境变量获取，否则使用默认开发地址
// 注意：在 Expo Go 中需要使用电脑的局域网 IP 地址
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export const VENDORS = ['Dell EMC', 'NetApp', 'Pure Storage', 'HPE', 'IBM Storage', 'VAST Data', 'Huawei Storage'];
export const CATEGORIES = ['Product', 'Financial', 'Technology', 'Acquisition', 'Market'];

export interface NewsItem {
  id: number;
  title: string;
  url: string;
  source_name: string;
  published_at: string;
  category?: string;
  vendor?: string;
  score?: number;
  summary_cn?: string;
  image_url?: string;
}

export const fetchNews = async (params: { limit?: number; category?: string; vendor?: string } = {}) => {
  try {
    const response = await axios.get(`${API_BASE}/news`, {
      params: {
        limit: params.limit,
        vendor: params.vendor,
        category: params.category,
      },
      timeout: 15000,
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return [];
  }
};

export async function fetchStats() {
  try {
    const response = await axios.get(`${API_BASE}/news/stats`, {
      timeout: 10000,
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return { total: 0, today: 0, byVendor: {}, byCategory: {} };
  }
}
