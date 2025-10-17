import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App";
import { useRegisterSW } from "virtual:pwa-register/react";

useRegisterSW({
  immediate: true,
  onOfflineReady() {},
  onNeedRefresh() {},
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
