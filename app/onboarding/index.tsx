import React, { useState, useRef } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Center,
  ScrollView,
  Pressable,
  useBreakpointValue,
  StatusBar,
} from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    icon: '🔍',
    title: 'Verify Drug Authenticity',
    subtitle: 'Scan QR codes or search for drugs to verify their authenticity and safety',
    description: 'Protect yourself and your loved ones from counterfeit medications by checking if drugs are registered with Ghana FDA.',
  },
  {
    id: 2,
    icon: '🛡️',
    title: 'FDA Verified Database',
    subtitle: 'Access the official Ghana FDA drug registration database',
    description: 'Get real-time information about registered drugs, their manufacturers, expiry dates, and safety profiles.',
  },
  {
    id: 3,
    icon: '🇬🇭',
    title: 'Protecting Ghana\'s Health',
    subtitle: 'Join the fight against counterfeit drugs in Ghana',
    description: 'Help build a safer healthcare system by reporting suspicious drugs and staying informed about drug safety.',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const iconSize = useBreakpointValue({ base: '6xl', md: '7xl', lg: '8xl' });
  const titleSize = useBreakpointValue({ base: '2xl', md: '3xl', lg: '4xl' });
  const subtitleSize = useBreakpointValue({ base: 'md', md: 'lg', lg: 'xl' });
  const descriptionSize = useBreakpointValue({ base: 'sm', md: 'md', lg: 'lg' });
  const containerPadding = useBreakpointValue({ base: 6, md: 8, lg: 12 });

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      // Go to user selection
      router.replace('/user-selection');
    }
  };

  const handleSkip = () => {
    router.replace('/user-selection');
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <Box flex={1}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2196f3', '#1976d2']}
        style={{ flex: 1 }}
      >
        
        {/* Skip Button */}
        <Box position="absolute" top={12} right={6} zIndex={10}>
          <Pressable onPress={handleSkip}>
            <Text color="white" fontSize="md" fontWeight="500">
              Skip
            </Text>
          </Pressable>
        </Box>

        {/* Main Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
        >
          {onboardingData.map((item, index) => (
            <Box key={item.id} width={width}>
              <Center flex={1} px={containerPadding}>
                <VStack space={8} alignItems="center" w="100%" maxW="md">
                  
                  {/* Icon */}
                  <Text fontSize={iconSize} textAlign="center">
                    {item.icon}
                  </Text>

                  {/* Content */}
                  <VStack space={4} alignItems="center">
                    <Text
                      fontSize={titleSize}
                      fontWeight="bold"
                      color="white"
                      textAlign="center"
                      lineHeight={titleSize}
                    >
                      {item.title}
                    </Text>
                    
                    <Text
                      fontSize={subtitleSize}
                      color="white"
                      opacity={0.9}
                      textAlign="center"
                      fontWeight="500"
                    >
                      {item.subtitle}
                    </Text>
                    
                    <Text
                      fontSize={descriptionSize}
                      color="white"
                      opacity={0.8}
                      textAlign="center"
                      lineHeight="md"
                      maxW="90%"
                    >
                      {item.description}
                    </Text>
                  </VStack>

                </VStack>
              </Center>
            </Box>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <Box pb={12} px={containerPadding}>
          <VStack space={6} alignItems="center">
            
            {/* Pagination Dots */}
            <HStack space={2} alignItems="center">
              {onboardingData.map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleDotPress(index)}
                >
                  <Box
                    w={currentIndex === index ? 6 : 2}
                    h={2}
                    bg={currentIndex === index ? 'white' : 'rgba(255,255,255,0.5)'}
                    rounded="full"
                    transition={{ duration: 200 }}
                  />
                </Pressable>
              ))}
            </HStack>

            {/* Next/Get Started Button */}
            <Button
              onPress={handleNext}
              size="lg"
              w="100%"
              maxW="xs"
              bg="white"
              _pressed={{ bg: 'gray.100' }}
              _text={{
                color: 'primary.600',
                fontWeight: '600',
                fontSize: 'md',
              }}
              rounded="xl"
              shadow={3}
            >
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Button>

          </VStack>
        </Box>

      </LinearGradient>
    </Box>
  );
}