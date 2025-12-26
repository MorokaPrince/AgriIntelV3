import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session) => {
      try {
        if (!session || !session.user) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        const tenantId = session.user.tenantId || 'demo-farm';
        const userId = session.user.id;
        const limit = 20;
        const skip = 0;

        const db = mongoose.connection.db;
        if (!db) {
          return NextResponse.json(
            { error: 'Database connection failed' },
            { status: 500 }
          );
        }

        // Get unread count
        const unreadCount = await db.collection('notifications').countDocuments({
          tenantId,
          userId: new mongoose.Types.ObjectId(userId),
          isRead: false,
        });

        // Get notifications
        const notifications = await db
          .collection('notifications')
          .find({
            tenantId,
            userId: new mongoose.Types.ObjectId(userId),
          })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip)
          .toArray();

        return NextResponse.json({
          notifications,
          unreadCount,
          total: await db.collection('notifications').countDocuments({
            tenantId,
            userId: new mongoose.Types.ObjectId(userId),
          }),
        });
      } catch (error) {
        console.error('Notifications fetch error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch notifications' },
          { status: 500 }
        );
      }
    }
  );
}

export async function PATCH(request: NextRequest) {
  return withAuth(
    request,
    async (_request: NextRequest, session) => {
      try {
        if (!session || !session.user) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }

        const body = await request.json();
        const { notificationId, isRead } = body;

        if (!notificationId) {
          return NextResponse.json(
            { error: 'Notification ID is required' },
            { status: 400 }
          );
        }

        const db = mongoose.connection.db;
        if (!db) {
          return NextResponse.json(
            { error: 'Database connection failed' },
            { status: 500 }
          );
        }

        const result = await db.collection('notifications').updateOne(
          { _id: new mongoose.Types.ObjectId(notificationId) },
          {
            $set: {
              isRead: isRead ?? true,
              readAt: isRead ? new Date() : null,
            },
          }
        );

        return NextResponse.json({
          success: result.modifiedCount > 0,
        });
      } catch (error) {
        console.error('Notification update error:', error);
        return NextResponse.json(
          { error: 'Failed to update notification' },
          { status: 500 }
        );
      }
    }
  );
}

