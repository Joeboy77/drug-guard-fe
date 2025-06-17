# DrugGuard Ghana Frontend

A modern React Native mobile application for DrugGuard Ghana, providing drug verification, search, and management capabilities for both citizens and FDA administrators.

## 🏥 Overview

DrugGuard Ghana Frontend is a comprehensive mobile application that enables:
- **Drug Verification**: QR code scanning and authenticity verification
- **Drug Search**: Advanced search with voice recognition
- **Drug Reporting**: Citizen report submission for suspicious drugs
- **Admin Dashboard**: Complete drug management for FDA administrators
- **Analytics**: Real-time insights and reporting
- **Voice Features**: Multi-language voice recognition and text-to-speech

## 🚀 Features

### Core Features
- ✅ **Drug Verification** - QR code scanning and authenticity checks
- ✅ **Drug Search** - Advanced search with voice recognition
- ✅ **Drug Reporting** - Citizen report submission and tracking
- ✅ **Admin Dashboard** - Complete drug management interface
- ✅ **Analytics Dashboard** - Real-time insights and reporting
- ✅ **Voice Processing** - Multi-language voice recognition and TTS
- ✅ **Multi-language Support** - English, Twi, Ga, Ewe
- ✅ **Offline Capabilities** - Basic functionality without internet

### User Experience Features
- 🎨 **Modern UI/UX** - Beautiful, intuitive interface
- 📱 **Responsive Design** - Optimized for all screen sizes
- 🌙 **Dark/Light Mode** - User preference support
- 🔔 **Push Notifications** - Real-time alerts and reminders
- 📊 **Real-time Updates** - Live data synchronization
- 🎯 **Accessibility** - Screen reader and voice navigation support

### Technical Features
- 🔐 **Secure Authentication** - JWT-based admin login
- 📡 **API Integration** - RESTful API communication
- 🗂️ **Local Storage** - Offline data persistence
- 🔄 **State Management** - Efficient data flow
- 📱 **Cross-platform** - iOS and Android support
- 🚀 **Performance Optimized** - Fast loading and smooth interactions

## 🛠️ Technology Stack

- **Framework**: React Native 0.79.3
- **Language**: TypeScript 5.8.3
- **Navigation**: Expo Router 5.1.0
- **UI Library**: NativeBase 3.4.28
- **State Management**: React Hooks + Context
- **HTTP Client**: Axios 1.7.2
- **Storage**: AsyncStorage 1.23.1
- **Icons**: Expo Vector Icons 14.1.0
- **Build Tool**: Expo CLI
- **Development**: Expo SDK 53

### Key Dependencies
- `expo-speech` - Text-to-speech functionality
- `expo-av` - Audio/video capabilities
- `expo-barcode-scanner` - QR code scanning
- `expo-camera` - Camera functionality
- `expo-linear-gradient` - Gradient effects
- `expo-linking` - Deep linking support

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd drugguard-frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
# API Configuration
API_BASE_URL=http://localhost:8080/api

# App Configuration
APP_NAME=DrugGuard Ghana
APP_VERSION=1.0.0

# Feature Flags
ENABLE_VOICE_FEATURES=true
ENABLE_ANALYTICS=true
ENABLE_PUSH_NOTIFICATIONS=true
```

### 4. Start Development Server
```bash
# Start Expo development server
npm start
# or
expo start

# Run on iOS
npm run ios
# or
expo start --ios

# Run on Android
npm run android
# or
expo start --android

# Run on Web
npm run web
# or
expo start --web
```

### 5. Build for Production
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Build for Web
expo build:web
```

## 📱 App Structure

### Navigation Structure
```
app/
├── _layout.tsx                 # Root layout
├── index.tsx                   # Home screen
├── onboarding/
│   ├── _layout.tsx
│   └── index.tsx              # Onboarding flow
├── user-selection.tsx          # User type selection
├── auth/
│   ├── _layout.tsx
│   └── admin-login.tsx        # Admin authentication
├── (tabs)/
│   ├── _layout.tsx            # Tab navigation
│   ├── index.tsx              # Home/Dashboard
│   ├── search.tsx             # Drug search
│   ├── scan.tsx               # QR code scanning
│   └── profile.tsx            # Drug reporting
└── admin/
    ├── _layout.tsx            # Admin layout
    ├── dashboard.tsx          # Admin dashboard
    ├── analytics.tsx          # Analytics
    ├── drugs/
    │   ├── _layout.tsx
    │   ├── index.tsx          # Drug list
    │   ├── create.tsx         # Create drug
    │   └── [id].tsx           # Drug details
    └── settings.tsx           # Admin settings
```

### Component Structure
```
components/
├── VoiceInput.tsx             # Voice recognition component
├── FloatingAiAssistant.tsx    # AI health assistant
├── SafeAreaWrapper.tsx        # Safe area handling
├── ErrorBoundary.tsx          # Error handling
└── BackHandlerPolyfill.ts     # Back button handling

services/
├── api.ts                     # API service layer
└── voiceService.ts            # Voice processing service

constants/
└── Colors.ts                  # Color definitions

context/
└── (context providers)        # React context providers
```

## 🎨 UI/UX Design

### Design System
- **Colors**: Consistent color palette with accessibility support
- **Typography**: Clear, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing system (4px base unit)
- **Components**: Reusable, accessible components
- **Animations**: Smooth, purposeful animations

### Key Design Principles
- **Accessibility First**: Screen reader support, voice navigation
- **Mobile-First**: Optimized for mobile interactions
- **Consistency**: Uniform design patterns throughout
- **Performance**: Fast loading and smooth interactions
- **Inclusivity**: Multi-language support and cultural considerations

## 🔧 Configuration

### App Configuration
```typescript
// app.json
{
  "expo": {
    "name": "DrugGuard Ghana",
    "slug": "drugguard-ghana",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#4299E1"
    },
    "platforms": ["ios", "android", "web"],
    "plugins": [
      "expo-router",
      "expo-barcode-scanner",
      "expo-camera"
    ]
  }
}
```

### API Configuration
```typescript
// services/api.ts
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 📚 Usage Guide

### For Citizens

#### Drug Search
1. Open the app and select "Citizen"
2. Navigate to the Search tab
3. Use text search or voice search
4. View drug details and authenticity status

#### Drug Verification
1. Go to the Scan tab
2. Scan QR code on medication
3. View verification results
4. Report suspicious drugs if needed

#### Report Suspicious Drugs
1. Navigate to the Report tab
2. Fill out the report form
3. Submit with details and photos
4. Track report status

### For FDA Administrators

#### Login
1. Select "FDA Administrator"
2. Enter credentials
3. Access admin dashboard

#### Drug Management
1. View all drugs in the database
2. Add new drugs with QR codes
3. Update drug information
4. Monitor drug status

#### Analytics
1. View real-time analytics
2. Monitor drug verification rates
3. Track citizen reports
4. Generate reports

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run specific test
npm test -- --testNamePattern="VoiceInput"

# Run with coverage
npm test -- --coverage
```

### Testing Strategy
- **Unit Tests**: Component and service testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user flow testing
- **Accessibility Tests**: Screen reader and voice navigation

## 🚀 Deployment

### Expo Build
```bash
# Build for iOS
expo build:ios --type archive

# Build for Android
expo build:android --type apk

# Build for Android App Bundle
expo build:android --type app-bundle
```

### App Store Deployment
1. **iOS App Store**:
   - Build with Expo
   - Upload to App Store Connect
   - Submit for review

2. **Google Play Store**:
   - Build APK/AAB
   - Upload to Google Play Console
   - Submit for review

### Web Deployment
```bash
# Build for web
expo build:web

# Deploy to hosting service
npm run deploy
```

## 🔒 Security

### Authentication
- JWT token management
- Secure token storage
- Automatic token refresh
- Session management

### Data Protection
- Encrypted local storage
- Secure API communication
- Input validation
- XSS protection

### Privacy
- Minimal data collection
- User consent management
- Data anonymization
- GDPR compliance

## 📊 Performance

### Optimization Techniques
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed images and lazy loading
- **Caching**: API response caching
- **Bundle Optimization**: Tree shaking and minification

### Monitoring
- **Performance Metrics**: Load times, frame rates
- **Error Tracking**: Crash reporting and analytics
- **User Analytics**: Usage patterns and engagement
- **API Monitoring**: Response times and errors

## 🌍 Internationalization

### Supported Languages
- **English** (Primary)
- **Twi** (Akan)
- **Ga**
- **Ewe**

### Localization Features
- **Voice Recognition**: Multi-language voice input
- **Text-to-Speech**: Localized voice output
- **UI Translation**: Complete interface translation
- **Cultural Adaptation**: Local customs and preferences

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies
4. Make changes
5. Run tests
6. Submit pull request

### Code Style
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Conventional Commits**: Standard commit messages

### Testing Requirements
- Unit tests for new components
- Integration tests for API calls
- Accessibility testing
- Performance testing

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- 📖 [User Guide](docs/user-guide.md)
- 🔧 [Developer Guide](docs/developer-guide.md)
- 🎨 [Design System](docs/design-system.md)
- 🧪 [Testing Guide](docs/testing-guide.md)

### Contact
- 📧 Email: support@drugguard-ghana.com
- 📱 Phone: +233 XX XXX XXXX
- 🌐 Website: https://drugguard-ghana.com
- 💬 Discord: [DrugGuard Community](https://discord.gg/drugguard)

## 🙏 Acknowledgments

- FDA Ghana for regulatory guidance
- React Native and Expo communities
- All contributors and stakeholders
- Ghanaian healthcare professionals

## 📈 Roadmap

### Version 1.1
- [ ] Drug interaction checker
- [ ] Medication reminder system
- [ ] Offline mode improvements
- [ ] Enhanced analytics

### Version 1.2
- [ ] Telemedicine integration
- [ ] Pharmacy locator
- [ ] Price comparison
- [ ] Community features

### Version 2.0
- [ ] AI-powered drug recognition
- [ ] Blockchain integration
- [ ] Advanced analytics
- [ ] Multi-country support

---

**DrugGuard Ghana Frontend** - Empowering drug safety and verification in Ghana 🇬🇭 