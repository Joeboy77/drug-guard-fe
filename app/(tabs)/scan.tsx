import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  VStack,
  Box,
  Text,
  Center,
  StatusBar,
  Icon,
  HStack,
  ScrollView,
  Pressable,
  Spinner,
  Badge,
  Heading,
  useToast,
  Modal,
  Input,
  Divider,
  Progress,
  Alert,
  AlertDialog,
  Button,
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { drugAPI, DrugVerificationResponse, Drug } from '../../services/api';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Dimensions, Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ScanResult {
  response: DrugVerificationResponse;
  scannedAt: Date;
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualQrCode, setManualQrCode] = useState('');
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  
  const toast = useToast();
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setHasPermission(permission?.granted || false);
  }, [permission]);

  useEffect(() => {
    // Start scanning animation
    const scanAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Start pulse animation
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (!scanned && !showResult) {
      scanAnim.start();
      pulseAnim.start();
    }

    return () => {
      scanAnim.stop();
      pulseAnim.stop();
    };
  }, [scanned, showResult, scanAnimation, pulseAnimation]);

  const handleQRCodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (scanned || isVerifying) return;

    setScanned(true);
    await verifyQrCode(data);
  }, [scanned, isVerifying]);

  const verifyQrCode = async (qrCodeData: string) => {
    if (!qrCodeData.trim()) {
      toast.show({
        description: 'Invalid QR code data',
        variant: 'error',
      });
      setScanned(false);
      return;
    }

    setIsVerifying(true);

    try {
      const response = await drugAPI.verifyDrug(qrCodeData, 'Ghana'); // You can get actual location if needed
      
      const result: ScanResult = {
        response,
        scannedAt: new Date(),
      };

      setScanResult(result);
      setScanHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 scans
      setShowResult(true);

      // Haptic feedback would go here if available
      if (response.isAuthentic) {
        toast.show({
          description: 'Drug verified successfully!',
          variant: 'success',
        });
      } else {
        toast.show({
          description: 'Verification completed with warnings',
          variant: 'warning',
        });
      }

    } catch (error) {
      console.error('Verification error:', error);
      toast.show({
        description: 'Verification failed. Please try again.',
        variant: 'error',
      });
      setScanned(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = async () => {
    if (!manualQrCode.trim()) {
      toast.show({
        description: 'Please enter a QR code',
        variant: 'warning',
      });
      return;
    }

    setShowManualEntry(false);
    await verifyQrCode(manualQrCode);
    setManualQrCode('');
  };

  const resetScanner = () => {
    setScanned(false);
    setScanResult(null);
    setShowResult(false);
  };

  const toggleFlash = () => {
    setFlashMode(current => current === 'off' ? 'on' : 'off');
  };

  const requestCameraPermission = async () => {
    await requestPermission();
  };

  const getStatusColor = (status: string) => {
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
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'green.500';
    if (score >= 60) return 'yellow.500';
    return 'red.500';
  };

  if (hasPermission === null) {
    return (
      <Box flex={1} bg="gray.50">
        <StatusBar barStyle="light-content" backgroundColor="#4299E1" />
        <Center flex={1}>
          <Spinner size="lg" color="blue.600" />
          <Text mt={4} color="gray.600">Requesting camera permission...</Text>
        </Center>
      </Box>
    );
  }

  if (!hasPermission) {
    return (
      <Box flex={1} bg="gray.50">
        <StatusBar barStyle="light-content" backgroundColor="#4299E1" />
        
        {/* Header */}
        <LinearGradient
          colors={['#4299E1', '#3182CE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Box pt={12} pb={6} px={6}>
            <HStack alignItems="center" justifyContent="center" space={3}>
              <Box bg="rgba(255,255,255,0.2)" p={3} borderRadius="xl">
                <Icon as={Ionicons} name="camera" size="2xl" color="white" />
              </Box>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  DrugGuard
                </Text>
                <Text fontSize="sm" color="white" opacity={0.8}>
                  QR Scanner
                </Text>
              </VStack>
            </HStack>
          </Box>
        </LinearGradient>

        <Center flex={1} px={6}>
          <VStack space={6} alignItems="center">
            <Box bg="red.100" p={6} borderRadius="xl">
              <Icon as={Ionicons} name="camera-off" size="4xl" color="red.500" />
            </Box>
            <VStack space={3} alignItems="center">
              <Text fontSize="xl" fontWeight="bold" color="gray.700" textAlign="center">
                Camera Permission Required
              </Text>
                            <Text fontSize="gray.500" textAlign="center" px={4}>
                  DrugGuard needs camera access to scan QR codes on drug packages and verify their authenticity
                </Text>
            </VStack>
            <Pressable onPress={requestCameraPermission}>
              {({ isPressed }) => (
                <LinearGradient
                  colors={isPressed ? ['#3182CE', '#2C5282'] : ['#4299E1', '#3182CE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 32,
                    paddingVertical: 16,
                    borderRadius: 16,
                    transform: isPressed ? [{ scale: 0.95 }] : [{ scale: 1 }],
                  }}
                >
                  <Text color="white" fontWeight="bold" fontSize="md">
                    Grant Camera Permission
                  </Text>
                </LinearGradient>
              )}
            </Pressable>
            <Pressable onPress={() => setShowManualEntry(true)} mt={4}>
              <Text color="blue.600" fontWeight="medium">
                Enter QR Code Manually Instead
              </Text>
            </Pressable>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="black">
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Result Modal */}
      <Modal isOpen={showResult} onClose={resetScanner} size="full">
        <Modal.Content maxWidth="100%" maxHeight="100%" bg="gray.50">
          <Modal.Header bg="white" borderBottomWidth={0}>
            <HStack justifyContent="space-between" alignItems="center" w="100%">
              <Text fontSize="lg" fontWeight="bold" color="gray.700">
                Verification Result
              </Text>
              <Pressable onPress={resetScanner}>
                <Icon as={Ionicons} name="close" size="lg" color="gray.500" />
              </Pressable>
            </HStack>
          </Modal.Header>
          
          <Modal.Body p={0}>
            {scanResult && (
              <ScrollView>
                {/* Result Header */}
                <LinearGradient
                  colors={scanResult.response.isAuthentic ? ['#48BB78', '#38A169'] : ['#F56565', '#E53E3E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Box p={6}>
                    <VStack space={4} alignItems="center">
                      <Box bg="rgba(255,255,255,0.2)" p={4} borderRadius="full">
                        <Icon 
                          as={Ionicons} 
                          name={scanResult.response.isAuthentic ? "checkmark-circle" : "warning"} 
                          size="4xl" 
                          color="white" 
                        />
                      </Box>
                      <VStack space={2} alignItems="center">
                        <Text fontSize="2xl" fontWeight="bold" color="white">
                          {scanResult.response.isAuthentic ? 'Authentic Drug' : 'Drug Alert'}
                        </Text>
                        <Text fontSize="md" color="white" opacity={0.9} textAlign="center">
                          {scanResult.response.message}
                        </Text>
                      </VStack>
                      
                      {/* Confidence Score */}
                      <VStack space={2} alignItems="center" w="100%">
                        <Text color="white" fontWeight="medium">
                          Confidence: {scanResult.response.confidenceScore}%
                        </Text>
                        <Progress 
                          value={scanResult.response.confidenceScore} 
                          w="200px" 
                          bg="rgba(255,255,255,0.3)"
                          _filledTrack={{ bg: "white" }}
                        />
                      </VStack>
                    </VStack>
                  </Box>
                </LinearGradient>

                {/* Warnings */}
                {scanResult.response.warnings && scanResult.response.warnings.length > 0 && (
                  <Box mx={4} mt={-4} mb={4}>
                    <Box bg="orange.100" p={4} borderRadius="xl" borderWidth={1} borderColor="orange.200">
                      <HStack space={3} alignItems="flex-start">
                        <Icon as={Ionicons} name="warning" color="orange.600" size="lg" mt={0.5} />
                        <VStack space={2} flex={1}>
                          <Text fontWeight="bold" color="orange.800">
                            Warnings
                          </Text>
                          {scanResult.response.warnings.map((warning, index) => (
                            <Text key={index} color="orange.700" fontSize="sm">
                              • {warning}
                            </Text>
                          ))}
                        </VStack>
                      </HStack>
                    </Box>
                  </Box>
                )}

                {/* Drug Details */}
                {scanResult.response.drug && (
                  <VStack space={4} px={4} pb={6}>
                    {/* Basic Information */}
                    <Box bg="white" borderRadius="2xl" p={6} shadow={2}>
                      <HStack space={3} alignItems="center" mb={4}>
                        <Box bg="blue.100" p={3} borderRadius="xl">
                          <Icon as={Ionicons} name="medical" color="blue.600" size="lg" />
                        </Box>
                        <Heading size="md" color="gray.700">
                          Drug Information
                        </Heading>
                      </HStack>
                      
                      <VStack space={3}>
                        <HStack justifyContent="space-between" alignItems="center">
                          <Text fontWeight="600" color="gray.600">Name</Text>
                          <Text fontWeight="500" color="gray.800" flex={1} textAlign="right">
                            {scanResult.response.drug.name}
                          </Text>
                        </HStack>
                        
                        <HStack justifyContent="space-between" alignItems="center">
                          <Text fontWeight="600" color="gray.600">Manufacturer</Text>
                          <Text fontWeight="500" color="gray.800" flex={1} textAlign="right">
                            {scanResult.response.drug.manufacturer}
                          </Text>
                        </HStack>

                        <HStack justifyContent="space-between" alignItems="center">
                          <Text fontWeight="600" color="gray.600">Batch Number</Text>
                          <Text fontWeight="500" color="gray.800" flex={1} textAlign="right">
                            {scanResult.response.drug.batchNumber}
                          </Text>
                        </HStack>

                        {scanResult.response.drug.activeIngredient && (
                          <HStack justifyContent="space-between" alignItems="center">
                            <Text fontWeight="600" color="gray.600">Active Ingredient</Text>
                            <Text fontWeight="500" color="gray.800" flex={1} textAlign="right">
                              {scanResult.response.drug.activeIngredient}
                            </Text>
                          </HStack>
                        )}

                        {scanResult.response.drug.strength && (
                          <HStack justifyContent="space-between" alignItems="center">
                            <Text fontWeight="600" color="gray.600">Strength</Text>
                            <Text fontWeight="500" color="gray.800" flex={1} textAlign="right">
                              {scanResult.response.drug.strength}
                            </Text>
                          </HStack>
                        )}

                        <HStack justifyContent="space-between" alignItems="center">
                          <Text fontWeight="600" color="gray.600">Status</Text>
                          <Badge 
                            colorScheme={getStatusColor(scanResult.response.drug.status).bg[0] === '#48BB78' ? 'green' : 'red'} 
                            variant="solid"
                          >
                            {scanResult.response.drug.status}
                          </Badge>
                        </HStack>

                        <HStack justifyContent="space-between" alignItems="center">
                          <Text fontWeight="600" color="gray.600">Expiry Date</Text>
                          <Text 
                            fontWeight="500" 
                            color={scanResult.response.drug.expired ? 'red.600' : 'gray.800'}
                          >
                            {formatDate(scanResult.response.drug.expiryDate)}
                            {scanResult.response.drug.expired && ' (EXPIRED)'}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>

                    {/* Instructions */}
                    {(scanResult.response.drug.description || 
                      scanResult.response.drug.usageInstructions || 
                      scanResult.response.drug.storageInstructions) && (
                      <Box bg="white" borderRadius="2xl" p={6} shadow={2}>
                        <HStack space={3} alignItems="center" mb={4}>
                          <Box bg="green.100" p={3} borderRadius="xl">
                            <Icon as={Ionicons} name="document-text" color="green.600" size="lg" />
                          </Box>
                          <Heading size="md" color="gray.700">
                            Instructions
                          </Heading>
                        </HStack>
                        
                        <VStack space={4}>
                          {scanResult.response.drug.description && (
                            <VStack space={2}>
                              <Text fontWeight="600" color="gray.600">Description</Text>
                              <Text color="gray.800" lineHeight="lg">
                                {scanResult.response.drug.description}
                              </Text>
                            </VStack>
                          )}
                          
                          {scanResult.response.drug.usageInstructions && (
                            <VStack space={2}>
                              <Text fontWeight="600" color="gray.600">Usage Instructions</Text>
                              <Text color="gray.800" lineHeight="lg">
                                {scanResult.response.drug.usageInstructions}
                              </Text>
                            </VStack>
                          )}
                          
                          {scanResult.response.drug.storageInstructions && (
                            <VStack space={2}>
                              <Text fontWeight="600" color="gray.600">Storage Instructions</Text>
                              <Text color="gray.800" lineHeight="lg">
                                {scanResult.response.drug.storageInstructions}
                              </Text>
                            </VStack>
                          )}
                        </VStack>
                      </Box>
                    )}

                    {/* Verification Info */}
                    <Box bg="white" borderRadius="2xl" p={6} shadow={2}>
                      <HStack space={3} alignItems="center" mb={4}>
                        <Box bg="purple.100" p={3} borderRadius="xl">
                          <Icon as={Ionicons} name="shield-checkmark" color="purple.600" size="lg" />
                        </Box>
                        <Heading size="md" color="gray.700">
                          Verification Details
                        </Heading>
                      </HStack>
                      
                      <VStack space={3}>
                        <HStack justifyContent="space-between" alignItems="center">
                          <Text fontWeight="600" color="gray.600">Verified At</Text>
                          <Text fontWeight="500" color="gray.800">
                            {scanResult.scannedAt.toLocaleString()}
                          </Text>
                        </HStack>
                        
                        <HStack justifyContent="space-between" alignItems="center">
                          <Text fontWeight="600" color="gray.600">Confidence Score</Text>
                          <HStack space={2} alignItems="center">
                            <Text fontWeight="500" color={getConfidenceColor(scanResult.response.confidenceScore)}>
                              {scanResult.response.confidenceScore}%
                            </Text>
                            <Icon 
                              as={Ionicons} 
                              name={scanResult.response.confidenceScore >= 80 ? "checkmark-circle" : 
                                    scanResult.response.confidenceScore >= 60 ? "warning" : "close-circle"} 
                              color={getConfidenceColor(scanResult.response.confidenceScore)} 
                              size="sm" 
                            />
                          </HStack>
                        </HStack>
                      </VStack>
                    </Box>
                  </VStack>
                )}
              </ScrollView>
            )}
          </Modal.Body>
          
          <Modal.Footer bg="white">
            <Button.Group w="100%" justifyContent="space-between">
              <Button variant="outline" flex={1} onPress={resetScanner}>
                Scan Another
              </Button>
              <Button 
                bg="blue.600" 
                flex={1} 
                ml={3} 
                onPress={resetScanner}
                _pressed={{ bg: "blue.700" }}
              >
                Done
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Manual Entry Modal */}
      <Modal isOpen={showManualEntry} onClose={() => setShowManualEntry(false)}>
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Manual QR Code Entry</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Text color="gray.600">
                Enter the QR code data manually if you're unable to scan
              </Text>
              <Input
                placeholder="Paste QR code data here..."
                value={manualQrCode}
                onChangeText={setManualQrCode}
                multiline
                numberOfLines={4}
              />
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button 
                variant="ghost" 
                colorScheme="blueGray" 
                onPress={() => setShowManualEntry(false)}
              >
                Cancel
              </Button>
              <Button 
                bg="blue.600" 
                onPress={handleManualVerify}
                _pressed={{ bg: "blue.700" }}
              >
                Verify
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {!showResult && (
        <>
          {/* QR Code Camera View - Optimized for Drug Package QR Codes */}
          <Box flex={1} position="relative">
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              flash={flashMode}
              onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'], // Only scan QR codes (not other barcodes)
              }}
            />

            {/* Overlay */}
            <Box flex={1} position="absolute" top={0} left={0} right={0} bottom={0}>
              {/* Header */}
              <Box bg="rgba(0,0,0,0.7)" pt={12} pb={4} px={6}>
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack>
                    <Text fontSize="xl" fontWeight="bold" color="white">
                      DrugGuard QR Scanner
                    </Text>
                    <Text fontSize="sm" color="white" opacity={0.8}>
                      Scan drug package QR code
                    </Text>
                  </VStack>
                  
                  <HStack space={3}>
                    <Pressable onPress={toggleFlash}>
                      <Box bg="rgba(255,255,255,0.2)" p={3} borderRadius="xl">
                        <Icon 
                          as={Ionicons} 
                          name={flashMode === 'on' ? "flash" : "flash-off"} 
                          color="white" 
                          size="lg" 
                        />
                      </Box>
                    </Pressable>
                  </HStack>
                </HStack>
              </Box>

              {/* QR Code Scanning Area */}
              <Center flex={1}>
                <Box position="relative" w="280px" h="280px">
                  {/* QR Code Frame Corners */}
                  <Box position="absolute" top={0} left={0} w="50px" h="50px">
                    <Box position="absolute" top={0} left={0} w="30px" h="4px" bg="white" borderRadius="2px" />
                    <Box position="absolute" top={0} left={0} w="4px" h="30px" bg="white" borderRadius="2px" />
                  </Box>
                  <Box position="absolute" top={0} right={0} w="50px" h="50px">
                    <Box position="absolute" top={0} right={0} w="30px" h="4px" bg="white" borderRadius="2px" />
                    <Box position="absolute" top={0} right={0} w="4px" h="30px" bg="white" borderRadius="2px" />
                  </Box>
                  <Box position="absolute" bottom={0} left={0} w="50px" h="50px">
                    <Box position="absolute" bottom={0} left={0} w="30px" h="4px" bg="white" borderRadius="2px" />
                    <Box position="absolute" bottom={0} left={0} w="4px" h="30px" bg="white" borderRadius="2px" />
                  </Box>
                  <Box position="absolute" bottom={0} right={0} w="50px" h="50px">
                    <Box position="absolute" bottom={0} right={0} w="30px" h="4px" bg="white" borderRadius="2px" />
                    <Box position="absolute" bottom={0} right={0} w="4px" h="30px" bg="white" borderRadius="2px" />
                  </Box>

                  {/* QR Code scanning line animation */}
                  {!scanned && !isVerifying && (
                    <Animated.View
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: 2,
                        backgroundColor: '#48BB78',
                        transform: [{
                          translateY: scanAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 276],
                          }),
                        }],
                      }}
                    />
                  )}

                  {/* QR Code detection pulse indicator */}
                  {!scanned && !isVerifying && (
                    <Animated.View
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: 60,
                        height: 60,
                        marginTop: -30,
                        marginLeft: -30,
                        borderRadius: 30,
                        backgroundColor: 'rgba(72, 187, 120, 0.3)',
                        borderWidth: 2,
                        borderColor: '#48BB78',
                        transform: [{ scale: pulseAnimation }],
                      }}
                    />
                  )}
                </Box>

                {/* Status Text */}
                <VStack space={3} alignItems="center" mt={8}>
                  {isVerifying ? (
                    <>
                      <Spinner size="lg" color="white" />
                      <Text color="white" fontSize="lg" fontWeight="medium">
                        Verifying drug QR code authenticity...
                      </Text>
                    </>
                  ) : scanned ? (
                    <Text color="white" fontSize="lg" fontWeight="medium">
                      QR Code scanned successfully, verifying drug...
                    </Text>
                  ) : (
                    <>
                      <Text color="white" fontSize="lg" fontWeight="medium" textAlign="center">
                        Position drug QR code within the frame
                      </Text>
                      <Text color="white" opacity={0.8} fontSize="sm" textAlign="center">
                        Hold steady - QR code will be scanned automatically
                      </Text>
                    </>
                  )}
                </VStack>
              </Center>

              {/* Bottom Controls */}
              <Box bg="rgba(0,0,0,0.7)" pb={8} pt={4} px={6}>
                <HStack justifyContent="space-around" alignItems="center">
                  <Pressable onPress={() => setShowManualEntry(true)}>
                    <VStack space={2} alignItems="center">
                      <Box bg="rgba(255,255,255,0.2)" p={3} borderRadius="xl">
                        <Icon as={Ionicons} name="create" color="white" size="lg" />
                      </Box>
                      <Text color="white" fontSize="xs">Manual Entry</Text>
                    </VStack>
                  </Pressable>

                  <Pressable onPress={resetScanner}>
                    <VStack space={2} alignItems="center">
                      <Box bg="rgba(255,255,255,0.2)" p={4} borderRadius="xl">
                        <Icon as={Ionicons} name="refresh" color="white" size="xl" />
                      </Box>
                      <Text color="white" fontSize="xs">Reset</Text>
                    </VStack>
                  </Pressable>

                  {scanHistory.length > 0 && (
                    <Pressable>
                      <VStack space={2} alignItems="center">
                        <Box bg="rgba(255,255,255,0.2)" p={3} borderRadius="xl" position="relative">
                          <Icon as={Ionicons} name="time" color="white" size="lg" />
                          <Badge 
                            position="absolute" 
                            top={-1} 
                            right={-1} 
                            bg="red.500" 
                            borderRadius="full" 
                            minW="20px" 
                            h="20px"
                            _text={{ fontSize: "xs", color: "white" }}
                          >
                            {scanHistory.length}
                          </Badge>
                        </Box>
                        <Text color="white" fontSize="xs">History</Text>
                      </VStack>
                    </Pressable>
                  )}
                </HStack>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}