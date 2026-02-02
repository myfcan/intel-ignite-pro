/**
 * V7 Script Input Types - Formato de entrada para o Pipeline V7-vv
 * 
 * Este arquivo define o formato exato do JSON que o administrador deve fornecer
 * para criar aulas V7 cinematográficas.
 * 
 * @version VV-Definitive
 * @see docs/V7-VV-JSON-MODEL.md
 */

// ============================================================================
// TIPOS DE CENA
// ============================================================================

/**
 * Tipos de cena suportados no INPUT do Pipeline V7-v2
 * 
 * CONTRATO CONGELADO v1.0:
 * - 'cta' é visual.type, NÃO scene.type
 * - Para criar CTA: use scene.type="narrative" + visual.type="cta"
 * - secret-reveal e gamification são mapeados para phase.type persistível
 */
export type V7SceneType = 
  | 'dramatic'      // Número/estatística impactante
  | 'narrative'     // Texto narrativo com items
  | 'comparison'    // Split-screen lado a lado
  | 'interaction'   // Quiz de múltipla escolha
  | 'playground'    // Comparação prompt amador vs pro
  | 'revelation'    // Revelação letra por letra (PERFEITO)
  | 'secret-reveal' // Revelação com áudio próprio (mapeia para 'revelation')
  | 'gamification'; // Resultado final com métricas (mapeia para 'narrative')

/**
 * Tipos de visual suportados
 */
export type V7VisualType =
  | 'number-reveal'   // Número grande com animação
  | 'text-reveal'     // Texto progressivo
  | 'split-screen'    // Lado a lado
  | 'letter-reveal'   // Letra por letra
  | 'cards-reveal'    // Cards em sequência
  | 'quiz'            // Tela de quiz
  | 'quiz-feedback'   // Feedback do quiz
  | 'playground'      // Comparação de prompts
  | 'result'          // Resultado/gamificação
  | 'cta';            // Call-to-action

/**
 * Mood para estilização visual
 */
export type V7Mood = 'danger' | 'success' | 'warning' | 'neutral' | 'dramatic';

// ============================================================================
// CONTEÚDO VISUAL
// ============================================================================

export interface V7NumberRevealContent {
  hookQuestion?: string;
  number: string;
  secondaryNumber?: string;
  subtitle?: string;
  mood?: V7Mood;
  countUp?: boolean;
}

export interface V7TextRevealContent {
  title?: string;
  mainText?: string;
  items?: Array<{
    icon?: string;
    text: string;
  }>;
  highlightWord?: string;
}

export interface V7SplitScreenContent {
  left: {
    label: string;
    mood: 'danger' | 'success' | 'warning';
    items: string[];
    emoji?: string;
  };
  right: {
    label: string;
    mood: 'danger' | 'success' | 'warning';
    items: string[];
    emoji?: string;
  };
}

export interface V7LetterRevealContent {
  word: string;
  letters: Array<{
    letter: string;
    meaning: string;
    subtitle?: string;
  }>;
  finalStamp?: string;
}

export interface V7QuizContent {
  question: string;
  mood?: V7Mood;
}

export interface V7ResultContent {
  emoji?: string;
  title: string;
  message?: string;
  metrics?: Array<{
    label: string;
    value: string;
    isHighlight?: boolean;
  }>;
  ctaText?: string;
}

export interface V7PlaygroundContent {
  title: string;
  subtitle?: string;
  instruction?: string;
}

export interface V7CardsContent {
  title: string;
  subtitle?: string;
  cards: Array<{
    id: string;
    text: string;
    icon?: string;
  }>;
}

// ============================================================================
// INTERAÇÕES
// ============================================================================

export interface V7QuizFeedback {
  title: string;
  subtitle: string;
  mood: 'success' | 'warning' | 'danger' | 'neutral';
  /** Texto narrado como feedback - gera áudio específico */
  narration?: string;
}

export interface V7QuizOption {
  id: string;
  text: string;
  category?: 'good' | 'bad';
  emoji?: string;
  feedback?: V7QuizFeedback;
}

export interface V7QuizInteraction {
  type: 'quiz';
  options: V7QuizOption[];
  correctFeedback?: string;
  incorrectFeedback?: string;
}

export interface V7PlaygroundResult {
  title: string;
  content: string;
  score: number;
  verdict: 'bad' | 'good' | 'excellent';
}

export interface V7PlaygroundInteraction {
  type: 'playground';
  amateurPrompt: string;
  professionalPrompt: string;
  amateurResult: V7PlaygroundResult;
  professionalResult: V7PlaygroundResult;
  userChallenge?: {
    instruction: string;
    challengePrompt: string;
    hints: string[];
  };
}

export interface V7CTAInteraction {
  type: 'cta-button';
  buttonText: string;
  action: 'next-phase' | 'complete';
}

export type V7Interaction = V7QuizInteraction | V7PlaygroundInteraction | V7CTAInteraction;

// ============================================================================
// MICRO-VISUAIS
// ============================================================================

export interface V7MicroVisualInput {
  id: string;
  /** Palavra-chave que dispara o micro-visual */
  anchorText: string;
  type: 'icon' | 'text' | 'number' | 'image' | 'badge' | 'highlight';
  content: {
    value?: string;
    icon?: string;
    color?: string;
    animation?: 'fade' | 'pop' | 'slide' | 'bounce';
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  };
  /** Duração em segundos */
  duration: number;
}

// ============================================================================
// EFEITOS VISUAIS
// ============================================================================

export interface V7VisualEffects {
  mood?: V7Mood;
  particles?: boolean | 'confetti' | 'sparks' | 'ember' | 'stars';
  glow?: boolean;
  shake?: boolean;
  vignette?: boolean;
}

// ============================================================================
// VISUAL COMPLETO
// ============================================================================

export interface V7Visual {
  type: V7VisualType;
  content: 
    | V7NumberRevealContent 
    | V7TextRevealContent 
    | V7SplitScreenContent 
    | V7LetterRevealContent 
    | V7QuizContent 
    | V7ResultContent
    | V7PlaygroundContent
    | V7CardsContent
    | Record<string, unknown>;
  effects?: V7VisualEffects;
  microVisuals?: V7MicroVisualInput[];
}

// ============================================================================
// CENA
// ============================================================================

export interface V7AnchorText {
  /** Palavra/frase que pausa o áudio - OBRIGATÓRIO para fases interativas */
  pauseAt?: string;
  /** Palavra/frase que transiciona para próxima fase */
  transitionAt?: string;
}

export interface V7SceneInput {
  /** ID único da cena */
  id: string;
  /** Título descritivo */
  title: string;
  /** Tipo da cena */
  type: V7SceneType;
  /** Texto narrado pela IA */
  narration: string;
  /** Configuração de sincronização */
  anchorText?: V7AnchorText;
  /** Configuração visual */
  visual: V7Visual;
  /** Configuração de interação (para tipos interativos) */
  interaction?: V7Interaction;
}

// ============================================================================
// INPUT PRINCIPAL
// ============================================================================

/**
 * V7 Script Input - Formato completo de entrada para o Pipeline V7-vv
 */
export interface V7ScriptInput {
  // Metadados
  title: string;
  subtitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  learningObjectives: string[];
  
  // Configurações de áudio
  voice_id?: string;
  generate_audio?: boolean;
  fail_on_audio_error?: boolean;
  
  // Trail/Order (para posicionamento na trilha)
  trail_id?: string;
  order_index?: number;
  
  // Cenas
  scenes: V7SceneInput[];
}

// ============================================================================
// VALIDAÇÃO
// ============================================================================

export interface V7ValidationError {
  scene: string;
  field: string;
  message: string;
}

/**
 * Valida se o tipo de cena requer anchorText.pauseAt
 */
export function requiresAnchorPause(sceneType: V7SceneType): boolean {
  return ['interaction', 'playground', 'secret-reveal', 'cta'].includes(sceneType);
}

/**
 * Valida um V7ScriptInput
 */
export function validateV7ScriptInput(input: V7ScriptInput): V7ValidationError[] {
  const errors: V7ValidationError[] = [];

  // Validar título
  if (!input.title?.trim()) {
    errors.push({ scene: 'root', field: 'title', message: 'Título é obrigatório' });
  }

  // Validar cenas
  if (!input.scenes || input.scenes.length === 0) {
    errors.push({ scene: 'root', field: 'scenes', message: 'Pelo menos uma cena é obrigatória' });
    return errors;
  }

  // Validar cada cena
  input.scenes.forEach((scene, index) => {
    const sceneId = scene.id || `scene-${index + 1}`;

    // Narração obrigatória
    if (!scene.narration?.trim()) {
      errors.push({
        scene: sceneId,
        field: 'narration',
        message: `Cena "${sceneId}" não tem narração.`
      });
    }

    // Visual obrigatório
    if (!scene.visual) {
      errors.push({
        scene: sceneId,
        field: 'visual',
        message: `Cena "${sceneId}" não tem configuração visual.`
      });
    }

    // AnchorText obrigatório para cenas interativas
    if (requiresAnchorPause(scene.type) && !scene.anchorText?.pauseAt) {
      errors.push({
        scene: sceneId,
        field: 'anchorText.pauseAt',
        message: `Cena interativa "${sceneId}" DEVE ter anchorText.pauseAt definido.`
      });
    }

    // Validar que pauseAt existe na narração
    if (scene.anchorText?.pauseAt && scene.narration) {
      const keyword = scene.anchorText.pauseAt.toLowerCase();
      const narration = scene.narration.toLowerCase();
      if (!narration.includes(keyword)) {
        errors.push({
          scene: sceneId,
          field: 'anchorText.pauseAt',
          message: `A palavra-chave "${scene.anchorText.pauseAt}" não existe na narração da cena "${sceneId}".`
        });
      }
    }

    // Validar quiz tem options
    if (scene.type === 'interaction' && scene.interaction?.type === 'quiz') {
      const quiz = scene.interaction as V7QuizInteraction;
      if (!quiz.options || quiz.options.length === 0) {
        errors.push({
          scene: sceneId,
          field: 'interaction.options',
          message: `Quiz "${sceneId}" deve ter pelo menos uma opção.`
        });
      }
    }
  });

  return errors;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Conta o total de palavras na narração (para estimar duração)
 */
export function countNarrationWords(input: V7ScriptInput): number {
  return input.scenes.reduce((total, scene) => {
    return total + (scene.narration?.split(/\s+/).length || 0);
  }, 0);
}

/**
 * Estima duração da aula em segundos
 * ~100 palavras = 60 segundos
 */
export function estimateDuration(input: V7ScriptInput): number {
  const words = countNarrationWords(input);
  const narrationTime = (words / 100) * 60;
  
  // Adiciona tempo para interações
  const interactionTime = input.scenes.reduce((total, scene) => {
    if (scene.type === 'interaction') return total + 45;
    if (scene.type === 'playground') return total + 60;
    return total;
  }, 0);
  
  return Math.round(narrationTime + interactionTime);
}
