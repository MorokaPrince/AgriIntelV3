import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import mongoose from 'mongoose';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  tenantId?: string;
}

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.IO server
 */
export function initializeWebSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware for authentication
  io.use((socket: AuthenticatedSocket, next) => {
    const { userId, tenantId } = socket.handshake.auth;

    if (!userId) {
      return next(new Error('Authentication error: userId required'));
    }

    socket.userId = userId;
    socket.tenantId = tenantId || 'demo-farm';

    next();
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[WebSocket] User ${socket.userId} connected`);

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      socket.join(`tenant:${socket.tenantId}`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[WebSocket] User ${socket.userId} disconnected`);
    });

    // Handle custom events
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  return io;
}

/**
 * Get Socket.IO server instance
 */
export function getWebSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Emit notification to specific user
 */
export function emitToUser(
  userId: string,
  event: string,
  data: unknown
): void {
  if (!io) {
    console.warn('[WebSocket] Server not initialized');
    return;
  }

  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit notification to all users in a tenant
 */
export function emitToTenant(
  tenantId: string,
  event: string,
  data: unknown
): void {
  if (!io) {
    console.warn('[WebSocket] Server not initialized');
    return;
  }

  io.to(`tenant:${tenantId}`).emit(event, data);
}

/**
 * Emit health alert
 */
export function emitHealthAlert(
  userId: string,
  alert: {
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    animalId?: string;
  }
): void {
  emitToUser(userId, 'health_alert', {
    type: 'health_alert',
    ...alert,
    timestamp: new Date(),
  });
}

/**
 * Emit task deadline notification
 */
export function emitTaskDeadline(
  userId: string,
  task: {
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    taskId?: string;
  }
): void {
  emitToUser(userId, 'task_deadline', {
    type: 'task_deadline',
    ...task,
    timestamp: new Date(),
  });
}

/**
 * Emit RFID status change
 */
export function emitRFIDStatus(
  userId: string,
  status: {
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    rfidId?: string;
  }
): void {
  emitToUser(userId, 'rfid_status', {
    type: 'rfid_status',
    ...status,
    timestamp: new Date(),
  });
}

/**
 * Broadcast notification to all connected clients
 */
export function broadcastNotification(
  event: string,
  data: unknown
): void {
  if (!io) {
    console.warn('[WebSocket] Server not initialized');
    return;
  }

  io.emit(event, data);
}

