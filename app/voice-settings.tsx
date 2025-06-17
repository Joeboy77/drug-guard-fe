import React, { useState, useEffect } from 'react';
import {
  VStack,
  Box,
  Text,
  Center,
  StatusBar,
  Icon,
  HStack,
  ScrollView,
  Pressable,
  Divider,
  Switch,
  Slider,
  useToast,
  Badge,
  Heading,
  Avatar,
  Flex,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import VoiceInput from '../components/VoiceInput';
import voiceService, { Language } from '../services/voiceService';
import { voiceAPI, LanguageInfo } from '../services/api';

export default function VoiceSettingsScreen() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [availableLanguages, setAvailableLanguages] = useState<LanguageInfo[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoLanguageDetection, setAutoLanguageDetection] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const toast = useToast();

  useEffect(() => {
    loadAvailableLanguages();
    loadVoiceSettings();
  }, []);

  const loadAvailableLanguages = async () => {
    try {
      const languages = await voiceAPI.getAvailableLanguages();
      setAvailableLanguages(languages);
    } catch (error) {
      console.error('Error loading languages:', error);
      // Fallback to local languages
      setAvailableLanguages([
        { code: 'en', name: 'English (Ghana)' },
        { code: 'twi', name: 'Twi (Akan)' },
        { code: 'ga', name: 'Ga' },
        { code: 'ewe', name: 'Ewe' },
      ]);
    }
  };

  const loadVoiceSettings = async () => {
    try {
      // Load saved settings from AsyncStorage
      // For now, use defaults
      setCurrentLanguage('en');
      setVoiceEnabled(true);
      setAutoLanguageDetection(true);
      setSpeechRate(0.9);
      setSpeechPitch(1.0);
      setSpeechVolume(1.0);
    } catch (error) {
      console.error('Error loading voice settings:', error);
    }
  };

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    voiceService.setLanguage(language);
    toast.show({
      description: `Language changed to ${language.toUpperCase()}`,
      variant: 'success',
    });
  };

  const handleVoiceResult = (text: string) => {
    setTestMessage(text);
    toast.show({
      description: `Voice recognized: ${text}`,
      variant: 'success',
    });
  };

  const testVoiceOutput = async () => {
    try {
      setIsLoading(true);
      const message = voiceService.getWelcomeMessage(currentLanguage);
      await voiceService.speak(message, currentLanguage);
      toast.show({
        description: 'Voice test completed',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error testing voice:', error);
      toast.show({
        description: 'Voice test failed',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageDisplayName = (code: string) => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language ? language.name : code.toUpperCase();
  };

  return (
    <Box flex={1} bg="gray.50">
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Box pt={12} pb={6} px={6}>
          <HStack alignItems="center" space={3}>
            <Pressable
              onPress={() => {/* Navigate back */}}
              p={2}
              borderRadius="full"
              bg="rgba(255,255,255,0.2)"
            >
              <Icon as={Ionicons} name="arrow-back" size="lg" color="white" />
            </Pressable>
            <VStack flex={1}>
              <Text fontSize="2xl" fontWeight="bold" color="white">
                Voice Settings
              </Text>
              <Text fontSize="sm" color="white" opacity={0.9}>
                Configure your voice preferences
              </Text>
            </VStack>
            <Avatar size="md" bg="rgba(255,255,255,0.2)">
              <Icon as={Ionicons} name="mic" color="white" size="lg" />
            </Avatar>
          </HStack>
        </Box>
      </LinearGradient>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        <VStack space={6} p={6}>
          {/* Voice Enable/Disable */}
          <Box bg="white" borderRadius="2xl" p={6} shadow={2}>
            <HStack justifyContent="space-between" alignItems="center" mb={4}>
              <HStack space={3} alignItems="center">
                <Box bg="blue.100" p={3} borderRadius="xl">
                  <Icon as={Ionicons} name="mic" color="blue.600" size="lg" />
                </Box>
                <VStack>
                  <Text fontSize="lg" fontWeight="600" color="gray.800">
                    Voice Features
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Enable voice recognition and speech
                  </Text>
                </VStack>
              </HStack>
              <Switch
                isChecked={voiceEnabled}
                onToggle={setVoiceEnabled}
                colorScheme="blue"
                size="lg"
              />
            </HStack>
            
            {voiceEnabled && (
              <VStack space={4}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="md" color="gray.700">Auto Language Detection</Text>
                  <Switch
                    isChecked={autoLanguageDetection}
                    onToggle={setAutoLanguageDetection}
                    colorScheme="blue"
                  />
                </HStack>
                
                <Divider />
                
                <VStack space={2}>
                  <Text fontSize="md" color="gray.700">Current Language</Text>
                  <HStack space={2} alignItems="center">
                    <Badge colorScheme="blue" variant="solid" px={3} py={1}>
                      {currentLanguage.toUpperCase()}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      {getLanguageDisplayName(currentLanguage)}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            )}
          </Box>

          {/* Language Selection */}
          <Box bg="white" borderRadius="2xl" p={6} shadow={2}>
            <HStack space={3} alignItems="center" mb={4}>
              <Box bg="green.100" p={3} borderRadius="xl">
                <Icon as={Ionicons} name="language" color="green.600" size="lg" />
              </Box>
              <VStack>
                <Text fontSize="lg" fontWeight="600" color="gray.800">
                  Language Settings
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Choose your preferred language
                </Text>
              </VStack>
            </HStack>
            
            <VStack space={3}>
              {availableLanguages.map((language) => (
                <Pressable
                  key={language.code}
                  onPress={() => handleLanguageChange(language.code as Language)}
                >
                  {({ isPressed }) => (
                    <Box
                      bg={isPressed ? 'blue.50' : 'gray.50'}
                      p={4}
                      borderRadius="xl"
                      borderWidth={1}
                      borderColor={currentLanguage === language.code ? 'blue.200' : 'gray.200'}
                    >
                      <HStack justifyContent="space-between" alignItems="center">
                        <VStack>
                          <Text fontSize="md" fontWeight="600" color="gray.800">
                            {language.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {language.code.toUpperCase()}
                          </Text>
                        </VStack>
                        {currentLanguage === language.code && (
                          <Icon as={Ionicons} name="checkmark-circle" color="blue.500" size="md" />
                        )}
                      </HStack>
                    </Box>
                  )}
                </Pressable>
              ))}
            </VStack>
          </Box>

          {/* Speech Settings */}
          <Box bg="white" borderRadius="2xl" p={6} shadow={2}>
            <HStack space={3} alignItems="center" mb={4}>
              <Box bg="purple.100" p={3} borderRadius="xl">
                <Icon as={Ionicons} name="volume-high" color="purple.600" size="lg" />
              </Box>
              <VStack>
                <Text fontSize="lg" fontWeight="600" color="gray.800">
                  Speech Settings
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Adjust voice output preferences
                </Text>
              </VStack>
            </HStack>
            
            <VStack space={6}>
              {/* Speech Rate */}
              <VStack space={2}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="md" color="gray.700">Speech Rate</Text>
                  <Text fontSize="sm" color="gray.500">{speechRate.toFixed(1)}x</Text>
                </HStack>
                <Slider
                  value={speechRate}
                  onChange={setSpeechRate}
                  minValue={0.5}
                  maxValue={2.0}
                  step={0.1}
                  colorScheme="blue"
                >
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider>
              </VStack>

              {/* Speech Pitch */}
              <VStack space={2}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="md" color="gray.700">Speech Pitch</Text>
                  <Text fontSize="sm" color="gray.500">{speechPitch.toFixed(1)}x</Text>
                </HStack>
                <Slider
                  value={speechPitch}
                  onChange={setSpeechPitch}
                  minValue={0.5}
                  maxValue={2.0}
                  step={0.1}
                  colorScheme="green"
                >
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider>
              </VStack>

              {/* Speech Volume */}
              <VStack space={2}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="md" color="gray.700">Speech Volume</Text>
                  <Text fontSize="sm" color="gray.500">{Math.round(speechVolume * 100)}%</Text>
                </HStack>
                <Slider
                  value={speechVolume}
                  onChange={setSpeechVolume}
                  minValue={0.0}
                  maxValue={1.0}
                  step={0.1}
                  colorScheme="orange"
                >
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb />
                </Slider>
              </VStack>
            </VStack>
          </Box>

          {/* Voice Test */}
          <Box bg="white" borderRadius="2xl" p={6} shadow={2}>
            <HStack space={3} alignItems="center" mb={4}>
              <Box bg="orange.100" p={3} borderRadius="xl">
                <Icon as={Ionicons} name="play" color="orange.600" size="lg" />
              </Box>
              <VStack>
                <Text fontSize="lg" fontWeight="600" color="gray.800">
                  Voice Test
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Test voice recognition and speech
                </Text>
              </VStack>
            </HStack>
            
            <VStack space={4}>
              {/* Voice Input Test */}
              <VStack space={3}>
                <Text fontSize="md" color="gray.700">Voice Recognition Test</Text>
                <Center>
                  <VoiceInput
                    onVoiceResult={handleVoiceResult}
                    onLanguageChange={handleLanguageChange}
                    disabled={!voiceEnabled}
                    size="lg"
                  />
                </Center>
                {testMessage && (
                  <Box bg="blue.50" p={3} borderRadius="lg" borderWidth={1} borderColor="blue.200">
                    <Text fontSize="sm" color="blue.800" fontStyle="italic">
                      "You said: {testMessage}"
                    </Text>
                  </Box>
                )}
              </VStack>

              <Divider />

              {/* Voice Output Test */}
              <VStack space={3}>
                <Text fontSize="md" color="gray.700">Voice Output Test</Text>
                <Pressable
                  onPress={testVoiceOutput}
                  disabled={isLoading || !voiceEnabled}
                >
                  {({ isPressed }) => (
                    <Box
                      bg={isPressed ? 'orange.100' : 'orange.500'}
                      p={4}
                      borderRadius="xl"
                      alignItems="center"
                    >
                      <HStack space={2} alignItems="center">
                        {isLoading ? (
                          <Icon as={Ionicons} name="hourglass" color="white" size="md" />
                        ) : (
                          <Icon as={Ionicons} name="volume-high" color="white" size="md" />
                        )}
                        <Text color="white" fontWeight="600">
                          {isLoading ? 'Testing...' : 'Test Voice Output'}
                        </Text>
                      </HStack>
                    </Box>
                  )}
                </Pressable>
              </VStack>
            </VStack>
          </Box>

          {/* Voice Tips */}
          <Box bg="blue.50" borderRadius="2xl" p={6} borderWidth={1} borderColor="blue.200">
            <HStack space={3} alignItems="flex-start">
              <Icon as={Ionicons} name="information-circle" color="blue.600" size="md" mt={1} />
              <VStack space={2} flex={1}>
                <Text fontSize="md" fontWeight="600" color="blue.800">
                  Voice Tips
                </Text>
                <VStack space={1}>
                  <Text fontSize="sm" color="blue.700">
                    • Speak clearly and at a normal pace
                  </Text>
                  <Text fontSize="sm" color="blue.700">
                    • Use drug names or common terms
                  </Text>
                  <Text fontSize="sm" color="blue.700">
                    • Ensure good microphone access
                  </Text>
                  <Text fontSize="sm" color="blue.700">
                    • Test in a quiet environment
                  </Text>
                </VStack>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </ScrollView>
    </Box>
  );
} 