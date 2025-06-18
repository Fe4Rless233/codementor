export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  level: string;
  totalScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface CodeSubmission {
  id: string;
  userId: string;
  title: string;
  code: string;
  language: string;
  complexity: number;
  quality: number;
  maintainability: number;
  performance: number;
  feedback?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SkillProgress {
  id: string;
  userId: string;
  skillName: string;
  level: number;
  xp: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResult {
  type: 'error' | 'warning' | 'suggestion' | 'info';
  title: string;
  description: string;
  line?: number;
  severity: number;
}

export interface CollaborationSession {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  isActive: boolean;
  createdBy: string;
  participants: User[];
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  user: User;
  message: string;
  type: 'text' | 'code' | 'system';
  createdAt: string;
}