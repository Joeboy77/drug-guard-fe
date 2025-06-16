import React from 'react';
import { Stack } from 'expo-router';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

// Ghana-themed color palette
const theme = extendTheme({
  colors: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb', 
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3', // Main blue
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    success: {
      50: '#f3e5f5',
      500: '#4caf50', // Ghana green
      600: '#43a047',
    },
    warning: {
      500: '#ffc107', // Ghana gold/yellow
      600: '#ffb300',
    },
    error: {
      500: '#f44336',
      600: '#e53935',
    },
    muted: {
      50: '#f9f9f9',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    }
  },
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
  fontConfig: {
    Inter: {
      100: { normal: 'Inter-Thin' },
      200: { normal: 'Inter-ExtraLight' },
      300: { normal: 'Inter-Light' },
      400: { normal: 'Inter-Regular' },
      500: { normal: 'Inter-Medium' },
      600: { normal: 'Inter-SemiBold' },
      700: { normal: 'Inter-Bold' },
      800: { normal: 'Inter-ExtraBold' },
      900: { normal: 'Inter-Black' },
    },
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'Inter',
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'xl',
        _text: {
          fontWeight: '600',
        },
      },
      defaultProps: {
        size: 'lg',
        colorScheme: 'primary',
      },
    },
    Input: {
      baseStyle: {
        rounded: 'xl',
        borderWidth: 1,
        _focus: {
          borderColor: 'primary.500',
          backgroundColor: 'white',
        },
      },
    },
  },
});

export default function RootLayout() {
  return (
    <NativeBaseProvider theme={theme}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          // Add this to prevent gesture conflicts
          gestureEnabled: Platform.OS === 'ios',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="user-selection" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </NativeBaseProvider>
  );
}