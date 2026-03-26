// ============================================
// Custom hook for handling notifications
// ============================================

import { useCallback } from 'react';
import { Settings } from '../types';
import { playNotificationSound } from '../utils/audio';

/**
 * Custom hook to handle notifications, sounds, and vibration
 */
export function useNotification(settings: Settings) {

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  /**
   * Play notification sound using Web Audio API
   */
  const playSound = useCallback(() => {
    if (!settings.soundEnabled) return;
    playNotificationSound();
  }, [settings.soundEnabled]);

  /**
   * Trigger vibration
   */
  const vibrate = useCallback(() => {
    if (!settings.vibrationEnabled) return;

    if ('vibrate' in navigator) {
      // Vibration pattern: vibrate 200ms, pause 100ms, vibrate 200ms
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  }, [settings.vibrationEnabled]);

  /**
   * Show a notification with sound and vibration
   */
  const notify = useCallback(async (title: string, body: string, icon?: string) => {
    // Play sound and vibrate first
    playSound();
    vibrate();

    // Check if we have permission for notifications
    const hasPermission = await requestPermission();
    
    if (hasPermission) {
      try {
        const notificationOptions: NotificationOptions & { renotify?: boolean } = {
          body,
          icon: icon || '👶',
          tag: 'baby-care-reminder',
          requireInteraction: true,
        };
        const notification = new Notification(title, notificationOptions);

        // Auto-close notification after 10 seconds
        setTimeout(() => {
          notification.close();
        }, 10000);

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.warn('Could not show notification:', error);
      }
    }
  }, [playSound, vibrate, requestPermission]);

  return {
    notify,
    requestPermission,
    playSound,
    vibrate,
  };
}
