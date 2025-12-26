import { io, Socket } from 'socket.io-client';

export interface NotificationEvent {
  type: 'health_alert' | 'task_deadline' | 'rfid_status' | 'breeding_cycle' | 'feed_inventory';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedEntityId?: string;
  timestamp: Date;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  /**
   * Initialize WebSocket connection
   */
  connect(userId: string, tenantId: string = 'demo-farm'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';
        
        this.socket = io(socketUrl, {
          auth: {
            userId,
            tenantId,
          },
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: 10000,
          reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.socket.on('connect', () => {
          console.log('[WebSocket] Connected to server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('[WebSocket] Disconnected from server');
          this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
          console.error('[WebSocket] Connection error:', error);
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(error);
          }
        });

        this.socket.on('error', (error) => {
          console.error('[WebSocket] Error:', error);
        });
      } catch (error) {
        console.error('[WebSocket] Failed to initialize:', error);
        reject(error);
      }
    });
  }

  /**
   * Subscribe to notification events
   */
  onNotification(callback: (notification: NotificationEvent) => void): void {
    if (!this.socket) {
      console.warn('[WebSocket] Socket not initialized');
      return;
    }

    this.socket.on('notification', (data: NotificationEvent) => {
      console.log('[WebSocket] Received notification:', data);
      callback(data);
    });
  }

  /**
   * Subscribe to health alerts
   */
  onHealthAlert(callback: (alert: NotificationEvent) => void): void {
    if (!this.socket) {
      console.warn('[WebSocket] Socket not initialized');
      return;
    }

    this.socket.on('health_alert', (data: NotificationEvent) => {
      console.log('[WebSocket] Health alert received:', data);
      callback(data);
    });
  }

  /**
   * Subscribe to task deadline notifications
   */
  onTaskDeadline(callback: (task: NotificationEvent) => void): void {
    if (!this.socket) {
      console.warn('[WebSocket] Socket not initialized');
      return;
    }

    this.socket.on('task_deadline', (data: NotificationEvent) => {
      console.log('[WebSocket] Task deadline received:', data);
      callback(data);
    });
  }

  /**
   * Subscribe to RFID status changes
   */
  onRFIDStatus(callback: (status: NotificationEvent) => void): void {
    if (!this.socket) {
      console.warn('[WebSocket] Socket not initialized');
      return;
    }

    this.socket.on('rfid_status', (data: NotificationEvent) => {
      console.log('[WebSocket] RFID status received:', data);
      callback(data);
    });
  }

  /**
   * Emit a custom event
   */
  emit(event: string, data: unknown): void {
    if (!this.socket) {
      console.warn('[WebSocket] Socket not initialized');
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      console.log('[WebSocket] Disconnected');
    }
  }

  /**
   * Check if connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const websocketService = new WebSocketService();

