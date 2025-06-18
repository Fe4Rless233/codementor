export interface AnalysisResult {
  overall_quality: number; // 1-10
  complexity: number;     // 1-10
  maintainability: number; // 1-10
  performance: number;    // 1-10
  issues: AnalysisIssue[];
  suggestions: AnalysisSuggestion[];
  skills_demonstrated: string[];
  skills_to_improve: string[];
  learning_path: string; // A general text summary for next steps
}

export interface AnalysisIssue {
  type: 'error' | 'warning' | 'suggestion' | 'info';
  title: string;
  description: string;
  line?: number; // Optional line number for the issue
  severity: number; // 1-10, 10 being most severe
}

export interface AnalysisSuggestion {
  title: string;
  description: string;
  example?: string; // Optional code example for improvement
}

export interface LearningPathStep {
  skill: string;
  priority: number; // 1-10, 10 being high priority
  estimated_time: string;
  prerequisites: string[];
  resources: LearningResource[];
}

export interface LearningResource {
  type: 'tutorial' | 'project' | 'practice' | 'article' | 'video';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  link?: string; // Optional URL to the resource
}

export interface GeneratedLearningPath {
  path: LearningPathStep[];
  timeline: string; // Overall estimated timeline (e.g., "3 weeks", "2 months")
  milestones: string[]; // Key milestones in the learning journey
}