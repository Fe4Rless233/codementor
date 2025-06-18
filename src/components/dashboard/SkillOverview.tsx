// src/components/dashboard/SkillOverview.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useSkillTracking } from '@/hooks/useSkillTracking'; // Import the hook
import { BookOpen, TrendingUp, Loader2 } from 'lucide-react'; // Icons

export default function SkillOverview() {
  const { skills, recommendations, loading, error } = useSkillTracking();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center min-h-[150px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mr-3" />
          <p className="text-gray-600">Loading skill insights...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600 bg-red-50 py-4 rounded-lg">
          <p className="font-medium">Failed to load skill data.</p>
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  // Helper to calculate progress for a more visual bar
  const calculateProgressForDisplay = (xp: number) => {
    const xpPerLevel = 100; // Example: 100 XP per level
    const currentLevel = Math.floor(xp / xpPerLevel);
    const progressInCurrentLevel = xp % xpPerLevel;
    return {
      level: currentLevel,
      progress: progressInCurrentLevel,
      xpToNextLevel: xpPerLevel - progressInCurrentLevel,
    };
  };

  const topSkills = skills
    .map(skill => ({
      ...skill,
      displayProgress: calculateProgressForDisplay(skill.xp),
    }))
    .sort((a, b) => b.xp - a.xp) // Sort by XP descending
    .slice(0, 3); // Get top 3

  const topRecommendations = recommendations.slice(0, 3); // Get top 3 recommendations

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* My Top Skills Card */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-primary-600" /> My Top Skills
        </h3>
        {topSkills.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <p>No skills tracked yet. Submit your first code!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topSkills.map((skill) => (
              <div key={skill.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {skill.skillName} (Level {skill.displayProgress.level})
                  </span>
                  <span className="text-sm text-gray-500">{skill.xp} XP</span>
                </div>
                <ProgressBar
                  value={skill.displayProgress.progress}
                  max={skill.displayProgress.xpToNextLevel + skill.displayProgress.progress} // Max should be total XP for current level
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {skill.displayProgress.xpToNextLevel} XP to next level
                </p>
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full mt-6" onClick={() => {/* navigate to full skills page */}}>
          View All Skills
        </Button>
      </Card>

      {/* Recommended Learning Card */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-secondary-600" /> Recommended For You
        </h3>
        {topRecommendations.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <p>No new recommendations. Keep coding to discover more!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topRecommendations.map((rec, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-md border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <p className="font-medium text-gray-800">{rec.skill}</p>
                  <p className="text-xs text-gray-500">Strength: {rec.strength}</p>
                </div>
                <Button size="sm" onClick={() => {/* action to explore this recommended skill */}}>
                  Explore
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full mt-6" onClick={() => {/* navigate to full learning path page */}}>
          View Full Learning Path
        </Button>
      </Card>
    </div>
  );
}