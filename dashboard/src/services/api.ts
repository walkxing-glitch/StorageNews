import axios from 'axios';

const API_BASE = '/api';

export interface NewsItem {
  id: number;
  title: string;
  summary?: string;
  url?: string;
  image_url?: string;
  source_name?: string;
  vendor?: string;
  category?: string;
  published_at: string;
  created_at: string;
}

export interface Stats {
  total: number;
  today: number;
  byVendor: Record<string, number>;
  byCategory: Record<string, number>;
}

export async function fetchNews(params?: {
  limit?: number;
  offset?: number;
  vendor?: string;
  category?: string;
}): Promise<NewsItem[]> {
  const response = await axios.get(`${API_BASE}/news`, { params });
  return response.data.data;
}

export async function fetchStats(): Promise<Stats> {
  const response = await axios.get(`${API_BASE}/news/stats`);
  return response.data.data;
}

export async function fetchVendors(): Promise<string[]> {
  const response = await axios.get(`${API_BASE}/news/vendors`);
  return response.data.data;
}

export interface AnalyticsData {
  period: string;
  trends: {
    date: string;
    count: number;
    avgScore: number;
  }[];
  vendors: {
    name: string;
    count: number;
    avgScore: number;
    latestNews: string;
  }[];
  categories: {
    name: string;
    count: number;
    avgScore: number;
  }[];
  sources: {
    name: string;
    count: number;
    avgScore: number;
  }[];
}

export async function fetchAnalytics(period?: string): Promise<AnalyticsData> {
  const response = await axios.get(`${API_BASE}/news/analytics`, {
    params: { period }
  });
  return response.data.data;
}
