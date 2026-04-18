import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";

function FullScreenLoader() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:38px_38px] opacity-40" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[520px] h-[220px] bg-blue-100/60 rounded-full blur-3xl" />

      <div className="relative bg-white/85 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-xl shadow-gray-200/60 px-8 py-7 flex flex-col items-center">
        <div className="relative w-11 h-11 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 border-r-blue-500 animate-spin" />
          <div className="absolute inset-2 rounded-full bg-blue-50 border border-blue-100" />
        </div>

        <p className="text-sm font-semibold text-gray-800 tracking-tight">Loading your workspace</p>
        <p className="text-[11px] text-gray-400 mt-1">Checking your session and permissions...</p>
      </div>
    </div>
  );
}

export function HrProtectedRoute() {
  const { status, role } = useAuth();
  if (status === "loading") return <FullScreenLoader />;
  if (role !== "hr") return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function DevProtectedRoute() {
  const { status, role } = useAuth();
  if (status === "loading") return <FullScreenLoader />;
  if (role !== "dev") return <Navigate to="/devLogin" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { status, role } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  if (status === "loading") return <FullScreenLoader />;
  
 
  if (token) return <Outlet />;

  if (role === "hr") return <Navigate to="/dashboard" replace />;
  if (role === "dev") return <Navigate to="/devDashboard" replace />;
  return <Outlet />;
}
