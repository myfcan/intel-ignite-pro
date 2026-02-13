/**
 * 🔒 SCHEMAS TIPADOS ESTRITAMENTE PARA EXERCÍCIOS
 * 
 * Define estruturas TypeScript rígidas para cada tipo de exercício.
 * Isso previne que exercícios sejam criados com estrutura incorreta.
 */

// ============================================================
// DRAG-DROP EXERCISE
// ============================================================
export interface DragDropItem {
  id: string;
  text: string;
  category: string;
}

export interface DragDropCategory {
  id: string;
  title: string;
  description?: string;
}

export interface DragDropExerciseData {
  items: DragDropItem[];
  categories: DragDropCategory[];
  feedback?: {
    correct: string;
    incorrect: string;
  };
}

// ============================================================
// FILL-IN-BLANKS EXERCISE
// ============================================================
export interface FillInBlanksSentence {
  id: string;
  /**
   * Texto da sentença com placeholder para resposta.
   *
   * ✅ PADRÃO RECOMENDADO: 7 underscores (_______)
   * ⚠️ RETROCOMPATIBILIDADE: 11 underscores (___________) também aceito
   *
   * @example "A IA aprende com _______."
   * @see src/lib/exerciseConstants.ts para funções auxiliares
   */
  text: string;
  correctAnswers: string[];
  hint: string;
  explanation?: string;
}

export interface FillInBlanksExerciseData {
  sentences: FillInBlanksSentence[];
  feedback: {
    allCorrect: string;
    someCorrect: string;
    needsReview: string;
  };
}

// ============================================================
// SCENARIO-SELECTION EXERCISE
// ============================================================
export interface ScenarioOption {
  id: string;
  title?: string;
  description?: string;
  emoji?: string;
  isCorrect?: boolean;
  feedback?: string;
}

export interface ScenarioSelectionScenario {
  id: string;
  situation?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  // Campos para formato alternativo
  title?: string;
  description?: string;
  emoji?: string;
  isCorrect?: boolean;
  feedback?: string;
}

export interface ScenarioSelectionExerciseData {
  scenarios: ScenarioSelectionScenario[];
  correctExplanation?: string;
  followUpQuestion?: string;
  followUpAnswer?: string;
}

// ============================================================
// TRUE-FALSE EXERCISE
// ============================================================
export interface TrueFalseStatement {
  id: string;
  text: string;
  correct: boolean;
  explanation: string;
}

export interface TrueFalseExerciseData {
  statements: TrueFalseStatement[];
  feedback: {
    perfect: string;
    good: string;
    needsReview: string;
    allCorrect?: string;
    someCorrect?: string;
  };
}

// ============================================================
// PLATFORM-MATCH EXERCISE
// ============================================================
export interface PlatformMatchScenario {
  id: string;
  text: string;
  correctPlatform: string;
  emoji: string;
}

export interface PlatformMatchPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface PlatformMatchExerciseData {
  scenarios: PlatformMatchScenario[];
  platforms: PlatformMatchPlatform[];
}

// ============================================================
// DATA-COLLECTION EXERCISE
// ============================================================
export interface DataCollectionDataPoint {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface DataCollectionScenario {
  id: string;
  emoji: string;
  platform: string;
  situation: string;
  dataPoints: DataCollectionDataPoint[];
  context: string;
}

export interface DataCollectionExerciseData {
  scenario: DataCollectionScenario;
  feedback?: {
    allCorrect: string;
    someCorrect: string;
    needsReview: string;
  };
}

// ============================================================
// MULTIPLE-CHOICE EXERCISE
// ============================================================
export interface MultipleChoiceExerciseData {
  question: string;
  options: string[];
  correctAnswer: string;  // Texto completo da opção correta
  explanation: string;
}

// ============================================================
// COMPLETE-SENTENCE EXERCISE
// ============================================================
/**
 * 🎯 REGRA PADRÃO COMPLETE-SENTENCE:
 *
 * - Se `options` existe → Exercício de MÚLTIPLA ESCOLHA (RadioGroup)
 * - Se `options` NÃO existe → Exercício de TEXTO LIVRE (Input)
 *
 * ✅ RECOMENDADO: Sempre usar `options` para melhor UX
 */
export interface CompleteSentenceSentence {
  id: string;
  /**
   * Texto da sentença com placeholder para resposta.
   *
   * ✅ PADRÃO RECOMENDADO: 7 underscores (_______)
   * ⚠️ RETROCOMPATIBILIDADE: 11 underscores (___________) também aceito
   *
   * @example "O Prompt _______ adapta a explicação."
   * @see src/lib/exerciseConstants.ts para funções auxiliares
   */
  text: string;
  correctAnswers: string[]; // Respostas aceitas (pelo menos 1 deve estar em options se options existir; outros são sinônimos)
  options?: string[]; // 🆕 Se presente, exibe como múltipla escolha (RadioGroup)
                       //     Se ausente, exibe como texto livre (Input)
                       //     Pelo menos 1 correctAnswer deve estar aqui
  hints?: string[]; // 💡 Dicas opcionais exibidas antes do input
}

export interface CompleteSentenceExerciseData {
  sentences: CompleteSentenceSentence[];
}

// ============================================================
// FLIPCARD-QUIZ EXERCISE
// ============================================================
export interface FlipCardQuizCard {
  id: string;
  front: {
    icon?: string;       // Nome Lucide (Brain, Zap, Target...)
    label: string;       // "Conceito 1", "Desafio 3"
    color?: string;      // Acento: 'cyan' | 'emerald' | 'purple' | 'amber'
  };
  back: {
    text: string;        // Pergunta ou conceito revelado
    image?: string;      // URL opcional
  };
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
}

export interface FlipCardQuizExerciseData {
  cards: FlipCardQuizCard[];
  feedback?: {
    perfect: string;
    good: string;
    needsReview: string;
  };
}

// ============================================================
// TIMED-QUIZ EXERCISE
// ============================================================
export interface TimedQuizQuestion {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
  timeOverride?: number;
}

export interface TimedQuizExerciseData {
  timePerQuestion: number;
  bonusPerSecondLeft: number;
  timeoutPenalty: 'skip' | 'wrong';
  visualTheme: 'cyber' | 'minimal';
  questions: TimedQuizQuestion[];
  feedback?: {
    perfect: string;
    good: string;
    needsReview: string;
    timeBonus: string;
  };
}

// ============================================================
// DISCRIMINATED UNION - GARANTIA DE TIPO CORRETO
// ============================================================
export type ExerciseConfigTyped = 
  | { 
      id: string;
      type: 'drag-drop';
      title: string;
      instruction: string;
      data: DragDropExerciseData;
      passingScore?: number;
      maxAttempts?: number;
    }
  | { 
      id: string;
      type: 'fill-in-blanks';
      title: string;
      instruction: string;
      data: FillInBlanksExerciseData;
      passingScore?: number;
      maxAttempts?: number;
    }
  | { 
      id: string;
      type: 'scenario-selection';
      title: string;
      instruction: string;
      data: ScenarioSelectionExerciseData;
      passingScore?: number;
      maxAttempts?: number;
    }
  | { 
      id: string;
      type: 'true-false';
      title: string;
      instruction: string;
      data: TrueFalseExerciseData;
      passingScore?: number;
      maxAttempts?: number;
    }
  | { 
      id: string;
      type: 'platform-match';
      title: string;
      instruction: string;
      data: PlatformMatchExerciseData;
      passingScore?: number;
      maxAttempts?: number;
    }
  | { 
      id: string;
      type: 'data-collection';
      title: string;
      instruction: string;
      data: DataCollectionExerciseData; // ⚠️ OBRIGATÓRIO ter scenario (singular)!
      passingScore?: number;
      maxAttempts?: number;
    }
  | { 
      id: string;
      type: 'complete-sentence';
      title: string;
      instruction: string;
      data: CompleteSentenceExerciseData;
      passingScore?: number;
      maxAttempts?: number;
    }
  | { 
      id: string;
      type: 'multiple-choice';
      title: string;
      instruction: string;
      data: MultipleChoiceExerciseData;
      passingScore?: number;
      maxAttempts?: number;
    }
  | { 
      id: string;
      type: 'flipcard-quiz';
      title: string;
      instruction: string;
      data: FlipCardQuizExerciseData;
      passingScore?: number;
      maxAttempts?: number;
    }
  | { 
      id: string;
      type: 'timed-quiz';
      title: string;
      instruction: string;
      data: TimedQuizExerciseData;
      passingScore?: number;
      maxAttempts?: number;
    };
