import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 🔄 PWA DESABILITADO: Removido para evitar problemas de cache com Service Worker
// que causava exibição de versões antigas do dashboard
// O SW será reativado quando o app estiver estável para produção

// 🧹 Limpar qualquer Service Worker antigo e caches obsoletos
const APP_VERSION = '2026-02-25-v4';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('[PWA] Service Worker removido:', registration.scope);
    });
    // Se havia SWs ativos, força reload limpo UMA vez
    if (registrations.length > 0) {
      const reloadKey = `sw-cleared-${APP_VERSION}`;
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1');
        window.location.reload();
      }
    }
  });
}

// Limpar caches antigos (IndexedDB / Cache API)
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
      console.log('[PWA] Cache removido:', name);
    });
  });
}

console.log('[AIliv] Dashboard versão:', APP_VERSION);

// Runtime signature no boot
import('./lib/runtimeSignature').then(({ logRuntimeSignature }) => {
  logRuntimeSignature({ route: window.location.pathname });
});

// 🧪 Disponibilizar testes no console (desenvolvimento)
if (import.meta.env.DEV) {
  import('./lib/exerciseValidator.manual').catch(() => {
    // Ignore test file loading errors in dev
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
