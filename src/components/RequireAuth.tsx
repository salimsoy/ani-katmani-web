import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth() {
  const { token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null; // localStorage okunurken kısa an bekle

  if (!token) {
    // Login sonrası kaldığı yere dönebilsin diye nereden geldiğini state'te taşıyoruz
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}