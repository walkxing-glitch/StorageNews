import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { fetchNews, NewsItem, VENDORS, CATEGORIES } from '../../services/api';

export default function NewsListScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    try {
      const data = await fetchNews({
        limit: 50,
        vendor: selectedVendor || undefined,
        category: selectedCategory || undefined
      });
      setNews(data);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedVendor, selectedCategory]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNews();
  }, [loadNews]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}d`;
  };

  const openUrl = async (url?: string) => {
    if (url) {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: '#0a0a0a',
        controlsColor: '#00ff88',
        showTitle: true,
      });
    }
  };

  const renderItem = ({ item }: { item: NewsItem }) => {
    const score = Number(item.score || 0);
    const isFeatured = score > 50;
    const isHot = score > 40;

    // Placeholder gradient colors if no image
    const placeholderColors = ['#1a1a1a', '#0a0a0a'] as const;

    if (isFeatured && item.image_url) {
      return (
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => openUrl(item.url)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: item.image_url }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.featuredOverlay}
          >
            <View style={styles.featuredContent}>
              <View style={styles.badgeRow}>
                <View style={[styles.scoreBadge, styles.hotBadge]}>
                  <Text style={styles.scoreText}>🔥 TOP {Math.round(score)}</Text>
                </View>
                {item.vendor && <Text style={styles.featuredVendor}>{item.vendor}</Text>}
              </View>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.featuredMeta}>
                {item.source_name} • {formatTime(item.published_at)}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.newsItem}
        onPress={() => openUrl(item.url)}
        activeOpacity={0.7}
      >
        <View style={styles.itemRow}>
          <View style={styles.textContent}>
            <View style={styles.titleRow}>
              <Text style={styles.compactTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
            <View style={styles.meta}>
              {item.score && (
                <View style={[styles.scoreBadge, isHot && styles.hotBadge]}>
                  <Text style={styles.scoreText}>
                    {isHot ? '🔥 ' : ''}{Math.round(score)}
                  </Text>
                </View>
              )}
              {item.vendor && <Text style={styles.vendor}>{item.vendor}</Text>}
              <Text style={styles.source}>{item.source_name} • {formatTime(item.published_at)}</Text>
            </View>
          </View>

          {item.image_url ? (
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </View>
          ) : (
            <LinearGradient
              colors={['#2a2a2a', '#1a1a1a']}
              style={styles.thumbnail}
            />
          )}
        </View>

        {item.summary_cn && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>AI 摘要</Text>
            <Text style={styles.summaryText} numberOfLines={3}>{item.summary_cn}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedVendor && styles.activeChip]}
            onPress={() => setSelectedVendor(null)}
          >
            <Text style={[styles.filterText, !selectedVendor && styles.activeFilterText]}>All Vendors</Text>
          </TouchableOpacity>
          {VENDORS.map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.filterChip, selectedVendor === v && styles.activeChip]}
              onPress={() => setSelectedVendor(v)}
            >
              <Text style={[styles.filterText, selectedVendor === v && styles.activeFilterText]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedCategory && styles.activeChip]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.filterText, !selectedCategory && styles.activeFilterText]}>All Topics</Text>
          </TouchableOpacity>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.filterChip, selectedCategory === c && styles.activeChip]}
              onPress={() => setSelectedCategory(c)}
            >
              <Text style={[styles.filterText, selectedCategory === c && styles.activeFilterText]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={news}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00ff88"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No news matches</Text>
            <Text style={styles.emptySubtext}>Try changing filters or pull to refresh</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  newsItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  featuredCard: {
    height: 240,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredContent: {
    gap: 8,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 28,
  },
  featuredVendor: {
    color: '#4488ff',
    fontSize: 12,
    fontWeight: '600',
  },
  featuredMeta: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  compactTitle: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
    fontWeight: '500',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  scoreBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  hotBadge: {
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  scoreText: {
    color: '#00ff88',
    fontSize: 10,
    fontWeight: 'bold',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  vendor: {
    fontSize: 11,
    color: '#4488ff',
    fontWeight: '600',
  },
  category: {
    fontSize: 11,
    color: '#ffaa00',
  },
  source: {
    fontSize: 11,
    color: '#888',
  },
  time: {
    fontSize: 11,
    color: '#666666',
  },
  summaryContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#111',
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#00ff88',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#00ff88',
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: 13,
    color: '#aaa',
    lineHeight: 18,
  },
  filtersContainer: {
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  filterRow: {
    flexGrow: 0,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  activeChip: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderColor: '#00ff88',
  },
  filterText: {
    color: '#666',
    fontSize: 12,
  },
  activeFilterText: {
    color: '#00ff88',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  emptySubtext: {
    color: '#444',
    fontSize: 12,
    marginTop: 8,
  },
});
