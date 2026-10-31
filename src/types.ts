export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type TaskPriority = 'p1' | 'p2' | 'p3' | 'p4';

export type TaskCategory =
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'ai'
  | 'database'
  | 'security'
  | 'testing';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  tags: string[];
  estimatedHours: number;
  subtasks: Subtask[];
  codeSnippetPreview?: string;
  aiNotes?: string;
  createdAt: string;
  dueDate?: string;
}

export type ViewMode = 'kanban' | 'list' | 'matrix' | 'antigravity' | 'pomodoro';

export interface GravitySettings {
  enabled: boolean;
  gravityY: number; // 0 = 0G, 0.2 = Moon, 0.98 = Earth, -0.8 = Inverted
  airFriction: number;
  bounceRestitution: number;
  mouseMode: 'drag' | 'attract' | 'repel';
}

export interface CopilotSolution {
  architecturalAdvice: string;
  implementationCode: string;
  codeLanguage: string;
  cliCommands: string[];
  checklist: string[];
  aiSuperpowerTip: string;
}

export interface SprintOptimizationResult {
  executiveSummary: string;
  recommendedOrderIds: string[];
  focusStrategy: string;
  metrics: {
    totalBacklogHours: number;
    bottlenecksCount: number;
    completionRatePercentage: number;
  };
  devProductivityTips: string[];
}
