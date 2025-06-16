import React, { useState, useRef, useMemo, useCallback, useEffect, forwardRef } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Input,
  Button,
  Center,
  Pressable,
  useBreakpointValue,
  StatusBar,
  useToast,
  ScrollView,
  KeyboardAvoidingView,
  IInputProps,
} from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Platform, Dimensions, TextInput, View, StyleSheet } from 'react-native';
import { authAPI, apiUtils } from '../../services/api';

const { width, height } = Dimensions.get('window');

// Custom Input component that wraps native TextInput
const CustomInput = forwardRef<TextInput, any>(({ 
  placeholder, 
  value, 
  onChangeText, 
  onFocus, 
  onBlur,
  secureTextEntry = false,
  autoCapitalize = 'none',
  autoCorrect = false,
  returnKeyType = 'done',
  onSubmitEditing,
  editable = true,
  style,
  ...props 
}, ref) => {
  return (
    <View style={[styles.inputContainer, style]}>
      <TextInput
        ref={ref}
        style={styles.textInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  textInput: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
});

export default function AdminLoginScreen() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Add refs for input management with proper typing
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const toast = useToast();
  
  // Memoize breakpoint values to prevent re-renders
  const cardWidth = useMemo(() => {
    if (width < 768) return width * 0.9;
    if (width < 1024) return 400;
    return 450;
  }, []);
  
  const titleSize = useMemo(() => {
    if (width < 768) return '2xl';
    if (width < 1024) return '3xl';
    return '3xl';
  }, []);
  
  const containerPadding = useMemo(() => {
    if (width < 768) return 4;
    if (width < 1024) return 6;
    return 8;
  }, []);

  // Focus management
  useEffect(() => {
    const handleFocus = (inputName: string) => {
      setFocusedInput(inputName);
    };

    const handleBlur = () => {
      setFocusedInput(null);
    };

    return () => {
      // Cleanup
    };
  }, []);

  const handleLogin = useCallback(async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.show({
        description: "Please fill in all fields",
        variant: "warning",
        placement: "top"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Use real API
      const loginResponse = await authAPI.login({
        username: formData.username.trim(),
        password: formData.password,
      });
      
      toast.show({
        description: `Welcome back, ${loginResponse.fullName}!`,
        variant: "success",
        placement: "top"
      });
      
      // Navigate to admin dashboard
      router.replace('/admin/dashboard');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (apiUtils.isNetworkError(error)) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid credentials. Please check your Staff ID/Email and password.';
      } else {
        errorMessage = apiUtils.getErrorMessage(error);
      }
      
      toast.show({
        description: errorMessage,
        variant: "error",
        placement: "top"
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, toast]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  const fillDemoCredentials = useCallback((staffId: string, password: string) => {
    setFormData({ username: staffId, password });
  }, []);

  const handleUsernameChange = useCallback((text: string) => {
    setFormData(prev => ({...prev, username: text}));
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setFormData(prev => ({...prev, password: text}));
  }, []);

  const handleShowPasswordToggle = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleUsernameSubmit = useCallback(() => {
    passwordRef.current?.focus();
  }, []);

  const handlePasswordSubmit = useCallback(() => {
    handleLogin();
  }, [handleLogin]);

  const handleUsernameFocus = useCallback(() => {
    setFocusedInput('username');
  }, []);

  const handlePasswordFocus = useCallback(() => {
    setFocusedInput('password');
  }, []);

  const handleUsernameBlur = useCallback(() => {
    setFocusedInput(null);
  }, []);

  const handlePasswordBlur = useCallback(() => {
    setFocusedInput(null);
  }, []);

  return (
    <Box flex={1}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2196f3', '#1976d2']}
        style={{ flex: 1 }}
      >
        
        {/* Back Button */}
        <Box position="absolute" top={12} left={4} zIndex={10}>
          <Pressable onPress={handleGoBack} p={2}>
            <Text color="white" fontSize="2xl">←</Text>
          </Pressable>
        </Box>

        <KeyboardAvoidingView 
          flex={1} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          enabled={true}
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            bounces={false}
          >
            <Center flex={1} px={containerPadding}>
              
              {/* Login Card */}
              <Box
                bg="white"
                rounded="2xl"
                shadow={9}
                p={8}
                w={cardWidth}
                maxW="md"
              >
                <VStack space={6} alignItems="center">
                  
                  {/* Header */}
                  <VStack space={3} alignItems="center">
                    <Box
                      bg="primary.50"
                      p={4}
                      rounded="full"
                    >
                      <Text fontSize="3xl">🛡️</Text>
                    </Box>
                    <Text
                      fontSize={titleSize}
                      fontWeight="bold"
                      color="primary.700"
                      textAlign="center"
                    >
                      FDA Admin Login
                    </Text>
                    <Text
                      fontSize="sm"
                      color="gray.500"
                      textAlign="center"
                    >
                      Enter your Staff ID or Email and password
                    </Text>
                  </VStack>

                  {/* Login Form */}
                  <VStack space={4} w="100%">
                    
                    {/* Username Field */}
                    <VStack space={2}>
                      <Text fontSize="sm" fontWeight="500" color="gray.700">
                        Staff ID or Email
                      </Text>
                      <CustomInput
                        ref={usernameRef}
                        placeholder="e.g. FDA001 or admin@fda.gov.gh"
                        value={formData.username}
                        onChangeText={handleUsernameChange}
                        onFocus={handleUsernameFocus}
                        onBlur={handleUsernameBlur}
                        returnKeyType="next"
                        onSubmitEditing={handleUsernameSubmit}
                        editable={!isLoading}
                      />
                    </VStack>

                    {/* Password Field */}
                    <VStack space={2}>
                      <Text fontSize="sm" fontWeight="500" color="gray.700">
                        Password
                      </Text>
                      <View style={{ position: 'relative' }}>
                        <CustomInput
                          ref={passwordRef}
                          placeholder="Enter your password"
                          secureTextEntry={!showPassword}
                          value={formData.password}
                          onChangeText={handlePasswordChange}
                          onFocus={handlePasswordFocus}
                          onBlur={handlePasswordBlur}
                          returnKeyType="done"
                          onSubmitEditing={handlePasswordSubmit}
                          editable={!isLoading}
                        />
                        <Pressable 
                          onPress={handleShowPasswordToggle} 
                          style={{
                            position: 'absolute',
                            right: 12,
                            top: 12,
                            zIndex: 1,
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text fontSize="sm" color="#2196f3">
                            {showPassword ? "Hide" : "Show"}
                          </Text>
                        </Pressable>
                      </View>
                    </VStack>

                    {/* Login Button */}
                    <Button
                      onPress={handleLogin}
                      isLoading={isLoading}
                      isLoadingText="Authenticating..."
                      size="lg"
                      bg="primary.500"
                      _pressed={{ bg: "primary.600" }}
                      _text={{
                        fontWeight: "600"
                      }}
                      mt={2}
                    >
                      Login to Admin Panel
                    </Button>

                  </VStack>

                  {/* Demo Credentials */}
                  <Box bg="gray.50" p={4} rounded="lg" w="100%">
                    <Text fontSize="xs" color="gray.600" textAlign="center" fontWeight="500" mb={3}>
                      Quick Login (Demo):
                    </Text>
                    <VStack space={2}>
                      <Pressable 
                        onPress={() => fillDemoCredentials('FDA001', 'Admin123!')}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      >
                        <Box bg="primary.50" p={2} rounded="md">
                          <Text fontSize="xs" color="primary.700" textAlign="center" fontWeight="500">
                            🥇 FDA001 - Dr. Kwame Asante (Senior Inspector)
                          </Text>
                        </Box>
                      </Pressable>
                      
                      <Pressable 
                        onPress={() => fillDemoCredentials('FDA002', 'Admin456!')}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      >
                        <Box bg="success.50" p={2} rounded="md">
                          <Text fontSize="xs" color="success.700" textAlign="center" fontWeight="500">
                            🥈 FDA002 - Dr. Ama Osei (Quality Officer)
                          </Text>
                        </Box>
                      </Pressable>
                      
                      <Pressable 
                        onPress={() => fillDemoCredentials('FDA003', 'Admin789!')}
                        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      >
                        <Box bg="warning.50" p={2} rounded="md">
                          <Text fontSize="xs" color="warning.700" textAlign="center" fontWeight="500">
                            🥉 FDA003 - Mr. Kofi Mensah (Enforcement Director)
                          </Text>
                        </Box>
                      </Pressable>
                    </VStack>
                  </Box>

                </VStack>
              </Box>

              {/* Footer */}
              <VStack space={2} alignItems="center" mt={8}>
                <Text color="white" opacity={0.8} fontSize="sm" textAlign="center">
                  Authorized Personnel Only
                </Text>
                <Text color="white" fontSize="xs" opacity={0.6} textAlign="center">
                  Food and Drugs Authority - Ghana
                </Text>
              </VStack>

            </Center>
          </ScrollView>
        </KeyboardAvoidingView>

      </LinearGradient>
    </Box>
  );
}