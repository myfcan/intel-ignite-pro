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
  text: string; // Deve conter "_______" onde o usuário preenche
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
// COMPLETE-SENTENCE EXERCISE
// ============================================================
export interface CompleteSentenceSentence {
  id: string;
  text: string; // Texto com blank
  correctAnswers: string[];
}

export interface CompleteSentenceExerciseData {
  sentences: CompleteSentenceSentence[];
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
    };
