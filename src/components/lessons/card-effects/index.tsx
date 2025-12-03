'use client';

import React from 'react';

// Importar todos os card effects
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

// Re-exportar componentes
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

/**
 * Tipos de card effects disponíveis
 *
 * 🎬 10 CARD EFFECTS CINEMATOGRÁFICOS
 *
 * Cada tipo corresponde a um cenário visual específico:
 * 1. app-builder: Celular 3D com código sendo gerado pela IA
 * 2. digital-employee: Central de operações com robô processando tarefas
 * 3. business-design: Canvas com post-its, laser organizando
 * 4. content-creator: Páginas caindo em livro + player de vídeo
 * 5. content-machine: Esteira de fábrica com portal de IA
 * 6. video-studio: Editor de vídeo com timeline e parâmetros
 * 7. automation: Fluxograma desenhado ao vivo
 * 8. presence-amplifier: Clonagem de estilo para múltiplos canais
 * 9. strategic-advisor: 3 cenários com gráficos comparativos
 * 10. new-professions: Palco do futuro com silhuetas e foguete
 */
export type CardEffectType =
  | 'app-builder'
  | 'digital-employee'
  | 'business-design'
  | 'content-creator'
  | 'content-machine'
  | 'video-studio'
  | 'automation'
  | 'presence-amplifier'
  | 'strategic-advisor'
  | 'new-professions';

/**
 * Props para os componentes de Card Effect
 * 🆕 isActive: controla quando a animação deve iniciar
 */
export interface CardEffectProps {
  /** Se true, a animação inicia. Se false, fica em estado inicial/parado */
  isActive?: boolean;
}

/**
 * Mapeamento de tipo → componente
 */
const CARD_EFFECT_COMPONENTS: Record<CardEffectType, React.FC<CardEffectProps>> = {
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
};

/**
 * Descrições amigáveis para cada tipo (para UI)
 */
export const CARD_EFFECT_LABELS: Record<CardEffectType, string> = {
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
};

/**
 * Descrições detalhadas para tooltips
 */
export const CARD_EFFECT_DESCRIPTIONS: Record<CardEffectType, string> = {
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
};

/**
 * Lista de tipos para seleção em UI
 */
export const CARD_EFFECT_TYPES: CardEffectType[] = [
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
  /** 🆕 Se true, a animação inicia. Se false, fica em estado inicial */
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
