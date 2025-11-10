import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 🧪 Disponibilizar testes no console (desenvolvimento)
if (import.meta.env.DEV) {
  import('./lib/exerciseValidator.test');
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
