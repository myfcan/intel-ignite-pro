import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BUILD_FINGERPRINT } from './lib/runtimeSignature';

// 🔄 PWA DESABILITADO: Removido para evitar problemas de cache com Service Worker

// ============================================================
// Fase 1: Invalidação determinística por BUILD_FINGERPRINT
// Cada build gera um fingerprint único (via Vite define).
// Se o fingerprint mudar em relação ao anterior salvo em localStorage,
// limpamos SWs + Cache API e forçamos reload único (anti-loop via sessionStorage).
// ============================================================
const PREVIOUS_FP_KEY = 'ailiv_build_fp';
const RELOAD_GUARD_KEY = `ailiv_reload_${BUILD_FINGERPRINT}`;

const previousFP = localStorage.getItem(PREVIOUS_FP_KEY);
const isNewBuild = previousFP !== null && previousFP !== BUILD_FINGERPRINT;

// Sempre persiste o fingerprint atual
localStorage.setItem(PREVIOUS_FP_KEY, BUILD_FINGERPRINT);

if (isNewBuild) {
  console.warn(`[AIliv:CachePurge] Build mudou: ${previousFP} → ${BUILD_FINGERPRINT}. Limpando caches...`);
}

// Limpar SWs (sempre, para segurança)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('[AIliv:SW] Removido:', registration.scope);
    });
    // Se havia SWs e build mudou, reload controlado
    if (registrations.length > 0 && isNewBuild && !sessionStorage.getItem(RELOAD_GUARD_KEY)) {
      sessionStorage.setItem(RELOAD_GUARD_KEY, '1');
      console.warn('[AIliv:CachePurge] Reload forçado por novo build.');
      window.location.reload();
    }
  });
}

// Limpar Cache API (sempre, para segurança)
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
      console.log('[AIliv:Cache] Removido:', name);
    });
    // Se havia caches e build mudou, reload controlado
    if (names.length > 0 && isNewBuild && !sessionStorage.getItem(RELOAD_GUARD_KEY)) {
      sessionStorage.setItem(RELOAD_GUARD_KEY, '1');
      console.warn('[AIliv:CachePurge] Reload forçado por novo build (cache).');
      window.location.reload();
    }
  });
}

console.log(`[AIliv] Boot | build=${BUILD_FINGERPRINT} | prev=${previousFP ?? 'first-run'} | new=${isNewBuild}`);

// Runtime signature no boot
import('./lib/runtimeSignature').then(({ logRuntimeSignature }) => {
  logRuntimeSignature({ route: window.location.pathname });
});

// 🧪 Disponibilizar testes no console (desenvolvimento)
if (import.meta.env.DEV) {
  import('./lib/exerciseValidator.manual').catch(() => {});
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
