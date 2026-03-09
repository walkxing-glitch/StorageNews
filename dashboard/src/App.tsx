import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchNews, fetchStats, NewsItem, Stats, AnalyticsData, fetchAnalytics } from './services/api';
import { Chart } from './components/Chart';

function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<string>('7d');

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [newsData, statsData, analyticsData] = await Promise.all([
        fetchNews({
          limit: 100,
          vendor: selectedVendor || undefined,
          category: selectedCategory || undefined,
        }),
        fetchStats(),
        fetchAnalytics(analyticsPeriod),
      ]);
      setNews(newsData);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedVendor, selectedCategory, analyticsPeriod]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [loadData]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const topVendors = stats 
    ? Object.entries(stats.byVendor)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    : [];

  const categories = stats
    ? Object.entries(stats.byCategory)
        .sort((a, b) => b[1] - a[1])
    : [];

  // Chart data preparation
  const vendorChartData = {
    labels: topVendors.map(([vendor]) => vendor),
    datasets: [
      {
        label: 'News Count',
        data: topVendors.map(([, count]) => count),
        backgroundColor: 'rgba(0, 255, 136, 0.6)',
        borderColor: 'rgba(0, 255, 136, 1)',
        borderWidth: 1,
      },
    ],
  };

  const categoryChartData = {
    labels: categories.map(([category]) => category),
    datasets: [
      {
        data: categories.map(([, count]) => count),
        backgroundColor: [
          '#00ff88', '#4488ff', '#ffaa00', '#ff4444', '#aa44ff',
          '#44ffaa', '#ff8844', '#8844ff', '#44ffff', '#ffff44'
        ],
        borderWidth: 2,
        borderColor: '#1a1a1a',
      },
    ],
  };

  // Generate timeline data (last 7 days)
  const timelineData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyCounts = last7Days.map(date => {
      return news.filter(item => 
        item.published_at.startsWith(date)
      ).length;
    });

    return {
      labels: last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'News Published',
          data: dailyCounts,
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0, 255, 136, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [news]);

  return (
    <div className="app">
      <header className="header">
        <h1>STORAGE NEWS MONITOR</h1>
        <span className={`header-status ${refreshing ? 'refreshing' : ''}`}>
          {refreshing ? 'Refreshing...' : `Last updated: ${new Date().toLocaleTimeString()}`}
        </span>
      </header>

      <main className="main-grid">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">
              {selectedVendor || selectedCategory 
                ? `FILTERED: ${selectedVendor || ''} ${selectedCategory || ''}` 
                : 'LATEST NEWS'}
            </span>
            <span className="panel-count">{news.length}</span>
          </div>
          
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="news-list">
              {news.map((item) => (
                <div 
                  key={item.id} 
                  className="news-item"
                  onClick={() => item.url && window.open(item.url, '_blank')}
                >
                  <div className="news-title">{item.title}</div>
                  <div className="news-meta">
                    {item.vendor && <span className="news-vendor">{item.vendor}</span>}
                    {item.category && <span className="news-category">{item.category}</span>}
                    <span className="news-source">{item.source_name}</span>
                    <span className="news-time">{formatTime(item.published_at)}</span>
                  </div>
                </div>
              ))}
              {news.length === 0 && (
                <div className="loading">No news found. Waiting for data collection...</div>
              )}
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">STATS</span>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats?.total || 0}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats?.today || 0}</div>
                <div className="stat-label">Today</div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">NEWS TIMELINE</span>
            </div>
            <div className="chart-wrapper">
              <Chart data={timelineData} title="Last 7 Days" type="line" />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">TOP VENDORS</span>
            </div>
            <div className="chart-wrapper">
              <Chart data={vendorChartData} title="News by Vendor" type="bar" />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">CATEGORY BREAKDOWN</span>
            </div>
            <div className="chart-wrapper">
              <Chart data={categoryChartData} title="News by Category" type="doughnut" />
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">BY VENDOR</span>
            </div>
            <div className="vendor-list">
              <div 
                className={`vendor-item ${!selectedVendor ? 'active' : ''}`}
                onClick={() => setSelectedVendor(null)}
              >
                <span className="vendor-name">All Vendors</span>
              </div>
              {topVendors.map(([vendor, count]) => (
                <div 
                  key={vendor}
                  className={`vendor-item ${selectedVendor === vendor ? 'active' : ''}`}
                  onClick={() => setSelectedVendor(selectedVendor === vendor ? null : vendor)}
                >
                  <span className="vendor-name">{vendor}</span>
                  <span className="vendor-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">BY CATEGORY</span>
            </div>
            <div className="category-tags">
              <span 
                className={`category-tag ${!selectedCategory ? 'active' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </span>
              {categories.map(([category, count]) => (
                <span 
                  key={category}
                  className={`category-tag ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                >
                  {category} ({count})
                </span>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">ANALYTICS</span>
              <select 
                className="period-selector"
                value={analyticsPeriod}
                onChange={(e) => setAnalyticsPeriod(e.target.value)}
              >
                <option value="1d">1 Day</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>
          </div>

          {analytics && (
            <>
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">NEWS TRENDS</span>
                </div>
                <div className="chart-wrapper">
                  <Chart 
                    data={{
                      labels: analytics.trends.map(t => {
                        const d = new Date(t.date);
                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }),
                      datasets: [{
                        label: 'News Count',
                        data: analytics.trends.map(t => t.count),
                        borderColor: '#00ff88',
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        tension: 0.4,
                        fill: true,
                      }]
                    }} 
                    title="Daily News Volume" 
                    type="line" 
                  />
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">SOURCE ANALYSIS</span>
                </div>
                <div className="chart-wrapper">
                  <Chart 
                    data={{
                      labels: analytics.sources.slice(0, 10).map(s => s.name),
                      datasets: [{
                        label: 'News Count',
                        data: analytics.sources.slice(0, 10).map(s => s.count),
                        backgroundColor: 'rgba(0, 255, 136, 0.6)',
                        borderColor: 'rgba(0, 255, 136, 1)',
                        borderWidth: 1,
                      }]
                    }} 
                    title="News by Source" 
                    type="bar" 
                  />
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">CATEGORY BREAKDOWN</span>
                </div>
                <div className="chart-wrapper">
                  <Chart 
                    data={{
                      labels: analytics.categories.map(c => c.name),
                      datasets: [{
                        data: analytics.categories.map(c => c.count),
                        backgroundColor: [
                          '#00ff88', '#4488ff', '#ffaa00', '#ff4444', '#aa44ff',
                          '#44ffaa', '#ff8844', '#8844ff', '#44ffff', '#ffff44'
                        ],
                        borderWidth: 2,
                        borderColor: '#1a1a1a',
                      }]
                    }} 
                    title="News by Category" 
                    type="doughnut" 
                  />
                </div>
              </div>
            </>
          )}
