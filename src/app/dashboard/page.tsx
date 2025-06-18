// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Your custom auth hook
import DashboardStats from '@/components/dashboard/DashboardStats'; // Your DashboardStats component
import RecentActivity from '@/components/dashboard/RecentActivity'; // Your RecentActivity component
import SkillOverview from '@/components/dashboard/SkillOverview';   // Your SkillOverview component
import { Button } from '@/components/ui/Button'; // Your Button component
import { Card } from '@/components/ui/Card';     // Your Card component
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // For charts
import { useState } from 'react';
import toast from 'react-hot-toast'; // For notifications

// Define the type for chart data
interface QualityProgressData {
  date: string; // e.g., '2024-01'
  quality: number; // average quality score
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null); // State for overall stats
  const [recentActivity, setRecentActivity] = useState<any>(null); // State for recent activity
  // Skill data is managed by useSkillTracking directly in SkillOverview, not here.
  const [qualityProgressData, setQualityProgressData] = useState<QualityProgressData[]>([]); // State for chart data

  const [statsLoading, setStatsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [qualityChartLoading, setQualityChartLoading] = useState(true);

  const [statsError, setStatsError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [qualityChartError, setQualityChartError] = useState<string | null>(null);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Fetch dashboard data when user is authenticated
  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        // Fetch Stats
        setStatsLoading(true);
        setStatsError(null);
        try {
          const statsResponse = await fetch('/api/user/stats');
          if (!statsResponse.ok) throw new Error('Failed to fetch stats');
          const statsData = await statsResponse.json();
          setStats(statsData);
        } catch (err: any) {
          console.error('Error fetching stats:', err);
          setStatsError(err.message || 'Error loading stats');
          toast.error('Failed to load dashboard statistics.');
        } finally {
          setStatsLoading(false);
        }

        // Fetch Recent Activity
        setActivityLoading(true);
        setActivityError(null);
        try {
          const activityResponse = await fetch('/api/user/activity');
          if (!activityResponse.ok) throw new Error('Failed to fetch activity');
          const activityData = await activityResponse.json();
          setRecentActivity(activityData.activity);
        } catch (err: any) {
          console.error('Error fetching activity:', err);
          setActivityError(err.message || 'Error loading activity');
          toast.error('Failed to load recent activity.');
        } finally {
          setActivityLoading(false);
        }

        // Fetch Quality Progress Data (or generate mock for now)
        setQualityChartLoading(true);
        setQualityChartError(null);
        try {
          // In a real application, you'd fetch this from your API
          // For now, using a mock to demonstrate the chart
          const mockQualityData: QualityProgressData[] = [
            { date: 'Jan', quality: 6.2 },
            { date: 'Feb', quality: 6.8 },
            { date: 'Mar', quality: 7.1 },
            { date: 'Apr', quality: 7.5 },
            { date: 'May', quality: 7.9 },
            { date: 'Jun', quality: 8.2 },
            // Add more data points as user makes submissions
          ];
          setQualityProgressData(mockQualityData);
        } catch (err: any) {
          setQualityChartError(err.message || 'Error loading quality chart');
          toast.error('Failed to load quality progress chart.');
        } finally {
          setQualityChartLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [user]); // Re-run effect when user changes (i.e., logs in)

  // Show a full-page loader while initial authentication check is in progress
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If user is null (not logged in) after loading, the useEffect will redirect
  if (!user) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Welcome, {user.user_metadata?.username || user.email?.split('@')[0] || 'Developer'}!
            </h1>
            <p className="text-lg text-gray-600">Your personalized CodeMentor dashboard.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={() => router.push('/editor')}
              variant="outline"
              className="group"
            >
              Start New Project
              <Code className="ml-2 h-4 w-4 transition-transform group-hover:rotate-6" />
            </Button>
            <Button
              onClick={() => router.push('/collaborate/new')}
            >
              Start Collaboration
              <Users className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <DashboardStats stats={stats} loading={statsLoading} error={statsError} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Code Quality Progress Chart */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Code Quality Progress</h3>
            {qualityChartLoading ? (
              <div className="flex items-center justify-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : qualityChartError ? (
              <div className="text-center text-red-600 h-60 flex items-center justify-center">
                <p>{qualityChartError}</p>
              </div>
            ) : qualityProgressData.length === 0 ? (
                <div className="text-center text-gray-500 h-60 flex items-center justify-center">
                    <p>No quality data yet. Submit code to track your progress!</p>
                </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={qualityProgressData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis domain={[0, 10]} stroke="#666" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0px 2px 10px rgba(0,0,0,0.1)' }}
                    labelStyle={{ color: '#333' }}
                    itemStyle={{ color: '#333' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="quality"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Skill Overview */}
          <SkillOverview />
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <RecentActivity activity={recentActivity} loading={activityLoading} error={activityError} />
        </div>
      </div>
    </div>
  );
}