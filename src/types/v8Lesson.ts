import { ExerciseConfig } from './guidedLesson';

// ===========================================
// V8 "Read & Listen" Premium — Tipos
// ===========================================

/**
 * V8Section — Uma seção de conteúdo com áudio individual
 */
export interface V8Section {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  audioUrl: string;
  audioDurationSeconds?: number;
}

/**
 * V8InlineQuiz — Quiz inserido ENTRE seções
 */
export interface V8InlineQuiz {
  id: string;
  afterSectionIndex: number;
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;
  reinforcement?: string;
  audioUrl?: string;
  reinforcementAudioUrl?: string;
  explanationAudioUrl?: string;

  quizType?: 'multiple-choice' | 'true-false' | 'fill-blank';

  // Campos para true-false
  statement?: string;
  isTrue?: boolean;

  // Campos para fill-blank
  sentenceWithBlank?: string;
  correctAnswer?: string;
  acceptableAnswers?: string[];

  // Phase 7 (Gap 5): Chip options for fill-blank (correct + distractors)
  chipOptions?: string[];
}

/**
 * V8InlinePlayground — Playground inserido ENTRE seções
 */
export interface V8InlinePlayground {
  id: string;
  afterSectionIndex: number;

  title: string;
  subtitle?: string;
  instruction: string;

  narration?: string;
  audioUrl?: string;

  amateurPrompt: string;
  professionalPrompt: string;
  amateurResult?: string;
  professionalResult?: string;

  userChallenge?: {
    instruction: string;
    challengePrompt: string;
    hints: string[];
    evaluationCriteria: string[];
    scoring?: {
      maxScore: number;
      rubric: Array<{ criterion: string; points: number }>;
    };
    maxAttempts?: number;
  };

  successMessage: string;
  tryAgainMessage: string;
  successAudioUrl?: string;
  tryAgainAudioUrl?: string;
  hintOnFail?: string[];

  offlineFallback?: {
    message: string;
    exampleAnswer: string;
  };
}

/**
 * V8InsightBlock — Insight de recompensa inserido ENTRE seções
 */
export interface V8InsightBlock {
  id: string;
  afterSectionIndex: number;
  title: string;
  insightText: string;
  creditsReward: number;
  audioUrl?: string;
}

/**
 * V8InlineCompleteSentence — Complete-sentence exercise inserido ENTRE seções (Phase 8, Gap 4)
 * Estilo Coursiv: chips arrastáveis para preencher lacunas
 */
export interface V8InlineCompleteSentence {
  id: string;
  afterSectionIndex: number;
  title: string;
  instruction: string;
  sentences: Array<{
    id: string;
    text: string;              // Frase com _______ como placeholder
    correctAnswers: string[];  // Respostas corretas
    options: string[];         // Chips disponíveis (corretas + distratoras)
    hints?: string[];
  }>;
  audioUrl?: string;
}

/**
 * V8InlineExercise — Exercício interativo inline ENTRE seções (Phase 9)
 * Suporta 4 tipos confiáveis: true-false, multiple-choice, complete-sentence, fill-in-blanks
 */
export interface V8InlineExercise {
  id: string;
  afterSectionIndex: number;
  type: 'true-false' | 'multiple-choice' | 'complete-sentence' | 'fill-in-blanks' | 'flipcard-quiz' | 'scenario-selection' | 'platform-match' | 'timed-quiz';
  title: string;
  instruction: string;
  data: Record<string, any>;
  audioUrl?: string;
}

/**
 * V8LessonData — Armazenado em lessons.content (JSONB)
 */
export interface V8LessonData {
  contentVersion: 'v8';
  title: string;
  description?: string;
  sections: V8Section[];
  inlineQuizzes: V8InlineQuiz[];
  inlinePlaygrounds?: V8InlinePlayground[];
  inlineInsights?: V8InsightBlock[];
  inlineCompleteSentences?: V8InlineCompleteSentence[];  // Phase 8 (Gap 4)
  inlineExercises?: V8InlineExercise[];  // Phase 9: Inline exercises (4 reliable types)
  exercises: ExerciseConfig[];
}

/**
 * V8PlayerState — Estado do player (gerenciado por useV8Player hook)
 */
export interface V8PlayerState {
  currentIndex: number;
  mode: 'read' | 'listen';
  isPlaying: boolean;
  playbackSpeed: number;
  phase: 'mode-select' | 'content' | 'exercises' | 'completion';
  scores: number[];
  playgroundScores: Record<string, number>;  // Phase 4 (Gap 3): playground.id → score
}
