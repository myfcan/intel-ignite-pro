import { ExerciseConfig } from './guidedLesson';

// ===========================================
// V8 "Read & Listen" Premium — Tipos
// ===========================================

/**
 * V8Section — Uma seção de conteúdo com áudio individual
 * Cada seção tem seu próprio arquivo MP3 (15-30s)
 */
export interface V8Section {
  id: string;                    // ex: 'section-01'
  title: string;                 // Título exibido em 28px bold
  content: string;               // Markdown renderizado via react-markdown
  imageUrl?: string;             // Imagem com gradient overlay
  audioUrl: string;              // Áudio individual desta seção (15-30s)
  audioDurationSeconds?: number; // Duração em segundos (para progress bar)
}

/**
 * V8InlineQuiz — Quiz inserido ENTRE seções
 * Trigger: aparece após sections[afterSectionIndex] via audio.onEnded
 */
export interface V8InlineQuiz {
  id: string;                    // ex: 'quiz-01'
  afterSectionIndex: number;     // Aparece após sections[N]
  question: string;              // Pergunta exibida
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation: string;           // Feedback ao responder
  reinforcement?: string;        // Texto extra ao errar
  audioUrl?: string;             // Áudio da pergunta (narrado)
  reinforcementAudioUrl?: string; // Áudio do reforço ao errar
}

/**
 * V8InlinePlayground — Playground inserido ENTRE seções
 * Trigger: aparece após sections[afterSectionIndex] via timeline
 * Ordenação: playground ANTES de quiz quando mesmo afterSectionIndex
 */
export interface V8InlinePlayground {
  id: string;                    // ex: 'playground-01'
  afterSectionIndex: number;     // 0-based, validado: 0 <= x < sections.length

  // UI (exibido na tela)
  title: string;                 // "Teste na Prática"
  subtitle?: string;
  instruction: string;           // Texto curto de UI (>= 40 chars)

  // Narração (separada da UI para áudio de qualidade)
  narration?: string;            // Texto narrado com tags de emoção
  audioUrl?: string;             // Áudio gerado a partir de narration

  // Prompts comparativos
  amateurPrompt: string;         // != professionalPrompt (validado)
  professionalPrompt: string;
  amateurResult?: string;        // Se preenchido: usa direto (híbrido)
  professionalResult?: string;   // Se vazio: chama IA na hora

  // Desafio do usuário
  userChallenge?: {
    instruction: string;
    challengePrompt: string;
    hints: string[];             // max 3 (validado)
    evaluationCriteria: string[];// ex: "tem objetivo claro", "pede formato"
    scoring?: {
      maxScore: number;
      rubric: Array<{ criterion: string; points: number }>;
    };
    maxAttempts?: number;        // default 3
  };

  // Feedback explícito
  successMessage: string;        // Ação, não motivação vazia
  tryAgainMessage: string;
  hintOnFail?: string[];

  // Fallback offline
  offlineFallback?: {
    message: string;
    exampleAnswer: string;
  };
}

/**
 * V8LessonData — Armazenado em lessons.content (JSONB)
 * Discriminado por contentVersion: 'v8'
 */
export interface V8LessonData {
  contentVersion: 'v8';          // Discriminador de versão
  title: string;
  description?: string;
  sections: V8Section[];         // Seções de conteúdo
  inlineQuizzes: V8InlineQuiz[]; // Quizzes mid-lesson
  inlinePlaygrounds?: V8InlinePlayground[]; // Playgrounds mid-lesson
  exercises: ExerciseConfig[];   // Exercícios finais (reutiliza tipo existente)
}

/**
 * V8PlayerState — Estado do player (gerenciado por useV8Player hook)
 */
export interface V8PlayerState {
  currentIndex: number;          // Índice da seção/quiz atual
  mode: 'read' | 'listen';      // Modo selecionado pelo usuário
  isPlaying: boolean;            // Áudio tocando?
  playbackSpeed: number;         // 1 | 1.25 | 1.5 | 2
  phase: 'mode-select' | 'content' | 'exercises' | 'completion';
  scores: number[];              // Scores dos exercícios finais
}
