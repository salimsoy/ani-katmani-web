import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Package, BarChart3, ClipboardList, Ticket, Truck, Users, Store,
  LogOut, Menu, X, ChevronRight, UserCheck, MessageSquare, AlertCircle, RotateCcw
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AdminLink {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  exact?: boolean;
}

const ADMIN_LINKS: AdminLink[] = [
  { to: "/admin-dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/admin", label: "Figürinler", icon: Package, exact: true },
  { to: "/admin-orders", label: "Siparişler", icon: ClipboardList },
  { to: "/admin-sellers", label: "Satıcı Başvuruları", icon: UserCheck },
  { to: "/admin-coupons", label: "Kuponlar", icon: Ticket },
  { to: "/admin-shipping", label: "Kargo", icon: Truck },
  { to: "/admin-users", label: "Kullanıcılar", icon: Users },
  { to: "/admin-sellers-list", label: "Tüm Satıcılar", icon: Store },
  { to: "/admin-reviews", label: "Yorumlar", icon: MessageSquare },
  { to: "/admin-complaints", label: "Şikayetler", icon: AlertCircle },
  { to: "/admin-returns", label: "İadeler", icon: RotateCcw },
];

// Route'a göre sayfa başlığını bulur (üst bar için)
function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/admin-orders/")) return "Sipariş Detayı";
  const link = ADMIN_LINKS.find((l) =>
    l.exact ? pathname === l.to : pathname.startsWith(l.to)
  );
  return link?.label ?? "Admin Panel";
}

export default function AdminLayout() {
  const { firstName, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = getPageTitle(location.pathname);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop'ta sabit, mobilde overlay */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40
          w-64 h-screen
          bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo / Marka */}
        <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-lg font-extrabold text-gray-900">Anı Katmanı</p>
            <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-wider">
              Admin Panel
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menü */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {ADMIN_LINKS.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} />
                  <span className="flex-1">{label}</span>
                  {isActive && <span className="w-1 h-6 rounded-full bg-orange-500 -mr-3" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Alt kısım — kullanıcı bilgisi + linkler */}
        <div className="border-t border-gray-100 p-3 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 mb-2">
            <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
              {firstName?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{firstName ?? "Admin"}</p>
              <p className="text-[11px] font-semibold text-gray-500">Yönetici</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Store size={18} />
            Siteye Dön
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Sidebar açıkken mobilde arkaya karanlık overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Ana içerik alanı */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Üst bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1 text-gray-500 hover:text-gray-900"
              >
                <Menu size={22} />
              </button>

              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-sm min-w-0">
                <span className="text-gray-400 font-semibold hidden sm:inline">Admin</span>
                <ChevronRight size={14} className="text-gray-300 hidden sm:block" />
                <h1 className="text-lg font-extrabold text-gray-900 truncate">{pageTitle}</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Sayfa içeriği */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}