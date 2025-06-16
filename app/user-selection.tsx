import React from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Center,
  Pressable,
  useBreakpointValue,
  StatusBar,
  Image,
} from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function UserSelectionScreen() {
  const cardSize = useBreakpointValue({ 
    base: width * 0.85, 
    md: width * 0.4, 
    lg: 350 
  });
  const titleSize = useBreakpointValue({ base: '2xl', md: '3xl', lg: '4xl' });
  const cardTitleSize = useBreakpointValue({ base: 'xl', md: '2xl', lg: '2xl' });
  const containerPadding = useBreakpointValue({ base: 6, md: 8, lg: 12 });
  const cardLayout = useBreakpointValue({ 
    base: 'column', 
    md: 'row', 
    lg: 'row' 
  });

  const handleCitizenSelect = () => {
    // Navigate to citizen features (drug search/verification)
    router.push('/(tabs)');
  };

  const handleAdminSelect = () => {
    // Navigate to FDA admin login
    router.push('/auth/admin-login');
  };

  return (
    <Box flex={1}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2196f3', '#1976d2']}
        style={{ flex: 1 }}
      >
        
        <Center flex={1} px={containerPadding}>
          <VStack space={8} alignItems="center" w="100%" maxW="4xl">
            
            {/* Header */}
            <VStack space={4} alignItems="center" mb={4}>
              <Text
                fontSize={titleSize}
                fontWeight="bold"
                color="white"
                textAlign="center"
              >
                Welcome to DrugGuard
              </Text>
              <Text
                fontSize="lg"
                color="white"
                opacity={0.9}
                textAlign="center"
                maxW="md"
              >
                Choose how you'd like to use the app
              </Text>
            </VStack>

            {/* User Type Cards */}
            <VStack 
              space={6} 
              alignItems="center" 
              w="100%"
              direction={cardLayout as any}
            >
              
              {/* Citizen Card */}
              <Pressable onPress={handleCitizenSelect}>
                <Box
                  bg="white"
                  rounded="2xl"
                  shadow={9}
                  p={6}
                  w={cardSize}
                  h={cardLayout === 'column' ? 200 : 250}
                  position="relative"
                  overflow="hidden"
                >
                  {/* Background Pattern */}
                  <Box
                    position="absolute"
                    top={-10}
                    right={-10}
                    opacity={0.1}
                  >
                    <Text fontSize="8xl" color="primary.500">
                      👥
                    </Text>
                  </Box>

                  <VStack space={4} alignItems="flex-start" h="100%">
                    <HStack alignItems="center" space={3}>
                      <Box
                        bg="primary.50"
                        p={3}
                        rounded="xl"
                      >
                        <Text fontSize="2xl">👤</Text>
                      </Box>
                      <Text
                        fontSize={cardTitleSize}
                        fontWeight="bold"
                        color="primary.700"
                      >
                        I'm a Citizen
                      </Text>
                    </HStack>

                    <Text
                      fontSize="md"
                      color="gray.600"
                      lineHeight="md"
                      flex={1}
                    >
                      Verify drug authenticity, search the FDA database, and report suspicious medications
                    </Text>

                    <HStack space={2} flexWrap="wrap">
                      <Box bg="success.50" px={2} py={1} rounded="md">
                        <Text fontSize="xs" color="success.600" fontWeight="500">
                          QR Scanning
                        </Text>
                      </Box>
                      <Box bg="warning.50" px={2} py={1} rounded="md">
                        <Text fontSize="xs" color="warning.600" fontWeight="500">
                          Drug Search
                        </Text>
                      </Box>
                    </HStack>
                  </VStack>
                </Box>
              </Pressable>

              {/* FDA Admin Card */}
              <Pressable onPress={handleAdminSelect}>
                <Box
                  bg="white"
                  rounded="2xl"
                  shadow={9}
                  p={6}
                  w={cardSize}
                  h={cardLayout === 'column' ? 200 : 250}
                  position="relative"
                  overflow="hidden"
                >
                  {/* Background Pattern */}
                  <Box
                    position="absolute"
                    top={-10}
                    right={-10}
                    opacity={0.1}
                  >
                    <Text fontSize="8xl" color="primary.500">
                      🛡️
                    </Text>
                  </Box>

                  <VStack space={4} alignItems="flex-start" h="100%">
                    <HStack alignItems="center" space={3}>
                      <Box
                        bg="primary.50"
                        p={3}
                        rounded="xl"
                      >
                        <Text fontSize="2xl">👨‍⚕️</Text>
                      </Box>
                      <Text
                        fontSize={cardTitleSize}
                        fontWeight="bold"
                        color="primary.700"
                      >
                        FDA Admin
                      </Text>
                    </HStack>

                    <Text
                      fontSize="md"
                      color="gray.600"
                      lineHeight="md"
                      flex={1}
                    >
                      Manage drug registrations, monitor verification activities, and maintain the official database
                    </Text>

                    <HStack space={2} flexWrap="wrap">
                      <Box bg="error.50" px={2} py={1} rounded="md">
                        <Text fontSize="xs" color="error.600" fontWeight="500">
                          Secure Access
                        </Text>
                      </Box>
                      <Box bg="primary.50" px={2} py={1} rounded="md">
                        <Text fontSize="xs" color="primary.600" fontWeight="500">
                          Admin Panel
                        </Text>
                      </Box>
                    </HStack>
                  </VStack>
                </Box>
              </Pressable>

            </VStack>

            {/* Footer Info */}
            <VStack space={2} alignItems="center" mt={8}>
              <Text color="white" opacity={0.8} fontSize="sm" textAlign="center">
                DrugGuard Ghana is powered by
              </Text>
              <Text color="white" fontWeight="bold" fontSize="md">
                Food and Drugs Authority - Ghana
              </Text>
            </VStack>

          </VStack>
        </Center>

      </LinearGradient>
    </Box>
  );
}