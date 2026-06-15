import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { BrowserRouter } from "react-router-dom";
import "./styles/globals.css";
import "./styles/font-vars.css";
import { App } from "./App";
import { authClient } from "./lib/auth-client";
import { convex } from "./lib/convex";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexBetterAuthProvider>
  </StrictMode>,
);
