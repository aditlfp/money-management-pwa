import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App";
import PWABadge from "./PWABadge";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <>
      <PWABadge />
      <App />
    </>
  </StrictMode>
);
