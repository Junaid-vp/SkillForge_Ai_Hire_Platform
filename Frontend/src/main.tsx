import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MobileGuard from "./HR/Components/DesktopGaurd.tsx";
import { AuthProvider } from "./Context/AuthContext.tsx";
import { HelmetProvider } from "react-helmet-async";


const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
  <MobileGuard>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </AuthProvider>
  </QueryClientProvider>
  </MobileGuard>
  </HelmetProvider>
);
