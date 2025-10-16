export interface Target {
  id: string;
  x: number;
  y: number;
  spawnTime: number;
  clicked?: boolean;
  reactionTime?: number;
}

export interface ClickData {
  x: number;
  y: number;
  timestamp: number;
  targetId?: string;
  reactionTime?: number;
  isFalseClick?: boolean;
}

export interface GameSession {
  targets: Target[];
  clicks: ClickData[];
  missedTargets: number;
  falseClicks: number;
  startTime: number;
  endTime: number;
}

export interface CategoryScore {
  score: number;
  description: string;
  indicators: string[];
}

export interface ADHDAnalysis {
  overallScore: number;
  adhdLikelihood: "High" | "Moderate" | "Low" | "Unlikely";
  categories: {
    inattention: CategoryScore;
    impulsivity: CategoryScore;
    hyperactivity: CategoryScore;
    sustainedAttention: CategoryScore;
  };
  reactionTimeAnalysis: {
    average: number;
    consistency: string;
    pattern: string;
  };
  accuracyMetrics: {
    hitRate: number;
    missRate: number;
    falsePositiveRate: number;
  };
  recommendations: string[];
  clinicalNotes: string;
}
