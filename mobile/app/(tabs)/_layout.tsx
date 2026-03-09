import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#2a2a2a',
        },
        tabBarActiveTintColor: '#00ff88',
        tabBarInactiveTintColor: '#666666',
        headerStyle: {
          backgroundColor: '#0a0a0a',
        },
        headerTintColor: '#00ff88',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Storage News',
          tabBarLabel: 'News',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📰</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
