import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  ScrollView,
  StatusBar,
  Input,
  TextArea,
  Select,
  Button,
  Icon,
  Center,
  Divider,
  Badge,
  useToast,
  Spinner,
  Pressable,
  Heading,
  Alert,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { drugAPI, DrugReport, CreateDrugReportRequest } from '../../services/api';
import { TextInput, View, StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native';

const issueTypes = [
  { label: 'Counterfeit Drug', value: 'COUNTERFEIT' },
  { label: 'Expired Medication', value: 'EXPIRED' },
  { label: 'Suspicious Packaging', value: 'SUSPICIOUS_PACKAGING' },
  { label: 'Wrong Medication', value: 'WRONG_MEDICATION' },
  { label: 'Poor Quality', value: 'POOR_QUALITY' },
  { label: 'Missing Information', value: 'MISSING_INFORMATION' },
  { label: 'Unusual Side Effects', value: 'UNUSUAL_SIDE_EFFECTS' },
  { label: 'Other', value: 'OTHER' },
];

const severityLevels = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' },
];

const CustomInput = forwardRef<TextInput, any>(({ 
  placeholder, 
  value, 
  onChangeText, 
  onFocus, 
  onBlur, 
  onSubmitEditing,
  editable = true,
  style,
  multiline = false,
  numberOfLines = 1,
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
    outputRange: ['#E2E8F0', '#E53E3E'],
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
        shadowColor: '#E53E3E',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: isFocused ? 4 : 1,
        minHeight: multiline ? 80 : 56,
      }
    ]}>
      <TextInput
        ref={inputRef}
        style={[
          styles.textInput,
          { textAlignVertical: multiline ? 'top' : 'center' }
        ]}
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : undefined}
        returnKeyType={multiline ? 'default' : 'next'}
        blurOnSubmit={!multiline}
        {...props}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    flex: 1,
  },
});

// Isolated wrapper components to prevent re-renders
const InputWrapper = React.memo(({ 
  value, 
  onChangeText, 
  placeholder, 
  ...props 
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  [key: string]: any;
}) => (
  <CustomInput
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    {...props}
  />
));

const TextAreaWrapper = React.memo(({ 
  value, 
  onChangeText, 
  placeholder, 
  numberOfLines = 4,
  ...props 
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  numberOfLines?: number;
  [key: string]: any;
}) => (
  <CustomInput
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    multiline={true}
    numberOfLines={numberOfLines}
    returnKeyType="done"
    blurOnSubmit={true}
    {...props}
  />
));

// Move ReportForm outside the main component to prevent re-renders
const ReportForm = React.memo(({ 
  formData, 
  updateFormData, 
  handleSubmit, 
  isSubmitting 
}: {
  formData: CreateDrugReportRequest;
  updateFormData: (field: keyof CreateDrugReportRequest, value: string | undefined) => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
}) => (
  <Box bg="white" mx={4} p={6} borderRadius="xl" shadow={2}>
    <VStack space={6}>
      <VStack space={2}>
        <Heading size="lg" color="red.600">
          🚨 Report Suspicious Drug
        </Heading>
        <Text fontSize="sm" color="gray.600">
          Help protect our community by reporting any suspicious or counterfeit medications
        </Text>
      </VStack>

      <Divider />

      {/* Drug Information */}
      <VStack space={4}>
        <Text fontSize="md" fontWeight="bold" color="gray.700">
          Drug Information
        </Text>
        
        <InputWrapper
          placeholder="Drug Name *"
          value={formData.drugName}
          onChangeText={(text: string) => updateFormData('drugName', text)}
        />
        
        <InputWrapper
          placeholder="Manufacturer *"
          value={formData.manufacturer}
          onChangeText={(text: string) => updateFormData('manufacturer', text)}
        />
        
        <HStack space={3}>
          <InputWrapper
            placeholder="Batch Number"
            value={formData.batchNumber}
            onChangeText={(text: string) => updateFormData('batchNumber', text)}
            style={{ flex: 1 }}
          />
          
          <InputWrapper
            placeholder="Registration Number"
            value={formData.registrationNumber}
            onChangeText={(text: string) => updateFormData('registrationNumber', text)}
            style={{ flex: 1 }}
          />
        </HStack>
      </VStack>

      {/* Issue Details */}
      <VStack space={4}>
        <Text fontSize="md" fontWeight="bold" color="gray.700">
          Issue Details
        </Text>
        
        <Select
          selectedValue={formData.issueType}
          placeholder="Select Issue Type *"
          onValueChange={(value: string | undefined) => {
            if (value) updateFormData('issueType', value);
          }}
          size="lg"
          borderRadius="lg"
          bg="gray.50"
          borderWidth={1}
          borderColor="gray.200"
          _selectedItem={{
            bg: 'red.100',
          }}
        >
          {issueTypes.map((type) => (
            <Select.Item key={type.value} label={type.label} value={type.value} />
          ))}
        </Select>
        
        <Select
          selectedValue={formData.severity}
          placeholder="Select Severity Level"
          onValueChange={(value: string | undefined) => {
            if (value) updateFormData('severity', value as any);
          }}
          size="lg"
          borderRadius="lg"
          bg="gray.50"
          borderWidth={1}
          borderColor="gray.200"
          _selectedItem={{
            bg: 'red.100',
          }}
        >
          {severityLevels.map((level) => (
            <Select.Item key={level.value} label={level.label} value={level.value} />
          ))}
        </Select>
        
        <TextAreaWrapper
          placeholder="Describe the issue in detail *"
          value={formData.description}
          onChangeText={(text: string) => updateFormData('description', text)}
          numberOfLines={4}
        />
      </VStack>

      {/* Location & Contact */}
      <VStack space={4}>
        <Text fontSize="md" fontWeight="bold" color="gray.700">
          Location & Contact (Optional)
        </Text>
        
        <InputWrapper
          placeholder="Location where you found this drug"
          value={formData.location}
          onChangeText={(text: string) => updateFormData('location', text)}
        />
        
        <InputWrapper
          placeholder="Your contact information (phone/email)"
          value={formData.contactInfo}
          onChangeText={(text: string) => updateFormData('contactInfo', text)}
        />
      </VStack>

      {/* Submit Button */}
      <Button
        onPress={handleSubmit}
        bg="red.600"
        size="lg"
        borderRadius="lg"
        _pressed={{ bg: 'red.700' }}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <HStack space={2} alignItems="center">
            <Spinner color="white" size="sm" />
            <Text color="white" fontWeight="medium">
              Submitting...
            </Text>
          </HStack>
        ) : (
          <HStack space={2} alignItems="center">
            <Icon as={Ionicons} name="send" color="white" size="sm" />
            <Text color="white" fontWeight="medium">
              Submit Report
            </Text>
          </HStack>
        )}
      </Button>
    </VStack>
  </Box>
));

export default function ReportScreen() {
  const [formData, setFormData] = useState<CreateDrugReportRequest>({
    drugName: '',
    manufacturer: '',
    batchNumber: '',
    registrationNumber: '',
    description: '',
    issueType: '',
    location: '',
    contactInfo: '',
    severity: 'MEDIUM',
  });
  
  const [recentReports, setRecentReports] = useState<DrugReport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadRecentReports();
  }, []);

  const loadRecentReports = useCallback(async () => {
    setIsLoadingReports(true);
    try {
      const reports = await drugAPI.getRecentReports();
      setRecentReports(reports);
    } catch (error) {
      console.error('Error loading recent reports:', error);
      toast.show({
        description: 'Failed to load recent reports',
        variant: 'error',
      });
    } finally {
      setIsLoadingReports(false);
    }
  }, [toast]);

  const handleSubmit = useCallback(async () => {
    // Validate required fields
    if (!formData.drugName.trim() || !formData.manufacturer.trim() || 
        !formData.description.trim() || !formData.issueType) {
      toast.show({
        description: 'Please fill in all required fields',
        variant: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await drugAPI.createDrugReport(formData);
      toast.show({
        description: 'Report submitted successfully! Thank you for helping keep our community safe.',
        variant: 'success',
      });
      
      // Reset form
      setFormData({
        drugName: '',
        manufacturer: '',
        batchNumber: '',
        registrationNumber: '',
        description: '',
        issueType: '',
        location: '',
        contactInfo: '',
        severity: 'MEDIUM',
      });
      
      // Reload recent reports
      loadRecentReports();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.show({
        description: 'Failed to submit report. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, toast, loadRecentReports]);

  const updateFormData = useCallback((field: keyof CreateDrugReportRequest, value: string | undefined) => {
    if (value !== undefined && value !== null) {
      setFormData(prev => ({ ...prev, [field]: value as any }));
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'UNDER_REVIEW':
        return 'blue';
      case 'RESOLVED':
        return 'green';
      case 'DISMISSED':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const RecentReportsCard = ({ report }: { report: DrugReport }) => (
    <Box bg="white" mx={4} p={4} mb={3} borderRadius="lg" shadow={1} borderWidth={1} borderColor="gray.200">
      <VStack space={3}>
        <HStack justifyContent="space-between" alignItems="flex-start">
          <VStack flex={1} space={1}>
            <Text fontSize="lg" fontWeight="bold" color="gray.800">
              {report.drugName}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {report.manufacturer}
            </Text>
          </VStack>
          <VStack space={1} alignItems="flex-end">
            <Badge colorScheme={getSeverityColor(report.severity)} variant="solid" size="sm">
              {report.severity}
            </Badge>
            <Badge colorScheme={getStatusColor(report.status)} variant="outline" size="sm">
              {report.status.replace('_', ' ')}
            </Badge>
          </VStack>
        </HStack>
        
        <Text fontSize="sm" color="gray.700" numberOfLines={2}>
          {report.description}
        </Text>
        
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="xs" color="gray.500">
            {report.issueType.replace('_', ' ')}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {formatDate(report.createdAt)}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Box flex={1} bg="gray.50">
        <StatusBar barStyle="dark-content" backgroundColor="#f7fafc" />
        
        {/* Header */}
        <Box bg="white" pt={12} pb={4} px={4} shadow={1}>
          <VStack space={4}>
            <HStack alignItems="center" space={2}>
              <Icon as={Ionicons} name="warning" size="lg" color="red.600" />
              <Text fontSize="2xl" fontWeight="bold" color="red.600">
                Report Drugs
              </Text>
            </HStack>
            
            <Text fontSize="md" color="gray.500">
              Report suspicious or counterfeit medications to help protect our community
            </Text>
          </VStack>
        </Box>

        <ScrollView 
          flex={1} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <VStack space={6} py={4}>
            {/* Toggle Buttons */}
            <HStack space={2} px={4}>
              <Pressable
                flex={1}
                onPress={() => setShowForm(true)}
                bg={showForm ? 'red.600' : 'white'}
                p={3}
                borderRadius="lg"
                borderWidth={1}
                borderColor={showForm ? 'red.600' : 'gray.300'}
              >
                <Center>
                  <Text color={showForm ? 'white' : 'gray.600'} fontWeight="medium">
                    Report Issue
                  </Text>
                </Center>
              </Pressable>
              
              <Pressable
                flex={1}
                onPress={() => setShowForm(false)}
                bg={!showForm ? 'red.600' : 'white'}
                p={3}
                borderRadius="lg"
                borderWidth={1}
                borderColor={!showForm ? 'red.600' : 'gray.300'}
              >
                <Center>
                  <Text color={!showForm ? 'white' : 'gray.600'} fontWeight="medium">
                    Recent Reports
                  </Text>
                </Center>
              </Pressable>
            </HStack>

            {showForm ? (
              <ReportForm 
                formData={formData}
                updateFormData={updateFormData}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            ) : (
              <VStack space={4}>
                <Box px={4}>
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    Recent Community Reports
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    See what others have reported recently
                  </Text>
                </Box>

                {isLoadingReports ? (
                  <Center py={8}>
                    <Spinner size="lg" color="red.600" />
                    <Text mt={4} color="gray.600">
                      Loading recent reports...
                    </Text>
                  </Center>
                ) : recentReports.length > 0 ? (
                  recentReports.map((report) => (
                    <RecentReportsCard key={report.id} report={report} />
                  ))
                ) : (
                  <Center py={8}>
                    <Icon as={Ionicons} name="checkmark-circle-outline" size="4xl" color="green.400" />
                    <Text mt={4} fontSize="lg" color="gray.600" textAlign="center">
                      No recent reports
                    </Text>
                    <Text mt={2} fontSize="sm" color="gray.500" textAlign="center" px={8}>
                      Be the first to report a suspicious drug and help keep our community safe
                    </Text>
                  </Center>
                )}
              </VStack>
            )}
          </VStack>
        </ScrollView>
      </Box>
    </KeyboardAvoidingView>
  );
}