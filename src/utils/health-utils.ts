'use server';

import { IHealthRecord } from '@/models/HealthRecord';
import { IAnimal } from '@/models/Animal';

/**
 * Process health records to create chart data for HealthTrendsChart
 * @param healthRecords Array of health records from MongoDB
 * @returns Chart data in the format expected by HealthTrendsChart
 */
export function processHealthTrendsData(healthRecords: IHealthRecord[]): {
  data: Record<string, number[]>;
  labels: string[];
  title: string;
} {
  if (!healthRecords || healthRecords.length === 0) {
    return {
      data: {
        'Excellent': [0, 0, 0, 0, 0, 0, 0],
        'Good': [0, 0, 0, 0, 0, 0, 0],
        'Fair': [0, 0, 0, 0, 0, 0, 0],
        'Poor': [0, 0, 0, 0, 0, 0, 0],
      },
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
      title: 'Health Status Trends'
    };
  }

  // Group records by week
  const weeklyData: Record<string, { excellent: number; good: number; fair: number; poor: number }> = {};

  // Get the most recent 7 weeks
  const now = new Date();
  const weeks = Array.from({ length: 7 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (now.getDay() + (6 - i) * 7));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  });

  // Initialize weekly data
  weeks.forEach((weekStart, index) => {
    const weekKey = `Week ${index + 1}`;
    weeklyData[weekKey] = { excellent: 0, good: 0, fair: 0, poor: 0 };
  });

  // Process each health record
  healthRecords.forEach(record => {
    const recordDate = new Date(record.date);
    const weekDiff = Math.floor((now.getTime() - recordDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

    if (weekDiff >= 0 && weekDiff < 7) {
      const weekKey = `Week ${7 - weekDiff}`;
      const severity = record.severity || 'low';

      // Map severity to health categories
      if (severity === 'low') {
        weeklyData[weekKey].excellent += 1;
      } else if (severity === 'medium') {
        weeklyData[weekKey].good += 1;
      } else if (severity === 'high') {
        weeklyData[weekKey].fair += 1;
      } else if (severity === 'critical') {
        weeklyData[weekKey].poor += 1;
      }
    }
  });

  // Convert to chart format
  const chartData: Record<string, number[]> = {
    'Excellent': [],
    'Good': [],
    'Fair': [],
    'Poor': []
  };

  const labels: string[] = [];

  weeks.forEach((weekStart, index) => {
    const weekKey = `Week ${index + 1}`;
    labels.push(weekKey);

    // Calculate percentages
    const week = weeklyData[weekKey];
    const total = week.excellent + week.good + week.fair + week.poor;

    chartData['Excellent'].push(total > 0 ? Math.round((week.excellent / total) * 100) : 0);
    chartData['Good'].push(total > 0 ? Math.round((week.good / total) * 100) : 0);
    chartData['Fair'].push(total > 0 ? Math.round((week.fair / total) * 100) : 0);
    chartData['Poor'].push(total > 0 ? Math.round((week.poor / total) * 100) : 0);
  });

  return {
    data: chartData,
    labels,
    title: 'Health Status Trends'
  };
}

/**
 * Get health statistics from health records
 * @param healthRecords Array of health records
 * @param animals Array of animals for health score calculation
 * @returns Health statistics for dashboard cards
 */
export function getHealthStatistics(healthRecords: IHealthRecord[], animals: IAnimal[]) {
  const totalRecords = healthRecords.length;
  const activeRecords = healthRecords.filter(r => r.status === 'active').length;

  // Calculate health score based on severity
  const severityScores: Record<string, number> = {
    'low': 100,
    'medium': 75,
    'high': 50,
    'critical': 25
  };

  const healthyAnimals = animals.filter(a => {
    const animalHealthRecords = healthRecords.filter(r => r.animalId.toString() === a._id?.toString());
    if (animalHealthRecords.length === 0) return true; // No records means healthy

    // Get most recent record
    const recentRecord = animalHealthRecords.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    return recentRecord && severityScores[recentRecord.severity] >= 75;
  }).length;

  const healthScore = animals.length > 0 ? Math.round((healthyAnimals / animals.length) * 100) : 0;

  return [
    {
      title: 'Total Records',
      value: totalRecords.toString(),
      change: '+18%',
      trend: 'up',
      icon: 'ClipboardDocumentListIcon',
      color: 'blue'
    },
    {
      title: 'Active Treatments',
      value: activeRecords.toString(),
      change: '-3',
      trend: 'down',
      icon: 'HeartIcon',
      color: 'red'
    },
    {
      title: 'Scheduled Visits',
      value: healthRecords.filter(r => r.followUp?.required).length.toString(),
      change: '+2',
      trend: 'up',
      icon: 'CalendarIcon',
      color: 'purple'
    },
    {
      title: 'Health Score',
      value: `${healthScore}%`,
      change: '+2%',
      trend: 'up',
      icon: 'ShieldCheckIcon',
      color: 'green'
    }
  ];
}

/**
 * Get upcoming appointments from health records
 * @param healthRecords Array of health records
 * @returns Upcoming appointments
 */
export function getUpcomingAppointments(healthRecords: IHealthRecord[]) {
  const now = new Date();
  const upcoming = healthRecords
    .filter(r => r.followUp?.required && r.followUp.date && new Date(r.followUp.date) > now)
    .sort((a, b) => new Date(a.followUp?.date || 0).getTime() - new Date(b.followUp?.date || 0).getTime())
    .slice(0, 3)
    .map((record, index) => ({
      id: index + 1,
      animalName: record.animalRfid || `Animal ${index + 1}`,
      animalId: record.animalRfid || `RFID-${index + 1}`,
      type: record.recordType.charAt(0).toUpperCase() + record.recordType.slice(1),
      date: record.followUp?.date ? new Date(record.followUp.date).toISOString().split('T')[0] : '',
      time: record.followUp?.date ? new Date(record.followUp.date).toTimeString().split(' ')[0].substring(0, 5) : '',
      veterinarian: record.veterinarian || 'Dr. Smith',
      status: 'confirmed'
    }));

  return upcoming;
}

/**
 * Get health alerts from health records
 * @param healthRecords Array of health records
 * @returns Health alerts
 */
export function getHealthAlerts(healthRecords: IHealthRecord[]) {
  const now = new Date();

  // Critical issues
  const criticalIssues = healthRecords
    .filter(r => r.severity === 'critical' && r.status === 'active')
    .slice(0, 3)
    .map((record, index) => ({
      id: index + 1,
      type: 'error',
      title: 'Critical Health Issue',
      description: `${record.diagnosis} - ${record.animalRfid}`,
      time: 'urgent',
      priority: 'high'
    }));

  // Overdue follow-ups
  const overdueFollowUps = healthRecords
    .filter(r => r.followUp?.required && r.followUp.date && new Date(r.followUp.date) < now && r.status !== 'resolved')
    .slice(0, 3)
    .map((record, index) => ({
      id: criticalIssues.length + index + 1,
      type: 'warning',
      title: 'Follow-up Overdue',
      description: `Follow-up needed for ${record.diagnosis} - ${record.animalRfid}`,
      time: 'overdue',
      priority: 'high'
    }));

  // Upcoming vaccinations
  const upcomingVaccinations = healthRecords
    .filter(r => r.recordType === 'vaccination' &&
       r.vaccinations?.some(v => v.nextDueDate && new Date(v.nextDueDate) > now))
    .slice(0, 3)
    .map((record, index) => {
      const nextVaccination = record.vaccinations
        ?.filter(v => v.nextDueDate && new Date(v.nextDueDate) > now)
        .sort((a, b) => new Date(a.nextDueDate || 0).getTime() - new Date(b.nextDueDate || 0).getTime())[0];

      return {
        id: criticalIssues.length + overdueFollowUps.length + index + 1,
        type: 'info',
        title: 'Vaccination Due',
        description: `${nextVaccination?.vaccine} due for ${record.animalRfid}`,
        time: nextVaccination?.nextDueDate ? new Date(nextVaccination.nextDueDate).toLocaleDateString() : '',
        priority: 'medium'
      };
    });

  return [...criticalIssues, ...overdueFollowUps, ...upcomingVaccinations].slice(0, 3);
}