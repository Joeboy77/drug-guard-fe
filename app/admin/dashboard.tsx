import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  ScrollView,
  Pressable,
  useBreakpointValue,
  Badge,
  Button,
  Alert,
  Progress,
  Divider,
  Skeleton,
  Center,
  useToast,
} from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { RefreshControl, Dimensions } from 'react-native';
import { drugAPI, Drug } from '../../services/api';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalDrugs: number;
  activeDrugs: number;
  recalledDrugs: number;
  expiredDrugs: number;
  suspendedDrugs: number;
  drugsExpiringSoon: number;
}

interface ScanStats {
  totalScans: number;
  authenticScans: number;
  suspiciousScans: number;
  notFoundScans: number;
  errorScans: number;
  authenticPercentage: number;
  suspiciousPercentage: number;
}

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [scanStats, setScanStats] = useState<ScanStats | null>(null);
  const [expiringDrugs, setExpiringDrugs] = useState<Drug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 4 });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all dashboard data concurrently
      const [drugStatsResponse, scanStatsResponse, expiringResponse] = await Promise.all([
        drugAPI.getDrugStatistics(),
        drugAPI.getScanStatistics(),
        drugAPI.getDrugsExpiringSoon(30),
      ]);

      setDashboardStats(drugStatsResponse);
      setScanStats(scanStatsResponse);
      setExpiringDrugs(expiringResponse);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.show({
        description: 'Failed to load dashboard data',
        status: 'error',
        placement: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, subtitle, onPress }: any) => (
    <Pressable onPress={onPress} _pressed={{ opacity: 0.8 }}>
      <Box bg="white" rounded="2xl" p={5} shadow={3} mb={4}>
        <VStack space={3}>
          <HStack justifyContent="space-between" alignItems="flex-start">
            <Box bg={`${color}.100`} p={3} rounded="xl">
              <Text fontSize="2xl">{icon}</Text>
            </Box>
            <VStack alignItems="flex-end" space={1}>
              <Text fontSize="2xl" fontWeight="bold" color={`${color}.600`}>
                {value?.toLocaleString() || '0'}
              </Text>
              {subtitle && (
                <Text fontSize="xs" color="gray.500">
                  {subtitle}
                </Text>
              )}
            </VStack>
          </HStack>
          <Text fontSize="sm" fontWeight="600" color="gray.700">
            {title}
          </Text>
        </VStack>
      </Box>
    </Pressable>
  );

  const QuickActionCard = ({ title, description, icon, color, onPress }: any) => (
    <Pressable onPress={onPress} _pressed={{ opacity: 0.8 }}>
      <Box bg="white" rounded="xl" p={4} shadow={2} mb={3}>
        <HStack space={3} alignItems="center">
          <Box bg={`${color}.100`} p={3} rounded="xl">
            <Text fontSize="xl">{icon}</Text>
          </Box>
          <VStack flex={1} space={1}>
            <Text fontSize="md" fontWeight="semibold" color="gray.800">
              {title}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {description}
            </Text>
          </VStack>
          <Text fontSize="lg" color={`${color}.500`}>→</Text>
        </HStack>
      </Box>
    </Pressable>
  );

  const AlertCard = ({ type, title, message, count }: any) => {
    const alertColors = {
      warning: { bg: 'warning.50', border: 'warning.200', text: 'warning.800', icon: '⚠️' },
      error: { bg: 'error.50', border: 'error.200', text: 'error.800', icon: '🚨' },
      info: { bg: 'info.50', border: 'info.200', text: 'info.800', icon: 'ℹ️' },
    };
    
    const colors = alertColors[type] || alertColors.info;

    return (
      <Box bg={colors.bg} border="1" borderColor={colors.border} rounded="xl" p={4} mb={3}>
        <HStack space={3} alignItems="center">
          <Text fontSize="xl">{colors.icon}</Text>
          <VStack flex={1} space={1}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="md" fontWeight="semibold" color={colors.text}>
                {title}
              </Text>
              {count && (
                <Badge colorScheme={type} variant="solid" rounded="full">
                  {count}
                </Badge>
              )}
            </HStack>
            <Text fontSize="sm" color={colors.text}>
              {message}
            </Text>
          </VStack>
        </HStack>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <ScrollView flex={1} bg="gray.50" p={6}>
        <VStack space={4}>
          <Skeleton.Text lines={2} />
          <HStack space={4}>
            <Skeleton h="120" flex={1} rounded="xl" />
            <Skeleton h="120" flex={1} rounded="xl" />
          </HStack>
          <Skeleton h="200" rounded="xl" />
        </VStack>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      flex={1}
      bg="gray.50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={['#2196f3', '#1976d2']}>
        <VStack space={4} p={6} pt={isMobile ? 4 : 8}>
          <VStack space={2}>
            <Text fontSize="2xl" fontWeight="bold" color="white">
              Welcome back, Admin! 👋
            </Text>
            <Text fontSize="md" color="white" opacity={0.9}>
              Here's what's happening with DrugGuard Ghana today
            </Text>
          </VStack>
          
          <HStack space={4} flexWrap="wrap">
            <Box bg="rgba(255,255,255,0.2)" px={3} py={2} rounded="full">
              <Text fontSize="sm" color="white" fontWeight="500">
                📅 {new Date().toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </Box>
          </HStack>
        </VStack>
      </LinearGradient>

      <VStack space={6} p={6} mt={-4}>
        
        {/* Drug Statistics */}
        <VStack space={4}>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            📊 Drug Statistics
          </Text>
          
          <VStack space={4}>
            {/* Primary Stats */}
            <HStack space={4} flexWrap="wrap">
              <Box flex={cardColumns === 1 ? 1 : 0.48}>
                <StatCard
                  title="Total Drugs Registered"
                  value={dashboardStats?.totalDrugs}
                  icon="💊"
                  color="primary"
                  subtitle="All drugs"
                  onPress={() => router.push('/admin/drugs')}
                />
              </Box>
              <Box flex={cardColumns === 1 ? 1 : 0.48}>
                <StatCard
                  title="Active Drugs"
                  value={dashboardStats?.activeDrugs}
                  icon="✅"
                  color="success"
                  subtitle="Currently valid"
                  onPress={() => router.push('/admin/drugs?status=active')}
                />
              </Box>
            </HStack>

            {/* Secondary Stats */}
            <HStack space={4} flexWrap="wrap">
              <Box flex={cardColumns === 1 ? 1 : 0.32}>
                <StatCard
                  title="Recalled"
                  value={dashboardStats?.recalledDrugs}
                  icon="🚫"
                  color="error"
                  onPress={() => router.push('/admin/drugs?status=recalled')}
                />
              </Box>
              <Box flex={cardColumns === 1 ? 1 : 0.32}>
                <StatCard
                  title="Expired"
                  value={dashboardStats?.expiredDrugs}
                  icon="⏰"
                  color="warning"
                  onPress={() => router.push('/admin/drugs?status=expired')}
                />
              </Box>
              <Box flex={cardColumns === 1 ? 1 : 0.32}>
                <StatCard
                  title="Suspended"
                  value={dashboardStats?.suspendedDrugs}
                  icon="⏸️"
                  color="muted"
                  onPress={() => router.push('/admin/drugs?status=suspended')}
                />
              </Box>
            </HStack>
          </VStack>
        </VStack>

        {/* Verification Statistics */}
        <VStack space={4}>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            🔍 Verification Statistics
          </Text>
          
          <Box bg="white" rounded="2xl" p={5} shadow={3}>
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="primary.600">
                    {scanStats?.totalScans?.toLocaleString() || '0'}
                  </Text>
                  <Text fontSize="sm" color="gray.600">Total Scans</Text>
                </VStack>
                <Box bg="primary.100" p={3} rounded="xl">
                  <Text fontSize="2xl">📱</Text>
                </Box>
              </HStack>

              <VStack space={3}>
                <VStack space={2}>
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color="gray.600">Authentic Scans</Text>
                    <Text fontSize="sm" fontWeight="600" color="success.600">
                      {scanStats?.authenticPercentage?.toFixed(1) || '0'}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={scanStats?.authenticPercentage || 0} 
                    colorScheme="success" 
                    rounded="full"
                    size="sm"
                  />
                </VStack>

                <VStack space={2}>
                  <HStack justifyContent="space-between">
                    <Text fontSize="sm" color="gray.600">Suspicious Scans</Text>
                    <Text fontSize="sm" fontWeight="600" color="error.600">
                      {scanStats?.suspiciousPercentage?.toFixed(1) || '0'}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={scanStats?.suspiciousPercentage || 0} 
                    colorScheme="error" 
                    rounded="full"
                    size="sm"
                  />
                </VStack>
              </VStack>
            </VStack>
          </Box>
        </VStack>

        {/* Alerts Section */}
        <VStack space={4}>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            🚨 Alerts & Notifications
          </Text>
          
          {dashboardStats?.drugsExpiringSoon > 0 && (
            <AlertCard
              type="warning"
              title="Drugs Expiring Soon"
              message={`${dashboardStats.drugsExpiringSoon} drugs expire within 30 days`}
              count={dashboardStats.drugsExpiringSoon}
            />
          )}

          {scanStats?.suspiciousScans > 0 && (
            <AlertCard
              type="error"
              title="Suspicious Scan Activity"
              message={`${scanStats.suspiciousScans} suspicious scans detected today`}
              count={scanStats.suspiciousScans}
            />
          )}

          {expiringDrugs.length === 0 && dashboardStats?.drugsExpiringSoon === 0 && (
            <AlertCard
              type="info"
              title="All Systems Normal"
              message="No critical alerts at this time"
            />
          )}
        </VStack>

        {/* Quick Actions */}
        <VStack space={4}>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            ⚡ Quick Actions
          </Text>
          
          <QuickActionCard
            title="Add New Drug"
            description="Register a new drug and generate QR code"
            icon="➕"
            color="success"
            onPress={() => router.push('/admin/drugs/create')}
          />
          
          <QuickActionCard
            title="View All Drugs"
            description="Browse and manage registered drugs"
            icon="📋"
            color="primary"
            onPress={() => router.push('/admin/drugs')}
          />
          
          <QuickActionCard
            title="Analytics Dashboard"
            description="View detailed reports and insights"
            icon="📊"
            color="warning"
            onPress={() => router.push('/admin/analytics')}
          />
          
          <QuickActionCard
            title="System Settings"
            description="Configure system preferences"
            icon="⚙️"
            color="muted"
            onPress={() => router.push('/admin/settings')}
          />
        </VStack>

        {/* Recent Activity */}
        {expiringDrugs.length > 0 && (
          <VStack space={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                ⏰ Drugs Expiring Soon
              </Text>
              <Button 
                size="sm" 
                variant="ghost" 
                onPress={() => router.push('/admin/drugs?filter=expiring')}
              >
                View All
              </Button>
            </HStack>
            
            <VStack space={3}>
              {expiringDrugs.slice(0, 3).map((drug) => (
                <Box key={drug.id} bg="white" rounded="xl" p={4} shadow={2}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <VStack flex={1} space={1}>
                      <Text fontSize="md" fontWeight="semibold" color="gray.800">
                        {drug.name}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {drug.manufacturer} • Batch: {drug.batchNumber}
                      </Text>
                      <Text fontSize="sm" color="warning.600" fontWeight="500">
                        Expires: {new Date(drug.expiryDate).toLocaleDateString()}
                      </Text>
                    </VStack>
                    <Badge colorScheme="warning" variant="solid" rounded="full">
                      {Math.ceil((new Date(drug.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days
                    </Badge>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
}