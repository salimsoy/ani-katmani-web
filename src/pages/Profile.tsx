import { Link, useNavigate } from "react-router-dom";
import { Package, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { token, firstName, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center mb-3">
          <span className="text-3xl font-bold text-white">
            {token && firstName ? firstName[0].toUpperCase() : "?"}
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {token ? `Merhaba, ${firstName}!` : "Misafir Kullanıcı"}
        </h1>
      </div>

      {token ? (
        <div className="space-y-3">
          <Link
            to="/orders"
            className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="flex items-center gap-3 font-semibold text-gray-900">
              <Package size={20} className="text-orange-500" />
              Siparişlerim
            </span>
            <span className="text-orange-500">→</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center justify-between bg-gray-900 rounded-2xl p-4 hover:bg-gray-800 transition-colors"
            >
              <span className="flex items-center gap-3 font-semibold text-white">
                <Settings size={20} className="text-orange-500" />
                Admin Paneli
              </span>
              <span className="text-orange-500">→</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-500 font-bold py-3.5 mt-6 hover:bg-red-100"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <Link
            to="/login"
            className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="font-semibold text-gray-900">🔐 Giriş Yap</span>
            <span className="text-orange-500">→</span>
          </Link>
          <Link
            to="/register"
            className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="font-semibold text-gray-900">✨ Kayıt Ol</span>
            <span className="text-orange-500">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
