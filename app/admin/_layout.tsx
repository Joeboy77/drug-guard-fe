import React, { useEffect, useState } from 'react';
import { Stack, router, usePathname } from 'expo-router';
import {
  Box,
  HStack,
  VStack,
  Text,
  Pressable,
  useBreakpointValue,
  StatusBar,
  Badge,
  Avatar,
  Menu,
  useToast,
  Divider,
} from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Dimensions } from 'react-native';
import { authAPI, authTokenManager } from '../../services/api';

const { width } = Dimensions.get('window');

interface AdminUser {
  staffId: string;
  fullName: string;
  department: string;
  position: string;
  email: string;
}

export default function AdminLayout() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const toast = useToast();

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await authTokenManager.getToken();
      if (!token) {
        router.replace('/');
        return;
      }

      const userData = await authAPI.validateToken();
      setAdminUser({
        staffId: userData.staffId,
        fullName: userData.fullName,
        department: userData.department,
        position: userData.position,
        email: userData.email,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      toast.show({
        description: 'Session expired. Please login again.',
        status: 'warning',
        placement: 'top',
      });
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      toast.show({
        description: 'Logged out successfully',
        status: 'success',
        placement: 'top',
      });
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, still navigate to root
      router.replace('/');
    }
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      icon: '📊',
      isActive: pathname === '/admin/dashboard',
    },
    {
      label: 'Drugs',
      route: '/admin/drugs',
      icon: '💊',
      isActive: pathname.startsWith('/admin/drugs'),
      badge: 'NEW',
    },
    {
      label: 'Analytics',
      route: '/admin/analytics',
      icon: '📈',
      isActive: pathname === '/admin/analytics',
    },
    {
      label: 'Settings',
      route: '/admin/settings',
      icon: '⚙️',
      isActive: pathname === '/admin/settings',
    },
  ];

  const AdminNavItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => router.push(item.route)}
      _pressed={{ opacity: 0.7 }}
    >
      <HStack
        space={3}
        alignItems="center"
        py={3}
        px={4}
        rounded="xl"
        bg={item.isActive ? 'primary.50' : 'transparent'}
        borderWidth={item.isActive ? 1 : 0}
        borderColor="primary.200"
      >
        <Text fontSize="lg">{item.icon}</Text>
        <VStack flex={1}>
          <HStack alignItems="center" space={2}>
            <Text
              fontSize="md"
              fontWeight={item.isActive ? '700' : '500'}
              color={item.isActive ? 'primary.700' : 'gray.700'}
            >
              {item.label}
            </Text>
            {item.badge && (
              <Badge colorScheme="warning" variant="solid" rounded="full" size="sm">
                {item.badge}
              </Badge>
            )}
          </HStack>
        </VStack>
        {item.isActive && (
          <Box w={1} h={6} bg="primary.500" rounded="full" />
        )}
      </HStack>
    </Pressable>
  );

  if (isLoading) {
    return (
      <Box flex={1} bg="white">
        <StatusBar barStyle="dark-content" />
        <LinearGradient colors={['#2196f3', '#1976d2']} style={{ flex: 1 }}>
          <VStack flex={1} justifyContent="center" alignItems="center" space={4}>
            <Text fontSize="4xl">🛡️</Text>
            <Text color="white" fontSize="lg" fontWeight="600">
              Loading Admin Panel...
            </Text>
          </VStack>
        </LinearGradient>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="gray.50">
      <StatusBar barStyle="dark-content" />
      
      {/* Mobile Header */}
      {isMobile && (
        <LinearGradient colors={['#2196f3', '#1976d2']}>
          <Box pt={12} pb={4} px={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space={3} alignItems="center">
                <Box bg="white" p={2} rounded="full">
                  <Text fontSize="lg">🛡️</Text>
                </Box>
                <VStack>
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    DrugGuard Admin
                  </Text>
                  <Text color="white" opacity={0.8} fontSize="sm">
                    {adminUser?.fullName}
                  </Text>
                </VStack>
              </HStack>
              
              <Menu
                trigger={(triggerProps) => (
                  <Pressable {...triggerProps}>
                    <Avatar size="sm" bg="white">
                      <Text color="primary.500" fontWeight="bold">
                        {adminUser?.fullName.charAt(0)}
                      </Text>
                    </Avatar>
                  </Pressable>
                )}
              >
                <Menu.Item onPress={() => router.push('/admin/profile')}>
                  Profile
                </Menu.Item>
                <Menu.Item onPress={handleLogout}>
                  Logout
                </Menu.Item>
              </Menu>
            </HStack>
          </Box>
        </LinearGradient>
      )}

      <HStack flex={1}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Box w="280" bg="white" borderRightWidth={1} borderColor="gray.200">
            <VStack flex={1}>
              {/* Sidebar Header */}
              <LinearGradient colors={['#2196f3', '#1976d2']}>
                <VStack space={4} p={6}>
                  <HStack space={3} alignItems="center">
                    <Box bg="white" p={3} rounded="full">
                      <Text fontSize="2xl">🛡️</Text>
                    </Box>
                    <VStack>
                      <Text color="white" fontSize="xl" fontWeight="bold">
                        DrugGuard
                      </Text>
                      <Text color="white" opacity={0.8} fontSize="sm">
                        Admin Panel
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Box bg="rgba(255,255,255,0.15)" p={3} rounded="xl">
                    <VStack space={1}>
                      <Text color="white" fontSize="sm" fontWeight="600">
                        {adminUser?.fullName}
                      </Text>
                      <Text color="white" opacity={0.8} fontSize="xs">
                        {adminUser?.position}
                      </Text>
                      <Text color="white" opacity={0.7} fontSize="xs">
                        {adminUser?.department}
                      </Text>
                    </VStack>
                  </Box>
                </VStack>
              </LinearGradient>

              {/* Navigation */}
              <VStack flex={1} p={4} space={2}>
                <Text
                  fontSize="xs"
                  fontWeight="600"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing={1}
                  mb={2}
                >
                  Navigation
                </Text>
                
                {navigationItems.map((item, index) => (
                  <AdminNavItem key={index} item={item} />
                ))}
              </VStack>

              {/* Sidebar Footer */}
              <Box p={4}>
                <Divider mb={4} />
                <Pressable onPress={handleLogout}>
                  <HStack space={3} alignItems="center" py={2}>
                    <Text fontSize="lg">🚪</Text>
                    <Text fontSize="md" color="error.500" fontWeight="500">
                      Logout
                    </Text>
                  </HStack>
                </Pressable>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Main Content Area */}
        <Box flex={1}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="drugs" />
            <Stack.Screen name="analytics" />
            <Stack.Screen name="settings" />
          </Stack>
        </Box>
      </HStack>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Box bg="white" borderTopWidth={1} borderColor="gray.200" pt={2} pb={6}>
          <HStack justifyContent="space-around" alignItems="center">
            {navigationItems.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => router.push(item.route)}
                _pressed={{ opacity: 0.7 }}
                flex={1}
                alignItems="center"
              >
                <VStack space={1} alignItems="center">
                  <Box
                    bg={item.isActive ? 'primary.50' : 'transparent'}
                    p={2}
                    rounded="full"
                    position="relative"
                  >
                    <Text fontSize="lg">{item.icon}</Text>
                    {item.badge && (
                      <Badge
                        position="absolute"
                        top={-1}
                        right={-1}
                        colorScheme="warning"
                        variant="solid"
                        rounded="full"
                        size="xs"
                      >
                        •
                      </Badge>
                    )}
                  </Box>
                  <Text
                    fontSize="xs"
                    fontWeight={item.isActive ? '600' : '400'}
                    color={item.isActive ? 'primary.600' : 'gray.500'}
                  >
                    {item.label}
                  </Text>
                </VStack>
              </Pressable>
            ))}
          </HStack>
        </Box>
      )}
    </Box>
  );
}