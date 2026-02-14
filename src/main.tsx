import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import App from "./App.tsx";
import "./index.css";

// 🔄 PWA: Forçar atualização imediata do Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Atualiza automaticamente sem perguntar ao usuário
    console.log('[PWA] Nova versão disponível, atualizando...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[PWA] App pronta para uso offline');
  },
  onRegisteredSW(swUrl, r) {
    if (r) {
      // Verificação imediata ao registrar
      r.update();
      // Verifica atualizações a cada 60 segundos
      setInterval(() => {
        console.log('[PWA] Verificando atualizações...');
        r.update();
      }, 60 * 1000);
    }
  },
});

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
