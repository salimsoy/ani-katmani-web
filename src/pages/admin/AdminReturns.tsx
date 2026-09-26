import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { RotateCcw, ChevronRight } from "lucide-react";
import type { Return } from "../../types";

const STATUS_COLORS: Record<string, string> = {
  "Talep Edildi": "bg-orange-50 text-orange-600",
  "Onaylandı": "bg-blue-50 text-blue-600",
  "Reddedildi": "bg-red-50 text-red-600",
  "Kargoya Verildi": "bg-purple-50 text-purple-600",
  "Satıcıya Ulaştı": "bg-indigo-50 text-indigo-600",
  "Ücret İadesi Yapıldı": "bg-green-50 text-green-600",
};

export default function AdminReturns() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Return[]>("/returns/admin")
      .then(setReturns)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  if (returns.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <RotateCcw size={48} className="mb-4" />
        <p className="font-semibold">Henüz iade talebi yok.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">{returns.length} iade talebi</p>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Ürün</th>
                <th className="px-4 py-3">Mağaza</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Sebep</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3 text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returns.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{r.figurineName}</p>
                    <p className="text-xs text-gray-400">Sipariş #{r.orderId}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.sellerStoreName || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{r.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.reason}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.refundAmount.toFixed(2)} ₺</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        STATUS_COLORS[r.status] ?? "bg-gray-50 text-gray-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin-returns/${r.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 hover:bg-gray-800"
                    >
                      Detay
                      <ChevronRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
