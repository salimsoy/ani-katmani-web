import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import { PLACEHOLDER_IMAGE } from "../api/placeholderImage";
import type { Order } from "../types";

const STATUS_COLORS: Record<string, string> = {
  Beklemede: "#ff9800",
  Hazırlanıyor: "#2196f3",
  Kargoda: "#9c27b0",
  "Teslim Edildi": "#27ae60",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<Order>(`/orders/${id}`)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  if (!order) {
    return <div className="flex justify-center py-20 text-gray-400">Sipariş bulunamadı.</div>;
  }

  const statusColor = STATUS_COLORS[order.status] ?? "#999";
  // "Ara Toplam" = sadece ürünlerin toplamı (kargo ve indirim hariç)
  const originalPrice = order.totalPrice + (order.discountAmount || 0) - (order.shippingCost || 0);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Sipariş #{order.id}</h1>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <p className="text-xs text-gray-400 mb-2">Sipariş Durumu</p>
        <span
          className="inline-block text-sm font-bold px-3 py-1.5 rounded-lg mb-2"
          style={{ backgroundColor: `${statusColor}22`, color: statusColor }}
        >
          {order.status}
        </span>
        <p className="text-sm text-gray-400">
          {new Date(order.createdAt).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
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

      <h2 className="font-bold text-gray-900 mb-3">Teslimat Bilgileri</h2>
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Ad Soyad</span>
          <span className="font-semibold text-gray-900">{order.fullName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Telefon</span>
          <span className="font-semibold text-gray-900">{order.phoneNumber}</span>
        </div>
        <div className="flex justify-between text-sm gap-4">
          <span className="text-gray-500 shrink-0">Adres</span>
          <span className="font-semibold text-gray-900 text-right">{order.address}</span>
        </div>
      </div>

      <h2 className="font-bold text-gray-900 mb-3">Ödeme Özeti</h2>
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        {order.discountAmount > 0 && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ara Toplam</span>
              <span className="text-gray-400 line-through">{originalPrice.toFixed(2)} ₺</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">İndirim</span>
              <span className="text-red-500 font-semibold">- {order.discountAmount.toFixed(2)} ₺</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Kargo{order.shippingOption ? ` (${order.shippingOption.name})` : ""}
          </span>
          <span className="font-semibold text-gray-900">{order.shippingCost.toFixed(2)} ₺</span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-3">
          <span className="font-bold text-gray-900">Toplam</span>
          <span className="text-xl font-extrabold text-orange-500">{order.totalPrice.toFixed(2)} ₺</span>
        </div>
      </div>
    </div>
  );
}
