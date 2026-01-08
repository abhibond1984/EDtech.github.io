
export type SketchStyle = 'pencil' | 'watercolor' | 'chalkboard' | 'crayon';
export type DifficultyLevel = 'easy' | 'similar' | 'difficult';
export type GradeLevel = 'Elementary (K-5)' | 'Middle School (6-8)' | 'High School (9-12)' | 'College/Expert';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'short-answer' | 'true-false';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  illustrationPrompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

export interface TextbookAnalysis {
  subject: string;
  topic: string;
  summary: string;
  funFact: string;
  questions: Question[];
  sources?: GroundingSource[];
}

export type AppState = 'upload' | 'grade_selection' | 'analyzing' | 'results';
