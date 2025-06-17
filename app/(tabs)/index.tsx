import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  ScrollView,
  StatusBar,
  Button,
  Badge,
  Pressable,
  Avatar,
  Alert,
  Center,
  Divider,
  Icon,
  Progress,
  useToast,
  Spinner,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, RefreshControl, Animated } from 'react-native';
import { router } from 'expo-router';
import { drugAPI } from '../../services/api';
import FloatingAiAssistant, { FloatingAiButton } from '../../components/FloatingAiAssistant';

const { width } = Dimensions.get('window');

const mockFDAAlerts = [
  {
    id: 1,
    title: "⚠️ Critical Counterfeit Alert",
    description: "Fake Tramadol tablets with dangerous additives detected in Greater Accra and Ashanti regions",
    severity: "high",
    date: "June 12, 2025",
    category: "Counterfeit Warning",
    affectedRegions: ["Greater Accra", "Ashanti"],
    reportedCases: 47
  },
  {
    id: 2,
    title: "✅ New Drug Approved",
    description: "Metformin XR Extended Release by Ghana Pharmaceuticals has received FDA approval",
    severity: "info", 
    date: "June 10, 2025",
    category: "Registration Update",
    drugClass: "Antidiabetic"
  },
  {
    id: 3,
    title: "🔄 Voluntary Recall Notice",
    description: "Benylin Cough Syrup batch CS789456 recalled due to quality concerns",
    severity: "medium",
    date: "June 8, 2025",
    category: "Product Recall",
    batchNumber: "CS789456",
    unitsAffected: "12,450"
  }
];

const mockPublicStats = {
  totalScans: "47,592",
  drugsVerified: "41,186", 
  counterfeitsCaught: "156",
  alertsIssued: "34",
  successRate: "94.2%",
  dailyScans: "+1,247"
};

const healthTips = [
  {
    title: "Check Expiry Dates",
    content: "Always verify expiration dates before taking any medication - expired drugs can be ineffective or harmful"
  },
  {
    title: "Proper Storage",
    content: "Store medicines in cool, dry places away from direct sunlight to maintain their effectiveness"
  },
  {
    title: "Don't Share Prescriptions", 
    content: "Never share prescription drugs with family or friends - they're prescribed specifically for you"
  },
  {
    title: "Report Suspicious Drugs",
    content: "Report any suspicious medications to FDA Ghana hotline: 0302-681109 to protect others"
  },
  {
    title: "Verify Registration",
    content: "Check for FDA registration numbers on all drug packages before purchase or consumption"
  },
  {
    title: "Beware of Counterfeits",
    content: "Be cautious of unusually cheap medications from unknown sources - quality drugs cost appropriately"
  }
];

const quickActions = [
  {
    title: "Scan QR Code",
    description: "Instantly verify drug authenticity",
    icon: "qr-code-outline",
    color: "blue",
    route: "scan",
    gradient: ["#3B82F6", "#1D4ED8"]
  },
  {
    title: "Search Database", 
    description: "Browse registered medications",
    icon: "search-outline",
    color: "green", 
    route: "search",
    gradient: ["#10B981", "#059669"]
  },
  {
    title: "Drug Information",
    description: "Learn about medications",
    icon: "medical-outline",
    color: "purple",
    route: "search", 
    gradient: ["#8B5CF6", "#7C3AED"]
  },
  {
    title: "Report Issue",
    description: "Report suspicious drugs",
    icon: "warning-outline",
    color: "red",
    route: "profile",
    gradient: ["#EF4444", "#DC2626"]
  }
];

export default function CitizenHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const toast = useToast();

  const loadRecentReports = async () => {
    setIsLoadingReports(true);
    try {
      const reports = await drugAPI.getRecentReports();
      setRecentReports(reports.slice(0, 3)); // Show only 3 most recent
    } catch (error) {
      console.error('Error loading recent reports:', error);
      // Don't show error to user, just set empty array
      setRecentReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Load recent reports and simulate refreshing data
    loadRecentReports();
    setTimeout(() => {
      setRefreshing(false);
      toast.show({
        description: "Data updated successfully",
        variant: "success",
        duration: 2000
      });
    }, 1500);
  }, []);

  useEffect(() => {
    loadRecentReports();
    
    // Animated health tips rotation
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      setCurrentTipIndex((prev) => (prev + 1) % healthTips.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'red';
      case 'HIGH':
        return 'orange';
      case 'MEDIUM':
        return 'yellow';
      case 'LOW':
        return 'green';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const StatCard = ({ label, value, icon, color, subtext, trend }) => (
    <Pressable>
      {({ isPressed }) => (
        <Box 
          bg="white" 
          rounded="3xl" 
          p={5} 
          shadow={isPressed ? 1 : 3}
          transform={isPressed ? [{ scale: 0.98 }] : [{ scale: 1 }]}
          flex={1}
          borderWidth="1"
          borderColor="gray.100"
        >
          <VStack space={3} alignItems="center">
            <Box bg={`${color}.50`} rounded="full" p={4} borderWidth="2" borderColor={`${color}.100`}>
              <Text fontSize="2xl">{icon}</Text>
            </Box>
            <VStack space={1} alignItems="center">
              <Text fontSize="3xl" fontWeight="bold" color={`${color}.600`}>
                {value}
              </Text>
              <Text fontSize="xs" color="gray.600" textAlign="center" fontWeight="600" letterSpacing="0.5">
                {label.toUpperCase()}
              </Text>
              {subtext && (
                <Text fontSize="2xs" color="gray.400" textAlign="center">
                  {subtext}
                </Text>
              )}
            </VStack>
          </VStack>
        </Box>
      )}
    </Pressable>
  );

  const AlertCard = ({ alert }) => {
    const getAlertConfig = (severity) => {
      switch (severity) {
        case 'high': 
          return { 
            colorScheme: 'red', 
            bg: 'red.50', 
            borderColor: 'red.200',
            icon: 'alert-circle',
            iconColor: 'red.500'
          };
        case 'medium': 
          return { 
            colorScheme: 'orange', 
            bg: 'orange.50', 
            borderColor: 'orange.200',
            icon: 'warning',
            iconColor: 'orange.500'
          };
        case 'low': 
          return { 
            colorScheme: 'yellow', 
            bg: 'yellow.50', 
            borderColor: 'yellow.200',
            icon: 'information-circle',
            iconColor: 'yellow.600'
          };
        default: 
          return { 
            colorScheme: 'blue', 
            bg: 'blue.50', 
            borderColor: 'blue.200',
            icon: 'information-circle',
            iconColor: 'blue.500'
          };
      }
    };

    const config = getAlertConfig(alert.severity);

    return (
      <Pressable>
        {({ isPressed }) => (
          <Box 
            bg="white" 
            rounded="2xl" 
            p={5} 
            shadow={isPressed ? 1 : 2}
            mb={4}
            borderLeftWidth="4"
            borderLeftColor={config.iconColor}
            borderWidth="1"
            borderColor="gray.100"
            transform={isPressed ? [{ scale: 0.99 }] : [{ scale: 1 }]}
          >
            <VStack space={3}>
              <HStack space={3} alignItems="flex-start">
                <Box bg={config.bg} p={2} rounded="xl" borderWidth="1" borderColor={config.borderColor}>
                  <Icon as={Ionicons} name={config.icon} size="lg" color={config.iconColor} />
                </Box>
                <VStack flex={1} space={2}>
                  <HStack justifyContent="space-between" alignItems="flex-start">
                    <Text fontSize="md" fontWeight="bold" color="gray.800" flex={1}>
                      {alert.title}
                    </Text>
                    <Badge
                      colorScheme={config.colorScheme}
                      variant="solid"
                      rounded="full"
                      _text={{ fontSize: "2xs", fontWeight: "bold" }}
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" lineHeight="lg">
                    {alert.description}
                  </Text>
                </VStack>
              </HStack>
              
              {/* Additional Alert Details */}
              <Box bg="gray.50" rounded="xl" p={3}>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      {alert.category}
                    </Text>
                    {alert.affectedRegions && (
                      <Text fontSize="2xs" color="gray.400">
                        Regions: {alert.affectedRegions.join(", ")}
                      </Text>
                    )}
                  </VStack>
                  <VStack alignItems="flex-end">
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      {alert.date}
                    </Text>
                    {alert.reportedCases && (
                      <Text fontSize="2xs" color="red.500">
                        {alert.reportedCases} cases reported
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Box>
            </VStack>
          </Box>
        )}
      </Pressable>
    );
  };

  const QuickActionCard = ({ action }) => (
    <Pressable onPress={() => router.push(`/(tabs)/${action.route}`)}>
      {({ isPressed }) => (
        <Box 
          rounded="2xl" 
          shadow={isPressed ? 1 : 3}
          transform={isPressed ? [{ scale: 0.97 }] : [{ scale: 1 }]}
          overflow="hidden"
          borderWidth="1"
          borderColor="gray.100"
        >
          <LinearGradient
            colors={action.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 20 }}
          >
            <HStack space={4} alignItems="center">
              <Box bg="rgba(255,255,255,0.25)" rounded="2xl" p={3}>
                <Icon as={Ionicons} name={action.icon} size="xl" color="white" />
              </Box>
              <VStack flex={1} space={1}>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {action.title}
                </Text>
                <Text fontSize="sm" color="white" opacity={0.9}>
                  {action.description}
                </Text>
              </VStack>
              <Icon as={Ionicons} name="chevron-forward" size="lg" color="white" opacity={0.8} />
            </HStack>
          </LinearGradient>
        </Box>
      )}
    </Pressable>
  );

  const UserReportCard = ({ report }) => (
    <Pressable onPress={() => router.push('/(tabs)/profile')}>
      {({ isPressed }) => (
        <Box 
          bg="white" 
          rounded="2xl" 
          p={4} 
          shadow={isPressed ? 1 : 2}
          mb={3}
          borderLeftWidth="4"
          borderLeftColor={`${getSeverityColor(report.severity)}.500`}
          borderWidth="1"
          borderColor="gray.100"
          transform={isPressed ? [{ scale: 0.99 }] : [{ scale: 1 }]}
        >
          <VStack space={3}>
            <HStack space={3} alignItems="flex-start">
              <Box bg={`${getSeverityColor(report.severity)}.50`} p={2} rounded="xl" borderWidth="1" borderColor={`${getSeverityColor(report.severity)}.200`}>
                <Icon as={Ionicons} name="warning" size="md" color={`${getSeverityColor(report.severity)}.500`} />
              </Box>
              <VStack flex={1} space={2}>
                <HStack justifyContent="space-between" alignItems="flex-start">
                  <Text fontSize="md" fontWeight="bold" color="gray.800" flex={1}>
                    {report.drugName}
                  </Text>
                  <Badge
                    colorScheme={getSeverityColor(report.severity)}
                    variant="solid"
                    rounded="full"
                    _text={{ fontSize: "2xs", fontWeight: "bold" }}
                  >
                    {report.severity}
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600" lineHeight="lg">
                  {report.description.length > 80 ? `${report.description.substring(0, 80)}...` : report.description}
                </Text>
              </VStack>
            </HStack>
            
            <Box bg="gray.50" rounded="xl" p={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
                    {report.issueType.replace('_', ' ')}
                  </Text>
                  <Text fontSize="2xs" color="gray.400">
                    {report.manufacturer}
                  </Text>
                </VStack>
                <VStack alignItems="flex-end">
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
                    {formatDate(report.createdAt)}
                  </Text>
                  <Text fontSize="2xs" color="gray.400">
                    Community Report
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </VStack>
        </Box>
      )}
    </Pressable>
  );

  return (
    <Box flex={1} bg="#F8FAFC">
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header Section */}
        <LinearGradient
          colors={['#1E40AF', '#1D4ED8', '#2563EB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 50, paddingHorizontal: 24, paddingBottom: 40 }}
        >
          <VStack space={6} alignItems="center">
            {/* Enhanced Logo */}
            <Box 
              size={20} 
              bg="white" 
              rounded="full" 
              justifyContent="center"
              alignItems="center"
              shadow={4}
              borderWidth="3"
              borderColor="rgba(255,255,255,0.3)"
            >
              <Text fontSize="4xl">🛡️</Text>
            </Box>

            {/* Title Section */}
            <VStack space={3} alignItems="center">
              <Text fontSize="3xl" fontWeight="black" color="white" textAlign="center" letterSpacing="0.5">
                DrugGuard Ghana
              </Text>
              <Text fontSize="lg" color="white" opacity={0.95} textAlign="center" maxW="90%" fontWeight="medium">
                Protecting Ghana's health through smart technology
              </Text>
            </VStack>

            {/* Ghana Flag with Animation */}
            <VStack space={2} alignItems="center">
              <HStack space={2}>
                <Box w={12} h={2} bg="#dc2626" rounded="full" />
                <Box w={12} h={2} bg="#fbbf24" rounded="full" />
                <Box w={12} h={2} bg="#16a34a" rounded="full" />
              </HStack>
              <Text fontSize="sm" color="white" opacity={0.8} fontWeight="medium">
                🇬🇭 FDA APPROVED SYSTEM
              </Text>
            </VStack>
          </VStack>
        </LinearGradient>

        {/* Enhanced Quick Actions */}
        <VStack space={4} px={6} mt={-6}>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={2}>
            🚀 Quick Actions
          </Text>
          <VStack space={3}>
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} action={action} />
            ))}
          </VStack>
        </VStack>

        {/* Enhanced Impact Statistics */}
        <VStack space={6} px={6} mt={8}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              📊 System Impact
            </Text>
            <Badge colorScheme="green" variant="solid" rounded="full">
              LIVE
            </Badge>
          </HStack>
          
          <Box bg="white" rounded="3xl" p={6} shadow={4} borderWidth="1" borderColor="gray.100">
            <VStack space={5}>
              <HStack space={3}>
                <StatCard
                  label="Total Scans"
                  value={mockPublicStats.totalScans}
                  icon="📊"
                  color="blue"
                  subtext={mockPublicStats.dailyScans + " today"}
                />
                <StatCard
                  label="Verified"
                  value={mockPublicStats.drugsVerified}
                  icon="✅"
                  color="green"
                  subtext={mockPublicStats.successRate + " success"}
                />
              </HStack>
              <HStack space={3}>
                <StatCard
                  label="Counterfeits"
                  value={mockPublicStats.counterfeitsCaught}
                  icon="⚠️"
                  color="orange"
                  subtext="Lives protected"
                />
                <StatCard
                  label="Alerts"
                  value={mockPublicStats.alertsIssued}
                  icon="🚨"
                  color="red"
                  subtext="This month"
                />
              </HStack>
            </VStack>
          </Box>
        </VStack>

        {/* Enhanced Health Tip */}
        <VStack space={4} px={6} mt={8}>
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            💡 Health Tip of the Day
          </Text>
          <Animated.View style={{ opacity: fadeAnim }}>
            <LinearGradient
              colors={['#EBF4FF', '#DBEAFE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 20 }}
            >
              <HStack space={4} alignItems="center">
                <Box bg="blue.500" rounded="full" p={3}>
                  <Text fontSize="2xl">🏥</Text>
                </Box>
                <VStack flex={1} space={2}>
                  <Text fontSize="md" color="blue.800" fontWeight="bold">
                    {healthTips[currentTipIndex].title}
                  </Text>
                  <Text fontSize="sm" color="blue.700" lineHeight="lg">
                    {healthTips[currentTipIndex].content}
                  </Text>
                  <Progress 
                    value={(currentTipIndex + 1) / healthTips.length * 100} 
                    w="100%" 
                    bg="blue.200" 
                    _filledTrack={{ bg: "blue.500" }}
                    size="xs"
                  />
                </VStack>
              </HStack>
            </LinearGradient>
          </Animated.View>
        </VStack>

        {/* Enhanced FDA Alerts */}
        <VStack space={4} px={6} mt={8}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              🚨 Latest FDA Alerts
            </Text>
            <Badge colorScheme="blue" variant="outline" rounded="full">
              UPDATED TODAY
            </Badge>
          </HStack>
          
          {mockFDAAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </VStack>

        {/* Recent Community Reports */}
        <VStack space={4} px={6} mt={8}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              👥 Recent Community Reports
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/profile')}>
              <Badge colorScheme="red" variant="outline" rounded="full">
                REPORT ISSUE
              </Badge>
            </Pressable>
          </HStack>
          
          {isLoadingReports ? (
            <Center py={8}>
              <Spinner size="lg" color="red.600" />
              <Text mt={4} color="gray.600">
                Loading community reports...
              </Text>
            </Center>
          ) : recentReports.length > 0 ? (
            recentReports.map((report) => (
              <UserReportCard key={report.id} report={report} />
            ))
          ) : (
            <Box bg="white" rounded="2xl" p={6} shadow={2} borderWidth="1" borderColor="gray.100">
              <Center>
                <VStack space={3} alignItems="center">
                  <Icon as={Ionicons} name="shield-checkmark-outline" size="4xl" color="green.400" />
                  <Text fontSize="lg" color="gray.600" textAlign="center" fontWeight="medium">
                    No Recent Reports
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center" px={4}>
                    Community is safe! Be the first to report any suspicious drugs you encounter.
                  </Text>
                  <Pressable onPress={() => router.push('/(tabs)/profile')}>
                    <Box bg="red.600" rounded="xl" px={6} py={3}>
                      <Text color="white" fontWeight="medium">
                        Report Suspicious Drug
                      </Text>
                    </Box>
                  </Pressable>
                </VStack>
              </Center>
            </Box>
          )}
        </VStack>

        {/* Enhanced Emergency Contacts */}
        <VStack space={4} px={6} mt={8} mb={8}>
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            📞 Emergency Contacts
          </Text>
          
          <LinearGradient
            colors={['#FEF2F2', '#FEE2E2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 20 }}
          >
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={3} alignItems="center" flex={1}>
                  <Box bg="red.500" rounded="full" p={3}>
                    <Icon as={Ionicons} name="call" color="white" size="lg" />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="lg" fontWeight="bold" color="red.800">
                      FDA Ghana Hotline
                    </Text>
                    <Text fontSize="sm" color="red.600">
                      Report suspicious drugs immediately
                    </Text>
                  </VStack>
                </HStack>
                <Pressable onPress={() => {}}>
                  <Box bg="red.500" rounded="xl" px={4} py={2}>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      0302-681109
                    </Text>
                  </Box>
                </Pressable>
              </HStack>
              
              <Divider bg="red.300" />
              
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={3} alignItems="center" flex={1}>
                  <Box bg="red.600" rounded="full" p={3}>
                    <Icon as={Ionicons} name="medical" color="white" size="lg" />
                  </Box>
                  <VStack flex={1}>
                    <Text fontSize="lg" fontWeight="bold" color="red.800">
                      Poison Control Center
                    </Text>
                    <Text fontSize="sm" color="red.600">
                      24/7 Emergency poisoning assistance
                    </Text>
                  </VStack>
                </HStack>
                <Pressable onPress={() => {}}>
                  <Box bg="red.600" rounded="xl" px={4} py={2}>
                    <Text fontSize="lg" fontWeight="bold" color="white">
                      193
                    </Text>
                  </Box>
                </Pressable>
              </HStack>
            </VStack>
          </LinearGradient>
        </VStack>

        {/* Enhanced Footer */}
        <Box px={6} pb={12}>
          <Center>
            <VStack space={3} alignItems="center">
              <Text fontSize="sm" color="gray.500" textAlign="center" fontWeight="medium">
                Powered by Food and Drugs Authority - Ghana
              </Text>
              <Text fontSize="xs" color="gray.400" textAlign="center">
                Protecting public health through innovative technology
              </Text>
              <HStack space={2}>
                <Box w={2} h={2} bg="green.400" rounded="full" />
                <Text fontSize="xs" color="green.600" fontWeight="medium">
                  System Online & Secure
                </Text>
              </HStack>
            </VStack>
          </Center>
        </Box>
      </ScrollView>

      {/* Floating AI Health Assistant Button */}
      <FloatingAiButton
        onPress={() => setIsAiModalVisible(true)}
      />

      {/* AI Health Assistant Modal */}
      <FloatingAiAssistant
        isVisible={isAiModalVisible}
        onClose={() => setIsAiModalVisible(false)}
      />
    </Box>
  );
}