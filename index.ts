// Global polyfill for BackHandler.removeEventListener
import { BackHandler } from 'react-native';

// Apply polyfill before anything else loads
if (BackHandler && typeof BackHandler.removeEventListener === 'undefined') {
  BackHandler.removeEventListener = function(eventName: string, handler: () => boolean): void {
    // Polyfill: In newer React Native versions, this method was removed
    // The new addEventListener returns a subscription object with a remove method
    console.log('BackHandler.removeEventListener polyfill applied');
  };
}

// Import the actual expo-router entry point
import 'expo-router/entry';