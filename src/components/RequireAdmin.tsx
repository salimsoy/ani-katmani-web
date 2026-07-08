import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin() {
  const { token, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;
  if (!token || !isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}