import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// PWA DESABILITADO temporariamente para evitar cache stale

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __BUILD_FINGERPRINT__: JSON.stringify(
      `${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36).slice(-5)}`
    ),
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-query"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
}));
