import React from 'react';
import { Box, Text, Button, VStack } from 'native-base';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box flex={1} bg="white" justifyContent="center" alignItems="center" px={6}>
          <VStack space={4} alignItems="center">
            <Text fontSize="2xl" color="error.500">⚠️</Text>
            <Text fontSize="lg" fontWeight="bold" color="gray.700">
              Something went wrong
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              There was an error loading the app. Please restart the application.
            </Text>
            <Button
              onPress={() => this.setState({ hasError: false })}
              colorScheme="primary"
            >
              Try Again
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}