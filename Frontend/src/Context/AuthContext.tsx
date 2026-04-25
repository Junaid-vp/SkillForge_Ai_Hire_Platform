import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../Api/Axios";

type AuthRole = "hr" | "dev" | null;
type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface HrUser {
  id: string;
}

interface DevUser {
  id: string;
}

interface AuthContextValue {
  status: AuthStatus;
  role: AuthRole;
  hr: HrUser | null;
  dev: DevUser | null;
  refreshAuth: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [role, setRole] = useState<AuthRole>(null);
  const [hr, setHr] = useState<HrUser | null>(null);
  const [dev, setDev] = useState<DevUser | null>(null);

  const clearAuth = () => {
    setStatus("unauthenticated");
    setRole(null);
    setHr(null);
    setDev(null);
  };

  const refreshAuth = async () => {
    setStatus("loading");

    try {
      const hrRes = await api.get("/auth/hr/me");
      setRole("hr");
      setHr(hrRes?.data?.data ?? null);
      setDev(null);
      setStatus("authenticated");
      return;
    } catch {
      // Not an HR session.
    }

    try {
      const devRes = await api.get("/dev/me");
      setRole("dev");
      setDev(devRes?.data?.data ?? null);
      setHr(null);
      setStatus("authenticated");
      return;
    } catch {
      clearAuth();
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const value = useMemo(
    () => ({ status, role, hr, dev, refreshAuth, clearAuth }),
    [status, role, hr, dev]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
