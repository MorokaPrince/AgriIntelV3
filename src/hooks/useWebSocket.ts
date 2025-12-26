'use client';

import { useEffect, useCallback } from 'react';
import { websocketService, NotificationEvent } from '@/services/websocketService';
import { useNotificationStore } from '@/stores/notification-store';
import { useAuthStore } from '@/stores/auth-store';

export function useWebSocket() {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  /**
   * Initialize WebSocket connection on mount
   */
  useEffect(() => {
    if (!user?._id) return;

    const initializeWebSocket = async () => {
      try {
        await websocketService.connect(user._id);
        console.log('[useWebSocket] Connected successfully');
      } catch (error) {
        console.error('[useWebSocket] Failed to connect:', error);
      }
    };

    initializeWebSocket();

    return () => {
      websocketService.disconnect();
    };
  }, [user?._id]);

  /**
   * Handle incoming notifications
   */
  useEffect(() => {
    if (!websocketService.getIsConnected()) return;

    const handleNotification = (notification: NotificationEvent) => {
      addNotification({
        title: notification.title,
        message: notification.message,
        type: notification.priority === 'critical' ? 'error' : 
              notification.priority === 'high' ? 'warning' : 'success',
        autoClose: true,
        autoCloseDelay: notification.priority === 'critical' ? 10000 : 5000,
      });
    };

    websocketService.onNotification(handleNotification);
    websocketService.onHealthAlert(handleNotification);
    websocketService.onTaskDeadline(handleNotification);
    websocketService.onRFIDStatus(handleNotification);
  }, [addNotification]);

  /**
   * Emit event to server
   */
  const emit = useCallback((event: string, data: unknown) => {
    websocketService.emit(event, data);
  }, []);

  /**
   * Get connection status
   */
  const isConnected = websocketService.getIsConnected();

  return {
    isConnected,
    emit,
  };
}

