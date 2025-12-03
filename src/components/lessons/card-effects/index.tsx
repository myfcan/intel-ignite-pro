'use client';

import React from 'react';

// ============================================================
// AULA 1 - O Furacão da I.A.
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
// AULA 2 - História da Maria
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

// Re-exportar componentes - AULA 1
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

// Re-exportar componentes - AULA 2
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

/**
 * Tipos de card effects disponíveis
 *
 * 🎬 AULA 1 - O Furacão da I.A. (12 cards)
 * 🎬 AULA 2 - História da Maria (14 cards)
 */
export type CardEffectType =
  // AULA 1 - O Furacão da I.A.
  | 'app-builder'
  | 'digital-employee'
  | 'business-design'
  | 'content-creator'
  | 'content-machine'
  | 'video-studio'
  | 'automation'
  | 'presence-amplifier'
  | 'strategic-advisor'
  | 'new-professions'
  | 'playground-chat'
  | 'closing-message'
  // AULA 2 - História da Maria
  | 'profile-card'
  | 'problem-identifier'
  | 'story-revealer'
  | 'stats-comparison'
  | 'transformation-viewer'
  | 'amplifier-concept'
  | 'generic-detector'
  | 'prompt-magic'
  | 'emotion-connector'
  | 'object-transformer'
  | 'prompt-builder'
  | 'variation-multiplier'
  | 'time-saver'
  | 'next-steps';

/**
 * Props para os componentes de Card Effect
 */
export interface CardEffectProps {
  isActive?: boolean;
}

/**
 * Mapeamento de tipo → componente
 */
const CARD_EFFECT_COMPONENTS: Record<CardEffectType, React.FC<CardEffectProps>> = {
  // AULA 1
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
  // AULA 2
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
};

/**
 * Descrições amigáveis para cada tipo (para UI)
 */
export const CARD_EFFECT_LABELS: Record<CardEffectType, string> = {
  // AULA 1
  'app-builder': 'IA Construindo App',
  'digital-employee': 'Funcionário Digital',
  'business-design': 'Design de Negócio',
  'content-creator': 'Coautor de Livros/Cursos',
  'content-machine': 'Máquina de Conteúdo',
  'video-studio': 'Estúdio de Vídeo',
  'automation': 'Fluxos de Automação',
  'presence-amplifier': 'Amplificador de Presença',
  'strategic-advisor': 'Conselho Estratégico',
  'new-professions': 'Novas Profissões',
  'playground-chat': 'Playground / Chat IA',
  'closing-message': 'Mensagem de Encerramento',
  // AULA 2
  'profile-card': 'Card de Perfil',
  'problem-identifier': 'Identificador de Problema',
  'story-revealer': 'Revelador de História',
  'stats-comparison': 'Comparação de Stats',
  'transformation-viewer': 'Visualizador de Transformação',
  'amplifier-concept': 'Conceito Amplificador',
  'generic-detector': 'Detector de Genérico',
  'prompt-magic': 'Mágica do Prompt',
  'emotion-connector': 'Conector Emocional',
  'object-transformer': 'Transformador de Objeto',
  'prompt-builder': 'Construtor de Prompt',
  'variation-multiplier': 'Multiplicador de Variações',
  'time-saver': 'Economia de Tempo',
  'next-steps': 'Próximos Passos',
};

/**
 * Descrições detalhadas para tooltips
 */
export const CARD_EFFECT_DESCRIPTIONS: Record<CardEffectType, string> = {
  // AULA 1
  'app-builder': 'Celular 3D com código surgindo, IA enviando pulsos de energia',
  'digital-employee': 'Central de operações com 3 colunas, robô digitando, notificações',
  'business-design': 'Canvas com post-its caindo, laser azul organizando, setas conectando',
  'content-creator': 'Páginas flutuando em livro, marcador neon, player de vídeo',
  'content-machine': 'Esteira de fábrica com portal de IA transformando conteúdo',
  'video-studio': 'Editor com timeline animada, cenas mudando, sliders de parâmetros',
  'automation': 'Fluxograma desenhado ao vivo com pulsos de energia nas conexões',
  'presence-amplifier': 'Orbe de IA clonando texto para múltiplos canais',
  'strategic-advisor': '3 painéis com gráficos, prós/contras, destaque na melhor opção',
  'new-professions': 'Palco com silhuetas, rótulos flutuantes, foguete decolando',
  'playground-chat': 'Interface de chat interativo com IA, mensagens animadas',
  'closing-message': 'Texto motivacional animado para conclusões e transições',
  // AULA 2
  'profile-card': 'Card de perfil animado com foto, nome, idade e detalhes',
  'problem-identifier': 'Visualização de problemas com indicadores vermelhos',
  'story-revealer': 'Revela o segredo/insight com animação de lâmpada',
  'stats-comparison': 'Comparação visual Antes vs Depois com números',
  'transformation-viewer': 'Contador animado de resultados impressionantes',
  'amplifier-concept': 'Visualização de amplificação: entrada → IA → saída maior',
  'generic-detector': 'Scanner que detecta textos genéricos vs específicos',
  'prompt-magic': 'Transforma texto genérico em texto com emoção',
  'emotion-connector': 'Visualiza conexão emocional com corações flutuantes',
  'object-transformer': 'Transforma objeto comum em produto vendável',
  'prompt-builder': 'Construtor de prompts passo a passo',
  'variation-multiplier': '1 produto → múltiplas variações de conteúdo',
  'time-saver': 'Mostra economia de tempo: 10 posts em 10 minutos',
  'next-steps': 'Call-to-action com próximos passos animados',
};

/**
 * Cards organizados por aula
 */
export const CARD_EFFECTS_BY_LESSON: Record<string, CardEffectType[]> = {
  'aula-1': [
    'app-builder',
    'digital-employee',
    'business-design',
    'content-creator',
    'content-machine',
    'video-studio',
    'automation',
    'presence-amplifier',
    'strategic-advisor',
    'new-professions',
    'playground-chat',
    'closing-message',
  ],
  'aula-2': [
    'profile-card',
    'problem-identifier',
    'story-revealer',
    'stats-comparison',
    'transformation-viewer',
    'amplifier-concept',
    'generic-detector',
    'prompt-magic',
    'emotion-connector',
    'object-transformer',
    'prompt-builder',
    'variation-multiplier',
    'time-saver',
    'next-steps',
  ],
};

/**
 * Lista de tipos para seleção em UI (todos)
 */
export const CARD_EFFECT_TYPES: CardEffectType[] = [
  ...CARD_EFFECTS_BY_LESSON['aula-1'],
  ...CARD_EFFECTS_BY_LESSON['aula-2'],
];

/**
 * Retorna o componente de card effect para um determinado tipo
 */
export function getCardEffectComponent(type: string): React.FC<CardEffectProps> | null {
  const normalizedType = type.toLowerCase().trim() as CardEffectType;
  return CARD_EFFECT_COMPONENTS[normalizedType] || null;
}

/**
 * Verifica se um tipo de card effect é válido
 */
export function isValidCardEffectType(type: string): type is CardEffectType {
  const normalizedType = type.toLowerCase().trim();
  return normalizedType in CARD_EFFECT_COMPONENTS;
}

/**
 * Props para o componente DynamicCardEffect
 */
export interface DynamicCardEffectProps {
  type: string;
  fallback?: React.ReactNode;
  isActive?: boolean;
}

/**
 * Componente que renderiza dinamicamente o card effect correto
 */
export const DynamicCardEffect: React.FC<DynamicCardEffectProps> = ({
  type,
  fallback = null,
  isActive = false
}) => {
  const Component = getCardEffectComponent(type);

  if (!Component) {
    console.warn(`[DynamicCardEffect] Tipo desconhecido: "${type}". Tipos válidos: ${CARD_EFFECT_TYPES.join(', ')}`);
    return <>{fallback}</>;
  }

  return <Component isActive={isActive} />;
};

export default DynamicCardEffect;
