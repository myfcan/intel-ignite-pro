/**
 * V7 Diagnostic Engine - Exports
 * ===============================
 * 
 * Sistema de diagnóstico profundo para aulas V7.
 */

// Types
export * from './types';

// Engine
export { V7DiagnosticEngine, analyzeLesson } from './engine';

// Modules (para uso direto se necessário)
export { analyzeAnchorCrossReferences, normalizeTimestamps, findKeywordGlobally } from './modules/anchorCrossRef';
export { analyzePhaseTiming, calculateAudioCoverage } from './modules/phaseTiming';
export { analyzeMicroVisuals } from './modules/microVisualValidation';
export { analyzeInteractions } from './modules/interactionRequirements';
export { analyzeAudioIntegrity } from './modules/audioIntegrity';
export { analyzeJsonStructure, extractPhasesFromContent } from './modules/jsonStructure';
export { analyzeContentTypes } from './modules/contentTypes';
export { analyzeFeedbackAudios } from './modules/feedbackAudio';
