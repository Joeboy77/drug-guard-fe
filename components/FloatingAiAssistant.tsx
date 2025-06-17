import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Input,
  Button,
  Pressable,
  useToast,
  Spinner,
  Icon,
  Badge,
  Select,
  CheckIcon,
  Modal,
  Center,
  Avatar,
  Divider,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions, 
  Animated,
  ScrollView,
  View,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  language?: string;
  safetyLevel?: string;
  disclaimer?: string;
}

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Twi', value: 'twi' },
  { label: 'Ga', value: 'ga' },
  { label: 'Ewe', value: 'ewe' },
];

interface FloatingAiAssistantProps {
  isVisible: boolean;
  onClose: () => void;
}

// Enhanced Custom Input component
const CustomInput = forwardRef<TextInput, any>(({ 
  placeholder, 
  value, 
  onChangeText, 
  onFocus, 
  onBlur,
  multiline = false,
  maxHeight = 100,
  style,
  ...props 
}, ref) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  React.useImperativeHandle(ref, () => inputRef.current!);

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      useNativeDriver: false, // Required for color/shadow animations
      tension: 100,
      friction: 8,
    }).start();
    onFocus?.(e);
  }, [onFocus, focusAnim]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      useNativeDriver: false, // Required for color/shadow animations
      tension: 100,
      friction: 8,
    }).start();
    onBlur?.(e);
  }, [onBlur, focusAnim]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#6366F1'],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.25],
  });

  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#FAFBFF'],
  });

  const scale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  return (
    <Animated.View style={[
      styles.inputContainer, 
      style,
      {
        borderColor,
        shadowOpacity,
        backgroundColor,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: isFocused ? 8 : 2,
        minHeight: multiline ? 56 : 56,
        maxHeight: multiline ? maxHeight : 56,
        transform: [{ scale }],
      }
    ]}>
      <TextInput
        ref={inputRef}
        style={[
          styles.textInput,
          { 
            textAlignVertical: multiline ? 'top' : 'center',
            fontSize: 16,
            lineHeight: 22,
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        multiline={multiline}
        returnKeyType={multiline ? 'default' : 'send'}
        blurOnSubmit={!multiline}
        {...props}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flex: 1,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});

// Enhanced Typing Indicator
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (animatedValue: Animated.Value, delay: number) => 
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );

    const animation1 = createAnimation(dot1, 0);
    const animation2 = createAnimation(dot2, 200);
    const animation3 = createAnimation(dot3, 400);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <HStack space={1} alignItems="center" px={4} py={3}>
      <Avatar size="sm" bg="primary.500" mr={2}>
        <Icon as={Ionicons} name="medical" color="white" size="sm" />
      </Avatar>
      <Box bg="white" px={4} py={3} rounded="2xl" shadow={2} borderWidth={1} borderColor="gray.100">
        <HStack space={1} alignItems="center">
          {[dot1, dot2, dot3].map((dot, index) => (
            <Animated.View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#6366F1',
                opacity: dot,
                transform: [
                  {
                    scale: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.5],
                    }),
                  },
                ],
              }}
            />
          ))}
          <Text fontSize="sm" color="gray.600" ml={2}>
            AI is thinking...
          </Text>
        </HStack>
      </Box>
    </HStack>
  );
};

// Memoized input wrapper
const InputWrapper = React.memo(({ 
  value, 
  onChangeText, 
  placeholder, 
  multiline = false,
  maxHeight = 100,
  ...props 
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  maxHeight?: number;
  [key: string]: any;
}) => (
  <CustomInput
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    multiline={multiline}
    maxHeight={maxHeight}
    {...props}
  />
));

// Enhanced Floating Button Component
const FloatingAiButton = ({ onPress }: { onPress: () => void }) => {
  const [isPressed, setIsPressed] = useState(false);
  const buttonAnim = useRef(new Animated.Value(0)).current; // Single animation value
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(buttonAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false, // For width and opacity
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(buttonAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false, // For width and opacity
    }).start();
  };

  const width = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [64, 160],
  });

  const scale = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
  });

  const textOpacity = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const textTranslateX = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 100,
        right: 16,
        zIndex: 1000,
        transform: [{ scale: pulseAnim }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={{
            width,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#6366F1',
            shadowColor: '#6366F1',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            transform: [{ scale }],
          }}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.gradientBackground}
          />
          <Icon
            as={Ionicons}
            name="medical"
            size="lg"
            color="white"
            style={{ marginRight: 8 }}
          />
          <Animated.View
            style={{
              opacity: textOpacity,
              transform: [{ translateX: textTranslateX }],
            }}
          >
            <Text
              color="white"
              fontSize="md"
              fontWeight="700"
              numberOfLines={1}
              style={{ width: 90 }}
            >
              AI Health
            </Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// Message Component
const MessageComponent = ({ message }: { message: ChatMessage }) => (
  <Box
    mb={4}
    alignSelf={message.type === 'user' ? 'flex-end' : 'flex-start'}
    maxW="85%"
  >
    {message.type === 'ai' && (
      <HStack mb={2} alignItems="center">
        <Avatar size="sm" bg="primary.500" mr={2}>
          <Icon as={Ionicons} name="medical" color="white" size="sm" />
        </Avatar>
        <Text fontSize="xs" color="gray.500" fontWeight="semibold">
          AI Health Assistant
        </Text>
      </HStack>
    )}
    
    <Box
      bg={message.type === 'user' 
        ? { linearGradient: { colors: ['#6366F1', '#8B5CF6'], start: [0, 0], end: [1, 1] } }
        : 'white'
      }
      px={5}
      py={4}
      rounded="2xl"
      shadow={message.type === 'user' ? 4 : 2}
      borderWidth={message.type === 'ai' ? 1 : 0}
      borderColor="gray.100"
      ml={message.type === 'ai' ? 10 : 0}
    >
      <Text
        color={message.type === 'user' ? 'white' : 'gray.800'}
        fontSize="md"
        lineHeight="lg"
        fontWeight={message.type === 'user' ? '600' : '500'}
      >
        {message.content}
      </Text>
      
      {message.disclaimer && (
        <Box mt={3} p={3} bg="yellow.50" rounded="xl" borderWidth={1} borderColor="yellow.200">
          <Text fontSize="xs" color="yellow.800" fontStyle="italic" lineHeight="md">
            ⚠️ {message.disclaimer}
          </Text>
        </Box>
      )}
      
      {message.safetyLevel === 'EMERGENCY' && (
        <Box mt={3} p={3} bg="red.50" rounded="xl" borderWidth={1} borderColor="red.200">
          <Text fontSize="xs" color="red.800" fontWeight="bold" lineHeight="md">
            🚨 EMERGENCY: Seek immediate medical attention!
          </Text>
        </Box>
      )}
    </Box>
    
    <Text
      fontSize="xs"
      color="gray.400"
      mt={2}
      alignSelf={message.type === 'user' ? 'flex-end' : 'flex-start'}
      ml={message.type === 'ai' ? 10 : 0}
    >
      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </Text>
  </Box>
);

export default function FloatingAiAssistant({ isVisible, onClose }: FloatingAiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const toast = useToast();
  const slideAnim = useRef(new Animated.Value(height)).current;

  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      loadSuggestedQuestions();
      addWelcomeMessage();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, selectedLanguage, slideAnim]);

  const loadSuggestedQuestions = async () => {
    try {
      const suggestions = getSuggestionsForLanguage(selectedLanguage);
      setSuggestedQuestions(suggestions);
    } catch (error) {
      console.error('Failed to load suggested questions:', error);
    }
  };

  const getSuggestionsForLanguage = (language: string) => {
    switch (language) {
      case 'twi':
        return [
          'Paracetamol yɛ aduru a ɛyɛ ade?',
          'Mɛtumi aya aduru a ɛnyɛ ade?',
          'Aduru a ɛyɛ ade wɔ Ghana?',
          'Sɛdeɛ mɛkora aduru?',
        ];
      case 'ga':
        return [
          'Paracetamol yɛ aduru a ɛyɛ ade?',
          'Mɛtumi aya aduru a ɛnyɛ ade?',
          'Aduru a ɛyɛ ade wɔ Ghana?',
          'Sɛdeɛ mɛkora aduru?',
        ];
      case 'ewe':
        return [
          'Paracetamol nye atike a nye ade?',
          'Mɛtumi aya atike a nye ade?',
          'Atike a nye ade le Ghana?',
          'Aleke mawɔ atike?',
        ];
      default:
        return [
          'What are the side effects of paracetamol?',
          'How can I identify fake drugs?',
          'What are common medications in Ghana?',
          'How to safely store medications?',
          'What should I do if I miss a dose?',
          'Drug interactions to watch for?',
        ];
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'ai',
      content: getWelcomeMessage(selectedLanguage),
      timestamp: new Date(),
      language: selectedLanguage,
    };
    setMessages([welcomeMessage]);
  };

  const getWelcomeMessage = (language: string) => {
    switch (language) {
      case 'twi':
        return 'Akwaaba! Me yɛ AI Health Assistant. Me bɛtumi akyerɛ wo aduru ho asɛm ne ahobrɛase. Fa wo mbisa bi a! 🏥✨';
      case 'ga':
        return 'Akwaaba! Me yɛ AI Health Assistant. Me bɛtumi akyerɛ wo aduru ho asɛm ne ahobrɛase. Fa wo mbisa bi a! 🏥✨';
      case 'ewe':
        return 'Woezɔ! Nye le AI Health Assistant. Nye ate ŋu aɖe wo atike kple ahobrɛase. Na wo mbisa aɖe! 🏥✨';
      default:
        return 'Welcome! I\'m your AI Health Assistant. I can help you with drug information and health advice. Ask me anything! 🏥✨';
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      language: selectedLanguage,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiResponse = getMockAiResponse(content.trim(), selectedLanguage);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        language: selectedLanguage,
        safetyLevel: 'SAFE',
        disclaimer: 'This AI provides general health information only. Always consult a healthcare professional for medical advice.',
      };

      setMessages(prev => [...prev, aiMessage]);

      toast.show({
        description: 'Response received successfully!',
        variant: 'success',
        placement: 'top',
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m having trouble processing your question right now. Please try again later or consult a healthcare professional.',
        timestamp: new Date(),
        language: selectedLanguage,
        safetyLevel: 'ERROR',
      };

      setMessages(prev => [...prev, errorMessage]);

      toast.show({
        description: 'Failed to get response. Please try again.',
        variant: 'error',
        placement: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMockAiResponse = (question: string, language: string) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('paracetamol') || lowerQuestion.includes('acetaminophen')) {
      return language === 'en' 
        ? 'Paracetamol (acetaminophen) is a common pain reliever and fever reducer. 💊\n\n✅ Common uses: Pain relief, fever reduction\n⚠️ Side effects: Nausea, stomach upset (rare)\n📋 Dosage: Follow package instructions\n🔔 Always consult a doctor if symptoms persist beyond 3 days.'
        : 'Paracetamol yɛ aduru a ɛyɛ ade a ɛyɛ aduru a ɛyɛ ade. 💊\n\nɛyɛ aduru a ɛyɛ ade a ɛyɛ ade. Fa wo mbisa bi a healthcare professional ho!';
    }
    
    if (lowerQuestion.includes('fake') || lowerQuestion.includes('counterfeit')) {
      return language === 'en'
        ? '🔍 To identify fake drugs:\n\n✅ Check proper packaging and labels\n📱 Verify with DrugGuard Ghana app\n🏪 Buy from registered pharmacies only\n🆔 Look for FDA registration numbers\n📞 Report suspicious drugs immediately\n\n🚨 Fake drugs can be dangerous - always be vigilant!'
        : '🔍 Sɛ wo bɛhunu aduru a ɛnyɛ ade:\n\n✅ Hwɛ packaging ne labels\n📱 Verify wɔ DrugGuard Ghana app\n🏪 Tɔ wɔ registered pharmacies\n🆔 Hwɛ FDA registration numbers\n📞 Report suspicious drugs immediately';
    }
    
    return language === 'en'
      ? 'Thank you for your question! 😊 I\'m here to help with health and medication information. For specific medical advice, please consult a healthcare professional. 👩‍⚕️👨‍⚕️'
      : 'Meda wo ase wo mbisa! 😊 Me wɔ ha sɛ me bɛkyerɛ wo aduru ho asɛm. Sɛ wo wɔ mbisa a ɛfa medical advice ho a, fa wo mbisa healthcare professional. 👩‍⚕️👨‍⚕️';
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Modal isOpen={isVisible} onClose={onClose} size="full">
      <Modal.Content bg="transparent" maxW="100%" maxH="100%">
        <Modal.Body p={0}>
          <Animated.View
            style={{
              flex: 1,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Box flex={1} bg="gray.50" rounded="3xl" overflow="hidden" shadow={9}>
              {/* Enhanced Header */}
              <Box>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6', '#EC4899']}
                  style={styles.gradientBackground}
                />
                <Box px={6} py={5} pt={8}>
                  <HStack justifyContent="space-between" alignItems="center" mb={4}>
                    <VStack flex={1}>
                      <HStack alignItems="center" mb={1}>
                        <Avatar size="md" bg="white" mr={3}>
                          <Icon as={Ionicons} name="medical" color="primary.500" size="lg" />
                        </Avatar>
                        <VStack>
                          <Text fontSize="xl" fontWeight="bold" color="white">
                            AI Health Assistant
                          </Text>
                          <Text fontSize="sm" color="white" opacity={0.9}>
                            Your medical AI companion
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                    
                    <HStack space={3} alignItems="center">
                      <Badge colorScheme="green" variant="solid" rounded="full" px={3}>
                        <HStack alignItems="center" space={1}>
                          <Box w={2} h={2} bg="green.300" rounded="full" />
                          <Text fontSize="xs" fontWeight="bold">Online</Text>
                        </HStack>
                      </Badge>
                      <Pressable onPress={onClose} p={2} rounded="full" bg="blackAlpha.200">
                        <Icon as={Ionicons} name="close" size="lg" color="white" />
                      </Pressable>
                    </HStack>
                  </HStack>

                  {/* Enhanced Language Selector */}
                  <HStack space={3} alignItems="center">
                    <Icon as={Ionicons} name="language" size="sm" color="white" opacity={0.9} />
                    <Text fontSize="sm" color="white" opacity={0.9} fontWeight="600">Language:</Text>
                    <Select
                      selectedValue={selectedLanguage}
                      minWidth="140"
                      onValueChange={setSelectedLanguage}
                      bg="whiteAlpha.200"
                      borderColor="whiteAlpha.300"
                      color="white"
                      placeholderTextColor="white"
                      dropdownIcon={<Icon as={Ionicons} name="chevron-down" color="white" size="sm" />}
                      _selectedItem={{
                        bg: "primary.600",
                        endIcon: <CheckIcon size="4" color="white" />
                      }}
                    >
                      {languages.map(lang => (
                        <Select.Item key={lang.value} label={lang.label} value={lang.value} />
                      ))}
                    </Select>
                  </HStack>
                </Box>
              </Box>

              {/* Chat Messages - FIXED: Removed FlatList, using map directly */}
              <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((message) => (
                  <MessageComponent key={message.id} message={message} />
                ))}
                
                {isLoading && <TypingIndicator />}
              </ScrollView>

              {/* Enhanced Suggested Questions */}
              {showSuggestions && suggestedQuestions.length > 0 && (
                <Box bg="white" px={5} py={4} borderTopWidth={1} borderColor="gray.100">
                  <Text fontSize="md" fontWeight="bold" color="gray.700" mb={3}>
                    💡 Suggested Questions
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <HStack space={3}>
                      {suggestedQuestions.slice(0, 6).map((question, index) => (
                        <Pressable
                          key={index}
                          onPress={() => handleSuggestedQuestion(question)}
                          bg="primary.50"
                          px={4}
                          py={3}
                          rounded="2xl"
                          borderWidth={1}
                          borderColor="primary.200"
                          shadow={1}
                          _pressed={{ bg: 'primary.100', transform: [{ scale: 0.98 }] }}
                        >
                          <Text fontSize="sm" color="primary.700" numberOfLines={2} fontWeight="500">
                            {question}
                          </Text>
                        </Pressable>
                      ))}
                    </HStack>
                  </ScrollView>
                </Box>
              )}

              {/* Enhanced Input Area */}
              <Box bg="white" px={5} py={4} borderTopWidth={1} borderColor="gray.100">
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                  <HStack space={3} alignItems="flex-end">
                    <InputWrapper
                      value={inputText}
                      onChangeText={handleInputChange}
                      placeholder="Ask me about health and medications..."
                      multiline
                      maxHeight={120}
                    />
                    <Pressable
                      onPress={() => sendMessage(inputText)}
                      disabled={!inputText.trim() || isLoading}
                      style={({ pressed }) => ({
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      })}
                    >
                      <Box
                        bg={!inputText.trim() || isLoading ? 'gray.300' : 'primary.500'}
                        rounded="2xl"
                        p={4}
                        shadow={3}
                      >
                        <Icon
                          as={Ionicons}
                          name={isLoading ? 'hourglass' : 'send'}
                          size="lg"
                          color="white"
                        />
                      </Box>
                    </Pressable>
                  </HStack>
                </KeyboardAvoidingView>
              </Box>
            </Box>
          </Animated.View>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}

export { FloatingAiButton };