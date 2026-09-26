import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireSeller() {
  const { token, isSeller, isLoading } = useAuth();

  if (isLoading) return null;
  if (!token || !isSeller) return <Navigate to="/" replace />;

  return <Outlet />;
}