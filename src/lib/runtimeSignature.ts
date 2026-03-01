/**
 * Runtime Signature - Observabilidade de versão/build/layout
 * Permite rastrear exatamente qual build e layout está ativo no runtime.
 */

// Gerado automaticamente pelo Vite define
declare const __BUILD_FINGERPRINT__: string;

export const BUILD_FINGERPRINT = typeof __BUILD_FINGERPRINT__ !== 'undefined' 
  ? __BUILD_FINGERPRINT__ 
  : 'dev-local';

export const DASHBOARD_LAYOUT_ID = 'dashboard_v2026_03_01';

/**
 * Imprime a assinatura completa do runtime no console.
 * Chamado no boot e em cada navegação relevante.
 */
export function logRuntimeSignature(context?: { route?: string; layoutId?: string }) {
  const signature = {
    buildFingerprint: BUILD_FINGERPRINT,
    route: context?.route ?? window.location.pathname,
    layoutId: context?.layoutId ?? null,
    timestamp: new Date().toISOString(),
    env: window.location.hostname.includes('preview') ? 'preview' : 
         window.location.hostname.includes('lovable.app') ? 'published' : 'local',
  };
  
  console.log('[AIliv:RuntimeSignature]', JSON.stringify(signature));
  return signature;
}
