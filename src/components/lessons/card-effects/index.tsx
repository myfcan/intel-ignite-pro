'use client';

import React from 'react';

// ============================================================
// AULA 1 - Fundamentos da Inteligência Artificial
// ============================================================
import { CardEffectHypeDetector } from './CardEffectHypeDetector';
import { CardEffectGameChangers } from './CardEffectGameChangers';
import { CardEffectTrendVsChange } from './CardEffectTrendVsChange';
import { CardEffectPatternVsMagic } from './CardEffectPatternVsMagic';
import { CardEffectDataLearner } from './CardEffectDataLearner';
import { CardEffectPatternMachine } from './CardEffectPatternMachine';
import { CardEffectEverydayAi } from './CardEffectEverydayAi';
import { CardEffectRecommendationEngine } from './CardEffectRecommendationEngine';
import { CardEffectStrategicShift } from './CardEffectStrategicShift';
import { CardEffectGenaiIntro } from './CardEffectGenaiIntro';
import { CardEffectMediaGenerator } from './CardEffectMediaGenerator';
import { CardEffectRecombinationEngine } from './CardEffectRecombinationEngine';
import { CardEffectAiStrengths } from './CardEffectAiStrengths';
import { CardEffectAiWeaknesses } from './CardEffectAiWeaknesses';
import { CardEffectHumanDirector } from './CardEffectHumanDirector';

// ============================================================
// AULA 2 - O Furacão da I.A.
// ============================================================
import { CardEffectAppBuilder } from './CardEffectAppBuilder';
import { CardEffectDigitalEmployee } from './CardEffectDigitalEmployee';
import { CardEffectBusinessDesign } from './CardEffectBusinessDesign';
import { CardEffectContentCreator } from './CardEffectContentCreator';
import { CardEffectContentMachine } from './CardEffectContentMachine';
import { CardEffectVideoStudio } from './CardEffectVideoStudio';
import { CardEffectAutomation } from './CardEffectAutomation';
import { CardEffectPresenceAmplifier } from './CardEffectPresenceAmplifier';
import { CardEffectStrategicAdvisor } from './CardEffectStrategicAdvisor';
import { CardEffectNewProfessions } from './CardEffectNewProfessions';
import { CardEffectPlaygroundChat } from './CardEffectPlaygroundChat';
import { CardEffectClosingMessage } from './CardEffectClosingMessage';

// ============================================================
// AULA 3 - História da Maria
// ============================================================
import { CardEffectProfileCard } from './CardEffectProfileCard';
import { CardEffectProblemIdentifier } from './CardEffectProblemIdentifier';
import { CardEffectStoryRevealer } from './CardEffectStoryRevealer';
import { CardEffectStatsComparison } from './CardEffectStatsComparison';
import { CardEffectTransformationViewer } from './CardEffectTransformationViewer';
import { CardEffectAmplifierConcept } from './CardEffectAmplifierConcept';
import { CardEffectGenericDetector } from './CardEffectGenericDetector';
import { CardEffectPromptMagic } from './CardEffectPromptMagic';
import { CardEffectEmotionConnector } from './CardEffectEmotionConnector';
import { CardEffectObjectTransformer } from './CardEffectObjectTransformer';
import { CardEffectPromptBuilder } from './CardEffectPromptBuilder';
import { CardEffectVariationMultiplier } from './CardEffectVariationMultiplier';
import { CardEffectTimeSaver } from './CardEffectTimeSaver';
import { CardEffectNextSteps } from './CardEffectNextSteps';

// ============================================================
// AULA 4 - Oportunidades Reais com I.A.
// ============================================================
import { CardEffectHiddenMarket } from './CardEffectHiddenMarket';
import { CardEffectStabilityMap } from './CardEffectStabilityMap';
import { CardEffectNeedDetector } from './CardEffectNeedDetector';
import { CardEffectBridgeBuilder } from './CardEffectBridgeBuilder';
import { CardEffectLevelSystem } from './CardEffectLevelSystem';
import { CardEffectValueCalculator } from './CardEffectValueCalculator';
import { CardEffectReferenceBuilder } from './CardEffectReferenceBuilder';
import { CardEffectCaseViewer } from './CardEffectCaseViewer';
import { CardEffectProfitCalculator } from './CardEffectProfitCalculator';
import { CardEffectOpportunityIdentifier } from './CardEffectOpportunityIdentifier';
import { CardEffectProblemSolver } from './CardEffectProblemSolver';
import { CardEffectTemplateGallery } from './CardEffectTemplateGallery';
import { CardEffectPlaygroundCreator } from './CardEffectPlaygroundCreator';
import { CardEffectTimelineTracker } from './CardEffectTimelineTracker';
import { CardEffectGrowthVisualizer } from './CardEffectGrowthVisualizer';
import { CardEffectSuccessRoadmap } from './CardEffectSuccessRoadmap';

// ============================================================
// AULA 5 - O Dia em que a Padaria Mudou de Nível
// ============================================================
import { CardEffectBakeryTransformation } from './CardEffectBakeryTransformation';
import { CardEffectTeenageDesigner } from './CardEffectTeenageDesigner';
import { CardEffectFirstMoverAdvantage } from './CardEffectFirstMoverAdvantage';
import { CardEffectThreePersonaTypes } from './CardEffectThreePersonaTypes';
import { CardEffectFearVsAction } from './CardEffectFearVsAction';
import { CardEffectSilentDoer } from './CardEffectSilentDoer';
import { CardEffectRealWorldUses } from './CardEffectRealWorldUses';
import { CardEffectResumeBuilder } from './CardEffectResumeBuilder';
import { CardEffectSpreadsheetMaster } from './CardEffectSpreadsheetMaster';
import { CardEffectScriptWriter } from './CardEffectScriptWriter';
import { CardEffectYourReality } from './CardEffectYourReality';
import { CardEffectHelpNetwork } from './CardEffectHelpNetwork';
import { CardEffectSmallExperiment } from './CardEffectSmallExperiment';
import { CardEffectHistoryParallel } from './CardEffectHistoryParallel';
import { CardEffectBalancedApproach } from './CardEffectBalancedApproach';
import { CardEffectPracticePreview } from './CardEffectPracticePreview';

// ============================================================
// AULA 6 - A I.A. já substituiu alguém que você conhece
// ============================================================
import { CardEffectWakeUpCall } from './CardEffectWakeUpCall';
import { CardEffectNewPlayers } from './CardEffectNewPlayers';
import { CardEffectTakePosition } from './CardEffectTakePosition';
import { CardEffectJobShifter } from './CardEffectJobShifter';
import { CardEffectVulnerabilityAlert } from './CardEffectVulnerabilityAlert';
import { CardEffectValueBooster } from './CardEffectValueBooster';
import { CardEffectBlankPageBreaker } from './CardEffectBlankPageBreaker';
import { CardEffectTemplateStarter } from './CardEffectTemplateStarter';
import { CardEffectShortcutEngine } from './CardEffectShortcutEngine';
import { CardEffectRealProblemLoader } from './CardEffectRealProblemLoader';
import { CardEffectContextMapper } from './CardEffectContextMapper';
import { CardEffectSpecificityCoach } from './CardEffectSpecificityCoach';
import { CardEffectImpactSummary } from './CardEffectImpactSummary';
import { CardEffectControlShift } from './CardEffectControlShift';
import { CardEffectGuidingQuestion } from './CardEffectGuidingQuestion';

// Re-exportar componentes - AULA 1 (Fundamentos)
export { CardEffectHypeDetector } from './CardEffectHypeDetector';
export { CardEffectGameChangers } from './CardEffectGameChangers';
export { CardEffectTrendVsChange } from './CardEffectTrendVsChange';
export { CardEffectPatternVsMagic } from './CardEffectPatternVsMagic';
export { CardEffectDataLearner } from './CardEffectDataLearner';
export { CardEffectPatternMachine } from './CardEffectPatternMachine';
export { CardEffectEverydayAi } from './CardEffectEverydayAi';
export { CardEffectRecommendationEngine } from './CardEffectRecommendationEngine';
export { CardEffectStrategicShift } from './CardEffectStrategicShift';
export { CardEffectGenaiIntro } from './CardEffectGenaiIntro';
export { CardEffectMediaGenerator } from './CardEffectMediaGenerator';
export { CardEffectRecombinationEngine } from './CardEffectRecombinationEngine';
export { CardEffectAiStrengths } from './CardEffectAiStrengths';
export { CardEffectAiWeaknesses } from './CardEffectAiWeaknesses';
export { CardEffectHumanDirector } from './CardEffectHumanDirector';

// Re-exportar componentes - AULA 2 (Furacão)
export { CardEffectAppBuilder } from './CardEffectAppBuilder';
export { CardEffectDigitalEmployee } from './CardEffectDigitalEmployee';
export { CardEffectBusinessDesign } from './CardEffectBusinessDesign';
export { CardEffectContentCreator } from './CardEffectContentCreator';
export { CardEffectContentMachine } from './CardEffectContentMachine';
export { CardEffectVideoStudio } from './CardEffectVideoStudio';
export { CardEffectAutomation } from './CardEffectAutomation';
export { CardEffectPresenceAmplifier } from './CardEffectPresenceAmplifier';
export { CardEffectStrategicAdvisor } from './CardEffectStrategicAdvisor';
export { CardEffectNewProfessions } from './CardEffectNewProfessions';
export { CardEffectPlaygroundChat } from './CardEffectPlaygroundChat';
export { CardEffectClosingMessage } from './CardEffectClosingMessage';

// Re-exportar componentes - AULA 3 (História Maria)
export { CardEffectProfileCard } from './CardEffectProfileCard';
export { CardEffectProblemIdentifier } from './CardEffectProblemIdentifier';
export { CardEffectStoryRevealer } from './CardEffectStoryRevealer';
export { CardEffectStatsComparison } from './CardEffectStatsComparison';
export { CardEffectTransformationViewer } from './CardEffectTransformationViewer';
export { CardEffectAmplifierConcept } from './CardEffectAmplifierConcept';
export { CardEffectGenericDetector } from './CardEffectGenericDetector';
export { CardEffectPromptMagic } from './CardEffectPromptMagic';
export { CardEffectEmotionConnector } from './CardEffectEmotionConnector';
export { CardEffectObjectTransformer } from './CardEffectObjectTransformer';
export { CardEffectPromptBuilder } from './CardEffectPromptBuilder';
export { CardEffectVariationMultiplier } from './CardEffectVariationMultiplier';
export { CardEffectTimeSaver } from './CardEffectTimeSaver';
export { CardEffectNextSteps } from './CardEffectNextSteps';

// Re-exportar componentes - AULA 4 (Oportunidades)
export { CardEffectHiddenMarket } from './CardEffectHiddenMarket';
export { CardEffectNeedDetector } from './CardEffectNeedDetector';
export { CardEffectBridgeBuilder } from './CardEffectBridgeBuilder';
export { CardEffectLevelSystem } from './CardEffectLevelSystem';
export { CardEffectValueCalculator } from './CardEffectValueCalculator';
export { CardEffectReferenceBuilder } from './CardEffectReferenceBuilder';
export { CardEffectCaseViewer } from './CardEffectCaseViewer';
export { CardEffectProfitCalculator } from './CardEffectProfitCalculator';
export { CardEffectOpportunityIdentifier } from './CardEffectOpportunityIdentifier';
export { CardEffectProblemSolver } from './CardEffectProblemSolver';
export { CardEffectTemplateGallery } from './CardEffectTemplateGallery';
export { CardEffectPlaygroundCreator } from './CardEffectPlaygroundCreator';
export { CardEffectTimelineTracker } from './CardEffectTimelineTracker';
export { CardEffectGrowthVisualizer } from './CardEffectGrowthVisualizer';
export { CardEffectSuccessRoadmap } from './CardEffectSuccessRoadmap';
export { CardEffectStabilityMap } from './CardEffectStabilityMap';

// Re-exportar componentes - AULA 5 (Padaria)
export { CardEffectBakeryTransformation } from './CardEffectBakeryTransformation';
export { CardEffectTeenageDesigner } from './CardEffectTeenageDesigner';
export { CardEffectFirstMoverAdvantage } from './CardEffectFirstMoverAdvantage';
export { CardEffectThreePersonaTypes } from './CardEffectThreePersonaTypes';
export { CardEffectFearVsAction } from './CardEffectFearVsAction';
export { CardEffectSilentDoer } from './CardEffectSilentDoer';
export { CardEffectRealWorldUses } from './CardEffectRealWorldUses';
export { CardEffectResumeBuilder } from './CardEffectResumeBuilder';
export { CardEffectSpreadsheetMaster } from './CardEffectSpreadsheetMaster';
export { CardEffectScriptWriter } from './CardEffectScriptWriter';
export { CardEffectYourReality } from './CardEffectYourReality';
export { CardEffectHelpNetwork } from './CardEffectHelpNetwork';
export { CardEffectSmallExperiment } from './CardEffectSmallExperiment';
export { CardEffectHistoryParallel } from './CardEffectHistoryParallel';
export { CardEffectBalancedApproach } from './CardEffectBalancedApproach';
export { CardEffectPracticePreview } from './CardEffectPracticePreview';

// Re-exportar componentes - AULA 6 (Substituição)
export { CardEffectWakeUpCall } from './CardEffectWakeUpCall';
export { CardEffectNewPlayers } from './CardEffectNewPlayers';
export { CardEffectTakePosition } from './CardEffectTakePosition';
export { CardEffectJobShifter } from './CardEffectJobShifter';
export { CardEffectVulnerabilityAlert } from './CardEffectVulnerabilityAlert';
export { CardEffectValueBooster } from './CardEffectValueBooster';
export { CardEffectBlankPageBreaker } from './CardEffectBlankPageBreaker';
export { CardEffectTemplateStarter } from './CardEffectTemplateStarter';
export { CardEffectShortcutEngine } from './CardEffectShortcutEngine';
export { CardEffectRealProblemLoader } from './CardEffectRealProblemLoader';
export { CardEffectContextMapper } from './CardEffectContextMapper';
export { CardEffectSpecificityCoach } from './CardEffectSpecificityCoach';
export { CardEffectImpactSummary } from './CardEffectImpactSummary';
export { CardEffectControlShift } from './CardEffectControlShift';
export { CardEffectGuidingQuestion } from './CardEffectGuidingQuestion';

export type CardEffectType =
  // AULA 1 - Fundamentos
  | 'hype-detector' | 'game-changers' | 'trend-vs-change' | 'pattern-vs-magic'
  | 'data-learner' | 'pattern-machine' | 'everyday-ai' | 'recommendation-engine'
  | 'strategic-shift' | 'genai-intro' | 'media-generator' | 'recombination-engine'
  | 'ai-strengths' | 'ai-weaknesses' | 'human-director'
  // AULA 2 - Furacão
  | 'app-builder' | 'digital-employee' | 'business-design' | 'content-creator'
  | 'content-machine' | 'video-studio' | 'automation' | 'presence-amplifier'
  | 'strategic-advisor' | 'new-professions' | 'playground-chat' | 'closing-message'
  // AULA 3 - História Maria
  | 'profile-card' | 'problem-identifier' | 'story-revealer' | 'stats-comparison'
  | 'transformation-viewer' | 'amplifier-concept' | 'generic-detector' | 'prompt-magic'
  | 'emotion-connector' | 'object-transformer' | 'prompt-builder' | 'variation-multiplier'
  | 'time-saver' | 'next-steps'
  // AULA 4 - Oportunidades
  | 'hidden-market' | 'need-detector' | 'bridge-builder' | 'level-system'
  | 'value-calculator' | 'reference-builder' | 'case-viewer' | 'profit-calculator'
  | 'opportunity-identifier' | 'problem-solver' | 'template-gallery' | 'playground-creator'
  | 'timeline-tracker' | 'growth-visualizer' | 'success-roadmap' | 'stability-map'
  // AULA 5 - Padaria
  | 'bakery-transformation' | 'teenage-designer' | 'first-mover-advantage'
  | 'three-persona-types' | 'fear-vs-action' | 'silent-doer'
  | 'real-world-uses' | 'resume-builder' | 'spreadsheet-master' | 'script-writer'
  | 'your-reality' | 'help-network' | 'small-experiment'
  | 'history-parallel' | 'balanced-approach' | 'practice-preview'
  // AULA 6 - Substituição
  | 'wake-up-call' | 'new-players' | 'take-position' | 'job-shifter'
  | 'vulnerability-alert' | 'value-booster' | 'blank-page-breaker' | 'template-starter'
  | 'shortcut-engine' | 'real-problem-loader' | 'context-mapper' | 'specificity-coach'
  | 'impact-summary' | 'control-shift' | 'guiding-question';

export interface CardEffectProps {
  isActive?: boolean;
  duration?: number; // Duração total em segundos (para animações proporcionais)
}

const CARD_EFFECT_COMPONENTS: Record<CardEffectType, React.FC<CardEffectProps>> = {
  // AULA 1 - Fundamentos
  'hype-detector': CardEffectHypeDetector,
  'game-changers': CardEffectGameChangers,
  'trend-vs-change': CardEffectTrendVsChange,
  'pattern-vs-magic': CardEffectPatternVsMagic,
  'data-learner': CardEffectDataLearner,
  'pattern-machine': CardEffectPatternMachine,
  'everyday-ai': CardEffectEverydayAi,
  'recommendation-engine': CardEffectRecommendationEngine,
  'strategic-shift': CardEffectStrategicShift,
  'genai-intro': CardEffectGenaiIntro,
  'media-generator': CardEffectMediaGenerator,
  'recombination-engine': CardEffectRecombinationEngine,
  'ai-strengths': CardEffectAiStrengths,
  'ai-weaknesses': CardEffectAiWeaknesses,
  'human-director': CardEffectHumanDirector,
  // AULA 2 - Furacão
  'app-builder': CardEffectAppBuilder,
  'digital-employee': CardEffectDigitalEmployee,
  'business-design': CardEffectBusinessDesign,
  'content-creator': CardEffectContentCreator,
  'content-machine': CardEffectContentMachine,
  'video-studio': CardEffectVideoStudio,
  'automation': CardEffectAutomation,
  'presence-amplifier': CardEffectPresenceAmplifier,
  'strategic-advisor': CardEffectStrategicAdvisor,
  'new-professions': CardEffectNewProfessions,
  'playground-chat': CardEffectPlaygroundChat,
  'closing-message': CardEffectClosingMessage,
  // AULA 3 - História Maria
  'profile-card': CardEffectProfileCard,
  'problem-identifier': CardEffectProblemIdentifier,
  'story-revealer': CardEffectStoryRevealer,
  'stats-comparison': CardEffectStatsComparison,
  'transformation-viewer': CardEffectTransformationViewer,
  'amplifier-concept': CardEffectAmplifierConcept,
  'generic-detector': CardEffectGenericDetector,
  'prompt-magic': CardEffectPromptMagic,
  'emotion-connector': CardEffectEmotionConnector,
  'object-transformer': CardEffectObjectTransformer,
  'prompt-builder': CardEffectPromptBuilder,
  'variation-multiplier': CardEffectVariationMultiplier,
  'time-saver': CardEffectTimeSaver,
  'next-steps': CardEffectNextSteps,
  // AULA 4 - Oportunidades
  'hidden-market': CardEffectHiddenMarket,
  'need-detector': CardEffectNeedDetector,
  'bridge-builder': CardEffectBridgeBuilder,
  'level-system': CardEffectLevelSystem,
  'value-calculator': CardEffectValueCalculator,
  'reference-builder': CardEffectReferenceBuilder,
  'case-viewer': CardEffectCaseViewer,
  'profit-calculator': CardEffectProfitCalculator,
  'opportunity-identifier': CardEffectOpportunityIdentifier,
  'problem-solver': CardEffectProblemSolver,
  'template-gallery': CardEffectTemplateGallery,
  'playground-creator': CardEffectPlaygroundCreator,
  'timeline-tracker': CardEffectTimelineTracker,
  'growth-visualizer': CardEffectGrowthVisualizer,
  'success-roadmap': CardEffectSuccessRoadmap,
  'stability-map': CardEffectStabilityMap,
  // AULA 5 - Padaria
  'bakery-transformation': CardEffectBakeryTransformation,
  'teenage-designer': CardEffectTeenageDesigner,
  'first-mover-advantage': CardEffectFirstMoverAdvantage,
  'three-persona-types': CardEffectThreePersonaTypes,
  'fear-vs-action': CardEffectFearVsAction,
  'silent-doer': CardEffectSilentDoer,
  'real-world-uses': CardEffectRealWorldUses,
  'resume-builder': CardEffectResumeBuilder,
  'spreadsheet-master': CardEffectSpreadsheetMaster,
  'script-writer': CardEffectScriptWriter,
  'your-reality': CardEffectYourReality,
  'help-network': CardEffectHelpNetwork,
  'small-experiment': CardEffectSmallExperiment,
  'history-parallel': CardEffectHistoryParallel,
  'balanced-approach': CardEffectBalancedApproach,
  'practice-preview': CardEffectPracticePreview,
  // AULA 6 - Substituição
  'wake-up-call': CardEffectWakeUpCall,
  'new-players': CardEffectNewPlayers,
  'take-position': CardEffectTakePosition,
  'job-shifter': CardEffectJobShifter,
  'vulnerability-alert': CardEffectVulnerabilityAlert,
  'value-booster': CardEffectValueBooster,
  'blank-page-breaker': CardEffectBlankPageBreaker,
  'template-starter': CardEffectTemplateStarter,
  'shortcut-engine': CardEffectShortcutEngine,
  'real-problem-loader': CardEffectRealProblemLoader,
  'context-mapper': CardEffectContextMapper,
  'specificity-coach': CardEffectSpecificityCoach,
  'impact-summary': CardEffectImpactSummary,
  'control-shift': CardEffectControlShift,
  'guiding-question': CardEffectGuidingQuestion,
};

export const CARD_EFFECT_LABELS: Record<CardEffectType, string> = {
  // AULA 1 - Fundamentos
  'hype-detector': 'Detector de Hype', 'game-changers': 'Mudanças Revolucionárias',
  'trend-vs-change': 'Tendência vs Mudança', 'pattern-vs-magic': 'Padrão vs Mágica',
  'data-learner': 'Aprendizado de Dados', 'pattern-machine': 'Máquina de Padrões',
  'everyday-ai': 'IA no Dia a Dia', 'recommendation-engine': 'Motor de Recomendações',
  'strategic-shift': 'Mudança Estratégica', 'genai-intro': 'Introdução à IA Generativa',
  'media-generator': 'Gerador de Mídia', 'recombination-engine': 'Motor de Recombinação',
  'ai-strengths': 'Pontos Fortes da IA', 'ai-weaknesses': 'Limitações da IA',
  'human-director': 'Diretor Humano',
  // AULA 2 - Furacão
  'app-builder': 'IA Construindo App', 'digital-employee': 'Funcionário Digital',
  'business-design': 'Design de Negócio', 'content-creator': 'Coautor de Livros/Cursos',
  'content-machine': 'Máquina de Conteúdo', 'video-studio': 'Estúdio de Vídeo',
  'automation': 'Fluxos de Automação', 'presence-amplifier': 'Amplificador de Presença',
  'strategic-advisor': 'Conselho Estratégico', 'new-professions': 'Novas Profissões',
  'playground-chat': 'Playground / Chat IA', 'closing-message': 'Mensagem de Encerramento',
  // AULA 3 - História Maria
  'profile-card': 'Card de Perfil', 'problem-identifier': 'Identificador de Problema',
  'story-revealer': 'Revelador de História', 'stats-comparison': 'Comparação de Stats',
  'transformation-viewer': 'Visualizador de Transformação', 'amplifier-concept': 'Conceito Amplificador',
  'generic-detector': 'Detector de Genérico', 'prompt-magic': 'Mágica do Prompt',
  'emotion-connector': 'Conector Emocional', 'object-transformer': 'Transformador de Objeto',
  'prompt-builder': 'Construtor de Prompt', 'variation-multiplier': 'Multiplicador de Variações',
  'time-saver': 'Economia de Tempo', 'next-steps': 'Próximos Passos',
  // AULA 4 - Oportunidades
  'hidden-market': 'Mercado Oculto', 'need-detector': 'Detector de Necessidades',
  'bridge-builder': 'Construtor de Pontes', 'level-system': 'Sistema de Níveis',
  'value-calculator': 'Calculadora de Valor', 'reference-builder': 'Construtor de Autoridade',
  'case-viewer': 'Visualizador de Casos', 'profit-calculator': 'Calculadora de Ganhos',
  'opportunity-identifier': 'Identificador de Oportunidades', 'problem-solver': 'Solucionador',
  'template-gallery': 'Galeria de Templates', 'playground-creator': 'Criador de Soluções',
  'timeline-tracker': 'Linha do Tempo', 'growth-visualizer': 'Visualizador de Crescimento',
  'success-roadmap': 'Mapa do Sucesso', 'stability-map': 'Mapa da Estabilidade',
  // AULA 5 - Padaria
  'bakery-transformation': 'Transformação da Padaria', 'teenage-designer': 'Designer Adolescente',
  'first-mover-advantage': 'Vantagem do Pioneiro', 'three-persona-types': 'Três Tipos de Pessoa',
  'fear-vs-action': 'Medo vs Ação', 'silent-doer': 'Fazedor Silencioso',
  'real-world-uses': 'Usos no Mundo Real', 'resume-builder': 'Construtor de Currículo',
  'spreadsheet-master': 'Mestre das Planilhas', 'script-writer': 'Roteirista de Apoio',
  'your-reality': 'Sua Realidade', 'help-network': 'Rede de Ajuda',
  'small-experiment': 'Pequeno Experimento', 'history-parallel': 'Paralelo Histórico',
  'balanced-approach': 'Abordagem Equilibrada', 'practice-preview': 'Prévia da Prática',
  // AULA 6 - Substituição Silenciosa
  'wake-up-call': 'Chamado de Alerta', 'new-players': 'Novos Jogadores',
  'take-position': 'Tome Posição', 'job-shifter': 'Mudança de Trabalho',
  'vulnerability-alert': 'Alerta de Vulnerabilidade', 'value-booster': 'Amplificador de Valor',
  'blank-page-breaker': 'Quebrador de Página em Branco', 'template-starter': 'Iniciador de Templates',
  'shortcut-engine': 'Motor de Atalhos', 'real-problem-loader': 'Carregador de Problemas Reais',
  'context-mapper': 'Mapeador de Contexto', 'specificity-coach': 'Coach de Especificidade',
  'impact-summary': 'Resumo de Impacto', 'control-shift': 'Mudança de Controle',
  'guiding-question': 'Pergunta Guia',
};

export const CARD_EFFECT_DESCRIPTIONS: Record<CardEffectType, string> = {
  // AULA 1 - Fundamentos
  'hype-detector': 'Radar diferenciando hype de realidade',
  'game-changers': 'Timeline de marcos tecnológicos',
  'trend-vs-change': 'Comparação visual tendência vs mudança',
  'pattern-vs-magic': 'Cérebro digital processando padrões',
  'data-learner': 'Fluxo de dados sendo absorvido',
  'pattern-machine': 'Engrenagens reconhecendo padrões',
  'everyday-ai': 'Cenário doméstico com IA presente',
  'recommendation-engine': 'Interface de recomendações personalizadas',
  'strategic-shift': 'Diagrama de mudança estratégica',
  'genai-intro': 'Portal para IA generativa',
  'media-generator': 'Tela criando imagens e textos',
  'recombination-engine': 'Elementos sendo recombinados',
  'ai-strengths': 'Lista visual de pontos fortes',
  'ai-weaknesses': 'Limitações da IA ilustradas',
  'human-director': 'Humano dirigindo orquestra de IAs',
  // AULA 2 - Furacão
  'app-builder': 'Celular 3D com código surgindo', 'digital-employee': 'Central de operações com robô',
  'business-design': 'Canvas com post-its', 'content-creator': 'Páginas flutuando em livro',
  'content-machine': 'Esteira de fábrica com portal', 'video-studio': 'Editor com timeline',
  'automation': 'Fluxograma com pulsos', 'presence-amplifier': 'Orbe clonando texto',
  'strategic-advisor': 'Painéis com gráficos', 'new-professions': 'Palco com silhuetas',
  'playground-chat': 'Chat interativo', 'closing-message': 'Texto motivacional',
  // AULA 3 - História Maria
  'profile-card': 'Card de perfil animado', 'problem-identifier': 'Indicadores vermelhos',
  'story-revealer': 'Lâmpada reveladora', 'stats-comparison': 'Antes vs Depois',
  'transformation-viewer': 'Contador de resultados', 'amplifier-concept': 'Amplificação visual',
  'generic-detector': 'Scanner de textos', 'prompt-magic': 'Transformação de texto',
  'emotion-connector': 'Corações flutuantes', 'object-transformer': 'Produto vendável',
  'prompt-builder': 'Construtor passo a passo', 'variation-multiplier': 'Múltiplas variações',
  'time-saver': 'Economia de tempo', 'next-steps': 'Call-to-action',
  // AULA 4 - Oportunidades
  'hidden-market': 'Olho revelando oportunidades ocultas', 'need-detector': 'Radar escaneando necessidades',
  'bridge-builder': 'Ponte conectando problemas a soluções', 'level-system': 'Escada de níveis evolutivos',
  'value-calculator': 'Calculadora de preços por serviço', 'reference-builder': 'Construção de autoridade',
  'case-viewer': 'Caso real do João com e-commerces', 'profit-calculator': 'Projeção de ganhos mensais',
  'opportunity-identifier': 'Busca de oportunidades ao redor', 'problem-solver': 'Transformação problema→renda',
  'template-gallery': 'Galeria de modelos prontos', 'playground-creator': 'Simulação do Playground',
  'timeline-tracker': 'Timeline de 4 meses', 'growth-visualizer': 'Gráfico de crescimento',
  'success-roadmap': 'Mapa para o sucesso', 'stability-map': 'Pilares da estabilidade conectados',
  // AULA 5 - Padaria
  'bakery-transformation': 'Padaria do Zé com cartaz de I.A.', 'teenage-designer': 'Adolescente criando design',
  'first-mover-advantage': 'Corrida de vantagem competitiva', 'three-persona-types': 'Silhuetas dos três tipos',
  'fear-vs-action': 'Balanço entre medo e ação', 'silent-doer': 'Pessoa testando em silêncio',
  'real-world-uses': 'Grid de possibilidades reais', 'resume-builder': 'Currículo sendo criado por I.A.',
  'spreadsheet-master': 'Planilhas organizadas automaticamente', 'script-writer': 'Roteiro de vídeo estruturado',
  'your-reality': 'Espelho refletindo sua vida', 'help-network': 'Rede de pessoas ao redor',
  'small-experiment': 'Tubo de ensaio com experimento', 'history-parallel': 'Timeline internet vs I.A.',
  'balanced-approach': 'Escala de equilíbrio', 'practice-preview': 'Prévia das próximas práticas',
  // AULA 6 - Substituição Silenciosa
  'wake-up-call': 'Sino de alerta sobre substituição', 'new-players': 'Novos competidores entrando',
  'take-position': 'Escolha de posicionamento', 'job-shifter': 'Tarefas sendo redistribuídas',
  'vulnerability-alert': 'Scanner de vulnerabilidades', 'value-booster': 'Amplificador de valor pessoal',
  'blank-page-breaker': 'Quebrando a página em branco', 'template-starter': 'Templates prontos para usar',
  'shortcut-engine': 'Motor de atalhos com I.A.', 'real-problem-loader': 'Carregando problemas reais',
  'context-mapper': 'Mapeando contexto do usuário', 'specificity-coach': 'Treinador de especificidade',
  'impact-summary': 'Resumo visual do impacto', 'control-shift': 'Quem controla a mudança',
  'guiding-question': 'Pergunta para reflexão final',
};

export const CARD_EFFECTS_BY_LESSON: Record<string, CardEffectType[]> = {
  'aula-1': [
    'hype-detector', 'game-changers', 'trend-vs-change', 'pattern-vs-magic',
    'data-learner', 'pattern-machine', 'everyday-ai', 'recommendation-engine',
    'strategic-shift', 'genai-intro', 'media-generator', 'recombination-engine',
    'ai-strengths', 'ai-weaknesses', 'human-director',
  ],
  'aula-2': [
    'app-builder', 'digital-employee', 'business-design', 'content-creator',
    'content-machine', 'video-studio', 'automation', 'presence-amplifier',
    'strategic-advisor', 'new-professions', 'playground-chat', 'closing-message',
  ],
  'aula-3': [
    'profile-card', 'problem-identifier', 'story-revealer', 'stats-comparison',
    'transformation-viewer', 'amplifier-concept', 'generic-detector', 'prompt-magic',
    'emotion-connector', 'object-transformer', 'prompt-builder', 'variation-multiplier',
    'time-saver', 'next-steps',
  ],
  'aula-4': [
    'hidden-market', 'need-detector', 'bridge-builder', 'level-system',
    'value-calculator', 'reference-builder', 'case-viewer', 'profit-calculator',
    'opportunity-identifier', 'problem-solver', 'template-gallery', 'playground-creator',
    'timeline-tracker', 'growth-visualizer', 'success-roadmap', 'stability-map',
  ],
  'aula-5': [
    'bakery-transformation', 'teenage-designer', 'first-mover-advantage',
    'three-persona-types', 'fear-vs-action', 'silent-doer',
    'real-world-uses', 'resume-builder', 'spreadsheet-master', 'script-writer',
    'your-reality', 'help-network', 'small-experiment',
    'history-parallel', 'balanced-approach', 'practice-preview',
  ],
};

export const CARD_EFFECT_TYPES: CardEffectType[] = [
  ...CARD_EFFECTS_BY_LESSON['aula-1'],
  ...CARD_EFFECTS_BY_LESSON['aula-2'],
  ...CARD_EFFECTS_BY_LESSON['aula-3'],
  ...CARD_EFFECTS_BY_LESSON['aula-4'],
  ...CARD_EFFECTS_BY_LESSON['aula-5'],
];

export function getCardEffectComponent(type: string): React.FC<CardEffectProps> | null {
  const normalizedType = type.toLowerCase().trim() as CardEffectType;
  return CARD_EFFECT_COMPONENTS[normalizedType] || null;
}

export function isValidCardEffectType(type: string): type is CardEffectType {
  const normalizedType = type.toLowerCase().trim();
  return normalizedType in CARD_EFFECT_COMPONENTS;
}

export interface DynamicCardEffectProps {
  type: string;
  fallback?: React.ReactNode;
  isActive?: boolean;
}

export const DynamicCardEffect: React.FC<DynamicCardEffectProps> = ({
  type,
  fallback = null,
  isActive = false
}) => {
  const Component = getCardEffectComponent(type);
  if (!Component) {
    console.warn(`[DynamicCardEffect] Tipo desconhecido: "${type}"`);
    return <>{fallback}</>;
  }
  return <Component isActive={isActive} />;
};

export default DynamicCardEffect;
