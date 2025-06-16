import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Spinner,
  Alert,
  Pressable,
  Select,
  CheckIcon,
  Divider,
} from 'native-base';
import { RefreshControl, FlatList } from 'react-native';
import { analyticsAPI, OverviewStats, DrugAnalytics, ScanAnalytics, apiUtils } from '../../services/api';

// Component for stat cards
const StatCard = ({ title, value, subtitle, color = 'primary.600' }: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) => (
  <Box
    bg="white"
    p={4}
    rounded="lg"
    shadow={2}
    flex={1}
    m={1}
  >
    <Text fontSize="sm" color="gray.500" fontWeight="medium">
      {title}
    </Text>
    <Text fontSize="2xl" fontWeight="bold" color={color}>
      {value}
    </Text>
    {subtitle && (
      <Text fontSize="xs" color="gray.400">
        {subtitle}
      </Text>
    )}
  </Box>
);

// Component for list items
const ListItem = ({ label, value, percentage }: {
  label: string;
  value: number;
  percentage?: number;
}) => (
  <HStack justifyContent="space-between" alignItems="center" py={2}>
    <Text fontSize="sm" flex={1}>
      {label}
    </Text>
    <HStack alignItems="center" space={2}>
      <Text fontSize="sm" fontWeight="bold">
        {value}
      </Text>
      {percentage && (
        <Text fontSize="xs" color="gray.500">
          ({percentage.toFixed(1)}%)
        </Text>
      )}
    </HStack>
  </HStack>
);

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');

  // Analytics data state
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [drugAnalytics, setDrugAnalytics] = useState<DrugAnalytics | null>(null);
  const [scanAnalytics, setScanAnalytics] = useState<ScanAnalytics | null>(null);

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setError(null);
      
      // Load all analytics data in parallel
      const [overview, drugs, scans] = await Promise.all([
        analyticsAPI.getOverviewStats(),
        analyticsAPI.getDrugAnalytics(),
        analyticsAPI.getScanAnalytics(parseInt(selectedTimeframe)),
      ]);

      setOverviewStats(overview);
      setDrugAnalytics(drugs);
      setScanAnalytics(scans);
    } catch (err: any) {
      setError(apiUtils.getErrorMessage(err));
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe]);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  // Handle timeframe change
  const handleTimeframeChange = (value: string) => {
    setSelectedTimeframe(value);
    setLoading(true);
  };

  // Prepare data for FlatList
  const renderAnalyticsContent = () => {
    const content = [];

    // Header
    content.push({
      id: 'header',
      type: 'header',
      data: null
    });

    // Error Alert
    if (error) {
      content.push({
        id: 'error',
        type: 'error',
        data: error
      });
    }

    // Overview Statistics
    if (overviewStats) {
      content.push({
        id: 'overview',
        type: 'overview',
        data: overviewStats
      });
    }

    // Drug Status Breakdown
    if (overviewStats?.drugsByStatus) {
      content.push({
        id: 'status-breakdown',
        type: 'status-breakdown',
        data: overviewStats.drugsByStatus
      });
    }

    // Top Categories
    if (drugAnalytics?.categoryDistribution) {
      content.push({
        id: 'categories',
        type: 'categories',
        data: drugAnalytics.categoryDistribution
      });
    }

    // Top Manufacturers
    if (drugAnalytics?.topManufacturers) {
      content.push({
        id: 'manufacturers',
        type: 'manufacturers',
        data: drugAnalytics.topManufacturers
      });
    }

    // Scan Analytics
    if (scanAnalytics) {
      content.push({
        id: 'scan-analytics',
        type: 'scan-analytics',
        data: scanAnalytics
      });
    }

    // Expiry Analysis
    if (drugAnalytics?.expiryAnalysis) {
      content.push({
        id: 'expiry-analysis',
        type: 'expiry-analysis',
        data: drugAnalytics.expiryAnalysis
      });
    }

    // Quick Actions
    content.push({
      id: 'quick-actions',
      type: 'quick-actions',
      data: null
    });

    // Last updated
    content.push({
      id: 'last-updated',
      type: 'last-updated',
      data: null
    });

    return content;
  };

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'header':
        return (
          <VStack space={4} p={4}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="2xl" fontWeight="bold" color="primary.600">
                Analytics Dashboard
              </Text>
              <Select
                selectedValue={selectedTimeframe}
                minWidth="120"
                placeholder="Select timeframe"
                onValueChange={handleTimeframeChange}
                _selectedItem={{
                  bg: "primary.600",
                  endIcon: <CheckIcon size="5" />
                }}
              >
                <Select.Item label="7 days" value="7" />
                <Select.Item label="30 days" value="30" />
                <Select.Item label="90 days" value="90" />
              </Select>
            </HStack>
          </VStack>
        );

      case 'error':
        return (
          <Box px={4} pb={4}>
            <Alert status="error" variant="subtle">
              <Alert.Icon />
              <Text fontSize="sm">{item.data}</Text>
            </Alert>
          </Box>
        );

      case 'overview':
        const stats = item.data;
        return (
          <VStack space={3} px={4} pb={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700">
              Overview
            </Text>
            
            {/* Top row stats */}
            <HStack space={2}>
              <StatCard
                title="Total Drugs"
                value={stats.totalDrugs.toLocaleString()}
                subtitle="In database"
              />
              <StatCard
                title="Active Drugs"
                value={stats.activeDrugs.toLocaleString()}
                subtitle="Currently active"
                color="green.600"
              />
            </HStack>

            {/* Second row stats */}
            <HStack space={2}>
              <StatCard
                title="Total Scans"
                value={stats.totalScans.toLocaleString()}
                subtitle="All time"
                color="blue.600"
              />
              <StatCard
                title="Success Rate"
                value={`${stats.verificationSuccessRate}%`}
                subtitle="Authentic scans"
                color="green.600"
              />
            </HStack>

            {/* Third row stats */}
            <HStack space={2}>
              <StatCard
                title="Recent Scans"
                value={stats.recentScans.toLocaleString()}
                subtitle={`Last ${selectedTimeframe} days`}
                color="purple.600"
              />
              <StatCard
                title="Expiring Soon"
                value={stats.drugsExpiringSoon}
                subtitle="Next 30 days"
                color="orange.600"
              />
            </HStack>
          </VStack>
        );

      case 'status-breakdown':
        const statusData = item.data;
        return (
          <Box bg="white" p={4} rounded="lg" shadow={2} mx={4} mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
              Drug Status Distribution
            </Text>
            <VStack space={1}>
              {Object.entries(statusData).map(([status, count]: [string, any]) => (
                <ListItem
                  key={status}
                  label={status.replace('_', ' ')}
                  value={count}
                  percentage={(count / (overviewStats?.totalDrugs || 1)) * 100}
                />
              ))}
            </VStack>
          </Box>
        );

      case 'categories':
        const categoryData = item.data;
        return (
          <Box bg="white" p={4} rounded="lg" shadow={2} mx={4} mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
              Top Drug Categories
            </Text>
            <VStack space={1}>
              {Object.entries(categoryData)
                .sort(([,a]: any, [,b]: any) => b - a)
                .slice(0, 5)
                .map(([category, count]: [string, any]) => (
                  <ListItem
                    key={category}
                    label={category}
                    value={count}
                  />
                ))}
            </VStack>
          </Box>
        );

      case 'manufacturers':
        const manufacturerData = item.data;
        return (
          <Box bg="white" p={4} rounded="lg" shadow={2} mx={4} mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
              Top Manufacturers
            </Text>
            <VStack space={1}>
              {Object.entries(manufacturerData)
                .sort(([,a]: any, [,b]: any) => b - a)
                .slice(0, 5)
                .map(([manufacturer, count]: [string, any]) => (
                  <ListItem
                    key={manufacturer}
                    label={manufacturer}
                    value={count}
                  />
                ))}
            </VStack>
          </Box>
        );

      case 'scan-analytics':
        const scanData = item.data;
        return (
          <Box bg="white" p={4} rounded="lg" shadow={2} mx={4} mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
              Scan Analytics ({selectedTimeframe} days)
            </Text>
            
            <VStack space={3}>
              <HStack space={4} justifyContent="space-around">
                <VStack alignItems="center">
                  <Text fontSize="xl" fontWeight="bold" color="blue.600">
                    {scanData.totalScans.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.500">Total Scans</Text>
                </VStack>
                
                <VStack alignItems="center">
                  <Text fontSize="xl" fontWeight="bold" color="green.600">
                    {scanData.authenticScans.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.500">Authentic</Text>
                </VStack>
                
                <VStack alignItems="center">
                  <Text fontSize="xl" fontWeight="bold" color="red.600">
                    {scanData.fraudulentScans.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.500">Fraudulent</Text>
                </VStack>
              </HStack>

              <Divider />

              {/* Top Scanned Drugs */}
              {scanData.topScannedDrugs && scanData.topScannedDrugs.length > 0 && (
                <VStack space={2}>
                  <Text fontSize="md" fontWeight="semibold" color="gray.600">
                    Most Scanned Drugs
                  </Text>
                  {scanData.topScannedDrugs.slice(0, 3).map((drug: any, index: number) => (
                    <ListItem
                      key={index}
                      label={drug.drugName || drug.name}
                      value={drug.scanCount || drug.count}
                    />
                  ))}
                </VStack>
              )}
            </VStack>
          </Box>
        );

      case 'expiry-analysis':
        const expiryData = item.data;
        return (
          <Box bg="white" p={4} rounded="lg" shadow={2} mx={4} mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
              Expiry Analysis
            </Text>
            <VStack space={2}>
              <ListItem
                label="Already Expired"
                value={expiryData.expired}
              />
              <ListItem
                label="Expiring in 30 days"
                value={expiryData.expiring30Days}
              />
              <ListItem
                label="Expiring in 90 days"
                value={expiryData.expiring90Days}
              />
            </VStack>
          </Box>
        );

      case 'quick-actions':
        return (
          <Box bg="white" p={4} rounded="lg" shadow={2} mx={4} mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
              Quick Actions
            </Text>
            <VStack space={2}>
              <Pressable
                onPress={() => {/* Navigate to detailed reports */}}
                p={3}
                bg="primary.50"
                rounded="md"
              >
                <Text color="primary.600" fontWeight="medium">
                  📊 View Detailed Reports
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => {/* Export data */}}
                p={3}
                bg="green.50"
                rounded="md"
              >
                <Text color="green.600" fontWeight="medium">
                  📤 Export Data
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => {/* Configure alerts */}}
                p={3}
                bg="orange.50"
                rounded="md"
              >
                <Text color="orange.600" fontWeight="medium">
                  🔔 Configure Alerts
                </Text>
              </Pressable>
            </VStack>
          </Box>
        );

      case 'last-updated':
        return (
          <Text fontSize="xs" color="gray.400" textAlign="center" pb={4} px={4}>
            Last updated: {new Date().toLocaleString()}
          </Text>
        );

      default:
        return null;
    }
  };

  if (loading && !refreshing) {
    return (
      <Box flex={1} bg="gray.50" justifyContent="center" alignItems="center">
        <Spinner size="lg" color="primary.600" />
        <Text mt={4} color="gray.500">
          Loading analytics...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="gray.50">
      <FlatList
        data={renderAnalyticsContent()}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
}