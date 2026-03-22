import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MobileGuard from "./Components/DesktopGaurd.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <MobileGuard>
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <App />
    </StrictMode>
  </QueryClientProvider>
  </MobileGuard>
);
