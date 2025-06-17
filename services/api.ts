import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api'; 

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token management
export const authTokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  },
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await authTokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await authTokenManager.removeToken();
      // Could redirect to login here
    }
    return Promise.reject(error);
  }
);

// Types
export interface Drug {
  id: number;
  name: string;
  manufacturer: string;
  batchNumber: string;
  registrationNumber?: string;
  activeIngredient?: string;
  strength?: string;
  dosageForm?: string;
  category?: string;
  manufactureDate?: string;
  expiryDate: string;
  qrCode?: string;
  qrCodeImageUrl?: string;
  status: 'ACTIVE' | 'RECALLED' | 'EXPIRED' | 'SUSPENDED';
  description?: string;
  storageInstructions?: string;
  usageInstructions?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: any;
  updatedBy?: any;
  active: boolean;
  expired: boolean;
}

export interface CreateDrugRequest {
  name: string;
  manufacturer: string;
  batchNumber: string;
  registrationNumber?: string;
  activeIngredient?: string;
  strength?: string;
  dosageForm?: string;
  category?: string;
  manufactureDate?: string;
  expiryDate: string;
  description?: string;
  storageInstructions?: string;
  usageInstructions?: string;
}

export interface DrugVerificationResponse {
  isAuthentic: boolean;
  drug?: Drug;
  message: string;
  confidenceScore: number;
  warnings: string[];
  verifiedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  staffId: string;
  email: string;
  fullName: string;
  department: string;
  position: string;
}

export interface QrCodeResponse {
  qrCodeData: string;
  qrCodeImageUrl: string;
  downloadUrl: string;
  generatedAt: string;
}

// Analytics Types
export interface OverviewStats {
  totalDrugs: number;
  activeDrugs: number;
  totalScans: number;
  totalAdmins: number;
  recentScans: number;
  recentDrugsAdded: number;
  drugsByStatus: Record<string, number>;
  drugsExpiringSoon: number;
  verificationSuccessRate: number;
}

export interface DrugAnalytics {
  categoryDistribution: Record<string, number>;
  topManufacturers: Record<string, number>;
  expiryAnalysis: {
    expired: number;
    expiring30Days: number;
    expiring90Days: number;
  };
  creationTimeline: Array<{
    month: string;
    count: number;
  }>;
}

export interface ScanAnalytics {
  totalScans: number;
  authenticScans: number;
  fraudulentScans: number;
  dailyTrend: Array<{
    date: string;
    scans: number;
    authentic: number;
  }>;
  topScannedDrugs: Array<{
    drugName: string;
    scanCount: number;
  }>;
  hourlyDistribution: Record<number, number>;
}

export interface TimeSeriesData {
  metric: string;
  interval: string;
  data: Array<{
    date: string;
    endDate: string;
    value: number;
  }>;
}

export interface GeographicData {
  regionDistribution: Record<string, number>;
  totalLocations: number;
  topRegion: string;
}

export interface DrugReport {
  id: number;
  drugName: string;
  manufacturer: string;
  batchNumber?: string;
  registrationNumber?: string;
  description: string;
  issueType: string;
  location?: string;
  contactInfo?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface CreateDrugReportRequest {
  drugName: string;
  manufacturer: string;
  batchNumber?: string;
  registrationNumber?: string;
  description: string;
  issueType: string;
  location?: string;
  contactInfo?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Voice Processing Types
export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  language: string;
}

export interface LanguageInfo {
  code: string;
  name: string;
}

export interface VoiceMessageRequest {
  text: string;
  language?: string;
}

export interface VoiceMessageResponse {
  message: string;
}

// API Services
export const authAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/signin', credentials);
    const loginData = response.data;
    
    // Store token
    await authTokenManager.setToken(loginData.token);
    
    return loginData;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/signout');
    } finally {
      await authTokenManager.removeToken();
    }
  },

  async validateToken(): Promise<LoginResponse> {
    const response = await api.get('/auth/validate');
    return response.data;
  },
};

export const drugAPI = {
  // Admin endpoints
  async createDrug(drugData: CreateDrugRequest): Promise<Drug> {
    const response = await api.post('/admin/drugs', drugData);
    return response.data;
  },

  async getAllDrugs(page = 0, size = 20, sortBy = 'name', sortDirection = 'asc'): Promise<any> {
    const response = await api.get('/admin/drugs', {
      params: { page, size, sortBy, sortDirection }
    });
    return response.data;
  },

  async getDrugById(id: number): Promise<Drug> {
    const response = await api.get(`/admin/drugs/${id}`);
    return response.data;
  },

  async updateDrug(id: number, drugData: Partial<CreateDrugRequest>): Promise<Drug> {
    const response = await api.put(`/admin/drugs/${id}`, drugData);
    return response.data;
  },

  async deleteDrug(id: number): Promise<void> {
    await api.delete(`/admin/drugs/${id}`);
  },

  async searchDrugs(searchData: any): Promise<any> {
    const response = await api.post('/admin/drugs/search', searchData);
    return response.data;
  },

  async generateQrCode(drugId: number): Promise<QrCodeResponse> {
    const response = await api.post(`/admin/drugs/${drugId}/qr-code`);
    return response.data;
  },

  async getDrugStatistics(): Promise<any> {
    const response = await api.get('/admin/drugs/statistics');
    return response.data;
  },

  async getScanStatistics(): Promise<any> {
    const response = await api.get('/admin/drugs/scan-statistics');
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get('/admin/drugs/categories');
    return response.data;
  },

  async getManufacturers(): Promise<string[]> {
    const response = await api.get('/admin/drugs/manufacturers');
    return response.data;
  },

  async getDrugsExpiringSoon(days = 30): Promise<Drug[]> {
    const response = await api.get('/admin/drugs/expiring-soon', { params: { days } });
    return response.data;
  },

  // Public endpoints
  async verifyDrug(qrCode: string, location?: string): Promise<DrugVerificationResponse> {
    const response = await api.post('/drugs/verify', { qrCode, location });
    return response.data;
  },

  async searchPublicDrugs(query: string, page = 0, size = 20): Promise<any> {
    const response = await api.get('/drugs/search', {
      params: { query, page, size }
    });
    return response.data;
  },

  // Drug Report endpoints
  async createDrugReport(reportData: CreateDrugReportRequest): Promise<DrugReport> {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  async getRecentReports(): Promise<DrugReport[]> {
    const response = await api.get('/reports/recent');
    return response.data;
  },

  async searchReports(query: string, page = 0, size = 10): Promise<any> {
    const response = await api.get('/reports/search', {
      params: { query, page, size }
    });
    return response.data;
  },

  // Admin drug report endpoints
  async getAllReports(page = 0, size = 20, sortBy = 'createdAt', sortDirection = 'desc'): Promise<any> {
    const response = await api.get('/admin/reports', {
      params: { page, size, sortBy, sortDirection }
    });
    return response.data;
  },

  async getReportById(id: number): Promise<DrugReport> {
    const response = await api.get(`/admin/reports/${id}`);
    return response.data;
  },

  async getReportsByStatus(status: string, page = 0, size = 20): Promise<any> {
    const response = await api.get(`/admin/reports/status/${status}`, {
      params: { page, size }
    });
    return response.data;
  },

  async getReportsBySeverity(severity: string, page = 0, size = 20): Promise<any> {
    const response = await api.get(`/admin/reports/severity/${severity}`, {
      params: { page, size }
    });
    return response.data;
  },

  async getPendingReports(): Promise<DrugReport[]> {
    const response = await api.get('/admin/reports/pending');
    return response.data;
  },

  async updateReportStatus(id: number, status: string, adminNotes?: string): Promise<DrugReport> {
    const response = await api.put(`/admin/reports/${id}/status`, {
      status,
      adminNotes
    });
    return response.data;
  },

  async getReportStatistics(): Promise<any> {
    const response = await api.get('/admin/reports/statistics');
    return response.data;
  },

  async getSeverityStatistics(): Promise<any> {
    const response = await api.get('/admin/reports/statistics/severity');
    return response.data;
  },

  async getStatusStatistics(): Promise<any> {
    const response = await api.get('/admin/reports/statistics/status');
    return response.data;
  },

  async getIssueTypeStatistics(): Promise<any> {
    const response = await api.get('/admin/reports/statistics/issue-types');
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  // Get overview dashboard statistics
  async getOverviewStats(): Promise<OverviewStats> {
    const response = await api.get('/admin/analytics/overview');
    return response.data;
  },

  // Get drug-related analytics
  async getDrugAnalytics(): Promise<DrugAnalytics> {
    const response = await api.get('/admin/analytics/drugs');
    return response.data;
  },

  // Get scan/verification analytics
  async getScanAnalytics(days = 30): Promise<ScanAnalytics> {
    const response = await api.get('/admin/analytics/scans', { params: { days } });
    return response.data;
  },

  // Get time series data for charts
  async getTimeSeriesData(metric: string, startDate: string, endDate: string, interval = 'daily'): Promise<any> {
    const response = await api.get('/admin/analytics/timeseries', {
      params: { metric, startDate, endDate, interval }
    });
    return response.data;
  },

  // Get geographic distribution
  async getGeographicDistribution(days = 30): Promise<any> {
    const response = await api.get('/admin/analytics/geographic', { params: { days } });
    return response.data;
  },

  // Get top performers
  async getTopPerformers(type = 'drugs', limit = 10, days = 30): Promise<any> {
    const response = await api.get('/admin/analytics/top-performers', {
      params: { type, limit, days }
    });
    return response.data;
  },

  // Get expiry tracking analytics
  async getExpiryTracking(): Promise<any> {
    const response = await api.get('/admin/analytics/expiry-tracking');
    return response.data;
  },

  // Get user activity analytics
  async getUserActivity(days = 30): Promise<any> {
    const response = await api.get('/admin/analytics/user-activity', { params: { days } });
    return response.data;
  },

  // Get system health metrics
  async getSystemHealth(): Promise<any> {
    const response = await api.get('/admin/analytics/system-health');
    return response.data;
  },

  // Get fraud detection analytics
  async getFraudDetection(days = 30): Promise<any> {
    const response = await api.get('/admin/analytics/fraud-detection', { params: { days } });
    return response.data;
  },

  // Generate custom report
  async generateCustomReport(reportConfig: any): Promise<any> {
    const response = await api.post('/admin/analytics/reports/generate', reportConfig);
    return response.data;
  },

  // Export analytics data
  async exportAnalyticsData(format: string, dataType: string, startDate?: string, endDate?: string): Promise<any> {
    const params: any = { format, dataType };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/admin/analytics/export', { params });
    return response.data;
  }
};

export const voiceAPI = {
  // Process voice input and convert to text
  async recognizeVoice(audioFile: File, language: string = 'en'): Promise<VoiceRecognitionResult> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);
    
    const response = await api.post('/voice/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Convert text to speech
  async textToSpeech(text: string, language: string = 'en'): Promise<Blob> {
    const response = await api.post('/voice/speak', {
      text,
      language,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Detect language from text
  async detectLanguage(text: string): Promise<{ language: string }> {
    const response = await api.post('/voice/detect-language', { text });
    return response.data;
  },

  // Get available languages
  async getAvailableLanguages(): Promise<LanguageInfo[]> {
    const response = await api.get('/voice/languages');
    return response.data;
  },

  // Get voice message in specified language
  async getVoiceMessage(language: string, messageType: string, args?: string[]): Promise<VoiceMessageResponse> {
    const params = new URLSearchParams({
      language,
      type: messageType,
    });
    
    if (args && args.length > 0) {
      args.forEach(arg => params.append('args', arg));
    }
    
    const response = await api.get(`/voice/message?${params.toString()}`);
    return response.data;
  },

  // Get drug-related phrases for voice recognition
  async getDrugPhrases(language: string): Promise<string[]> {
    const response = await api.get(`/voice/phrases?language=${language}`);
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await api.get('/voice/health');
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  isNetworkError: (error: any) => {
    return !error.response && error.code === 'NETWORK_ERROR';
  },

  getErrorMessage: (error: any) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  isTokenExpired: (error: any) => {
    return error.response?.status === 401;
  },
};

export default api;