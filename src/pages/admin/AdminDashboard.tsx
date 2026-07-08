import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import type { Order } from "../../types";

const STATUS_OPTIONS = ["Beklemede", "Hazırlanıyor", "Kargoda", "Teslim Edildi"];
const STATUS_COLORS: Record<string, string> = {
  Beklemede: "#ff9800",
  Hazırlanıyor: "#2196f3",
  Kargoda: "#9c27b0",
  "Teslim Edildi": "#27ae60",
};

interface TopFigurine {
  figurineId: number;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Order[]>("/orders/admin")
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const statusCounts: Record<string, number> = {};
  STATUS_OPTIONS.forEach((s) => (statusCounts[s] = 0));
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  });

  const figurineMap = new Map<number, TopFigurine>();
  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const existing = figurineMap.get(item.figurineId);
      const revenue = item.unitPrice * item.quantity;
      if (existing) {
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += revenue;
      } else {
        figurineMap.set(item.figurineId, {
          figurineId: item.figurineId,
          name: item.figurine?.name ?? `#${item.figurineId}`,
          totalQuantity: item.quantity,
          totalRevenue: revenue,
        });
      }
    });
  });

  const topFigurines = Array.from(figurineMap.values())
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);

  // Son 30 günün günlük ciro/sipariş sayısı için basit bir seri
  const last30Days: { date: string; count: number; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
    last30Days.push({ date: dateKey, count: 0, revenue: 0 });
  }
  orders.forEach((order) => {
    const orderDateKey = new Date(order.createdAt).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
    });
    const bucket = last30Days.find((d) => d.date === orderDateKey);
    if (bucket) {
      bucket.count += 1;
      bucket.revenue += order.totalPrice;
    }
  });
  const maxDailyRevenue = Math.max(...last30Days.map((d) => d.revenue), 1);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 mb-1">Toplam Sipariş</p>
          <p className="text-3xl font-extrabold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 mb-1">Toplam Ciro</p>
          <p className="text-3xl font-extrabold text-orange-500">{totalRevenue.toFixed(2)} ₺</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 mb-1">Ortalama Sipariş Tutarı</p>
          <p className="text-3xl font-extrabold text-gray-900">{avgOrderValue.toFixed(2)} ₺</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Durum Dağılımı</h2>
          <div className="space-y-3">
            {STATUS_OPTIONS.map((status) => {
              const count = statusCounts[status];
              const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{status}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
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

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">En Çok Satan Figürinler</h2>
          {topFigurines.length === 0 ? (
            <p className="text-sm text-gray-400">Henüz veri yok.</p>
          ) : (
            <div className="space-y-3">
              {topFigurines.map((f, index) => (
                <div key={f.figurineId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{index + 1}</span>
                    <span className="text-sm font-semibold text-gray-800">{f.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{f.totalQuantity} adet</p>
                    <p className="text-xs text-gray-400">{f.totalRevenue.toFixed(2)} ₺</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mt-6">
        <h2 className="font-bold text-gray-900 mb-4">Son 30 Gün — Günlük Ciro</h2>
        <div className="flex items-end gap-1 h-32">
          {last30Days.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative">
              <div
                className="w-full bg-orange-500 rounded-t hover:bg-orange-600 transition-colors"
                style={{ height: `${(d.revenue / maxDailyRevenue) * 100}%`, minHeight: d.revenue > 0 ? "2px" : "0" }}
                title={`${d.date}: ${d.revenue.toFixed(2)} ₺ (${d.count} sipariş)`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{last30Days[0].date}</span>
          <span>{last30Days[last30Days.length - 1].date}</span>
        </div>
      </div>
    </div>
  );
}