import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 25,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.2,
          shadowRadius: 15,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 12,
          paddingHorizontal: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarActiveTintColor: '#2196f3',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          borderRadius: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#e3f2fd' : 'transparent',
              borderRadius: 10,
              padding: 6,
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 32,
            }}>
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={focused ? 22 : 20} 
                color={color}
              />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#e8f5e8' : 'transparent',
              borderRadius: 10,
              padding: 6,
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 32,
            }}>
              <Ionicons 
                name={focused ? 'qr-code' : 'qr-code-outline'} 
                size={focused ? 22 : 20} 
                color={focused ? '#22c55e' : color}
              />
            </View>
          ),
          tabBarActiveTintColor: '#22c55e',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#fef3c7' : 'transparent',
              borderRadius: 10,
              padding: 6,
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 32,
            }}>
              <Ionicons 
                name={focused ? 'search' : 'search-outline'} 
                size={focused ? 22 : 20} 
                color={focused ? '#f59e0b' : color}
              />
            </View>
          ),
          tabBarActiveTintColor: '#f59e0b',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#fef2f2' : 'transparent',
              borderRadius: 10,
              padding: 6,
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 32,
            }}>
              <Ionicons 
                name={focused ? 'warning' : 'warning-outline'} 
                size={focused ? 22 : 20} 
                color={focused ? '#ef4444' : color}
              />
            </View>
          ),
          tabBarActiveTintColor: '#ef4444',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      />
    </Tabs>
  );
}