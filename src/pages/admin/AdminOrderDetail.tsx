import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "../../api/client";
import { PLACEHOLDER_IMAGE } from "../../api/placeholderImage";
import type { AdminOrder } from "../../types";

const STATUS_OPTIONS = ["Beklemede", "Hazırlanıyor", "Kargoda", "Teslim Edildi"];

const STATUS_COLORS: Record<string, string> = {
  Beklemede: "#ff9800",
  Hazırlanıyor: "#2196f3",
  Kargoda: "#9c27b0",
  "Teslim Edildi": "#27ae60",
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("Beklemede");

  useEffect(() => {
    setLoading(true);
    apiFetch<AdminOrder>(`/orders/admin/${id}`)
      .then((data) => {
        setOrder(data);
        setSelectedStatus(data.status);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(newStatus: string) {
    if (!order) return;
    setUpdating(true);
    try {
      await apiFetch(`/orders/${order.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setOrder({ ...order, status: newStatus });
    } catch {
      window.alert("Durum güncellenemedi.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  if (!order) {
    return <div className="flex justify-center py-20 text-gray-400">Sipariş bulunamadı.</div>;
  }

  const color = STATUS_COLORS[order.status] ?? "#999";
  const subtotal = order.orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/admin-orders")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeft size={16} />
        Sipariş Listesine Dön
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Sipariş #{order.id}</h1>
        <span
          className="text-sm font-bold px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {order.status}
        </span>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-900">Müşteri Bilgileri</h2>
          {!order.userId && (
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              MİSAFİR
            </span>
          )}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Ad Soyad</span>
          <span className="font-semibold text-gray-900">{order.fullName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Telefon</span>
          <span className="font-semibold text-gray-900">{order.phoneNumber}</span>
        </div>
        {(order.user?.email || order.email) && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">E-posta</span>
            <span className="font-semibold text-gray-900">{order.user?.email ?? order.email}</span>
          </div>
        )}
        <div className="flex justify-between text-sm gap-4">
          <span className="text-gray-500 shrink-0">Adres</span>
          <span className="font-semibold text-gray-900 text-right">{order.address}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Sipariş Tarihi</span>
          <span className="font-semibold text-gray-900">
            {new Date(order.createdAt).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <h2 className="font-bold text-gray-900 mb-3">Ürünler</h2>
      <div className="space-y-3 mb-6">
        {order.orderItems.map((item) => (
          <div key={item.id} className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm items-center">
            <img
              src={item.figurine?.imageUrl || PLACEHOLDER_IMAGE}
              alt={item.figurine?.name}
              className="w-16 h-16 rounded-xl object-cover bg-gray-100"
            />
            <div className="flex-1">
              <p className="font-bold text-gray-900">{item.figurine?.name}</p>
              <p className="text-xs text-gray-400 mb-1">
                {item.figurine?.filamentType} • {item.figurine?.scale}
              </p>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">{item.quantity} adet</span>
                <span className="font-bold text-orange-500">{(item.unitPrice * item.quantity).toFixed(2)} ₺</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-bold text-gray-900 mb-3">Ödeme Özeti</h2>
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Ara Toplam</span>
          <span className="text-gray-700">{subtotal.toFixed(2)} ₺</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">İndirim{order.coupon ? ` (${order.coupon.code})` : ""}</span>
            <span className="text-red-500 font-semibold">- {order.discountAmount.toFixed(2)} ₺</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Kargo{order.shippingOption ? ` (${order.shippingOption.name})` : ""}
          </span>
          <span className="text-gray-700">{order.shippingCost.toFixed(2)} ₺</span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-2">
          <span className="font-bold text-gray-900">Toplam</span>
          <span className="text-xl font-extrabold text-orange-500">{order.totalPrice.toFixed(2)} ₺</span>
        </div>
      </div>

      <h2 className="font-bold text-gray-900 mb-3">Durumu Değiştir</h2>
      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
          style={{ color: STATUS_COLORS[selectedStatus] }}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status} style={{ color: "#1a1a1a" }}>
              {status}
            </option>
          ))}
        </select>
        <button
          onClick={() => updateStatus(selectedStatus)}
          disabled={updating || selectedStatus === order.status}
          className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Güncelleniyor..." : "Güncelle"}
        </button>
      </div>
    </div>
  );
}