'use client';

import React from 'react';

// Importar todos os card effects
export { CardEffectAppBuilder } from './CardEffectAppBuilder';
export { CardEffectDigitalEmployee } from './CardEffectDigitalEmployee';
export { CardEffectBusinessDesign } from './CardEffectBusinessDesign';
export { CardEffectContentMachine } from './CardEffectContentMachine';
export { CardEffectAutomation } from './CardEffectAutomation';
export { CardEffectDataAnalysis } from './CardEffectDataAnalysis';
export { CardEffectCreativity } from './CardEffectCreativity';

// Lazy imports para code splitting
import { CardEffectAppBuilder } from './CardEffectAppBuilder';
import { CardEffectDigitalEmployee } from './CardEffectDigitalEmployee';
import { CardEffectBusinessDesign } from './CardEffectBusinessDesign';
import { CardEffectContentMachine } from './CardEffectContentMachine';
import { CardEffectAutomation } from './CardEffectAutomation';
import { CardEffectDataAnalysis } from './CardEffectDataAnalysis';
import { CardEffectCreativity } from './CardEffectCreativity';

/**
 * Tipos de card effects disponíveis
 *
 * Cada tipo corresponde a um cenário visual específico:
 * - app-builder: Celular com código sendo gerado
 * - digital-employee: Robô trabalhando
 * - business-design: Linha de progresso com etapas
 * - content-machine: Esteira de produção de conteúdo
 * - automation: Nós conectados com fluxo de energia
 * - data-analysis: Gráficos e análise de dados
 * - creativity: Lâmpada com ideias criativas
 */
export type CardEffectType =
  | 'app-builder'
  | 'digital-employee'
  | 'business-design'
  | 'content-machine'
  | 'automation'
  | 'data-analysis'
  | 'creativity'
  // Aliases para flexibilidade
  | 'ia-app'
  | 'ia-employee'
  | 'ia-business'
  | 'ia-content'
  | 'ia-automation'
  | 'ia-data'
  | 'ia-creative';

/**
 * Mapeamento de tipo → componente
 */
const CARD_EFFECT_COMPONENTS: Record<CardEffectType, React.FC> = {
  // Tipos principais
  'app-builder': CardEffectAppBuilder,
  'digital-employee': CardEffectDigitalEmployee,
  'business-design': CardEffectBusinessDesign,
  'content-machine': CardEffectContentMachine,
  'automation': CardEffectAutomation,
  'data-analysis': CardEffectDataAnalysis,
  'creativity': CardEffectCreativity,
  // Aliases
  'ia-app': CardEffectAppBuilder,
  'ia-employee': CardEffectDigitalEmployee,
  'ia-business': CardEffectBusinessDesign,
  'ia-content': CardEffectContentMachine,
  'ia-automation': CardEffectAutomation,
  'ia-data': CardEffectDataAnalysis,
  'ia-creative': CardEffectCreativity,
};

/**
 * Descrições amigáveis para cada tipo
 */
export const CARD_EFFECT_LABELS: Record<CardEffectType, string> = {
  'app-builder': 'IA Construindo App',
  'digital-employee': 'Funcionário Digital',
  'business-design': 'Design de Negócio',
  'content-machine': 'Máquina de Conteúdo',
  'automation': 'Automação de Processos',
  'data-analysis': 'Análise de Dados',
  'creativity': 'Geração de Ideias',
  // Aliases
  'ia-app': 'IA Construindo App',
  'ia-employee': 'Funcionário Digital',
  'ia-business': 'Design de Negócio',
  'ia-content': 'Máquina de Conteúdo',
  'ia-automation': 'Automação de Processos',
  'ia-data': 'Análise de Dados',
  'ia-creative': 'Geração de Ideias',
};

/**
 * Ícones sugeridos para cada tipo (Lucide icon names)
 */
export const CARD_EFFECT_ICONS: Record<CardEffectType, string> = {
  'app-builder': 'Smartphone',
  'digital-employee': 'Bot',
  'business-design': 'Target',
  'content-machine': 'Factory',
  'automation': 'Workflow',
  'data-analysis': 'BarChart3',
  'creativity': 'Lightbulb',
  // Aliases
  'ia-app': 'Smartphone',
  'ia-employee': 'Bot',
  'ia-business': 'Target',
  'ia-content': 'Factory',
  'ia-automation': 'Workflow',
  'ia-data': 'BarChart3',
  'ia-creative': 'Lightbulb',
};

/**
 * Lista de tipos principais (sem aliases) para seleção em UI
 */
export const CARD_EFFECT_TYPES: CardEffectType[] = [
  'app-builder',
  'digital-employee',
  'business-design',
  'content-machine',
  'automation',
  'data-analysis',
  'creativity',
];

/**
 * Retorna o componente de card effect para um determinado tipo
 *
 * @param type - Tipo do card effect
 * @returns Componente React ou null se tipo inválido
 */
export function getCardEffectComponent(type: string): React.FC | null {
  const normalizedType = type.toLowerCase().trim() as CardEffectType;
  return CARD_EFFECT_COMPONENTS[normalizedType] || null;
}

/**
 * Verifica se um tipo de card effect é válido
 *
 * @param type - Tipo a verificar
 * @returns true se válido
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
}

/**
 * Componente que renderiza dinamicamente o card effect correto
 * baseado no tipo fornecido
 */
export const DynamicCardEffect: React.FC<DynamicCardEffectProps> = ({
  type,
  fallback = null
}) => {
  const Component = getCardEffectComponent(type);

  if (!Component) {
    console.warn(`[DynamicCardEffect] Tipo desconhecido: "${type}". Usando fallback.`);
    return <>{fallback}</>;
  }

  return <Component />;
};

export default DynamicCardEffect;
