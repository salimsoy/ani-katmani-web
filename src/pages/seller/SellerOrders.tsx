import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { Package, ChevronRight } from "lucide-react";

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

type GroupedOrder = {
  orderId: number;
  customerFullName: string;
  createdAt: string;
  items: SellerOrderItem[];
  total: number;
};

const STATUS_COLORS: Record<string, string> = {
  Beklemede: "bg-orange-50 text-orange-600",
  Hazırlanıyor: "bg-blue-50 text-blue-600",
  Kargoda: "bg-purple-50 text-purple-600",
  "Teslim Edildi": "bg-green-50 text-green-600",
  "İptal Edildi": "bg-red-50 text-red-600",
  "Sipariş Tamamlandı": "bg-gray-100 text-gray-600",
};

function computeOverallStatus(items: SellerOrderItem[]): string {
  if (items.some((i) => i.status === "Beklemede" || i.status === "Hazırlanıyor" || i.status === "Kargoda")) {
    return "Hazırlanıyor";
  }
  if (items.every((i) => i.status === "Teslim Edildi")) return "Teslim Edildi";
  if (items.every((i) => i.status === "İptal Edildi")) return "İptal Edildi";
  return "Sipariş Tamamlandı";
}

function groupByOrder(items: SellerOrderItem[]): GroupedOrder[] {
  const map = new Map<number, GroupedOrder>();
  for (const item of items) {
    const existing = map.get(item.orderId);
    if (existing) {
      existing.items.push(item);
      existing.total += item.lineTotal;
    } else {
      map.set(item.orderId, {
        orderId: item.orderId,
        customerFullName: item.customerFullName,
        createdAt: item.createdAt,
        items: [item],
        total: item.lineTotal,
      });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<GroupedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<SellerOrderItem[]>("/orders/seller")
      .then((data) => setOrders(groupByOrder(data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <Package size={48} className="mb-4" />
        <p className="font-semibold">Henüz siparişiniz yok.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">{orders.length} sipariş</p>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Sipariş</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Toplam</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const overallStatus = computeOverallStatus(order.items);
                return (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">#{order.orderId}</td>
                    <td className="px-4 py-3 text-gray-600">{order.customerFullName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_COLORS[overallStatus] ?? "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {overallStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-orange-500 font-semibold whitespace-nowrap">
                      {order.total.toFixed(2)} ₺
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/seller-orders/${order.orderId}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 hover:bg-gray-800"
                      >
                        Detay
                        <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}