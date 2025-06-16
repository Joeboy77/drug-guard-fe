import React from 'react';
import { Box } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: any;
}

export default function SafeAreaWrapper({ children, style }: SafeAreaWrapperProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <Box
      flex={1}
      pt={Platform.OS === 'ios' ? insets.top : 0}
      pb={Platform.OS === 'ios' ? insets.bottom : 0}
      style={style}
    >
      {children}
    </Box>
  );
}