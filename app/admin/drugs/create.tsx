import React, { useState, useEffect, useMemo, useCallback, forwardRef } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Input,
  TextArea,
  Button,
  ScrollView,
  Pressable,
  useBreakpointValue,
  FormControl,
  Select,
  useToast,
  Divider,
  Progress,
  Image,
  Modal,
  Alert,
  CheckIcon,
  Center,
} from 'native-base';
import { router } from 'expo-router';
import { Platform, Dimensions, TextInput, View, StyleSheet } from 'react-native';
import { drugAPI, CreateDrugRequest, QrCodeResponse } from '../../../services/api';

const { width } = Dimensions.get('window');

// Custom Input component that wraps native TextInput
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

// Custom TextArea component that wraps native TextInput
const CustomTextArea = forwardRef<TextInput, any>(({ 
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
  height = 80,
  ...props 
}, ref) => {
  return (
    <View style={[styles.textAreaContainer, { height }, style]}>
      <TextInput
        ref={ref}
        style={[styles.textAreaInput, { height: height - 16 }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        placeholderTextColor="#9CA3AF"
        multiline={true}
        textAlignVertical="top"
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
  textAreaContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textAreaInput: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
});

export default function CreateDrugScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<QrCodeResponse | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<CreateDrugRequest>({
    name: '',
    manufacturer: '',
    batchNumber: '',
    registrationNumber: '',
    activeIngredient: '',
    strength: '',
    dosageForm: '',
    category: '',
    manufactureDate: '',
    expiryDate: '',
    description: '',
    storageInstructions: '',
    usageInstructions: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  
  // Memoize breakpoint values to prevent re-renders
  const isMobile = useMemo(() => {
    return width < 768;
  }, []);

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = useCallback(async () => {
    try {
      const [categoriesData, manufacturersData] = await Promise.all([
        drugAPI.getCategories(),
        drugAPI.getManufacturers(),
      ]);
      setCategories(categoriesData);
      setManufacturers(manufacturersData);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  }, []);

  const steps = useMemo(() => [
    { title: 'Basic Information', icon: '📋' },
    { title: 'Drug Details', icon: '💊' },
    { title: 'Instructions & Notes', icon: '📝' },
    { title: 'Review & Submit', icon: '✅' },
  ], []);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.name.trim()) newErrors.name = 'Drug name is required';
        if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
        if (!formData.batchNumber.trim()) newErrors.batchNumber = 'Batch number is required';
        if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
        break;
      
      case 1: // Drug Details
        if (!formData.activeIngredient?.trim()) newErrors.activeIngredient = 'Active ingredient is required';
        if (!formData.strength?.trim()) newErrors.strength = 'Strength is required';
        if (!formData.dosageForm?.trim()) newErrors.dosageForm = 'Dosage form is required';
        break;
      
      case 2: // Instructions
        if (!formData.description?.trim()) newErrors.description = 'Description is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  }, [validateStep, currentStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(2)) return;

    setIsLoading(true);
    try {
      // Create the drug
      const createdDrug = await drugAPI.createDrug(formData);
      
      toast.show({
        description: 'Drug created successfully!',
        variant: 'success',
        placement: 'top',
      });

      // Generate QR code if creation was successful
      if (createdDrug.id) {
        try {
          const qrResponse = await drugAPI.generateQrCode(createdDrug.id);
          setGeneratedQR(qrResponse);
          setShowQRModal(true);
        } catch (qrError) {
          console.error('QR generation error:', qrError);
          toast.show({
            description: 'Drug created but QR generation failed. You can generate it later.',
            variant: 'warning',
            placement: 'top',
          });
        }
      }

    } catch (error: any) {
      console.error('Error creating drug:', error);
      toast.show({
        description: error.response?.data?.message || 'Failed to create drug',
        variant: 'error',
        placement: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateStep, toast]);

  const handleFormChange = useCallback((field: keyof CreateDrugRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const renderStepIndicator = useCallback(() => (
    <VStack space={4} mb={6}>
      <HStack justifyContent="space-between" alignItems="center">
        {steps.map((step, index) => (
          <VStack key={index} alignItems="center" flex={1}>
            <Box
              w={10}
              h={10}
              rounded="full"
              bg={index <= currentStep ? 'primary.500' : 'gray.200'}
              alignItems="center"
              justifyContent="center"
              mb={2}
            >
              {index < currentStep ? (
                <CheckIcon size="4" color="white" />
              ) : (
                <Text fontSize="lg" color={index === currentStep ? 'white' : 'gray.500'}>
                  {step.icon}
                </Text>
              )}
            </Box>
            <Text 
              fontSize="xs" 
              textAlign="center" 
              color={index <= currentStep ? 'primary.600' : 'gray.400'}
              fontWeight={index === currentStep ? '600' : '400'}
            >
              {step.title}
            </Text>
          </VStack>
        ))}
      </HStack>
      <Progress 
        value={(currentStep / (steps.length - 1)) * 100} 
        colorScheme="primary" 
        rounded="full"
        size="sm"
      />
    </VStack>
  ), [steps, currentStep]);

  const renderBasicInformation = useCallback(() => (
    <VStack space={4}>
      <Text fontSize="lg" fontWeight="bold" color="gray.800">
        📋 Basic Information
      </Text>
      
      <FormControl isRequired isInvalid={!!errors.name}>
        <FormControl.Label>Drug Name</FormControl.Label>
        <CustomInput
          placeholder="e.g. Paracetamol 500mg Tablets"
          value={formData.name}
          onChangeText={(value: string) => handleFormChange('name', value)}
        />
        <FormControl.ErrorMessage>{errors.name}</FormControl.ErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={!!errors.manufacturer}>
        <FormControl.Label>Manufacturer</FormControl.Label>
        <Select
          placeholder="Select or type manufacturer"
          selectedValue={formData.manufacturer}
          onValueChange={(value: string) => handleFormChange('manufacturer', value)}
          size="lg"
        >
          {manufacturers.map((manufacturer) => (
            <Select.Item key={manufacturer} label={manufacturer} value={manufacturer} />
          ))}
        </Select>
        <FormControl.ErrorMessage>{errors.manufacturer}</FormControl.ErrorMessage>
      </FormControl>

      <HStack space={4}>
        <FormControl flex={1} isRequired isInvalid={!!errors.batchNumber}>
          <FormControl.Label>Batch Number</FormControl.Label>
          <CustomInput
            placeholder="e.g. PAR123456"
            value={formData.batchNumber}
            onChangeText={(value: string) => handleFormChange('batchNumber', value)}
          />
          <FormControl.ErrorMessage>{errors.batchNumber}</FormControl.ErrorMessage>
        </FormControl>

        <FormControl flex={1}>
          <FormControl.Label>Registration Number</FormControl.Label>
          <CustomInput
            placeholder="e.g. FDB24A0234"
            value={formData.registrationNumber}
            onChangeText={(value: string) => handleFormChange('registrationNumber', value)}
          />
        </FormControl>
      </HStack>

      <HStack space={4}>
        <FormControl flex={1}>
          <FormControl.Label>Manufacture Date</FormControl.Label>
          <CustomInput
            placeholder="YYYY-MM-DD"
            value={formData.manufactureDate}
            onChangeText={(value: string) => handleFormChange('manufactureDate', value)}
          />
        </FormControl>

        <FormControl flex={1} isRequired isInvalid={!!errors.expiryDate}>
          <FormControl.Label>Expiry Date</FormControl.Label>
          <CustomInput
            placeholder="YYYY-MM-DD"
            value={formData.expiryDate}
            onChangeText={(value: string) => handleFormChange('expiryDate', value)}
          />
          <FormControl.ErrorMessage>{errors.expiryDate}</FormControl.ErrorMessage>
        </FormControl>
      </HStack>
    </VStack>
  ), [formData, errors, manufacturers, handleFormChange]);

  const renderDrugDetails = useCallback(() => (
    <VStack space={4}>
      <Text fontSize="lg" fontWeight="bold" color="gray.800">
        💊 Drug Details
      </Text>
      
      <FormControl isRequired isInvalid={!!errors.activeIngredient}>
        <FormControl.Label>Active Ingredient</FormControl.Label>
        <CustomInput
          placeholder="e.g. Paracetamol"
          value={formData.activeIngredient}
          onChangeText={(value: string) => handleFormChange('activeIngredient', value)}
        />
        <FormControl.ErrorMessage>{errors.activeIngredient}</FormControl.ErrorMessage>
      </FormControl>

      <HStack space={4}>
        <FormControl flex={1} isRequired isInvalid={!!errors.strength}>
          <FormControl.Label>Strength</FormControl.Label>
          <CustomInput
            placeholder="e.g. 500mg"
            value={formData.strength}
            onChangeText={(value: string) => handleFormChange('strength', value)}
          />
          <FormControl.ErrorMessage>{errors.strength}</FormControl.ErrorMessage>
        </FormControl>

        <FormControl flex={1} isRequired isInvalid={!!errors.dosageForm}>
          <FormControl.Label>Dosage Form</FormControl.Label>
          <Select
            placeholder="Select form"
            selectedValue={formData.dosageForm}
            onValueChange={(value: string) => handleFormChange('dosageForm', value)}
            size="lg"
          >
            <Select.Item label="Tablet" value="Tablet" />
            <Select.Item label="Capsule" value="Capsule" />
            <Select.Item label="Syrup" value="Syrup" />
            <Select.Item label="Injection" value="Injection" />
            <Select.Item label="Cream" value="Cream" />
            <Select.Item label="Ointment" value="Ointment" />
            <Select.Item label="Drops" value="Drops" />
          </Select>
          <FormControl.ErrorMessage>{errors.dosageForm}</FormControl.ErrorMessage>
        </FormControl>
      </HStack>

      <FormControl>
        <FormControl.Label>Category</FormControl.Label>
        <Select
          placeholder="Select category"
          selectedValue={formData.category}
          onValueChange={(value: string) => handleFormChange('category', value)}
          size="lg"
        >
          {categories.map((category) => (
            <Select.Item key={category} label={category} value={category} />
          ))}
          <Select.Item label="Analgesic" value="Analgesic" />
          <Select.Item label="Antibiotic" value="Antibiotic" />
          <Select.Item label="Antimalarial" value="Antimalarial" />
          <Select.Item label="Antidiabetic" value="Antidiabetic" />
          <Select.Item label="Antihypertensive" value="Antihypertensive" />
          <Select.Item label="NSAID" value="NSAID" />
        </Select>
      </FormControl>
    </VStack>
  ), [formData, errors, categories, handleFormChange]);

  const renderInstructions = useCallback(() => (
    <VStack space={4}>
      <Text fontSize="lg" fontWeight="bold" color="gray.800">
        📝 Instructions & Notes
      </Text>
      
      <FormControl isRequired isInvalid={!!errors.description}>
        <FormControl.Label>Description</FormControl.Label>
        <CustomTextArea
          placeholder="Brief description of the drug and its purpose"
          value={formData.description}
          onChangeText={(value: string) => handleFormChange('description', value)}
          height={80}
        />
        <FormControl.ErrorMessage>{errors.description}</FormControl.ErrorMessage>
      </FormControl>

      <FormControl>
        <FormControl.Label>Storage Instructions</FormControl.Label>
        <CustomTextArea
          placeholder="How should this drug be stored?"
          value={formData.storageInstructions}
          onChangeText={(value: string) => handleFormChange('storageInstructions', value)}
          height={64}
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Usage Instructions</FormControl.Label>
        <CustomTextArea
          placeholder="How should this drug be used/administered?"
          value={formData.usageInstructions}
          onChangeText={(value: string) => handleFormChange('usageInstructions', value)}
          height={64}
        />
      </FormControl>
    </VStack>
  ), [formData, errors, handleFormChange]);

  const renderReview = useCallback(() => (
    <VStack space={4}>
      <Text fontSize="lg" fontWeight="bold" color="gray.800">
        ✅ Review & Submit
      </Text>
      
      <Box bg="white" rounded="xl" p={4} shadow={2}>
        <VStack space={3}>
          <HStack justifyContent="space-between">
            <Text fontSize="sm" color="gray.500">Drug Name:</Text>
            <Text fontSize="sm" fontWeight="600">{formData.name}</Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text fontSize="sm" color="gray.500">Manufacturer:</Text>
            <Text fontSize="sm" fontWeight="600">{formData.manufacturer}</Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text fontSize="sm" color="gray.500">Batch Number:</Text>
            <Text fontSize="sm" fontWeight="600">{formData.batchNumber}</Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text fontSize="sm" color="gray.500">Active Ingredient:</Text>
            <Text fontSize="sm" fontWeight="600">{formData.activeIngredient}</Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text fontSize="sm" color="gray.500">Strength:</Text>
            <Text fontSize="sm" fontWeight="600">{formData.strength}</Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text fontSize="sm" color="gray.500">Expiry Date:</Text>
            <Text fontSize="sm" fontWeight="600">{formData.expiryDate}</Text>
          </HStack>
        </VStack>
      </Box>

      <Alert status="info" colorScheme="info">
        <Alert.Icon />
        <Text fontSize="sm">
          After submission, a QR code will be automatically generated for this drug.
        </Text>
      </Alert>
    </VStack>
  ), [formData]);

  const renderContent = useCallback(() => {
    switch (currentStep) {
      case 0: return renderBasicInformation();
      case 1: return renderDrugDetails();
      case 2: return renderInstructions();
      case 3: return renderReview();
      default: return null;
    }
  }, [currentStep, renderBasicInformation, renderDrugDetails, renderInstructions, renderReview]);

  return (
    <Box flex={1} bg="gray.50">
      {/* Header */}
      <Box bg="white" pt={12} pb={4} px={6} shadow={2}>
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space={3} alignItems="center">
            <Pressable onPress={() => router.back()}>
              <Text fontSize="2xl" color="primary.500">←</Text>
            </Pressable>
            <VStack>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                Add New Drug
              </Text>
              <Text fontSize="sm" color="gray.500">
                Step {currentStep + 1} of {steps.length}
              </Text>
            </VStack>
          </HStack>
        </HStack>
      </Box>

      <ScrollView 
        flex={1} 
        p={6} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <VStack space={6}>
          {renderStepIndicator()}
          {renderContent()}
        </VStack>
      </ScrollView>

      {/* Navigation Buttons */}
      <Box bg="white" p={6} shadow={5}>
        <HStack space={4} justifyContent="space-between">
          <Button
            variant="outline"
            onPress={handlePrevious}
            isDisabled={currentStep === 0}
            flex={1}
          >
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onPress={handleNext} flex={1}>
              Next
            </Button>
          ) : (
            <Button
              onPress={handleSubmit}
              isLoading={isLoading}
              isLoadingText="Creating..."
              flex={1}
              colorScheme="success"
            >
              Create Drug
            </Button>
          )}
        </HStack>
      </Box>

      {/* QR Code Success Modal */}
      <Modal isOpen={showQRModal} onClose={() => setShowQRModal(false)} size="lg">
        <Modal.Content>
          <Modal.Header>🎉 Drug Created Successfully!</Modal.Header>
          <Modal.Body>
            <VStack space={4} alignItems="center">
              <Text textAlign="center" color="gray.600">
                Your drug has been registered and QR code generated successfully!
              </Text>
              
              {generatedQR?.qrCodeImageUrl && (
                <Box bg="gray.50" p={4} rounded="xl">
                  <Image
                    source={{ uri: generatedQR.qrCodeImageUrl }}
                    alt="Generated QR Code"
                    size="200"
                    resizeMode="contain"
                  />
                </Box>
              )}
              
              <Text fontSize="sm" color="gray.500" textAlign="center">
                QR code can be downloaded from the drug details page
              </Text>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="outline"
                onPress={() => {
                  setShowQRModal(false);
                  router.push('/admin/drugs');
                }}
              >
                View All Drugs
              </Button>
              <Button
                onPress={() => {
                  setShowQRModal(false);
                  // Reset form for new drug
                  setFormData({
                    name: '',
                    manufacturer: '',
                    batchNumber: '',
                    registrationNumber: '',
                    activeIngredient: '',
                    strength: '',
                    dosageForm: '',
                    category: '',
                    manufactureDate: '',
                    expiryDate: '',
                    description: '',
                    storageInstructions: '',
                    usageInstructions: '',
                  });
                  setCurrentStep(0);
                }}
              >
                Add Another Drug
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
}