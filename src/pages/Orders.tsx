import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import type { Order } from "../types";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Order[]>("/orders")
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  if (orders.length === 0) {
    return <div className="flex justify-center py-20 text-gray-400">Henüz hiç sipariş vermediniz.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Siparişlerim</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-900">Sipariş #{order.id}</span>
              <span className="bg-orange-50 text-orange-500 text-xs font-semibold px-3 py-1 rounded-full">
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-500">Toplam</span>
              <span className="text-lg font-extrabold text-gray-900">{order.totalPrice.toFixed(2)} ₺</span>
            </div>
            <p className="text-sm text-orange-500 font-semibold text-right mt-2">Detayları Gör →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
