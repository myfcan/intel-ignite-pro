import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 🔄 PWA DESABILITADO: Removido para evitar problemas de cache com Service Worker
// que causava exibição de versões antigas do dashboard
// O SW será reativado quando o app estiver estável para produção

// Limpar qualquer Service Worker antigo que ainda esteja registrado
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('[PWA] Service Worker removido:', registration.scope);
    });
  });
  // Limpar caches antigos
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log('[PWA] Cache removido:', name);
      });
    });
  }
}

// 🧪 Disponibilizar testes no console (desenvolvimento)
if (import.meta.env.DEV) {
  import('./lib/exerciseValidator.test').catch(() => {
    // Ignore test file loading errors in dev
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
