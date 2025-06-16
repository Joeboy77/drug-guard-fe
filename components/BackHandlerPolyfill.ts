import { BackHandler } from 'react-native';

// Polyfill for the missing removeEventListener function
if (BackHandler && !BackHandler.removeEventListener) {
  BackHandler.removeEventListener = function(eventName: string, handler: () => boolean) {
    // Use the new API if available
    if (BackHandler.remove) {
      const subscription = BackHandler.addEventListener(eventName, handler);
      subscription.remove();
    }
    // Otherwise, do nothing (graceful degradation)
  };
}

export default BackHandler;