import React, { useState, useCallback, forwardRef, useRef, useEffect } from 'react';
import {
  VStack,
  Box,
  Text,
  Center,
  StatusBar,
  Input,
  Icon,
  HStack,
  ScrollView,
  Pressable,
  Divider,
  Spinner,
  Alert,
  Badge,
  Heading,
  useToast,
  Avatar,
  Flex,
  AspectRatio,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { drugAPI, Drug } from '../../services/api';
import { TextInput, View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Enhanced Custom Input component with modern styling
const CustomInput = forwardRef<TextInput, any>(({ 
  placeholder, 
  value, 
  onChangeText, 
  onFocus, 
  onBlur,
  autoCapitalize = 'none',
  autoCorrect = false,
  returnKeyType = 'done',
  onSubmitEditing,
  editable = true,
  style,
  ...props 
}, ref) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  React.useImperativeHandle(ref, () => inputRef.current!);

  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  }, [onFocus, animatedValue]);

  const handleBlur = useCallback((e: any) => {
    setIsFocused(false);
    Animated.spring(animatedValue, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  }, [onBlur, animatedValue]);

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', '#4299E1'],
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <Animated.View style={[
      styles.inputContainer, 
      style,
      {
        borderColor,
        shadowOpacity,
        shadowColor: '#4299E1',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: isFocused ? 4 : 1,
      }
    ]}>
      <TextInput
        ref={inputRef}
        style={styles.textInput}
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
        placeholderTextColor="#A0AEC0"
        {...props}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
    flex: 1,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    flex: 1,
  },
});

// Enhanced Search Input Wrapper
const SearchInputWrapper = React.memo(({ 
  value, 
  onChangeText, 
  onSubmitEditing, 
  isLoading 
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  isLoading: boolean;
}) => {
  const inputRef = useRef<TextInput>(null);

  return (
    <CustomInput
      ref={inputRef}
      placeholder="Search for any medication..."
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      returnKeyType="search"
      editable={!isLoading}
      style={{ minHeight: 56 }}
    />
  );
});

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const toast = useToast();

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast.show({
        description: 'Please enter a drug name to search',
        variant: 'warning',
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setSelectedDrug(null);

    try {
      const response = await drugAPI.searchPublicDrugs(searchQuery.trim());
      setSearchResults(response.content || response || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.show({
        description: 'Failed to search for drugs. Please try again.',
        variant: 'error',
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, toast]);

  const handleDrugSelect = useCallback((drug: Drug) => {
    setSelectedDrug(drug);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { bg: ['#48BB78', '#38A169'], color: 'white' };
      case 'RECALLED':
        return { bg: ['#F56565', '#E53E3E'], color: 'white' };
      case 'EXPIRED':
        return { bg: ['#ED8936', '#DD6B20'], color: 'white' };
      case 'SUSPENDED':
        return { bg: ['#4299E1', '#3182CE'], color: 'white' };
      default:
        return { bg: ['#A0AEC0', '#718096'], color: 'white' };
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'checkmark-circle';
      case 'RECALLED':
        return 'warning';
      case 'EXPIRED':
        return 'time';
      case 'SUSPENDED':
        return 'pause-circle';
      default:
        return 'help-circle';
    }
  }, []);

  const DrugCard = useCallback(({ drug }: { drug: Drug }) => {
    const statusColor = getStatusColor(drug.status);
    const statusIcon = getStatusIcon(drug.status);
    
    return (
      <Pressable onPress={() => handleDrugSelect(drug)}>
        {({ isPressed }) => (
          <Box
            bg="white"
            mx={4}
            mb={4}
            borderRadius="2xl"
            shadow={isPressed ? 6 : 3}
            borderWidth={1}
            borderColor="gray.100"
            overflow="hidden"
            transform={isPressed ? [{ scale: 0.98 }] : [{ scale: 1 }]}
            transition="all 0.2s"
          >
            {/* Header with gradient */}
            <LinearGradient
              colors={statusColor.bg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ padding: 16 }}
            >
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={3} alignItems="center" flex={1}>
                  <Avatar
                    bg="white"
                    size="md"
                    source={{
                      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(drug.name)}&background=ffffff&color=4299E1&bold=true`
                    }}
                  >
                    <Icon as={Ionicons} name="medical" color="blue.500" size="sm" />
                  </Avatar>
                  <VStack flex={1}>
                    <Text fontSize="lg" fontWeight="bold" color="white" numberOfLines={2}>
                      {drug.name}
                    </Text>
                    <Text fontSize="sm" color="white" opacity={0.9}>
                      {drug.manufacturer}
                    </Text>
                  </VStack>
                </HStack>
                <Icon as={Ionicons} name={statusIcon} color="white" size="lg" />
              </HStack>
            </LinearGradient>

            {/* Content */}
            <VStack space={3} p={4}>
              {/* Quick Info */}
              <HStack space={4} flexWrap="wrap">
                {drug.activeIngredient && (
                  <VStack flex={1} minW="120">
                    <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase">
                      Active Ingredient
                    </Text>
                    <Text fontSize="sm" color="gray.800" fontWeight="500" numberOfLines={1}>
                      {drug.activeIngredient}
                    </Text>
                  </VStack>
                )}
                {drug.strength && (
                  <VStack flex={1} minW="80">
                    <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase">
                      Strength
                    </Text>
                    <Text fontSize="sm" color="gray.800" fontWeight="500">
                      {drug.strength}
                    </Text>
                  </VStack>
                )}
              </HStack>

              {/* Status and Expiry */}
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={2} alignItems="center">
                  <Badge
                    colorScheme={drug.expired ? 'red' : 'green'}
                    variant="subtle"
                    startIcon={<Icon as={Ionicons} name="time" size="xs" />}
                  >
                    {drug.expired ? 'Expired' : 'Valid'}
                  </Badge>
                  <Text fontSize="xs" color="gray.500">
                    Exp: {formatDate(drug.expiryDate)}
                  </Text>
                </HStack>
                <Icon as={Ionicons} name="chevron-forward" color="gray.400" size="sm" />
              </HStack>
            </VStack>
          </Box>
        )}
      </Pressable>
    );
  }, [handleDrugSelect, getStatusColor, getStatusIcon, formatDate]);

  const DrugDetails = useCallback(({ drug }: { drug: Drug }) => {
    const statusColor = getStatusColor(drug.status);
    const statusIcon = getStatusIcon(drug.status);

    return (
      <Box bg="gray.50" flex={1}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <LinearGradient
            colors={statusColor.bg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingBottom: 40 }}
          >
            <Box pt={12} px={6}>
              <HStack justifyContent="space-between" alignItems="flex-start" mb={6}>
                <Pressable
                  onPress={() => setSelectedDrug(null)}
                  p={2}
                  borderRadius="full"
                  bg="rgba(255,255,255,0.2)"
                >
                  <Icon as={Ionicons} name="arrow-back" size="lg" color="white" />
                </Pressable>
                <Icon as={Ionicons} name={statusIcon} size="2xl" color="white" />
              </HStack>

              <VStack space={3}>
                <Heading size="xl" color="white" textAlign="center">
                  {drug.name}
                </Heading>
                <Text fontSize="lg" color="white" opacity={0.9} textAlign="center">
                  {drug.manufacturer}
                </Text>
                <Center>
                  <Badge
                    bg="rgba(255,255,255,0.2)"
                    _text={{ color: 'white', fontWeight: 'bold' }}
                    px={4}
                    py={2}
                    borderRadius="full"
                  >
                    {drug.status}
                  </Badge>
                </Center>
              </VStack>
            </Box>
          </LinearGradient>

          {/* Content Cards */}
          <VStack space={4} mt={-6} px={4} pb={6}>
            {/* Basic Information Card */}
            <Box bg="white" borderRadius="2xl" p={6} shadow={2}>
              <HStack space={3} alignItems="center" mb={4}>
                <Box bg="blue.100" p={3} borderRadius="xl">
                  <Icon as={Ionicons} name="information-circle" color="blue.600" size="lg" />
                </Box>
                <Heading size="md" color="gray.700">
                  Basic Information
                </Heading>
              </HStack>
              
              <VStack space={4}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="600" color="gray.600">Batch Number</Text>
                  <Text fontWeight="500" color="gray.800">{drug.batchNumber}</Text>
                </HStack>
                
                {drug.registrationNumber && (
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontWeight="600" color="gray.600">Registration #</Text>
                    <Text fontWeight="500" color="gray.800">{drug.registrationNumber}</Text>
                  </HStack>
                )}
                
                {drug.activeIngredient && (
                  <VStack space={1}>
                    <Text fontWeight="600" color="gray.600">Active Ingredient</Text>
                    <Text fontWeight="500" color="gray.800">{drug.activeIngredient}</Text>
                  </VStack>
                )}
                
                {drug.strength && (
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontWeight="600" color="gray.600">Strength</Text>
                    <Text fontWeight="500" color="gray.800">{drug.strength}</Text>
                  </HStack>
                )}
                
                {drug.dosageForm && (
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontWeight="600" color="gray.600">Dosage Form</Text>
                    <Text fontWeight="500" color="gray.800">{drug.dosageForm}</Text>
                  </HStack>
                )}
                
                {drug.category && (
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontWeight="600" color="gray.600">Category</Text>
                    <Text fontWeight="500" color="gray.800">{drug.category}</Text>
                  </HStack>
                )}
              </VStack>
            </Box>

            {/* Dates Card */}
            <Box bg="white" borderRadius="2xl" p={6} shadow={2}>
              <HStack space={3} alignItems="center" mb={4}>
                <Box bg="green.100" p={3} borderRadius="xl">
                  <Icon as={Ionicons} name="calendar" color="green.600" size="lg" />
                </Box>
                <Heading size="md" color="gray.700">
                  Important Dates
                </Heading>
              </HStack>
              
              <VStack space={4}>
                {drug.manufactureDate && (
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontWeight="600" color="gray.600">Manufactured</Text>
                    <Text fontWeight="500" color="gray.800">{formatDate(drug.manufactureDate)}</Text>
                  </HStack>
                )}
                
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontWeight="600" color="gray.600">Expires</Text>
                  <HStack space={2} alignItems="center">
                    <Text 
                      fontWeight="500" 
                      color={drug.expired ? 'red.600' : 'gray.800'}
                    >
                      {formatDate(drug.expiryDate)}
                    </Text>
                    {drug.expired && (
                      <Badge colorScheme="red" size="sm">EXPIRED</Badge>
                    )}
                  </HStack>
                </HStack>
              </VStack>
            </Box>

            {/* Instructions Card */}
            {(drug.description || drug.storageInstructions || drug.usageInstructions) && (
              <Box bg="white" borderRadius="2xl" p={6} shadow={2}>
                <HStack space={3} alignItems="center" mb={4}>
                  <Box bg="orange.100" p={3} borderRadius="xl">
                    <Icon as={Ionicons} name="document-text" color="orange.600" size="lg" />
                  </Box>
                  <Heading size="md" color="gray.700">
                    Instructions & Guidelines
                  </Heading>
                </HStack>
                
                <VStack space={4}>
                  {drug.description && (
                    <VStack space={2}>
                      <Text fontWeight="600" color="gray.600">Description</Text>
                      <Text color="gray.800" lineHeight="lg">{drug.description}</Text>
                    </VStack>
                  )}
                  
                  {drug.storageInstructions && (
                    <VStack space={2}>
                      <Text fontWeight="600" color="gray.600">Storage Instructions</Text>
                      <Text color="gray.800" lineHeight="lg">{drug.storageInstructions}</Text>
                    </VStack>
                  )}
                  
                  {drug.usageInstructions && (
                    <VStack space={2}>
                      <Text fontWeight="600" color="gray.600">Usage Instructions</Text>
                      <Text color="gray.800" lineHeight="lg">{drug.usageInstructions}</Text>
                    </VStack>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        </ScrollView>
      </Box>
    );
  }, [getStatusColor, getStatusIcon, formatDate]);

  return (
    <Box flex={1} bg="gray.50">
      <StatusBar barStyle="light-content" backgroundColor="#4299E1" />
      
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#4299E1', '#3182CE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Box pt={12} pb={6} px={6}>
          <VStack space={4}>
            <HStack alignItems="center" justifyContent="center" space={3}>
              <Box bg="rgba(255,255,255,0.2)" p={3} borderRadius="xl">
                <Icon as={Ionicons} name="medical" size="2xl" color="white" />
              </Box>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  DrugGuard
                </Text>
                <Text fontSize="sm" color="white" opacity={0.8}>
                  FDA Database
                </Text>
              </VStack>
            </HStack>
            
            <Text fontSize="md" color="white" opacity={0.9} textAlign="center">
              Search and verify medication information from FDA database
            </Text>
          </VStack>
        </Box>
      </LinearGradient>

      {/* Enhanced Search Input */}
      <Box bg="white" px={6} py={6} shadow={1}>
        <HStack space={3} alignItems="center">
          <SearchInputWrapper
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearch}
            isLoading={isLoading}
          />
          <Pressable
            onPress={handleSearch}
            disabled={isLoading}
          >
            {({ isPressed }) => (
              <LinearGradient
                colors={isPressed ? ['#3182CE', '#2C5282'] : ['#4299E1', '#3182CE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  transform: isPressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
                }}
              >
                {isLoading ? (
                  <Spinner color="white" size="sm" />
                ) : (
                  <Icon as={Ionicons} name="search" size="md" color="white" />
                )}
              </LinearGradient>
            )}
          </Pressable>
        </HStack>
      </Box>

      {/* Content */}
      <ScrollView 
        flex={1} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {selectedDrug ? (
          <DrugDetails drug={selectedDrug} />
        ) : (
          <VStack space={4} py={6}>
            {isLoading ? (
              <Center py={12}>
                <Box bg="white" p={8} borderRadius="2xl" shadow={2} mx={6}>
                  <VStack space={4} alignItems="center">
                    <Box bg="blue.100" p={4} borderRadius="xl">
                      <Spinner size="lg" color="blue.600" />
                    </Box>
                    <Text fontSize="lg" fontWeight="600" color="gray.700">
                      Searching Database
                    </Text>
                    <Text color="gray.500" textAlign="center">
                      Please wait while we search for medications...
                    </Text>
                  </VStack>
                </Box>
              </Center>
            ) : hasSearched ? (
              searchResults.length > 0 ? (
                <VStack space={4}>
                  <Box px={4}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text fontSize="lg" fontWeight="600" color="gray.700">
                        Search Results
                      </Text>
                      <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                        {searchResults.length} found
                      </Badge>
                    </HStack>
                  </Box>
                  {searchResults.map((drug) => (
                    <DrugCard key={drug.id} drug={drug} />
                  ))}
                </VStack>
              ) : (
                <Center py={12}>
                  <Box bg="white" p={8} borderRadius="2xl" shadow={2} mx={6}>
                    <VStack space={4} alignItems="center">
                      <Box bg="red.100" p={6} borderRadius="xl">
                        <Icon as={Ionicons} name="search-outline" size="4xl" color="red.400" />
                      </Box>
                      <Text fontSize="lg" fontWeight="600" color="gray.700" textAlign="center">
                        No Results Found
                      </Text>
                      <Text color="gray.500" textAlign="center" px={4}>
                        We couldn't find any medications matching your search. Try different keywords or check the spelling.
                      </Text>
                    </VStack>
                  </Box>
                </Center>
              )
            ) : (
              <Center py={12}>
                <Box bg="white" p={8} borderRadius="2xl" shadow={2} mx={6}>
                  <VStack space={4} alignItems="center">
                    <Box bg="blue.100" p={6} borderRadius="xl">
                      <Icon as={Ionicons} name="medical-outline" size="4xl" color="blue.400" />
                    </Box>
                    <Text fontSize="lg" fontWeight="600" color="gray.700" textAlign="center">
                      Welcome to DrugGuard
                    </Text>
                    <Text color="gray.500" textAlign="center" px={4}>
                      Enter the name of any medication to search our comprehensive FDA database
                    </Text>
                  </VStack>
                </Box>
              </Center>
            )}
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}