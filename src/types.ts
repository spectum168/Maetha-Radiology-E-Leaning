export interface Staff {
  id: string;
  name: string;
  position: string;
  department: string;
  registeredAt: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIdx: number;
  explanation: string;
}

export interface Topic {
  id: string;
  title: string;
  url: string;
  embedUrl?: string;
  description: string;
  questions: QuizQuestion[];
}

export interface TrainingProgress {
  staffId: string;
  topicId: string;
  status: 'not_started' | 'studying' | 'completed';
  quizScore?: number;
  maxScore?: number;
  passed?: boolean;
  completedAt?: string;
  staffSignature?: string; // base64 canvas signature
}

export interface ApprovalRecord {
  staffId: string;
  topicId: string;
  headName: string;
  headPosition: string;
  headSignature?: string; // base64 signature
  approvedAt?: string;
}
