// src/components/editor/SkillsPanel.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useSkillTracking } from '@/hooks/useSkillTracking'; // Import your custom hook
import { BarChart, Flame, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'; // Icons
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SkillsPanel() {
  const { skills, recommendations, loading, error, fetchSkills } = useSkillTracking();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    mySkills: true,
    recommendations: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p>Loading skill data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <BookOpen className="h-10 w-10 mx-auto mb-4" />
        <p>Error loading skills: {error}</p>
        <p className="text-sm text-gray-500 mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  const calculateLevelProgress = (xp: number) => {
    // A simple example for calculating level progress.
    // You might have a more complex exponential or logarithmic progression.
    const xpPerLevel = 100;
    const currentLevel = Math.floor(xp / xpPerLevel);
    const progressInCurrentLevel = xp % xpPerLevel;
    return { currentLevel, progress: progressInCurrentLevel, nextLevelXp: xpPerLevel };
  };

  return (
    <div className="bg-gray-50 border-l border-gray-200 h-full overflow-y-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Skill Progression</h2>

      {/* My Skills Section */}
      <Card className="p-4">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('mySkills')}>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <BarChart className="w-5 h-5 mr-2 text-primary-600" /> My Current Skills ({skills.length})
          </h3>
          {expandedSections.mySkills ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        <AnimatePresence>
          {expandedSections.mySkills && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4"
            >
              {skills.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No skills tracked yet. Submit some code to start!
                </p>
              ) : (
                skills.map((skill) => {
                  const { currentLevel, progress, nextLevelXp } = calculateLevelProgress(skill.xp);
                  return (
                    <div key={skill.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-base font-medium text-gray-700">{skill.skillName} (Level {currentLevel})</span>
                        <span className="text-sm text-gray-500">{skill.xp} XP</span>
                      </div>
                      <ProgressBar value={progress} max={nextLevelXp} className="h-3" />
                      <p className="text-xs text-gray-500 mt-1">
                        {nextLevelXp - progress} XP to next level
                      </p>
                    </div>
                  );
                })
              )}
              <Button variant="outline" className="w-full mt-4" onClick={() => {/* navigate to dedicated skills page */}}>
                View Detailed Skill Report
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Recommended Learning Paths/Skills Section */}
      <Card className="p-4">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('recommendations')}>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Flame className="w-5 h-5 mr-2 text-secondary-600" /> Recommended for You ({recommendations.length})
          </h3>
          {expandedSections.recommendations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        <AnimatePresence>
          {expandedSections.recommendations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-3"
            >
              {recommendations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recommendations yet. Keep coding to help us learn your strengths!
                </p>
              ) : (
                recommendations.map((rec, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-md border border-gray-200 bg-white shadow-sm">
                    <div>
                      <p className="font-medium text-gray-900">{rec.skill}</p>
                      <p className="text-xs text-gray-500">Strength based on similar users: {rec.strength}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {/* action to explore skill */}}>
                      Learn More
                    </Button>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}