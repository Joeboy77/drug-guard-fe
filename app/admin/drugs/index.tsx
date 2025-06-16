import React, { useState, useEffect, useMemo, useCallback, forwardRef } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Input,
  Button,
  ScrollView,
  Pressable,
  useBreakpointValue,
  Badge,
  Menu,
  useToast,
  Skeleton,
  Divider,
  Modal,
  Alert,
  Image,
  Select,
  IconButton,
  Center,
  Flex,
  AspectRatio,
} from 'native-base';
import { router } from 'expo-router';
import { RefreshControl, Dimensions, TextInput, View, StyleSheet, FlatList, Animated } from 'react-native';
import { drugAPI, Drug, QrCodeResponse } from '../../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CustomSearchInput = forwardRef<TextInput, any>(({ 
  placeholder, 
  value, 
  onChangeText, 
  onFocus, 
  onBlur,
  autoCapitalize = 'none',
  autoCorrect = false,
  returnKeyType = 'search',
  onSubmitEditing,
  editable = true,
  style,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = new Animated.Value(0);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#3B82F6'],
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.1],
  });

  return (
    <Animated.View 
      style={[
        styles.searchContainer, 
        { 
          borderColor, 
          shadowOpacity,
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
          elevation: isFocused ? 4 : 2,
        },
        style
      ]}
    >
      <View style={styles.searchIcon}>
        <Text style={styles.searchIconText}>🔍</Text>
      </View>
      <TextInput
        ref={ref}
        style={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {value && (
        <Pressable onPress={() => onChangeText('')} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>✕</Text>
        </Pressable>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  searchIcon: {
    marginRight: 12,
    opacity: 0.6,
  },
  searchIconText: {
    fontSize: 18,
  },
  searchInput: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  drugCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  qrCodeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionButtonPrimary: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
});

export default function DrugsListScreen() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<QrCodeResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const toast = useToast();
  
  const isMobile = useMemo(() => {
    return width < 768;
  }, []);

  useEffect(() => {
    loadDrugs();
  }, [currentPage]);

  useEffect(() => {
    filterDrugs();
  }, [drugs, searchQuery, statusFilter]);

  const loadDrugs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await drugAPI.getAllDrugs(currentPage, 50);
      setDrugs(response.content || response);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error loading drugs:', error);
      toast.show({
        description: 'Failed to load drugs',
        variant: 'error',
        placement: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, toast]);

  const filterDrugs = useCallback(() => {
    let filtered = drugs;

    if (searchQuery.trim()) {
      filtered = filtered.filter(drug =>
        drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.activeIngredient?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(drug => drug.status === statusFilter);
    }

    setFilteredDrugs(filtered);
  }, [drugs, searchQuery, statusFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDrugs();
    setRefreshing(false);
  }, [loadDrugs]);

  const handleGenerateQR = useCallback(async (drug: Drug) => {
    try {
      const qrResponse = await drugAPI.generateQrCode(drug.id);
      setGeneratedQR(qrResponse);
      setSelectedDrug(drug);
      setShowQRModal(true);
      toast.show({
        description: 'QR code generated successfully!',
        title: 'Success',
        variant: 'success',
        placement: 'top',
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.show({
        description: 'Failed to generate QR code',
        variant: 'error',
        placement: 'top',
      });
    }
  }, [toast]);

  const handleDeleteDrug = useCallback(async (drug: Drug) => {
    try {
      await drugAPI.deleteDrug(drug.id);
      setDrugs(prev => prev.filter(d => d.id !== drug.id));
      toast.show({
        description: `${drug.name} deleted successfully`,
        variant: 'success',
        placement: 'top',
      });
    } catch (error) {
      console.error('Error deleting drug:', error);
      toast.show({
        description: 'Failed to delete drug',
        variant: 'error',
        placement: 'top',
      });
    }
  }, [toast]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE': return { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' };
      case 'RECALLED': return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
      case 'EXPIRED': return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
      case 'SUSPENDED': return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
      default: return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE': return '✅';
      case 'RECALLED': return '🚫';
      case 'EXPIRED': return '⏰';
      case 'SUSPENDED': return '⏸️';
      default: return '❓';
    }
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = getStatusColor(status);
    return (
      <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <HStack space={1} alignItems="center">
          <Text fontSize="xs">{getStatusIcon(status)}</Text>
          <Text fontSize="xs" fontWeight="600" color={colors.text}>
            {status}
          </Text>
        </HStack>
      </View>
    );
  };

  const FilterChips = () => {
    const filters = [
      { label: 'All', value: 'ALL' },
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Recalled', value: 'RECALLED' },
      { label: 'Expired', value: 'EXPIRED' },
      { label: 'Suspended', value: 'SUSPENDED' },
    ];

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <HStack space={2} px={1}>
          {filters.map((filter) => (
            <Pressable
              key={filter.value}
              onPress={() => setStatusFilter(filter.value)}
              style={[
                styles.filterChip,
                statusFilter === filter.value && styles.filterChipActive,
              ]}
            >
              <Text
                fontSize="sm"
                fontWeight="600"
                color={statusFilter === filter.value ? 'white' : '#6B7280'}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </HStack>
      </ScrollView>
    );
  };

  const DrugCard = useCallback(({ drug }: { drug: Drug }) => (
    <View style={styles.drugCard}>
      <VStack space={4}>
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="flex-start">
          <VStack flex={1} space={2}>
            <Text fontSize="lg" fontWeight="700" color="#1F2937">
              {drug.name}
            </Text>
            <VStack space={1}>
              <Text fontSize="sm" color="#6B7280" fontWeight="500">
                {drug.manufacturer}
              </Text>
              <Text fontSize="sm" color="#9CA3AF">
                Batch: {drug.batchNumber}
              </Text>
              {drug.activeIngredient && (
                <Text fontSize="sm" color="#3B82F6" fontWeight="600">
                  {drug.activeIngredient} {drug.strength}
                </Text>
              )}
            </VStack>
          </VStack>
          
          <VStack alignItems="flex-end" space={3}>
            <StatusBadge status={drug.status} />
            
            <Menu
              trigger={(triggerProps) => (
                <Pressable
                  {...triggerProps}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: '#F9FAFB',
                  }}
                >
                  <Text fontSize="lg" color="#6B7280">⋮</Text>
                </Pressable>
              )}
            >
              <Menu.Item onPress={() => router.push(`/admin/drugs/${drug.id}`)}>
                📄 View Details
              </Menu.Item>
              <Menu.Item onPress={() => handleGenerateQR(drug)}>
                🔲 Generate QR
              </Menu.Item>
              <Menu.Item onPress={() => handleDeleteDrug(drug)}>
                🗑️ Delete
              </Menu.Item>
            </Menu>
          </VStack>
        </HStack>

        {/* QR Code Display */}
        {drug.qrCode && (
          <View style={styles.qrCodeContainer}>
            <VStack space={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" fontWeight="600" color="#374151">
                  QR Code
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
                  <Text fontSize="xs" fontWeight="600" color="#166534">
                    ✓ Generated
                  </Text>
                </View>
              </HStack>
              
              <HStack space={4} alignItems="center">
                <Box>
                  {drug.qrCodeImageUrl ? (
                    <AspectRatio w="20" ratio={1}>
                      <Image
                        source={{ uri: drug.qrCodeImageUrl }}
                        alt="QR Code"
                        rounded="lg"
                        fallbackElement={
                          <Box 
                            bg="#F3F4F6" 
                            rounded="lg"
                            flex={1}
                            justifyContent="center" 
                            alignItems="center"
                          >
                            <Text fontSize="2xl" color="#9CA3AF">🔲</Text>
                          </Box>
                        }
                      />
                    </AspectRatio>
                  ) : (
                    <Box 
                      w="20" 
                      h="20"
                      bg="#F3F4F6" 
                      rounded="lg"
                      justifyContent="center" 
                      alignItems="center"
                    >
                      <Text fontSize="2xl" color="#9CA3AF">🔲</Text>
                    </Box>
                  )}
                </Box>
                
                <VStack flex={1} space={1}>
                  <Text fontSize="xs" color="#6B7280" fontWeight="600">
                    Verification Code
                  </Text>
                  <Text fontSize="xs" color="#9CA3AF" fontFamily="mono" numberOfLines={2}>
                    {drug.qrCode.substring(0, 32)}...
                  </Text>
                  <Text fontSize="xs" color="#9CA3AF">
                    {drug.qrCode.length} characters
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </View>
        )}

        {/* Drug Info */}
        <VStack space={2}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="sm" color="#6B7280" fontWeight="500">
              Expires: {new Date(drug.expiryDate).toLocaleDateString()}
            </Text>
            {drug.expired && (
              <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
                <Text fontSize="xs" fontWeight="600" color="#DC2626">
                  EXPIRED
                </Text>
              </View>
            )}
          </HStack>
          
          <Text fontSize="xs" color="#9CA3AF">
            Drug ID: {drug.id}
          </Text>
        </VStack>

        {/* Quick Actions */}
        <HStack space={3}>
          <Pressable
            style={styles.quickActionButton}
            onPress={() => router.push(`/admin/drugs/${drug.id}`)}
          >
            <Text fontSize="sm" fontWeight="600" color="#6B7280">
              View Details
            </Text>
          </Pressable>
          <Pressable
            style={[styles.quickActionButton, styles.quickActionButtonPrimary]}
            onPress={() => handleGenerateQR(drug)}
          >
            <Text fontSize="sm" fontWeight="600" color="white">
              {drug.qrCode ? 'Regenerate QR' : 'Generate QR'}
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    </View>
  ), [handleGenerateQR, handleDeleteDrug]);

  const EmptyState = useCallback(() => (
    <Center flex={1} py={20}>
      <VStack space={6} alignItems="center" maxW="sm">
        <Box 
          bg="#F8FAFC" 
          p={6} 
          rounded="full"
          borderWidth={1}
          borderColor="#E2E8F0"
        >
          <Text fontSize="6xl" opacity={0.6}>💊</Text>
        </Box>
        <VStack space={3} alignItems="center">
          <Text fontSize="xl" fontWeight="700" color="#374151">
            No drugs found
          </Text>
          <Text fontSize="md" color="#6B7280" textAlign="center" lineHeight="md">
            {searchQuery || statusFilter !== 'ALL' 
              ? 'Try adjusting your search or filter criteria to find what you\'re looking for'
              : 'Get started by adding your first drug to the system'
            }
          </Text>
        </VStack>
        {!searchQuery && statusFilter === 'ALL' && (
          <Button
            onPress={() => router.push('/admin/drugs/create')}
            size="lg"
            bg="#3B82F6"
            _pressed={{ bg: '#2563EB' }}
            rounded="xl"
            px={8}
            py={4}
          >
            <Text fontSize="md" fontWeight="600" color="white">
              Add First Drug
            </Text>
          </Button>
        )}
      </VStack>
    </Center>
  ), [searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <Box flex={1} bg="#F8FAFC">
        <Box bg="white" pt={12} pb={6} px={6}>
          <Skeleton h="8" w="48" mb={4} rounded="lg" />
          <Skeleton h="12" rounded="xl" mb={4} />
          <Skeleton h="8" w="32" rounded="lg" />
        </Box>
        <VStack space={4} px={6}>
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} h="40" rounded="2xl" />
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="#F8FAFC">
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={{
          paddingTop: 48,
          paddingBottom: 24,
          paddingHorizontal: 24,
        }}
      >
        <VStack space={6}>
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={4} alignItems="center">
              <Pressable 
                onPress={() => router.back()}
                style={{
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: '#F3F4F6',
                }}
              >
                <Text fontSize="xl" color="#374151">←</Text>
              </Pressable>
              <VStack>
                <Text fontSize="md" color="#6B7280" fontWeight="500">
                  {filteredDrugs.length} of {drugs.length} drugs
                </Text>
              </VStack>
            </HStack>
          </HStack>

          {/* Enhanced Search */}
          <VStack space={4}>
            <CustomSearchInput
              placeholder="Search drugs, manufacturers, batches..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            <FilterChips />
          </VStack>
        </VStack>
      </LinearGradient>

      {/* Drug List */}
      {filteredDrugs.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredDrugs}
          renderItem={({ item }) => <DrugCard drug={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ 
            paddingHorizontal: 24,
            paddingVertical: 8,
            paddingBottom: 32,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <Box h={2} />}
        />
      )}

      {/* Floating Action Button for Add Drug */}
      <Pressable
        onPress={() => router.push('/admin/drugs/create')}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#10B981',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Text fontSize="2xl" color="white" fontWeight="600">+</Text>
      </Pressable>

      {/* Enhanced QR Code Modal */}
      <Modal isOpen={showQRModal} onClose={() => setShowQRModal(false)} size="xl">
        <Modal.Content bg="white" rounded="2xl">
          <Modal.Header bg="transparent" borderBottomWidth={0} pb={0}>
            <HStack space={3} alignItems="center">
              <Box bg="#EBF8FF" p={2} rounded="lg">
                <Text fontSize="xl">🔲</Text>
              </Box>
              <Text fontSize="lg" fontWeight="700" color="#1F2937">
                QR Code Generated
              </Text>
            </HStack>
          </Modal.Header>
          <Modal.Body>
            <VStack space={6} alignItems="center">
              <Text textAlign="center" color="#6B7280" fontSize="md">
                QR code for{' '}
                <Text fontWeight="700" color="#1F2937">
                  {selectedDrug?.name}
                </Text>
              </Text>
              
              {generatedQR?.qrCodeImageUrl && (
                <Box bg="#F8FAFC" p={6} rounded="2xl" borderWidth={1} borderColor="#E5E7EB">
                  <AspectRatio w="48" ratio={1}>
                    <Image
                      source={{ uri: generatedQR.qrCodeImageUrl }}
                      alt="Generated QR Code"
                      rounded="xl"
                      fallbackElement={
                        <Box 
                          bg="#F3F4F6" 
                          rounded="xl"
                          flex={1}
                          justifyContent="center" 
                          alignItems="center"
                        >
                          <VStack space={3} alignItems="center">
                            <Text fontSize="4xl" color="#9CA3AF">🔲</Text>
                            <Text fontSize="md" color="#6B7280" fontWeight="600">
                              QR Code Generated
                            </Text>
                          </VStack>
                        </Box>
                      }
                    />
                  </AspectRatio>
                </Box>
              )}
              
              {generatedQR?.qrCodeData && (
                <Box bg="#EBF8FF" p={4} rounded="xl" w="full" borderWidth={1} borderColor="#BFDBFE">
                  <VStack space={2}>
                    <Text fontSize="sm" fontWeight="600" color="#1E40AF">
                      QR Code Data
                    </Text>
                    <Text fontSize="xs" color="#3730A3" fontFamily="mono">
                      {generatedQR.qrCodeData}
                    </Text>
                  </VStack>
                </Box>
              )}
              
              <Alert status="success" rounded="xl" bg="#F0FDF4" borderColor="#BBF7D0">
                <Alert.Icon />
                <Text fontSize="sm" color="#166534" fontWeight="500">
                  QR code can now be scanned by citizens to verify this drug
                </Text>
              </Alert>
            </VStack>
          </Modal.Body>
          <Modal.Footer bg="transparent" borderTopWidth={0}>
            <Button.Group space={3}>
              <Button 
                variant="outline" 
                onPress={() => setShowQRModal(false)}
                rounded="xl"
                px={6}
                borderColor="#E5E7EB"
              >
                <Text fontWeight="600" color="#6B7280">Close</Text>
              </Button>
              <Button 
                onPress={() => router.push(`/admin/drugs/${selectedDrug?.id}`)}
                bg="#3B82F6"
                _pressed={{ bg: '#2563EB' }}
                rounded="xl"
                px={6}
              >
                <Text fontWeight="600" color="white">View Details</Text>
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
}