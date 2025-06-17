import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Pressable,
  Icon,
  Text,
  HStack,
  VStack,
  Modal,
  Select,
  CheckIcon,
  useToast,
  Badge,
  Center,
  Spinner,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { Animated, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import voiceService, { Language } from '../services/voiceService';
import { Audio } from 'expo-av';

interface VoiceInputProps {
  onVoiceResult: (text: string) => void;
  onLanguageChange?: (language: Language) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onVoiceResult,
  onLanguageChange,
  disabled = false,
  size = 'md',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  // Get available languages
  const availableLanguages = voiceService.getAvailableLanguages();

  // Animation effects
  useEffect(() => {
    if (isListening) {
      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      // Wave animation
      const waveAnimation = Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      // Rotation animation
      const rotationAnimation = Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      );

      pulseAnimation.start();
      waveAnimation.start();
      rotationAnimation.start();

      return () => {
        pulseAnimation.stop();
        waveAnimation.stop();
        rotationAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
      rotationAnim.setValue(0);
    }
  }, [isListening, pulseAnim, waveAnim, rotationAnim]);

  // Handle language change
  const handleLanguageChange = useCallback((language: Language) => {
    setCurrentLanguage(language);
    voiceService.setLanguage(language);
    onLanguageChange?.(language);
    setIsModalVisible(false);
  }, [onLanguageChange]);

  // Simulate voice recognition (in a real app, this would use actual speech recognition)
  const startVoiceRecognition = useCallback(async () => {
    if (disabled) return;

    setIsListening(true);
    setIsProcessing(true);

    try {
      // Request microphone permissions when actually needed
      try {
        const { status } = await Audio.getPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await Audio.requestPermissionsAsync();
          if (newStatus !== 'granted') {
            toast.show({
              description: 'Microphone permission is required for voice recognition',
              variant: 'error',
            });
            setIsListening(false);
            setIsProcessing(false);
            return;
          }
        }
      } catch (permissionError) {
        console.warn('Permission request failed:', permissionError);
        // Continue with simulation for now
      }

      // Simulate listening time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate voice recognition result
      const simulatedResults = {
        en: ['paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin'],
        twi: ['paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin'],
        ga: ['paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin'],
        ewe: ['paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin'],
      };

      const results = simulatedResults[currentLanguage];
      const randomResult = results[Math.floor(Math.random() * results.length)];

      // Speak confirmation
      await voiceService.speak(
        voiceService.getSuccessMessage(currentLanguage, randomResult),
        currentLanguage
      );

      // Pass result to parent
      onVoiceResult(randomResult);

      toast.show({
        description: `Voice recognized: ${randomResult}`,
        variant: 'success',
      });

    } catch (error) {
      console.error('Voice recognition error:', error);
      
      await voiceService.speak(
        voiceService.getErrorMessage(currentLanguage),
        currentLanguage
      );

      toast.show({
        description: 'Voice recognition failed. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsListening(false);
      setIsProcessing(false);
    }
  }, [disabled, currentLanguage, onVoiceResult, toast]);

  // Stop voice recognition
  const stopVoiceRecognition = useCallback(async () => {
    setIsListening(false);
    setIsProcessing(false);
    await voiceService.stopSpeaking();
  }, []);

  // Handle button press
  const handlePress = useCallback(() => {
    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  }, [isListening, startVoiceRecognition, stopVoiceRecognition]);

  // Get button size styles
  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return { width: 48, height: 48, iconSize: 'md' };
      case 'lg':
        return { width: 72, height: 72, iconSize: '2xl' };
      default:
        return { width: 56, height: 56, iconSize: 'lg' };
    }
  };

  const buttonSize = getButtonSize();

  return (
    <>
      <Box position="relative">
        {/* Voice input button */}
        <Pressable
          onPress={handlePress}
          disabled={disabled || isProcessing}
          position="relative"
        >
          {({ isPressed }) => (
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  width: buttonSize.width,
                  height: buttonSize.height,
                  transform: [
                    { scale: isPressed ? 0.95 : 1 },
                    { scale: pulseAnim },
                  ],
                },
              ]}
            >
              {/* Background gradient */}
              <LinearGradient
                colors={
                  isListening
                    ? ['#EF4444', '#DC2626']
                    : ['#3B82F6', '#2563EB']
                }
                style={[styles.gradient, { borderRadius: buttonSize.width / 2 }]}
              />

              {/* Wave effect when listening */}
              {isListening && (
                <Animated.View
                  style={[
                    styles.wave,
                    {
                      width: buttonSize.width * 2,
                      height: buttonSize.height * 2,
                      borderRadius: buttonSize.width,
                      transform: [
                        {
                          scale: waveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 2],
                          }),
                        },
                      ],
                      opacity: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 0],
                      }),
                    },
                  ]}
                />
              )}

              {/* Icon */}
              <Center style={styles.iconContainer}>
                {isProcessing ? (
                  <Spinner color="white" size="sm" />
                ) : (
                  <Icon
                    as={Ionicons}
                    name={isListening ? 'mic' : 'mic-outline'}
                    color="white"
                    size={buttonSize.iconSize}
                  />
                )}
              </Center>
            </Animated.View>
          )}
        </Pressable>

        {/* Language indicator */}
        <Pressable
          onPress={() => setIsModalVisible(true)}
          position="absolute"
          top={-8}
          right={-8}
        >
          <Badge
            colorScheme="blue"
            variant="solid"
            rounded="full"
            px={2}
            py={1}
            minW={6}
          >
            <Text fontSize="xs" fontWeight="bold" color="white">
              {currentLanguage.toUpperCase()}
            </Text>
          </Badge>
        </Pressable>
      </Box>

      {/* Language selection modal */}
      <Modal isOpen={isModalVisible} onClose={() => setIsModalVisible(false)} size="sm">
        <Modal.Content>
          <Modal.Header>
            <HStack space={2} alignItems="center">
              <Icon as={Ionicons} name="language" color="blue.500" size="md" />
              <Text fontSize="lg" fontWeight="bold">
                Select Language
              </Text>
            </HStack>
          </Modal.Header>
          <Modal.Body>
            <VStack space={3}>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Choose your preferred language for voice recognition:
              </Text>
              {availableLanguages.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  {({ isPressed }) => (
                    <Box
                      bg={isPressed ? 'blue.50' : 'white'}
                      p={4}
                      borderRadius="lg"
                      borderWidth={1}
                      borderColor={currentLanguage === lang.code ? 'blue.200' : 'gray.200'}
                      shadow={isPressed ? 1 : 0}
                    >
                      <HStack justifyContent="space-between" alignItems="center">
                        <VStack>
                          <Text fontSize="md" fontWeight="600" color="gray.800">
                            {lang.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {lang.code.toUpperCase()}
                          </Text>
                        </VStack>
                        {currentLanguage === lang.code && (
                          <Icon as={Ionicons} name="checkmark-circle" color="blue.500" size="md" />
                        )}
                      </HStack>
                    </Box>
                  )}
                </Pressable>
              ))}
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  wave: {
    position: 'absolute',
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default VoiceInput; 