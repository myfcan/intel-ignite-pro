import { BUILD_FINGERPRINT } from '@/lib/runtimeSignature';

/**
 * Badge discreto mostrando build fingerprint.
 * Visível apenas para admins (via prop) ou quando ?debug=true na URL.
 */
export function BuildBadge({ isAdmin = false }: { isAdmin?: boolean }) {
  const showDebug = isAdmin || new URLSearchParams(window.location.search).has('debug');
  
  if (!showDebug) return null;

  const env = window.location.hostname.includes('preview') ? 'preview' : 
              window.location.hostname.includes('lovable.app') ? 'published' : 'local';

  return (
    <div className="fixed bottom-2 right-2 z-50 opacity-60 hover:opacity-100 transition-opacity">
      <div className="bg-foreground/80 text-background text-[10px] font-mono px-2 py-1 rounded-md flex gap-2 items-center">
        <span>{BUILD_FINGERPRINT}</span>
        <span className="text-primary-foreground/60">|</span>
        <span>{env}</span>
      </div>
    </div>
  );
}
