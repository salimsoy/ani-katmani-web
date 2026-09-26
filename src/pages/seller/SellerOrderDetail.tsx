import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { PLACEHOLDER_IMAGE } from "../../api/placeholderImage";
import { ChevronLeft, User, Phone, MapPin, Calendar } from "lucide-react";

type SellerOrderItem = {
  orderId: number;
  orderItemId: number;
  customerFullName: string;
  address: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
  figurine: { id: number; name: string; imageUrl: string | null };
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

const STATUS_COLORS: Record<string, string> = {
  Beklemede: "bg-orange-50 text-orange-600",
  Hazırlanıyor: "bg-blue-50 text-blue-600",
  Kargoda: "bg-purple-50 text-purple-600",
  "Teslim Edildi": "bg-green-50 text-green-600",
  "İptal Edildi": "bg-red-50 text-red-600",
};

const STATUS_OPTIONS = Object.keys(STATUS_COLORS).filter((s) => s !== "İptal Edildi");

export default function SellerOrderDetail() {
  const { orderId } = useParams();
  const [items, setItems] = useState<SellerOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<SellerOrderItem[]>("/orders/seller")
      .then((data) => setItems(data.filter((i) => String(i.orderId) === orderId)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  async function handleItemStatusChange(orderItemId: number, newStatus: string) {
    try {
      await apiFetch(`/order-items/${orderItemId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setItems((prev) =>
        prev.map((item) => (item.orderItemId === orderItemId ? { ...item, status: newStatus } : item))
      );
    } catch {
      window.alert("Durum güncellenemedi.");
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  if (items.length === 0) {
    return <div className="flex justify-center py-20 text-gray-400">Sipariş bulunamadı.</div>;
  }

  const first = items[0];
  const total = items.reduce((sum, i) => sum + i.lineTotal, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/seller-orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ChevronLeft size={16} />
        Siparişlere Dön
      </Link>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Sipariş #{first.orderId}</h1>

      <h2 className="font-bold text-gray-900 mb-3">Ürünler</h2>
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.orderItemId} className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm">
            <img
              src={item.figurine.imageUrl || PLACEHOLDER_IMAGE}
              alt={item.figurine.name}
              className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{item.figurine.name}</p>
              <p className="text-xs text-gray-400 mb-1">{item.quantity} adet × {item.unitPrice.toFixed(2)} ₺</p>
              <select
                value={item.status}
                onChange={(e) => handleItemStatusChange(item.orderItemId, e.target.value)}
                className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  STATUS_COLORS[item.status] ?? "bg-gray-50 text-gray-600"
                }`}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <p className="text-sm font-bold text-orange-500 shrink-0">{item.lineTotal.toFixed(2)} ₺</p>
          </div>
        ))}
      </div>

      <h2 className="font-bold text-gray-900 mb-3">Müşteri Bilgileri</h2>
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 space-y-3">
        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-500 flex items-center gap-1.5"><User size={14} />Ad Soyad</span>
          <span className="font-semibold text-gray-900">{first.customerFullName}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-500 flex items-center gap-1.5"><Phone size={14} />Telefon</span>
          <span className="font-semibold text-gray-900">{first.phoneNumber}</span>
        </div>
        <div className="flex justify-between text-sm gap-4">
          <span className="text-gray-500 shrink-0 flex items-center gap-1.5"><MapPin size={14} />Adres</span>
          <span className="font-semibold text-gray-900 text-right">{first.address}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-500 flex items-center gap-1.5"><Calendar size={14} />Sipariş Tarihi</span>
          <span className="font-semibold text-gray-900">
            {new Date(first.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white rounded-2xl p-5 shadow-sm">
        <span className="font-bold text-gray-900">Toplam</span>
        <span className="text-xl font-extrabold text-orange-500">{total.toFixed(2)} ₺</span>
      </div>
    </div>
  );
}