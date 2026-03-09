import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';

export default function NewsDetailScreen() {
  const { id, title, summary, url, source, vendor, category, time } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.meta}>
        {vendor && <Text style={styles.vendor}>{vendor}</Text>}
        {category && <Text style={styles.category}>{category}</Text>}
        <Text style={styles.source}>{source}</Text>
      </View>

      {summary && (
        <Text style={styles.summary}>{summary}</Text>
      )}

      {url && (
        <TouchableOpacity 
          style={styles.button}
          onPress={() => Linking.openURL(url as string)}
        >
          <Text style={styles.buttonText}>Read Full Article</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 28,
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  vendor: {
    fontSize: 12,
    color: '#4488ff',
  },
  category: {
    fontSize: 12,
    color: '#ffaa00',
  },
  source: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  summary: {
    fontSize: 15,
    color: '#cccccc',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#00ff88',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
});
