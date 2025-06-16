import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  ScrollView,
  Pressable,
  Badge,
  Button,
  Divider,
  useToast,
  Skeleton,
  Image,
  Modal,
} from 'native-base';
import { router, useLocalSearchParams } from 'expo-router';
import { drugAPI, Drug, QrCodeResponse } from '../../../services/api';

export default function DrugDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [drug, setDrug] = useState<Drug | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<QrCodeResponse | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (id) {
      loadDrug();
    }
  }, [id]);

  const loadDrug = async () => {
    try {
      const drugData = await drugAPI.getDrugById(Number(id));
      setDrug(drugData);
    } catch (error) {
      console.error('Error loading drug:', error);
      toast.show({
        description: 'Failed to load drug details',
        status: 'error',
        placement: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!drug) return;
    
    try {
      const qrResponse = await drugAPI.generateQrCode(drug.id);
      setGeneratedQR(qrResponse);
      setShowQRModal(true);
      toast.show({
        description: 'QR code generated successfully!',
        status: 'success',
        placement: 'top',
      });
    } catch (error) {
      toast.show({
        description: 'Failed to generate QR code',
        status: 'error',
        placement: 'top',
      });
    }
  };

  if (isLoading) {
    return (
      <Box flex={1} bg="gray.50" p={6}>
        <Skeleton.Text lines={10} />
      </Box>
    );
  }

  if (!drug) {
    return (
      <Box flex={1} bg="gray.50" justifyContent="center" alignItems="center">
        <Text>Drug not found</Text>
      </Box>
    );
  }

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
                Drug Details
              </Text>
              <Text fontSize="sm" color="gray.500">
                ID: {drug.id}
              </Text>
            </VStack>
          </HStack>
          
          <Button size="sm" onPress={handleGenerateQR}>
            Generate QR
          </Button>
        </HStack>
      </Box>

      <ScrollView flex={1} p={6}>
        <VStack space={6}>
          {/* Basic Info */}
          <Box bg="white" rounded="xl" p={5} shadow={2}>
            <VStack space={4}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {drug.name}
                </Text>
                <Badge colorScheme="success" variant="solid" rounded="full">
                  {drug.status}
                </Badge>
              </HStack>
              
              <VStack space={3}>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.500">Manufacturer:</Text>
                  <Text fontSize="sm" fontWeight="600">{drug.manufacturer}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.500">Batch Number:</Text>
                  <Text fontSize="sm" fontWeight="600">{drug.batchNumber}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.500">Registration Number:</Text>
                  <Text fontSize="sm" fontWeight="600">
                    {drug.registrationNumber || 'Not assigned'}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.500">Expiry Date:</Text>
                  <Text fontSize="sm" fontWeight="600">
                    {new Date(drug.expiryDate).toLocaleDateString()}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Drug Details */}
          <Box bg="white" rounded="xl" p={5} shadow={2}>
            <VStack space={4}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                Drug Information
              </Text>
              
              <VStack space={3}>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.500">Active Ingredient:</Text>
                  <Text fontSize="sm" fontWeight="600">{drug.activeIngredient}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.500">Strength:</Text>
                  <Text fontSize="sm" fontWeight="600">{drug.strength}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.500">Dosage Form:</Text>
                  <Text fontSize="sm" fontWeight="600">{drug.dosageForm}</Text>
                </HStack>
                <HStack justifyContent="space-between">
                  <Text fontSize="sm" color="gray.500">Category:</Text>
                  <Text fontSize="sm" fontWeight="600">{drug.category}</Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Description */}
          {drug.description && (
            <Box bg="white" rounded="xl" p={5} shadow={2}>
              <VStack space={3}>
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  Description
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {drug.description}
                </Text>
              </VStack>
            </Box>
          )}

          {/* QR Code Status */}
          <Box bg="white" rounded="xl" p={5} shadow={2}>
            <VStack space={4}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                QR Code Status
              </Text>
              
              <HStack justifyContent="space-between" alignItems="center">
                <VStack>
                  <Text fontSize="sm" color="gray.500">Status:</Text>
                  <Badge
                    colorScheme={drug.qrCode ? 'success' : 'warning'}
                    variant="subtle"
                  >
                    {drug.qrCode ? 'Generated' : 'Not Generated'}
                  </Badge>
                </VStack>
                
                <Button onPress={handleGenerateQR}>
                  {drug.qrCode ? 'Regenerate QR' : 'Generate QR'}
                </Button>
              </HStack>
            </VStack>
          </Box>

          <Button.Group space={2}>
            <Button variant="outline" onPress={() => router.push(`/admin/drugs/${drug.id}/edit`)}>
              Edit Drug
            </Button>
            <Button onPress={handleGenerateQR}>
              Generate QR Code
            </Button>
          </Button.Group>
        </VStack>
      </ScrollView>

      {/* QR Code Modal */}
      <Modal isOpen={showQRModal} onClose={() => setShowQRModal(false)} size="lg">
        <Modal.Content>
          <Modal.Header>QR Code Generated</Modal.Header>
          <Modal.Body>
            <VStack space={4} alignItems="center">
              {generatedQR?.qrCodeImageUrl && (
                <Image
                  source={{ uri: generatedQR.qrCodeImageUrl }}
                  alt="QR Code"
                  size="200"
                  resizeMode="contain"
                />
              )}
              <Text textAlign="center" color="gray.600">
                QR code for {drug.name}
              </Text>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button onPress={() => setShowQRModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
}