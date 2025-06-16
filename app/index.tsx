import React, { useEffect } from 'react';
import { 
  VStack, 
  HStack,
  Box, 
  Text, 
  Center, 
  useBreakpointValue,
  StatusBar,
} from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const logoSize = useBreakpointValue({ base: 120, md: 150, lg: 180 });
  const titleSize = useBreakpointValue({ base: 'xl', md: '2xl', lg: '3xl' });
  const subtitleSize = useBreakpointValue({ base: 'md', md: 'lg', lg: 'xl' });

  useEffect(() => {
    // Auto navigate to onboarding after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box flex={1}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2196f3', '#1976d2', '#0d47a1']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Center flex={1} px={6}>
          <VStack space={8} alignItems="center" w="100%">
            
            {/* App Logo/Icon */}
            <Box 
              size={logoSize} 
              bg="white" 
              rounded="full" 
              shadow={9}
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize="4xl" color="primary.500" fontWeight="bold">
                🛡️
              </Text>
            </Box>

            {/* App Title */}
            <VStack space={2} alignItems="center">
              <Text 
                fontSize={titleSize} 
                fontWeight="bold" 
                color="white"
                textAlign="center"
              >
                DrugGuard Ghana
              </Text>
              <Text 
                fontSize={subtitleSize} 
                color="white" 
                opacity={0.9}
                textAlign="center"
                maxW="80%"
              >
                Protecting Ghana's Health Through Drug Authentication
              </Text>
            </VStack>

            {/* Ghana Flag Colors Accent */}
            <HStack space={1} mt={4}>
              <Box w={12} h={2} bg="#dc2626" rounded="full" />
              <Box w={12} h={2} bg="#fbbf24" rounded="full" />
              <Box w={12} h={2} bg="#16a34a" rounded="full" />
            </HStack>

            {/* Simple Loading Indicator */}
            <VStack space={3} alignItems="center" mt={8}>
              <Text color="white" opacity={0.8} fontSize="sm">
                Loading...
              </Text>
            </VStack>

          </VStack>
        </Center>

        {/* Footer */}
        <Box pb={8} px={6}>
          <Text 
            textAlign="center" 
            color="white" 
            opacity={0.7} 
            fontSize="xs"
          >
            Food and Drugs Authority - Ghana
          </Text>
        </Box>
      </LinearGradient>
    </Box>
  );
}