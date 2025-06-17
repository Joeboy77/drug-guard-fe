import * as Speech from 'expo-speech';
import * as Audio from 'expo-av';
import { Platform } from 'react-native';

export type Language = 'en' | 'twi' | 'ga' | 'ewe';

export interface VoiceSettings {
  language: Language;
  rate: number;
  pitch: number;
  volume: number;
}

export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  language: Language;
}

// Language configuration for speech synthesis
const LANGUAGE_CONFIG = {
  en: {
    code: 'en-GH',
    name: 'English (Ghana)',
    voice: 'en-GH-Standard-A',
    rate: 0.9,
    pitch: 1.0,
  },
  twi: {
    code: 'ak-GH',
    name: 'Twi (Akan)',
    voice: 'en-GH-Standard-A', // Fallback to English for now
    rate: 0.8,
    pitch: 1.0,
  },
  ga: {
    code: 'gaa-GH',
    name: 'Ga',
    voice: 'en-GH-Standard-A', // Fallback to English for now
    rate: 0.8,
    pitch: 1.0,
  },
  ewe: {
    code: 'ee-GH',
    name: 'Ewe',
    voice: 'en-GH-Standard-A', // Fallback to English for now
    rate: 0.8,
    pitch: 1.0,
  },
};

// Common drug names in different languages for better recognition
const DRUG_KEYWORDS = {
  en: [
    'paracetamol', 'acetaminophen', 'ibuprofen', 'aspirin', 'amoxicillin',
    'penicillin', 'vitamin', 'antibiotic', 'painkiller', 'fever', 'headache',
    'medicine', 'drug', 'medication', 'pill', 'tablet', 'syrup', 'injection'
  ],
  twi: [
    'aduru', 'paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin',
    'penicillin', 'vitamin', 'antibiotic', 'yare', 'tiri', 'aduru'
  ],
  ga: [
    'aduru', 'paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin',
    'penicillin', 'vitamin', 'antibiotic', 'yare', 'tiri', 'aduru'
  ],
  ewe: [
    'atike', 'paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin',
    'penicillin', 'vitamin', 'antibiotic', 'yare', 'tiri', 'atike'
  ],
};

class VoiceService {
  private isListening = false;
  private recognition: any = null;
  private currentLanguage: Language = 'en';
  private settings: VoiceSettings = {
    language: 'en',
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
  };

  constructor() {
    this.initializeSpeech();
  }

  private async initializeSpeech() {
    try {
      // For text-to-speech, we don't need microphone permissions initially
      // Permissions will be requested when voice recording is actually used
      console.log('Voice service initialized');
    } catch (error) {
      console.error('Error initializing speech:', error);
    }
  }

  // Set language for voice recognition and synthesis
  setLanguage(language: Language) {
    this.currentLanguage = language;
    this.settings.language = language;
    
    const config = LANGUAGE_CONFIG[language];
    if (config) {
      this.settings.rate = config.rate;
      this.settings.pitch = config.pitch;
    }
  }

  // Get current language
  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  // Get available languages
  getAvailableLanguages() {
    return Object.entries(LANGUAGE_CONFIG).map(([code, config]) => ({
      code: code as Language,
      name: config.name,
    }));
  }

  // Detect language from text (simple keyword-based detection)
  detectLanguage(text: string): Language {
    const lowerText = text.toLowerCase();
    
    for (const [lang, keywords] of Object.entries(DRUG_KEYWORDS)) {
      const matchCount = keywords.filter(keyword => 
        lowerText.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        return lang as Language;
      }
    }
    
    // Default to English if no specific language detected
    return 'en';
  }

  // Speak text using text-to-speech
  async speak(text: string, language?: Language): Promise<void> {
    try {
      const targetLanguage = language || this.currentLanguage;
      const config = LANGUAGE_CONFIG[targetLanguage];
      
      const options = {
        language: config.code,
        pitch: this.settings.pitch,
        rate: this.settings.rate,
        volume: this.settings.volume,
        voice: config.voice,
      };

      await Speech.speak(text, options);
    } catch (error) {
      console.error('Error speaking text:', error);
      // Fallback to default English
      await Speech.speak(text, {
        language: 'en-GH',
        pitch: 1.0,
        rate: 0.9,
        volume: 1.0,
      });
    }
  }

  // Stop speaking
  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  // Check if currently speaking
  async isSpeaking(): Promise<boolean> {
    return await Speech.isSpeakingAsync();
  }

  // Get drug-related phrases for voice recognition
  getDrugPhrases(language: Language): string[] {
    const phrases = {
      en: [
        'Search for paracetamol',
        'Find ibuprofen',
        'Look up aspirin',
        'What is amoxicillin',
        'Drug information for',
        'Medicine details',
        'Side effects of',
        'Dosage for',
      ],
      twi: [
        'Hwehwɛ paracetamol',
        'Hwehwɛ ibuprofen',
        'Hwehwɛ aspirin',
        'Sɛn ne amoxicillin',
        'Aduru ho asɛm',
        'Aduru ho asɛm',
        'Aduru ho asɛm',
        'Aduru ho asɛm',
      ],
      ga: [
        'Hwehwɛ paracetamol',
        'Hwehwɛ ibuprofen',
        'Hwehwɛ aspirin',
        'Sɛn ne amoxicillin',
        'Aduru ho asɛm',
        'Aduru ho asɛm',
        'Aduru ho asɛm',
        'Aduru ho asɛm',
      ],
      ewe: [
        'Dzɔ paracetamol',
        'Dzɔ ibuprofen',
        'Dzɔ aspirin',
        'Nye ne amoxicillin',
        'Atike kple asɛm',
        'Atike kple asɛm',
        'Atike kple asɛm',
        'Atike kple asɛm',
      ],
    };
    
    return phrases[language] || phrases.en;
  }

  // Get welcome message in different languages
  getWelcomeMessage(language: Language): string {
    const messages = {
      en: 'Welcome to DrugGuard voice search. Say the name of a medication to search.',
      twi: 'Akwaaba wɔ DrugGuard voice search. Ka aduru din a wo pɛ sɛ wo hwehwɛ.',
      ga: 'Akwaaba wɔ DrugGuard voice search. Ka aduru din a wo pɛ sɛ wo hwehwɛ.',
      ewe: 'Woezɔ wɔ DrugGuard voice search. Gblɔ atike din a wo pɛ sɛ wo dzɔ.',
    };
    
    return messages[language] || messages.en;
  }

  // Get listening prompt in different languages
  getListeningPrompt(language: Language): string {
    const prompts = {
      en: 'Listening... Say the medication name now.',
      twi: 'Tie... Ka aduru din afei.',
      ga: 'Tie... Ka aduru din afei.',
      ewe: 'Tie... Gblɔ atike din afei.',
    };
    
    return prompts[language] || prompts.en;
  }

  // Get error message in different languages
  getErrorMessage(language: Language): string {
    const messages = {
      en: 'Sorry, I didn\'t understand. Please try again.',
      twi: 'Kafra, me nte wo asɛm. Fa wo mbisa bio.',
      ga: 'Kafra, me nte wo asɛm. Fa wo mbisa bio.',
      ewe: 'Kafra, nye mele wo nya. Fa wo mbisa bio.',
    };
    
    return messages[language] || messages.en;
  }

  // Get success message in different languages
  getSuccessMessage(language: Language, drugName: string): string {
    const messages = {
      en: `Found ${drugName}. Here are the details.`,
      twi: `Wohu ${drugName}. Hena ne details.`,
      ga: `Wohu ${drugName}. Hena ne details.`,
      ewe: `Wodzɔ ${drugName}. Hena ne details.`,
    };
    
    return messages[language] || messages.en;
  }

  // Get no results message in different languages
  getNoResultsMessage(language: Language): string {
    const messages = {
      en: 'No medications found. Please try a different search term.',
      twi: 'Wanhu aduru biara. Fa wo mbisa bio.',
      ga: 'Wanhu aduru biara. Fa wo mbisa bio.',
      ewe: 'Wanhu atike aɖeke. Fa wo mbisa bio.',
    };
    
    return messages[language] || messages.en;
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
export default voiceService; 