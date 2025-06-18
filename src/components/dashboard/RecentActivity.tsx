// src/components/dashboard/RecentActivity.tsx
'use client';

import { Card } from '@/components/ui/Card';
import {
  FileCode, // For code submissions
  Users,    // For collaborations
  Zap,      // For skill level-ups
  Lightbulb, // For analysis feedback
  Loader2   // For loading indicator
} from 'lucide-react'; // Assuming lucide-react is installed
import { formatDistanceToNowStrict, parseISO } from 'date-fns'; // For friendly time formatting

// Define the shape of an activity item for this component
interface ActivityItem {
  type: 'submission' | 'collaboration' | 'skill' | 'analysis';
  title: string;
  description: string | null;
  time: string; // ISO 8601 string
  icon?: React.ElementType; // Optional icon component from lucide-react
}

interface RecentActivityProps {
  /**
   * An array of the user's recent activity items.
   */
  activity: ActivityItem[] | null;
  /**
   * If true, indicates that the activity data is currently being loaded.
   */
  loading?: boolean;
  /**
   * An optional error message if loading activity failed.
   */
  error?: string | null;
}

export default function RecentActivity({ activity, loading, error }: RecentActivityProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[150px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mr-3" />
          <p className="text-gray-600">Loading recent activity...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600 bg-red-50 py-4 rounded-lg">
          <p className="font-medium">Failed to load activity.</p>
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (!activity || activity.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500 min-h-[150px] flex flex-col justify-center items-center">
          <FileCode className="h-10 w-10 mb-3 text-gray-400" />
          <p className="text-lg font-semibold mb-2">No Recent Activity</p>
          <p className="text-sm">Start coding, collaborate, or explore to see your activity here!</p>
        </div>
      </Card>
    );
  }

  // Map activity types to their respective Lucide icons and colors
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'submission': return <FileCode className="w-5 h-5 text-primary-600" />;
      case 'collaboration': return <Users className="w-5 h-5 text-secondary-600" />;
      case 'skill': return <Zap className="w-5 h-5 text-green-600" />;
      case 'analysis': return <Lightbulb className="w-5 h-5 text-blue-600" />;
      default: return <FileCode className="w-5 h-5 text-gray-600" />; // Fallback
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activity.map((item, index) => (
          <div key={index} className="flex items-start space-x-4 pb-4 last:pb-0 border-b last:border-b-0 border-gray-100">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(item.type)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.title}</p>
              {item.description && <p className="text-sm text-gray-700 mt-1">{item.description}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNowStrict(parseISO(item.time), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}