import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api/client";
import type { Order } from "../../types";

const STATUS_OPTIONS = ["Beklemede", "Hazırlanıyor", "Kargoda", "Teslim Edildi"];

const STATUS_COLORS: Record<string, string> = {
  Beklemede: "#ff9800",
  Hazırlanıyor: "#2196f3",
  Kargoda: "#9c27b0",
  "Teslim Edildi": "#27ae60",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function fetchOrders() {
    setLoading(true);
    apiFetch<Order[]>("/orders/admin")
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function updateStatus(orderId: number, newStatus: string) {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch {
      window.alert("Durum güncellenemedi.");
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchesName = order.fullName.toLowerCase().includes(term);
        const matchesId = order.id.toString().includes(term);
        if (!matchesName && !matchesId) return false;
      }

      if (statusFilter !== "Tümü" && order.status !== statusFilter) return false;

      const orderDate = new Date(order.createdAt);
      if (dateFrom && orderDate < new Date(dateFrom)) return false;
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999); // gün sonuna kadar dahil et
        if (orderDate > to) return false;
      }

      return true;
    });
  }, [orders, searchTerm, statusFilter, dateFrom, dateTo]);

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("Tümü");
    setDateFrom("");
    setDateTo("");
  }

  const hasActiveFilters = searchTerm || statusFilter !== "Tümü" || dateFrom || dateTo;

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Sipariş Yönetimi</h1>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Müşteri adı / Sipariş no</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ara..."
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="min-w-[160px]">
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Durum</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="Tümü">Tümü</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Başlangıç</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Bitiş</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-800 underline px-1 py-2">
            Filtreleri temizle
          </button>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-4">
        {filteredOrders.length} / {orders.length} sipariş gösteriliyor
      </p>

      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Filtreye uyan sipariş yok.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const color = STATUS_COLORS[order.status] ?? "#999";
            return (
              <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900">Sipariş #{order.id}</span>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-lg"
                    style={{ backgroundColor: `${color}22`, color }}
                  >
                    {order.status}
                  </span>
                </div>

                <p className="text-sm font-semibold text-gray-800">{order.fullName}</p>
                <p className="text-sm text-gray-500">{order.phoneNumber}</p>
                <p className="text-sm text-gray-500 mb-1">{order.address}</p>
                <p className="text-xs text-gray-400 mb-1">
                  {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                </p>
                {order.user?.email && <p className="text-sm text-orange-500">{order.user.email}</p>}

                <div className="border-t border-gray-100 my-3" />

                {order.orderItems.map((item) => (
                  <p key={item.id} className="text-sm text-gray-600">
                    • {item.figurine?.name} x{item.quantity} — {(item.unitPrice * item.quantity).toFixed(2)} ₺
                  </p>
                ))}

                <p className="font-extrabold text-gray-900 mt-2">Toplam: {order.totalPrice.toFixed(2)} ₺</p>

                <div className="border-t border-gray-100 my-3" />

                <p className="text-xs font-semibold text-gray-600 mb-2">Durumu Değiştir:</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => {
                    const active = order.status === status;
                    const statusColor = STATUS_COLORS[status];
                    return (
                      <button
                        key={status}
                        onClick={() => updateStatus(order.id, status)}
                        style={active ? { backgroundColor: statusColor, borderColor: statusColor } : undefined}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                          active ? "text-white" : "border-gray-200 text-gray-500"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}