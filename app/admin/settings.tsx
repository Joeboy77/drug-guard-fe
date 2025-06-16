import React, { useState } from 'react';
import {
  VStack,
  Box,
  Text,
  HStack,
  Icon,
  Pressable,
  Spinner,
  Divider,
  useToast,
} from 'native-base';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { authAPI } from '../../services/api';

export default function SettingsScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toast = useToast();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Call the logout API
      await authAPI.logout();

      // Show success message
      toast.show({
        description: 'Logged out successfully',
        status: 'success',
        placement: 'top',
      });

      // Navigate to root using Expo Router
      router.replace('/');

    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Even if API call fails, remove token locally and navigate
      try {
        await authAPI.logout();
      } catch (logoutError) {
        console.error('Token removal error:', logoutError);
      }

      // Show error message but still navigate
      toast.show({
        description: 'Logged out locally',
        status: 'warning',
        placement: 'top',
      });

      // Still navigate to root even if logout API fails
      router.replace('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const showLogoutConfirmation = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out of your FDA admin account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]
    );
  };

  return (
    <Box flex={1} bg="gray.50">
      <VStack flex={1} space={6} p={6}>
        {/* Header */}
        <VStack space={2} alignItems="center" mt={8}>
          <Icon
            as={Ionicons}
            name="settings-outline"
            size="xl"
            color="primary.600"
          />
          <Text fontSize="2xl" fontWeight="bold" color="primary.600">
            System Settings
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Manage your account and system preferences
          </Text>
        </VStack>

        <Divider />

        {/* Settings Options */}
        <VStack space={4} flex={1}>
          
          {/* Account Section */}
          <VStack space={3}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700">
              Account
            </Text>
            
            {/* Logout Option */}
            <Pressable
              onPress={showLogoutConfirmation}
              disabled={isLoggingOut}
              _pressed={{ opacity: 0.6 }}
            >
              <Box
                bg="white"
                p={4}
                rounded="lg"
                shadow={1}
                borderWidth={1}
                borderColor="red.200"
              >
                <HStack alignItems="center" justifyContent="space-between">
                  <HStack space={3} alignItems="center" flex={1}>
                    <Box
                      bg="red.100"
                      p={2}
                      rounded="full"
                    >
                      <Icon
                        as={Ionicons}
                        name="log-out-outline"
                        size="md"
                        color="red.600"
                      />
                    </Box>
                    <VStack flex={1}>
                      <Text fontSize="md" fontWeight="medium" color="red.600">
                        Logout
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Sign out of your FDA admin account
                      </Text>
                    </VStack>
                  </HStack>
                  
                  {isLoggingOut ? (
                    <Spinner size="sm" color="red.600" />
                  ) : (
                    <Icon
                      as={Ionicons}
                      name="chevron-forward"
                      size="sm"
                      color="red.400"
                    />
                  )}
                </HStack>
              </Box>
            </Pressable>
          </VStack>

          {/* Coming Soon Section */}
          <VStack space={3} mt={6}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700">
              Coming Soon
            </Text>
            
            {/* Placeholder Options */}
            <Box
              bg="white"
              p={4}
              rounded="lg"
              shadow={1}
              opacity={0.6}
            >
              <HStack alignItems="center" space={3}>
                <Box
                  bg="gray.100"
                  p={2}
                  rounded="full"
                >
                  <Icon
                    as={Ionicons}
                    name="notifications-outline"
                    size="md"
                    color="gray.400"
                  />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="md" fontWeight="medium" color="gray.400">
                    Notification Settings
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Configure alerts and notifications
                  </Text>
                </VStack>
                <Icon
                  as={Ionicons}
                  name="lock-closed"
                  size="sm"
                  color="gray.300"
                />
              </HStack>
            </Box>

            <Box
              bg="white"
              p={4}
              rounded="lg"
              shadow={1}
              opacity={0.6}
            >
              <HStack alignItems="center" space={3}>
                <Box
                  bg="gray.100"
                  p={2}
                  rounded="full"
                >
                  <Icon
                    as={Ionicons}
                    name="shield-outline"
                    size="md"
                    color="gray.400"
                  />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="md" fontWeight="medium" color="gray.400">
                    Security Settings
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Password and authentication options
                  </Text>
                </VStack>
                <Icon
                  as={Ionicons}
                  name="lock-closed"
                  size="sm"
                  color="gray.300"
                />
              </HStack>
            </Box>

            <Box
              bg="white"
              p={4}
              rounded="lg"
              shadow={1}
              opacity={0.6}
            >
              <HStack alignItems="center" space={3}>
                <Box
                  bg="gray.100"
                  p={2}
                  rounded="full"
                >
                  <Icon
                    as={Ionicons}
                    name="document-text-outline"
                    size="md"
                    color="gray.400"
                  />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="md" fontWeight="medium" color="gray.400">
                    Data Export
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Export system data and reports
                  </Text>
                </VStack>
                <Icon
                  as={Ionicons}
                  name="lock-closed"
                  size="sm"
                  color="gray.300"
                />
              </HStack>
            </Box>

            <Box
              bg="white"
              p={4}
              rounded="lg"
              shadow={1}
              opacity={0.6}
            >
              <HStack alignItems="center" space={3}>
                <Box
                  bg="gray.100"
                  p={2}
                  rounded="full"
                >
                  <Icon
                    as={Ionicons}
                    name="people-outline"
                    size="md"
                    color="gray.400"
                  />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="md" fontWeight="medium" color="gray.400">
                    User Management
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Manage FDA admin accounts
                  </Text>
                </VStack>
                <Icon
                  as={Ionicons}
                  name="lock-closed"
                  size="sm"
                  color="gray.300"
                />
              </HStack>
            </Box>

            <Box
              bg="white"
              p={4}
              rounded="lg"
              shadow={1}
              opacity={0.6}
            >
              <HStack alignItems="center" space={3}>
                <Box
                  bg="gray.100"
                  p={2}
                  rounded="full"
                >
                  <Icon
                    as={Ionicons}
                    name="server-outline"
                    size="md"
                    color="gray.400"
                  />
                </Box>
                <VStack flex={1}>
                  <Text fontSize="md" fontWeight="medium" color="gray.400">
                    System Configuration
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Advanced system settings
                  </Text>
                </VStack>
                <Icon
                  as={Ionicons}
                  name="lock-closed"
                  size="sm"
                  color="gray.300"
                />
              </HStack>
            </Box>
          </VStack>

        </VStack>

        {/* Footer */}
        <VStack space={2} alignItems="center" mt={4}>
          <Text fontSize="xs" color="gray.400">
            DrugGuard Ghana v1.0
          </Text>
          <Text fontSize="xs" color="gray.400">
            FDA Administration System
          </Text>
          <Text fontSize="xs" color="gray.300">
            © 2024 Ghana Food and Drugs Authority
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}