import { BUILD_FINGERPRINT, DASHBOARD_LAYOUT_ID } from '@/lib/runtimeSignature';

/**
 * Badge mostrando build fingerprint + layout ID + ambiente.
 * Visível para admins (via prop) ou quando ?debug=true na URL.
 */
export function BuildBadge({ isAdmin = false }: { isAdmin?: boolean }) {
  const showDebug = isAdmin || new URLSearchParams(window.location.search).has('debug');
  
  if (!showDebug) return null;

  const env = window.location.hostname.includes('preview') ? 'preview' : 
              window.location.hostname.includes('lovable.app') ? 'published' : 'local';

  return (
    <div className="fixed top-1 left-1 z-[9999] opacity-80 hover:opacity-100 transition-opacity">
      <div className="bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded-md flex gap-2 items-center shadow-lg">
        <span className="text-green-400">●</span>
        <span>{BUILD_FINGERPRINT}</span>
        <span className="text-white/40">|</span>
        <span className="text-cyan-300">{DASHBOARD_LAYOUT_ID}</span>
        <span className="text-white/40">|</span>
        <span className="text-yellow-300">{env}</span>
      </div>
    </div>
  );
}
