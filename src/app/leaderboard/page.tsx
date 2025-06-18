// src/app/leaderboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Your Avatar component
import { Loader2, Crown, Trophy, TrendingUp } from 'lucide-react'; // Icons for leaderboard
import toast from 'react-hot-toast';

// Define the type for a leaderboard entry
interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string | null;
  totalScore: number;
  level: string; // e.g., Beginner, Intermediate, Advanced
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLeaderboardLoading(true);
      setLeaderboardError(null);
      try {
        // This assumes you'll have an API endpoint like /api/leaderboard
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data.');
        }
        const data = await response.json();
        setLeaderboard(data.users || []); // Assuming the API returns an array of users
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        setLeaderboardError(err.message || 'Unable to load leaderboard. Please try again.');
        toast.error('Failed to load leaderboard.');
      } finally {
        setLeaderboardLoading(false);
      }
    };

    if (!authLoading && user) { // Only fetch if authenticated and auth state is loaded
      fetchLeaderboard();
    }
  }, [user, authLoading]); // Re-fetch if user or auth state changes

  if (authLoading || leaderboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            <Trophy className="inline-block h-10 w-10 text-yellow-500 mr-2 -mt-1" />
            CodeMentor Leaderboard
          </h1>
          <p className="text-lg text-gray-600">See how you rank among the top developers!</p>
        </div>

        {leaderboardError ? (
          <Card className="p-6 text-center text-red-600 bg-red-50">
            <p className="font-medium">Error: {leaderboardError}</p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
              Retry
            </Button>
          </Card>
        ) : leaderboard.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-xl font-semibold mb-2">No rankings yet.</p>
            <p className="text-md">Be the first to submit code and climb the ranks!</p>
          </Card>
        ) : (
          <Card className="p-6">
            <ul className="divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <li
                  key={entry.id}
                  className={`flex items-center py-4 ${
                    user.id === entry.id ? 'bg-primary-50 rounded-lg px-4 -mx-4' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-10 text-center font-bold text-xl text-gray-700">
                    {index === 0 && <Crown className="h-6 w-6 text-yellow-500 inline-block -mt-1" />}
                    {index === 1 && <Trophy className="h-6 w-6 text-gray-400 inline-block -mt-1" />}
                    {index === 2 && <Trophy className="h-6 w-6 text-orange-400 inline-block -mt-1" />}
                    {index > 2 ? `${index + 1}.` : ''}
                  </div>
                  <Avatar className="h-10 w-10 mx-4">
                    <AvatarImage src={entry.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.username}`} alt={entry.username} />
                    <AvatarFallback>{entry.username ? entry.username[0].toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-gray-900">{entry.username}</p>
                    <p className="text-sm text-gray-600">{entry.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-primary-700">{entry.totalScore}</p>
                    <p className="text-xs text-gray-500">score</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}