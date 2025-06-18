// src/components/dashboard/DashboardStats.tsx
'use client';

import { Card } from '@/components/ui/Card';
import {
  FileText, // For total submissions
  Award,    // For average quality
  Star,     // For skills learned
  TrendingUp, // For current streak
  Loader2   // For loading indicator
} from 'lucide-react'; // Assuming lucide-react is installed

interface DashboardStatsProps {
  /**
   * Object containing the user's statistics.
   */
  stats: {
    totalSubmissions: number;
    averageQuality: number; // typically 0-10 or 0-100
    skillsLearned: number;
    streak: number; // in days
  } | null;
  /**
   * If true, indicates that the stats are currently being loaded.
   */
  loading?: boolean;
  /**
   * An optional error message if loading stats failed.
   */
  error?: string | null;
}

export default function DashboardStats({ stats, loading, error }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500 mr-3" />
        <p className="text-gray-600">Loading your stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg shadow">
        <p className="font-medium">Failed to load dashboard stats.</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white rounded-lg shadow">
        <p>No stats available yet. Start coding to see your progress!</p>
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Submissions',
      value: stats.totalSubmissions,
      icon: FileText,
      color: 'primary',
      bgColor: 'primary-100',
    },
    {
      label: 'Average Quality',
      value: `${stats.averageQuality}/10`,
      icon: Award,
      color: 'green',
      bgColor: 'green-100',
    },
    {
      label: 'Skills Learned',
      value: stats.skillsLearned,
      icon: Star,
      color: 'secondary',
      bgColor: 'secondary-100',
    },
    {
      label: 'Current Streak',
      value: `${stats.streak} days`,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => {
        const IconComponent = item.icon; // Dynamic component rendering

        return (
          <Card key={index} className="p-6 flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-${item.bgColor}`}>
              <IconComponent className={`w-7 h-7 text-${item.color}-600`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{item.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{item.value}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}