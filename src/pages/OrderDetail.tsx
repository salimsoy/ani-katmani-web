import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import { PLACEHOLDER_IMAGE } from "../api/placeholderImage";
import ComplaintFormModal from "../components/ComplaintFormModal";
import ReturnFormModal from "../components/ReturnFormModal";
import { AlertCircle, RotateCcw } from "lucide-react";
import type { Order, Return } from "../types";
import LoadingState from "../components/LoadingState";

const STATUS_COLORS: Record<string, string> = {
  Beklemede: "#ff9800",
  Hazırlanıyor: "#2196f3",
  Kargoda: "#9c27b0",
  "Teslim Edildi": "#27ae60",
};

const RETURN_STATUS_COLORS: Record<string, string> = {
  "Talep Edildi": "#ff9800",
  "Onaylandı": "#2196f3",
  "Reddedildi": "#e53935",
  "Kargoya Verildi": "#9c27b0",
  "Satıcıya Ulaştı": "#3f51b5",
  "Ücret İadesi Yapıldı": "#27ae60",
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [complaintItem, setComplaintItem] = useState<{ id: number; name: string } | null>(null);
  const [returnItem, setReturnItem] = useState<{ id: number; name: string } | null>(null);
  const [returnsByItem, setReturnsByItem] = useState<Record<number, Return>>({});

  useEffect(() => {
    setLoading(true);
    apiFetch<Order>(`/orders/${id}`)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));

    apiFetch<Return[]>("/returns/mine")
      .then((returns) => {
        const map: Record<number, Return> = {};
        for (const r of returns) {
          if (r.orderId !== Number(id)) continue;
          // Aynı kalem için birden fazla iade kaydı varsa en güncelini göster
          const existing = map[r.orderItemId];
          if (!existing || new Date(r.createdAt) > new Date(existing.createdAt)) {
            map[r.orderItemId] = r;
          }
        }
        setReturnsByItem(map);
      })
      .catch(() => {});
  }, [id]);

  if (loading) {
    return <LoadingState />;
  }

  if (!order) {
    return <div className="flex justify-center py-20 text-gray-400">Sipariş bulunamadı.</div>;
  }

  // "Ara Toplam" = sadece ürünlerin toplamı (kargo ve indirim hariç)
  const originalPrice = order.totalPrice + (order.discountAmount || 0) - (order.shippingCost || 0);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Sipariş #{order.id}</h1>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
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
        {order.orderItems.map((item) => {
          const itemReturn = returnsByItem[item.id];
          return (
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
                {itemReturn ? (
                  <span
                    className="inline-block text-xs font-semibold px-2 py-0.5 rounded-lg mb-1"
                    style={{
                      backgroundColor: `${RETURN_STATUS_COLORS[itemReturn.status] ?? "#999"}22`,
                      color: RETURN_STATUS_COLORS[itemReturn.status] ?? "#999",
                    }}
                  >
                    İade: {itemReturn.status}
                  </span>
                ) : (
                  <span
                    className="inline-block text-xs font-semibold px-2 py-0.5 rounded-lg mb-1"
                    style={{
                      backgroundColor: `${STATUS_COLORS[item.status] ?? "#999"}22`,
                      color: STATUS_COLORS[item.status] ?? "#999",
                    }}
                  >
                    {item.status}
                  </span>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{item.quantity} adet</span>
                  <span className="font-bold text-orange-500">{(item.unitPrice * item.quantity).toFixed(2)} ₺</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => setComplaintItem({ id: item.id, name: item.figurine?.name ?? "Ürün" })}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500"
                  >
                    <AlertCircle size={12} />
                    Sorun Bildir
                  </button>
                  {itemReturn ? (
                    <Link
                      to={`/returns/${itemReturn.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-orange-500"
                    >
                      <RotateCcw size={12} />
                      İade Detayı
                    </Link>
                  ) : (
                    item.status === "Teslim Edildi" && (
                      <button
                        onClick={() => setReturnItem({ id: item.id, name: item.figurine?.name ?? "Ürün" })}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-orange-500"
                      >
                        <RotateCcw size={12} />
                        İade Talebi
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
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

      {complaintItem && (
        <ComplaintFormModal
          orderItemId={complaintItem.id}
          figurineName={complaintItem.name}
          onClose={() => setComplaintItem(null)}
          onCreated={(complaintId) => {
            setComplaintItem(null);
            navigate(`/complaints/${complaintId}`);
          }}
        />
      )}

      {returnItem && (
        <ReturnFormModal
          orderItemId={returnItem.id}
          figurineName={returnItem.name}
          onClose={() => setReturnItem(null)}
          onCreated={(returnId) => {
            setReturnItem(null);
            navigate(`/returns/${returnId}`);
          }}
        />
      )}
    </div>
  );
}