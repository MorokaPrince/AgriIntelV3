import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Animal from '@/models/Animal';
import HealthRecord from '@/models/HealthRecord';
import FinancialRecord from '@/models/FinancialRecord';
import FeedRecord from '@/models/FeedRecord';
import BreedingRecord from '@/models/BreedingRecord';
import RFIDRecord from '@/models/RFIDRecord';
import Task from '@/models/Task';
import Notification from '@/models/Notification';
import WeatherData from '@/models/WeatherData';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Use demo-farm tenant for now
    const tenantId = 'demo-farm';

      // Fetch counts for all modules
      const [
        animalCount,
        healthCount,
        financialCount,
        feedCount,
        breedingCount,
        rfidCount,
        taskCount,
        notificationCount,
        weatherCount
      ] = await Promise.all([
        Animal.countDocuments({ tenantId }),
        HealthRecord.countDocuments({ tenantId }),
        FinancialRecord.countDocuments({ tenantId }),
        FeedRecord.countDocuments({ tenantId }),
        BreedingRecord.countDocuments({ tenantId }),
        RFIDRecord.countDocuments({ tenantId }),
        Task.countDocuments({ tenantId }),
        Notification.countDocuments({ tenantId }),
        WeatherData?.countDocuments({ tenantId }) || 0
      ]);

      // Calculate animal statistics
      const animals = await Animal.find({ tenantId }).select('weight health.overallCondition status');
      const avgWeight = animals.length > 0
        ? Math.round(animals.reduce((sum, a) => sum + (a.weight || 0), 0) / animals.length)
        : 0;
      const healthyAnimals = animals.filter(
        a => a.health?.overallCondition === 'excellent' || a.health?.overallCondition === 'good'
      ).length;
      const healthScore = animals.length > 0 ? Math.round((healthyAnimals / animals.length) * 100) : 0;

      // Calculate financial statistics
      const financialRecords = await FinancialRecord.find({ tenantId }).select('recordType amount');
      const totalIncome = financialRecords
        .filter(r => r.recordType === 'income')
        .reduce((sum, r) => sum + (r.amount || 0), 0);
      const totalExpense = financialRecords
        .filter(r => r.recordType === 'expense')
        .reduce((sum, r) => sum + (r.amount || 0), 0);

      // Calculate health statistics
      const activeHealthRecords = await HealthRecord.countDocuments({
        tenantId,
        status: 'active'
      });

    return NextResponse.json({
      success: true,
      data: {
        modules: {
          animals: animalCount,
          health: healthCount,
          financial: financialCount,
          feeding: feedCount,
          breeding: breedingCount,
          rfid: rfidCount,
          tasks: taskCount,
          notifications: notificationCount,
          weather: weatherCount
        },
        statistics: {
          animals: {
            total: animalCount,
            avgWeight,
            healthScore,
            activeCount: animals.filter(a => a.status === 'active').length
          },
          health: {
            total: healthCount,
            activeRecords: activeHealthRecords
          },
          financial: {
            total: financialCount,
            totalIncome,
            totalExpense,
            profit: totalIncome - totalExpense
          },
          tasks: {
            total: taskCount
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

