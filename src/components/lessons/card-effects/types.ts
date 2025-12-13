/**
 * Props compartilhadas para todos os card effects
 */
export interface CardEffectProps {
  isActive?: boolean;
  duration?: number; // duração em segundos calculada pelo pipeline
  props?: Record<string, unknown>; // props customizáveis do card
}
