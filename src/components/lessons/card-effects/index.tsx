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

// ============================================================
// AULA 7 - Conteúdo rápido: redes sociais, posts e textos do dia a dia!
// ============================================================
import { CardEffectBlankScreen } from './CardEffectBlankScreen';
import { CardEffectLowEffortPost } from './CardEffectLowEffortPost';
import { CardEffectContentPartner } from './CardEffectContentPartner';
import { CardEffectRelatableMoments } from './CardEffectRelatableMoments';
import { CardEffectContentMistakes } from './CardEffectContentMistakes';
import { CardEffectAlwaysLate } from './CardEffectAlwaysLate';
import { CardEffectIdeaGenerator } from './CardEffectIdeaGenerator';
import { CardEffectCaptionBuilder } from './CardEffectCaptionBuilder';
import { CardEffectToneAdapter } from './CardEffectToneAdapter';
import { CardEffectRealProblem } from './CardEffectRealProblem';
import { CardEffectFillTheBrackets } from './CardEffectFillTheBrackets';
import { CardEffectFirstDraft } from './CardEffectFirstDraft';
import { CardEffectWeeklyRoutine } from './CardEffectWeeklyRoutine';
import { CardEffectPostChecklist } from './CardEffectPostChecklist';
import { CardEffectProcessOverInspiration } from './CardEffectProcessOverInspiration';

// ============================================================
// AULA 8 - Conteúdo Profundo: Transforme sua Experiência em Curso
// ============================================================
import { CardEffectCourseReveal } from './CardEffectCourseReveal';
import { CardEffectOverwhelmBreaker } from './CardEffectOverwhelmBreaker';
import { CardEffectClarityMap } from './CardEffectClarityMap';
import { CardEffectThreeBlocks } from './CardEffectThreeBlocks';
import { CardEffectOpeningFocus } from './CardEffectOpeningFocus';
import { CardEffectClosingFocus } from './CardEffectClosingFocus';
import { CardEffectAiWriter } from './CardEffectAiWriter';
import { CardEffectDraftMachine } from './CardEffectDraftMachine';
import { CardEffectStructureDraft } from './CardEffectStructureDraft';
import { CardEffectSkeletonBuilder } from './CardEffectSkeletonBuilder';
import { CardEffectTopicBrackets } from './CardEffectTopicBrackets';
import { CardEffectResultBrackets } from './CardEffectResultBrackets';
import { CardEffectBoundaryLine } from './CardEffectBoundaryLine';
import { CardEffectDirectorRule } from './CardEffectDirectorRule';
import { CardEffectDirectorMindset } from './CardEffectDirectorMindset';

// ============================================================
// AULA 9 - Conteúdo Profundo: Livros, Cursos, Aulas e Infoprodutos
// ============================================================
import { CardEffectDeepIntro } from './CardEffectDeepIntro';
import { CardEffectAuthorityBuilder } from './CardEffectAuthorityBuilder';
import { CardEffectStructureMap } from './CardEffectStructureMap';
import { CardEffectAudienceFocus } from './CardEffectAudienceFocus';
import { CardEffectResultClarifier } from './CardEffectResultClarifier';
import { CardEffectDraftExpander } from './CardEffectDraftExpander';
import { CardEffectPracticeBuilder } from './CardEffectPracticeBuilder';
import { CardEffectToolTrio } from './CardEffectToolTrio';
import { CardEffectTextEngine } from './CardEffectTextEngine';
import { CardEffectVisualIdentity } from './CardEffectVisualIdentity';
import { CardEffectProjectPicker } from './CardEffectProjectPicker';
import { CardEffectMiniCourse } from './CardEffectMiniCourse';
import { CardEffectLeverageMindset } from './CardEffectLeverageMindset';
import { CardEffectCoauthorRole } from './CardEffectCoauthorRole';
import { CardEffectCoreTriangle } from './CardEffectCoreTriangle';

// ============================================================
// AULA 10 - Conteúdo Profundo: Experiência em Curso Real
// ============================================================
import CardEffectDeepContentIntro from './CardEffectDeepContentIntro';
import CardEffectStartFromZero from './CardEffectStartFromZero';
import CardEffectMemoryStack from './CardEffectMemoryStack';
import CardEffectThreeDecisions from './CardEffectThreeDecisions';
import CardEffectModuleMap from './CardEffectModuleMap';
import CardEffectObjectiveLens from './CardEffectObjectiveLens';
import CardEffectSummaryBooster from './CardEffectSummaryBooster';
import CardEffectSupportMaterials from './CardEffectSupportMaterials';
import CardEffectFirstVersion from './CardEffectFirstVersion';
import CardEffectToolOrchestrator from './CardEffectToolOrchestrator';
import CardEffectVisualCreator from './CardEffectVisualCreator';
import CardEffectMediaExpander from './CardEffectMediaExpander';
import CardEffectProductMindset from './CardEffectProductMindset';
import CardEffectAssetLibrary from './CardEffectAssetLibrary';
import CardEffectBeyondSelling from './CardEffectBeyondSelling';

// ============================================================
// AULA 12 - Vídeos simples com I.A.
// ============================================================
import CardEffectVideoFeedExplosion from './CardEffectVideoFeedExplosion';
import CardEffectVideoConnection from './CardEffectVideoConnection';
import CardEffectBlankScreenBlock from './CardEffectBlankScreenBlock';
import CardEffectThreeVideoBlocks from './CardEffectThreeVideoBlocks';
import CardEffectHookPower from './CardEffectHookPower';
import CardEffectCallToAction from './CardEffectCallToAction';
import CardEffectIdeaToScript from './CardEffectIdeaToScript';
import CardEffectThreeVariations from './CardEffectThreeVariations';
import CardEffectPartnership from './CardEffectPartnership';
import CardEffectVideoStarter from './CardEffectVideoStarter';
import CardEffectAiTextEngine from './CardEffectAiTextEngine';
import CardEffectProductionBasics from './CardEffectProductionBasics';
import CardEffectScriptGuide from './CardEffectScriptGuide';
import CardEffectShortBlocks from './CardEffectShortBlocks';
import CardEffectConsistencyWins from './CardEffectConsistencyWins';

// ============================================================
// AULA 11 - Planilhas, organização e automação leve com I.A.
// ============================================================
import CardEffectFearBreaker from './CardEffectFearBreaker';
import CardEffectQaTable from './CardEffectQaTable';
import CardEffectAiAssistant from './CardEffectAiAssistant';
import CardEffectThreeQuestions from './CardEffectThreeQuestions';
import CardEffectMapVisual from './CardEffectMapVisual';
import CardEffectProblemToStructure from './CardEffectProblemToStructure';
import CardEffectFinanceExample from './CardEffectFinanceExample';
import CardEffectSalesExample from './CardEffectSalesExample';
import CardEffectTasksExample from './CardEffectTasksExample';
import CardEffectToolCombo from './CardEffectToolCombo';
import CardEffectSimulatorCall from './CardEffectSimulatorCall';
import CardEffectYouCommand from './CardEffectYouCommand';
import CardEffectHabitBuilder from './CardEffectHabitBuilder';
import CardEffectPatternVision from './CardEffectPatternVision';
import CardEffectPanelDecision from './CardEffectPanelDecision';

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

// Re-exportar componentes - AULA 7 (Conteúdo Rápido)
export { CardEffectBlankScreen } from './CardEffectBlankScreen';
export { CardEffectLowEffortPost } from './CardEffectLowEffortPost';
export { CardEffectContentPartner } from './CardEffectContentPartner';
export { CardEffectRelatableMoments } from './CardEffectRelatableMoments';
export { CardEffectContentMistakes } from './CardEffectContentMistakes';
export { CardEffectAlwaysLate } from './CardEffectAlwaysLate';
export { CardEffectIdeaGenerator } from './CardEffectIdeaGenerator';
export { CardEffectCaptionBuilder } from './CardEffectCaptionBuilder';
export { CardEffectToneAdapter } from './CardEffectToneAdapter';
export { CardEffectRealProblem } from './CardEffectRealProblem';
export { CardEffectFillTheBrackets } from './CardEffectFillTheBrackets';
export { CardEffectFirstDraft } from './CardEffectFirstDraft';
export { CardEffectWeeklyRoutine } from './CardEffectWeeklyRoutine';
export { CardEffectPostChecklist } from './CardEffectPostChecklist';
export { CardEffectProcessOverInspiration } from './CardEffectProcessOverInspiration';

// Re-exportar componentes - AULA 8 (Conteúdo Profundo)
export { CardEffectCourseReveal } from './CardEffectCourseReveal';
export { CardEffectOverwhelmBreaker } from './CardEffectOverwhelmBreaker';
export { CardEffectClarityMap } from './CardEffectClarityMap';
export { CardEffectThreeBlocks } from './CardEffectThreeBlocks';
export { CardEffectOpeningFocus } from './CardEffectOpeningFocus';
export { CardEffectClosingFocus } from './CardEffectClosingFocus';
export { CardEffectAiWriter } from './CardEffectAiWriter';
export { CardEffectDraftMachine } from './CardEffectDraftMachine';
export { CardEffectStructureDraft } from './CardEffectStructureDraft';
export { CardEffectSkeletonBuilder } from './CardEffectSkeletonBuilder';
export { CardEffectTopicBrackets } from './CardEffectTopicBrackets';
export { CardEffectResultBrackets } from './CardEffectResultBrackets';
export { CardEffectBoundaryLine } from './CardEffectBoundaryLine';
export { CardEffectDirectorRule } from './CardEffectDirectorRule';
export { CardEffectDirectorMindset } from './CardEffectDirectorMindset';

// Re-exportar componentes - AULA 9 (Conteúdo Profundo: Livros, Cursos, Infoprodutos)
export { CardEffectDeepIntro } from './CardEffectDeepIntro';
export { CardEffectAuthorityBuilder } from './CardEffectAuthorityBuilder';
export { CardEffectStructureMap } from './CardEffectStructureMap';
export { CardEffectAudienceFocus } from './CardEffectAudienceFocus';
export { CardEffectResultClarifier } from './CardEffectResultClarifier';
export { CardEffectDraftExpander } from './CardEffectDraftExpander';
export { CardEffectPracticeBuilder } from './CardEffectPracticeBuilder';
export { CardEffectToolTrio } from './CardEffectToolTrio';
export { CardEffectTextEngine } from './CardEffectTextEngine';
export { CardEffectVisualIdentity } from './CardEffectVisualIdentity';
export { CardEffectProjectPicker } from './CardEffectProjectPicker';
export { CardEffectMiniCourse } from './CardEffectMiniCourse';
export { CardEffectLeverageMindset } from './CardEffectLeverageMindset';

// Re-exportar componentes - AULA 10 (Conteúdo Profundo: Experiência em Curso Real)
export { default as CardEffectDeepContentIntro } from './CardEffectDeepContentIntro';
export { default as CardEffectStartFromZero } from './CardEffectStartFromZero';
export { default as CardEffectMemoryStack } from './CardEffectMemoryStack';
export { default as CardEffectThreeDecisions } from './CardEffectThreeDecisions';
export { default as CardEffectModuleMap } from './CardEffectModuleMap';
export { default as CardEffectObjectiveLens } from './CardEffectObjectiveLens';
export { default as CardEffectSummaryBooster } from './CardEffectSummaryBooster';
export { default as CardEffectSupportMaterials } from './CardEffectSupportMaterials';
export { default as CardEffectFirstVersion } from './CardEffectFirstVersion';
export { default as CardEffectToolOrchestrator } from './CardEffectToolOrchestrator';
export { default as CardEffectVisualCreator } from './CardEffectVisualCreator';
export { default as CardEffectMediaExpander } from './CardEffectMediaExpander';
export { default as CardEffectProductMindset } from './CardEffectProductMindset';
export { default as CardEffectAssetLibrary } from './CardEffectAssetLibrary';
export { default as CardEffectBeyondSelling } from './CardEffectBeyondSelling';

// Re-exportar componentes - AULA 12 (Vídeos simples)
export { default as CardEffectVideoFeedExplosion } from './CardEffectVideoFeedExplosion';
export { default as CardEffectVideoConnection } from './CardEffectVideoConnection';
export { default as CardEffectBlankScreenBlock } from './CardEffectBlankScreenBlock';
export { default as CardEffectThreeVideoBlocks } from './CardEffectThreeVideoBlocks';
export { default as CardEffectHookPower } from './CardEffectHookPower';
export { default as CardEffectCallToAction } from './CardEffectCallToAction';
export { default as CardEffectIdeaToScript } from './CardEffectIdeaToScript';
export { default as CardEffectThreeVariations } from './CardEffectThreeVariations';
export { default as CardEffectPartnership } from './CardEffectPartnership';
export { default as CardEffectVideoStarter } from './CardEffectVideoStarter';
export { default as CardEffectAiTextEngine } from './CardEffectAiTextEngine';
export { default as CardEffectProductionBasics } from './CardEffectProductionBasics';
export { default as CardEffectScriptGuide } from './CardEffectScriptGuide';
export { default as CardEffectShortBlocks } from './CardEffectShortBlocks';
export { default as CardEffectConsistencyWins } from './CardEffectConsistencyWins';

// Re-exportar componentes - AULA 11 (Planilhas, organização e automação)
export { default as CardEffectFearBreaker } from './CardEffectFearBreaker';
export { default as CardEffectQaTable } from './CardEffectQaTable';
export { default as CardEffectAiAssistant } from './CardEffectAiAssistant';
export { default as CardEffectThreeQuestions } from './CardEffectThreeQuestions';
export { default as CardEffectMapVisual } from './CardEffectMapVisual';
export { default as CardEffectProblemToStructure } from './CardEffectProblemToStructure';
export { default as CardEffectFinanceExample } from './CardEffectFinanceExample';
export { default as CardEffectSalesExample } from './CardEffectSalesExample';
export { default as CardEffectTasksExample } from './CardEffectTasksExample';
export { default as CardEffectToolCombo } from './CardEffectToolCombo';
export { default as CardEffectSimulatorCall } from './CardEffectSimulatorCall';
export { default as CardEffectYouCommand } from './CardEffectYouCommand';
export { default as CardEffectHabitBuilder } from './CardEffectHabitBuilder';
export { default as CardEffectPatternVision } from './CardEffectPatternVision';
export { default as CardEffectPanelDecision } from './CardEffectPanelDecision';

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
  | 'impact-summary' | 'control-shift' | 'guiding-question'
  // AULA 7 - Conteúdo Rápido
  | 'blank-screen' | 'low-effort-post' | 'content-partner' | 'relatable-moments'
  | 'content-mistakes' | 'always-late' | 'idea-generator' | 'caption-builder'
  | 'tone-adapter' | 'real-problem' | 'fill-the-brackets' | 'first-draft'
  | 'weekly-routine' | 'post-checklist' | 'process-over-inspiration'
  // AULA 8 - Conteúdo Profundo
  | 'course-reveal' | 'overwhelm-breaker' | 'clarity-map' | 'three-blocks'
  | 'opening-focus' | 'closing-focus' | 'ai-writer' | 'draft-machine'
  | 'structure-draft' | 'skeleton-builder' | 'topic-brackets' | 'result-brackets'
  | 'boundary-line' | 'director-rule' | 'director-mindset'
  // AULA 9 - Conteúdo Profundo: Livros, Cursos, Infoprodutos
  | 'deep-intro' | 'authority-builder' | 'structure-map' | 'audience-focus'
  | 'result-clarifier' | 'draft-expander' | 'practice-builder' | 'tool-trio'
  | 'text-engine' | 'visual-identity' | 'project-picker' | 'mini-course'
  | 'leverage-mindset' | 'coauthor-role' | 'core-triangle'
  // AULA 10 - Conteúdo Profundo: Experiência em Curso Real
  | 'deep-content-intro' | 'start-from-zero' | 'memory-stack' | 'three-decisions'
  | 'module-map' | 'objective-lens' | 'summary-booster' | 'support-materials'
  | 'first-version' | 'tool-orchestrator' | 'visual-creator' | 'media-expander'
  | 'product-mindset' | 'asset-library' | 'beyond-selling'
  // AULA 11 - Planilhas, organização e automação leve
  | 'fear-breaker' | 'qa-table' | 'ai-assistant' | 'three-questions'
  | 'map-visual' | 'problem-to-structure' | 'finance-example' | 'sales-example'
  | 'tasks-example' | 'tool-combo' | 'simulator-call' | 'you-command'
  | 'habit-builder' | 'pattern-vision' | 'panel-decision'
  // AULA 12 - Vídeos simples com I.A.
  | 'video-feed-explosion' | 'video-connection' | 'blank-screen-block' | 'three-video-blocks'
  | 'hook-power' | 'call-to-action' | 'idea-to-script' | 'three-variations'
  | 'partnership' | 'video-starter' | 'ai-text-engine' | 'production-basics'
  | 'script-guide' | 'short-blocks' | 'consistency-wins';

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
  // AULA 7 - Conteúdo Rápido
  'blank-screen': CardEffectBlankScreen,
  'low-effort-post': CardEffectLowEffortPost,
  'content-partner': CardEffectContentPartner,
  'relatable-moments': CardEffectRelatableMoments,
  'content-mistakes': CardEffectContentMistakes,
  'always-late': CardEffectAlwaysLate,
  'idea-generator': CardEffectIdeaGenerator,
  'caption-builder': CardEffectCaptionBuilder,
  'tone-adapter': CardEffectToneAdapter,
  'real-problem': CardEffectRealProblem,
  'fill-the-brackets': CardEffectFillTheBrackets,
  'first-draft': CardEffectFirstDraft,
  'weekly-routine': CardEffectWeeklyRoutine,
  'post-checklist': CardEffectPostChecklist,
  'process-over-inspiration': CardEffectProcessOverInspiration,
  // AULA 8 - Conteúdo Profundo
  'course-reveal': CardEffectCourseReveal,
  'overwhelm-breaker': CardEffectOverwhelmBreaker,
  'clarity-map': CardEffectClarityMap,
  'three-blocks': CardEffectThreeBlocks,
  'opening-focus': CardEffectOpeningFocus,
  'closing-focus': CardEffectClosingFocus,
  'ai-writer': CardEffectAiWriter,
  'draft-machine': CardEffectDraftMachine,
  'structure-draft': CardEffectStructureDraft,
  'skeleton-builder': CardEffectSkeletonBuilder,
  'topic-brackets': CardEffectTopicBrackets,
  'result-brackets': CardEffectResultBrackets,
  'boundary-line': CardEffectBoundaryLine,
  'director-rule': CardEffectDirectorRule,
  'director-mindset': CardEffectDirectorMindset,
  // AULA 9 - Conteúdo Profundo: Livros, Cursos, Infoprodutos
  'deep-intro': CardEffectDeepIntro,
  'authority-builder': CardEffectAuthorityBuilder,
  'structure-map': CardEffectStructureMap,
  'audience-focus': CardEffectAudienceFocus,
  'result-clarifier': CardEffectResultClarifier,
  'draft-expander': CardEffectDraftExpander,
  'practice-builder': CardEffectPracticeBuilder,
  'tool-trio': CardEffectToolTrio,
  'text-engine': CardEffectTextEngine,
  'visual-identity': CardEffectVisualIdentity,
  'project-picker': CardEffectProjectPicker,
  'mini-course': CardEffectMiniCourse,
  'leverage-mindset': CardEffectLeverageMindset,
  'coauthor-role': CardEffectCoauthorRole,
  'core-triangle': CardEffectCoreTriangle,
  // AULA 10 - Conteúdo Profundo: Experiência em Curso Real
  'deep-content-intro': CardEffectDeepContentIntro,
  'start-from-zero': CardEffectStartFromZero,
  'memory-stack': CardEffectMemoryStack,
  'three-decisions': CardEffectThreeDecisions,
  'module-map': CardEffectModuleMap,
  'objective-lens': CardEffectObjectiveLens,
  'summary-booster': CardEffectSummaryBooster,
  'support-materials': CardEffectSupportMaterials,
  'first-version': CardEffectFirstVersion,
  'tool-orchestrator': CardEffectToolOrchestrator,
  'visual-creator': CardEffectVisualCreator,
  'media-expander': CardEffectMediaExpander,
  'product-mindset': CardEffectProductMindset,
  'asset-library': CardEffectAssetLibrary,
  'beyond-selling': CardEffectBeyondSelling,
  // AULA 11 - Planilhas, organização e automação leve
  'fear-breaker': CardEffectFearBreaker,
  'qa-table': CardEffectQaTable,
  'ai-assistant': CardEffectAiAssistant,
  'three-questions': CardEffectThreeQuestions,
  'map-visual': CardEffectMapVisual,
  'problem-to-structure': CardEffectProblemToStructure,
  'finance-example': CardEffectFinanceExample,
  'sales-example': CardEffectSalesExample,
  'tasks-example': CardEffectTasksExample,
  'tool-combo': CardEffectToolCombo,
  'simulator-call': CardEffectSimulatorCall,
  'you-command': CardEffectYouCommand,
  'habit-builder': CardEffectHabitBuilder,
  'pattern-vision': CardEffectPatternVision,
  'panel-decision': CardEffectPanelDecision,
  // AULA 12 - Vídeos simples com I.A.
  'video-feed-explosion': CardEffectVideoFeedExplosion,
  'video-connection': CardEffectVideoConnection,
  'blank-screen-block': CardEffectBlankScreenBlock,
  'three-video-blocks': CardEffectThreeVideoBlocks,
  'hook-power': CardEffectHookPower,
  'call-to-action': CardEffectCallToAction,
  'idea-to-script': CardEffectIdeaToScript,
  'three-variations': CardEffectThreeVariations,
  'partnership': CardEffectPartnership,
  'video-starter': CardEffectVideoStarter,
  'ai-text-engine': CardEffectAiTextEngine,
  'production-basics': CardEffectProductionBasics,
  'script-guide': CardEffectScriptGuide,
  'short-blocks': CardEffectShortBlocks,
  'consistency-wins': CardEffectConsistencyWins,
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
  // AULA 7 - Conteúdo Rápido
  'blank-screen': 'Tela em Branco', 'low-effort-post': 'Post Sem Esforço',
  'content-partner': 'Parceiro de Conteúdo', 'relatable-moments': 'Momentos Relacionáveis',
  'content-mistakes': 'Erros de Conteúdo', 'always-late': 'Sempre Atrasado',
  'idea-generator': 'Gerador de Ideias', 'caption-builder': 'Construtor de Legendas',
  'tone-adapter': 'Adaptador de Tom', 'real-problem': 'Problema Real',
  'fill-the-brackets': 'Preencha os Colchetes', 'first-draft': 'Primeiro Rascunho',
  'weekly-routine': 'Rotina Semanal', 'post-checklist': 'Checklist de Post',
  'process-over-inspiration': 'Processo Sobre Inspiração',
  // AULA 8 - Conteúdo Profundo
  'course-reveal': 'Revelação do Curso', 'overwhelm-breaker': 'Quebrador de Sobrecarga',
  'clarity-map': 'Mapa da Clareza', 'three-blocks': 'Os 3 Blocos',
  'opening-focus': 'Foco na Abertura', 'closing-focus': 'Foco no Fechamento',
  'ai-writer': 'Escritor com IA', 'draft-machine': 'Máquina de Rascunhos',
  'structure-draft': 'Estrutura do Rascunho', 'skeleton-builder': 'Construtor de Esqueleto',
  'topic-brackets': 'Tópicos Entre Colchetes', 'result-brackets': 'Resultados Entre Colchetes',
  'boundary-line': 'Linha de Limite', 'director-rule': 'Regra do Diretor',
  'director-mindset': 'Mentalidade de Diretor',
  // AULA 9 - Conteúdo Profundo: Livros, Cursos, Infoprodutos
  'deep-intro': 'Introdução ao Conteúdo Profundo',
  'authority-builder': 'Construtor de Autoridade',
  'structure-map': 'Mapa da Estrutura',
  'audience-focus': 'Foco no Público',
  'result-clarifier': 'Clarificador de Resultado',
  'draft-expander': 'Expansor de Rascunho',
  'practice-builder': 'Construtor de Prática',
  'tool-trio': 'Trio de Ferramentas',
  'text-engine': 'Motor de Texto',
  'visual-identity': 'Identidade Visual',
  'project-picker': 'Seletor de Projeto',
  'mini-course': 'Mini-Curso',
  'leverage-mindset': 'Mentalidade de Alavanca',
  // AULA 10 - Conteúdo Profundo: Experiência em Curso Real
  'deep-content-intro': 'Conteúdo que Fica',
  'start-from-zero': 'Sempre do Zero',
  'memory-stack': 'Pilha de Memórias',
  'three-decisions': 'Três Decisões',
  'module-map': 'Mapa de Módulos',
  'objective-lens': 'Lentes de Objetivo',
  'summary-booster': 'Impulsionador de Sumário',
  'support-materials': 'Materiais de Apoio',
  'first-version': 'Versão 1',
  'tool-orchestrator': 'Orquestrador de Ferramentas',
  'visual-creator': 'Criador Visual',
  'media-expander': 'Expansor de Mídia',
  'product-mindset': 'Mentalidade de Produto',
  'asset-library': 'Biblioteca de Ativos',
  'beyond-selling': 'Além de Vender',
  // AULA 11 - Planilhas, organização e automação leve
  'fear-breaker': 'A Trava da Planilha',
  'qa-table': 'Perguntas e Respostas',
  'ai-assistant': 'Assistente de Planilhas',
  'three-questions': 'As Três Perguntas',
  'map-visual': 'Mapa Visual',
  'problem-to-structure': 'Do Problema à Estrutura',
  'finance-example': 'Exemplo: Finanças',
  'sales-example': 'Exemplo: Vendas',
  'tasks-example': 'Exemplo: Tarefas',
  'tool-combo': 'Combo de Ferramentas',
  'simulator-call': 'Simulador Guiado',
  'you-command': 'Seu Comando',
  'habit-builder': 'Construtor de Hábito',
  'pattern-vision': 'Visão de Padrões',
  'panel-decision': 'Painel de Decisão',
  // AULA 12 - Vídeos simples com I.A.
  'video-feed-explosion': 'Explosão no Feed',
  'video-connection': 'Conexão por Vídeo',
  'blank-screen-block': 'Bloqueio da Tela Branca',
  'three-video-blocks': 'Os 3 Blocos do Vídeo',
  'hook-power': 'Poder do Gancho',
  'call-to-action': 'Chamada para Ação',
  'idea-to-script': 'Da Ideia ao Roteiro',
  'three-variations': 'Três Variações',
  'partnership': 'Parceria com I.A.',
  'video-starter': 'Iniciador de Vídeo',
  'ai-text-engine': 'Motor de Texto com I.A.',
  'production-basics': 'Produção Básica',
  'script-guide': 'Guia de Roteiro',
  'short-blocks': 'Blocos Curtos',
  'consistency-wins': 'Consistência Vence',
  'coauthor-role': 'Papel do Coautor',
  'core-triangle': 'Triângulo Central',
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
  // AULA 7 - Conteúdo Rápido
  'blank-screen': 'Tela em branco esperando conteúdo', 'low-effort-post': 'Post com baixo esforço',
  'content-partner': 'I.A. como parceira de conteúdo', 'relatable-moments': 'Momentos que conectam',
  'content-mistakes': 'Erros comuns de conteúdo', 'always-late': 'Sempre atrasado com posts',
  'idea-generator': 'Gerador de ideias infinitas', 'caption-builder': 'Construtor de legendas',
  'tone-adapter': 'Adaptador de tom e voz', 'real-problem': 'Problema real do usuário',
  'fill-the-brackets': 'Preencha os colchetes', 'first-draft': 'Primeiro rascunho rápido',
  'weekly-routine': 'Rotina semanal de posts', 'post-checklist': 'Checklist antes de publicar',
  'process-over-inspiration': 'Processo vence inspiração',
  // AULA 8 - Conteúdo Profundo
  'course-reveal': 'Revelando curso escondido na experiência',
  'overwhelm-breaker': 'Quebrando a ideia de curso gigante',
  'clarity-map': 'Mapa de clareza de estrutura',
  'three-blocks': 'Os 3 blocos essenciais de um curso',
  'opening-focus': 'Foco na abertura impactante',
  'closing-focus': 'Foco no fechamento memorável',
  'ai-writer': 'IA como assistente de escrita',
  'draft-machine': 'Máquina geradora de rascunhos',
  'structure-draft': 'Estruturando o rascunho base',
  'skeleton-builder': 'Construindo esqueleto do curso',
  'topic-brackets': 'Organizando tópicos entre colchetes',
  'result-brackets': 'Definindo resultados prometidos',
  'boundary-line': 'Linha de limite do escopo',
  'director-rule': 'Regra do diretor no controle',
  'director-mindset': 'Mentalidade de diretor ativada',
  // AULA 9 - Conteúdo Profundo: Livros, Cursos, Infoprodutos
  'deep-intro': 'Por que conteúdo profundo importa agora',
  'authority-builder': 'Construindo autoridade real com conteúdo',
  'structure-map': 'Mapeando experiência em estrutura',
  'audience-focus': 'Focando no público certo',
  'result-clarifier': 'Clarificando a transformação prometida',
  'draft-expander': 'Expandindo ideias em linguagem simples',
  'practice-builder': 'Criando exercícios práticos',
  'tool-trio': 'As três camadas de I.A.',
  'text-engine': 'Motor de texto em ação',
  'visual-identity': 'Identidade visual do projeto',
  'project-picker': 'Escolhendo o projeto real',
  'mini-course': 'Formato enxuto e impactante',
  'leverage-mindset': 'I.A. como alavanca para conhecimento',
  // AULA 10 - Conteúdo Profundo: Experiência em Curso Real
  'deep-content-intro': 'Timeline vs conteúdo duradouro',
  'start-from-zero': 'Da postagem solta ao caminho contínuo',
  'memory-stack': 'Pilha de conhecimento acumulado',
  'three-decisions': 'Tema, público e promessa',
  'module-map': 'Mapa visual de módulos numerados',
  'objective-lens': 'Verbos claros em cada aula',
  'summary-booster': 'Sumário gerado pela I.A.',
  'support-materials': 'Roteiros, PDFs e descrições',
  'first-version': 'Melhor editar algo do que o vazio',
  'tool-orchestrator': 'Modelos de linguagem organizando ideias',
  'visual-creator': 'Capas, imagens e elementos visuais',
  'media-expander': 'Transformando texto em vídeo e áudio',
  'product-mindset': 'Conteúdo como ativo escalável',
  'asset-library': 'Biblioteca digital trabalhando por você',
  'beyond-selling': 'Impacto, clareza e novas possibilidades',
  // AULA 11 - Planilhas, organização e automação leve
  'fear-breaker': 'Planilha vazia com medo se desfazendo',
  'qa-table': 'Tabela como perguntas e respostas',
  'ai-assistant': 'Avatar de I.A. ajudando com planilha',
  'three-questions': 'Três cartões com perguntas essenciais',
  'map-visual': 'Confusão virando mapa organizado',
  'problem-to-structure': 'Texto se transformando em planilha',
  'finance-example': 'Extrato confuso virando controle',
  'sales-example': 'Pedidos soltos virando planilha de vendas',
  'tasks-example': 'Tarefas caóticas virando agenda organizada',
  'tool-combo': 'Chat de I.A. conectado à planilha',
  'simulator-call': 'Painel de 4 passos para gerar prompt',
  'you-command': 'Teclado digitando comando para planilha',
  'habit-builder': 'Calendário com lembrete de atualização',
  'pattern-vision': 'Gráfico revelando tendências',
  'panel-decision': 'Painel de decisão com dados',
  // AULA 12 - Vídeos simples com I.A.
  'video-feed-explosion': 'Feed transbordando de vídeos virais',
  'video-connection': 'Conexão humana através do vídeo',
  'blank-screen-block': 'Tela em branco travando criador',
  'three-video-blocks': 'Os três blocos essenciais do vídeo',
  'hook-power': 'Gancho poderoso nos primeiros segundos',
  'call-to-action': 'Chamada clara para ação do espectador',
  'idea-to-script': 'Transformando ideia em roteiro estruturado',
  'three-variations': 'Três versões do mesmo conteúdo',
  'partnership': 'I.A. como parceira de criação',
  'video-starter': 'Começando o primeiro vídeo',
  'ai-text-engine': 'Motor de texto gerando roteiros',
  'production-basics': 'Fundamentos de produção simples',
  'script-guide': 'Guia passo a passo do roteiro',
  'short-blocks': 'Blocos curtos e impactantes',
  'consistency-wins': 'Consistência supera perfeição',
  'coauthor-role': 'Você como coautor da I.A. no processo criativo',
  'core-triangle': 'Triângulo central: Clareza, Contexto, Exemplo',
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
  'aula-6': [
    'wake-up-call', 'new-players', 'take-position', 'job-shifter',
    'vulnerability-alert', 'value-booster', 'blank-page-breaker', 'template-starter',
    'shortcut-engine', 'real-problem-loader', 'context-mapper', 'specificity-coach',
    'impact-summary', 'control-shift', 'guiding-question',
  ],
  'aula-7': [
    'blank-screen', 'low-effort-post', 'content-partner', 'relatable-moments',
    'content-mistakes', 'always-late', 'idea-generator', 'caption-builder',
    'tone-adapter', 'real-problem', 'fill-the-brackets', 'first-draft',
    'weekly-routine', 'post-checklist', 'process-over-inspiration',
  ],
  'aula-8': [
    'course-reveal', 'overwhelm-breaker', 'clarity-map', 'three-blocks',
    'opening-focus', 'closing-focus', 'ai-writer', 'draft-machine',
    'structure-draft', 'skeleton-builder', 'topic-brackets', 'result-brackets',
    'boundary-line', 'director-rule', 'director-mindset',
  ],
  'aula-9': [
    'deep-intro', 'authority-builder', 'structure-map', 'audience-focus',
    'result-clarifier', 'draft-expander', 'practice-builder', 'tool-trio',
    'text-engine', 'visual-identity', 'project-picker', 'mini-course',
    'leverage-mindset', 'coauthor-role', 'core-triangle',
  ],
  'aula-10': [
    'deep-content-intro', 'start-from-zero', 'memory-stack', 'three-decisions',
    'module-map', 'objective-lens', 'summary-booster', 'support-materials',
    'first-version', 'tool-orchestrator', 'visual-creator', 'media-expander',
    'product-mindset', 'asset-library', 'beyond-selling',
  ],
  'aula-11': [
    'fear-breaker', 'qa-table', 'ai-assistant', 'three-questions',
    'map-visual', 'problem-to-structure', 'finance-example', 'sales-example',
    'tasks-example', 'tool-combo', 'simulator-call', 'you-command',
    'habit-builder', 'pattern-vision', 'panel-decision',
  ],
  'aula-08': [
    'video-feed-explosion', 'video-connection', 'blank-screen-block', 'three-video-blocks',
    'hook-power', 'call-to-action', 'idea-to-script', 'three-variations',
    'partnership', 'video-starter', 'ai-text-engine', 'production-basics',
    'script-guide', 'short-blocks', 'consistency-wins',
  ],
};

export const CARD_EFFECT_TYPES: CardEffectType[] = [
  ...CARD_EFFECTS_BY_LESSON['aula-1'],
  ...CARD_EFFECTS_BY_LESSON['aula-2'],
  ...CARD_EFFECTS_BY_LESSON['aula-3'],
  ...CARD_EFFECTS_BY_LESSON['aula-4'],
  ...CARD_EFFECTS_BY_LESSON['aula-5'],
  ...CARD_EFFECTS_BY_LESSON['aula-6'],
  ...CARD_EFFECTS_BY_LESSON['aula-7'],
  ...CARD_EFFECTS_BY_LESSON['aula-8'],
  ...CARD_EFFECTS_BY_LESSON['aula-9'],
  ...CARD_EFFECTS_BY_LESSON['aula-10'],
  ...CARD_EFFECTS_BY_LESSON['aula-11'],
  ...CARD_EFFECTS_BY_LESSON['aula-08'],
];

export function getCardEffectComponent(type: string | undefined | null): React.FC<CardEffectProps> | null {
  if (!type) return null;
  const normalizedType = type.toLowerCase().trim() as CardEffectType;
  return CARD_EFFECT_COMPONENTS[normalizedType] || null;
}

export function isValidCardEffectType(type: string | undefined | null): type is CardEffectType {
  if (!type) return false;
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
