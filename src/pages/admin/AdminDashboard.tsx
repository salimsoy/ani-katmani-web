import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { DashboardData } from "../../types";
import { Package, AlertTriangle, TrendingUp, TrendingDown, ShoppingBasket, Wallet, CalendarRange } from "lucide-react";
import LoadingState from "../../components/LoadingState";

const STATUS_COLORS: Record<string, string> = {
  Beklemede: "#ff9800",
  Hazırlanıyor: "#2196f3",
  Kargoda: "#9c27b0",
  "Teslim Edildi": "#27ae60",
  "İptal Edildi": "#e74c3c",
};

const STATUS_ORDER = ["Beklemede", "Hazırlanıyor", "Kargoda", "Teslim Edildi", "İptal Edildi"];

function formatTL(value: number) {
  return (
    value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺"
  );
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function TrendBadge({ change }: { change: number | null }) {
  if (change === null) {
    return <span className="text-xs text-gray-400">önceki dönem verisi yok</span>;
  }
  const up = change >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
        up ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
      }`}
    >
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}%{Math.abs(change).toFixed(1)}
    </span>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<DashboardData>("/dashboard")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (!data) {
    return <div className="flex justify-center py-20 text-gray-400">Veri yüklenemedi.</div>;
  }

  const { revenue, general, statusCounts, topFigurines, dailyRevenue, recentOrders, lowStockFigurines } = data;

  const now = new Date();
  const pendingCount = statusCounts["Beklemede"] ?? 0;
  const preparingCount = statusCounts["Hazırlanıyor"] ?? 0;
  const actionNeeded = pendingCount + preparingCount;

  const maxDailyRevenue = Math.max(...dailyRevenue.map((d) => d.revenue), 1);
  const maxTopRevenue = Math.max(...topFigurines.map((f) => f.totalRevenue), 1);
  const totalOrdersForStatus = Object.values(statusCounts).reduce((sum, c) => sum + c, 0);

  const outOfStockCount = lowStockFigurines.filter((f) => f.stock === 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">
          {now.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            weekday: "long",
          })}
        </p>
      </div>

      {/* Aksiyon gereken siparişler */}
      {actionNeeded > 0 && (
        <Link
          to="/admin-orders"
          className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 hover:bg-orange-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Package size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="font-bold text-orange-800">
                {actionNeeded} sipariş bekliyor / hazırlanıyor
              </p>
              <p className="text-sm text-orange-600">
                {pendingCount} beklemede, {preparingCount} hazırlanıyor
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-orange-700">Siparişlere git →</span>
        </Link>
      )}

      {/* Düşük stok uyarısı */}
      {lowStockFigurines.length > 0 && (
        <Link
          to="/admin"
          className="flex items-center justify-between bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="font-bold text-red-800">
                {lowStockFigurines.length} üründe stok azalıyor
                {outOfStockCount > 0 && ` (${outOfStockCount} tükendi)`}
              </p>
              <p className="text-sm text-red-600 line-clamp-1">
                {lowStockFigurines
                  .slice(0, 3)
                  .map((f) => `${f.name} (${f.stock})`)
                  .join(" · ")}
                {lowStockFigurines.length > 3 && ` +${lowStockFigurines.length - 3} daha`}
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-red-700">Figürinlere git →</span>
        </Link>
      )}

      {/* KPI kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Wallet size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Bugünkü Ciro</p>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{formatTL(revenue.today)}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <TrendBadge change={pctChange(revenue.today, revenue.yesterday)} />
            <span className="text-xs text-gray-400">
              düne göre · {revenue.todayOrderCount} sipariş
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Son 7 Gün</p>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{formatTL(revenue.last7Days)}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <TrendBadge change={pctChange(revenue.last7Days, revenue.previous7Days)} />
            <span className="text-xs text-gray-400">önceki 7 güne göre</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <CalendarRange size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Bu Ay</p>
          </div>
          <p className="text-2xl font-extrabold text-orange-600">{formatTL(revenue.thisMonth)}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <TrendBadge change={pctChange(revenue.thisMonth, revenue.lastMonth)} />
            <span className="text-xs text-gray-400">geçen aya göre</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <ShoppingBasket size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Ortalama Sepet</p>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">
            {formatTL(general.averageOrderValue)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {general.totalOrders} sipariş · %{general.guestOrderPercentage.toFixed(0)} misafir
          </p>
        </div>
      </div>

      {/* Son 30 gün grafiği */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Son 30 Gün — Günlük Ciro</h2>
          <span className="text-xs text-gray-400">en yüksek gün: {formatTL(maxDailyRevenue)}</span>
        </div>
        <div className="flex items-end gap-1 h-36">
          {dailyRevenue.map((d) => {
            const dateLabel = new Date(d.date).toLocaleDateString("tr-TR", {
              day: "2-digit",
              month: "2-digit",
            });
            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center justify-end group relative"
              >
                <div
                  className="w-full bg-orange-400 rounded-t hover:bg-orange-600 transition-colors cursor-default"
                  style={{
                    height: `${(d.revenue / maxDailyRevenue) * 100}%`,
                    minHeight: d.revenue > 0 ? "3px" : "0",
                  }}
                />
                <div className="pointer-events-none absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap z-10">
                  <span className="font-bold">{dateLabel}</span> · {formatTL(d.revenue)} ·{" "}
                  {d.orderCount} sipariş
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>
            {new Date(dailyRevenue[0].date).toLocaleDateString("tr-TR", {
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
          <span>
            {new Date(dailyRevenue[dailyRevenue.length - 1].date).toLocaleDateString("tr-TR", {
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Durum dağılımı */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Durum Dağılımı</h2>
          <div className="space-y-3">
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status] ?? 0;
              const pct = totalOrdersForStatus > 0 ? (count / totalOrdersForStatus) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{status}</span>
                    <span className="font-semibold text-gray-900">
                      {count} <span className="text-gray-400 font-normal">(%{pct.toFixed(0)})</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* En çok kazandıranlar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">En Çok Kazandıran Figürler</h2>
          {topFigurines.length === 0 ? (
            <p className="text-sm text-gray-400">Henüz veri yok.</p>
          ) : (
            <div className="space-y-3">
              {topFigurines.map((f, index) => (
                <div key={f.figurineId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-gray-400 w-4 shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 truncate">{f.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-gray-900">
                        {formatTL(f.totalRevenue)}
                      </span>
                      <span className="text-xs text-gray-400 ml-1.5">{f.totalQuantity} adet</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full"
                      style={{ width: `${(f.totalRevenue / maxTopRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Son siparişler */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Son Siparişler</h2>
            <Link
              to="/admin-orders"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              Tümü →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">Henüz sipariş yok.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const color = STATUS_COLORS[order.status] ?? "#999";
                return (
                  <Link
                    key={order.id}
                    to={`/admin-orders/${order.id}`}
                    className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        #{order.id} · {order.fullName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                        {order.isGuest && " · misafir"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                        title={order.status}
                      />
                      <span className="text-sm font-bold text-gray-900">
                        {formatTL(order.totalPrice)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}