import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Package, User, LogOut, Settings, MapPin, Store, MessageSquare, RotateCcw} from "lucide-react";

const ACCOUNT_LINKS = [
  { to: "/orders", label: "Siparişlerim", icon: Package },
  { to: "/account", label: "Bilgilerim", icon: User },
  { to: "/addresses", label: "Adreslerim", icon: MapPin },
  { to: "/complaints", label: "Şikayetlerim", icon: MessageSquare },
  { to: "/returns", label: "İadelerim", icon: RotateCcw },
];

export default function AccountLayout() {
  const { isAdmin, isSeller, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="flex gap-6">
      <aside className="w-52 shrink-0">
        <nav className="bg-white rounded-2xl border border-gray-100 p-3 sticky top-24 space-y-1">
          {ACCOUNT_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-500"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Settings size={18} />
              Admin Paneli
            </NavLink>
          )}

          {isSeller ? (
            <NavLink
              to="/seller-dashboard"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <Store size={18} />
              Satıcı Panelim
            </NavLink>
          ) : (
            !isAdmin && (
              <NavLink
                to="/seller-apply"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-orange-500 hover:bg-orange-50"
              >
                <Store size={18} />
                Satıcı Ol
              </NavLink>
            )
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 mt-2 border-t border-gray-100 pt-3"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}