// V7 Cinematic Phases - Export all phase components

// Phase Contracts (standardized types)
export * from '../../v7-phase-contracts';

// Controller
export { default as V7PhaseController, usePhaseController } from './V7PhaseController';
export type { V7Phase, V7Scene, V7LessonScript } from './V7PhaseController';

// Phase Components
export { default as V7PhaseDramatic } from './V7PhaseDramatic';
export { default as V7PhaseNarrative } from './V7PhaseNarrative';
export { default as V7PhaseQuiz } from './V7PhaseQuiz';
export { default as V7PhasePlayground } from './V7PhasePlayground';
export { default as V7PhaseGamification } from './V7PhaseGamification';
export { default as V7PhaseLoading } from './V7PhaseLoading';
export { default as V7PhaseCTA } from './V7PhaseCTA';
export { default as V7PhaseSecretReveal } from './V7PhaseSecretReveal';
export { default as V7PhaseMethodReveal } from './V7PhaseMethodReveal';

// ✅ V7-vv: Novos componentes de fluxo final
export { default as V7LessonCompleteCard } from './V7LessonCompleteCard';
export { default as V7PerfeitoDragDrop } from './V7PerfeitoDragDrop';
export { default as V7ExerciseResultCard } from './V7ExerciseResultCard';
export { default as V7RewardsModal } from './V7RewardsModal';
export { default as V7UserChallengeInput } from './V7UserChallengeInput';
