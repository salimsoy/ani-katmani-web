import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import { RotateCcw, ChevronRight } from "lucide-react";
import type { Return } from "../types";
import LoadingState from "../components/LoadingState";

const STATUS_COLORS: Record<string, string> = {
  "Talep Edildi": "bg-orange-50 text-orange-600",
  "Onaylandı": "bg-blue-50 text-blue-600",
  "Reddedildi": "bg-red-50 text-red-600",
  "Kargoya Verildi": "bg-purple-50 text-purple-600",
  "Satıcıya Ulaştı": "bg-indigo-50 text-indigo-600",
  "Ücret İadesi Yapıldı": "bg-green-50 text-green-600",
};

export default function Returns() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Return[]>("/returns/mine")
      .then(setReturns)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (returns.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <RotateCcw size={48} className="mb-4" />
        <p className="font-semibold">Henüz iade talebiniz yok.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">İadelerim</h1>

      <div className="space-y-4">
        {returns.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{r.figurineName}</p>
                <p className="text-sm text-gray-500">Sipariş #{r.orderId}</p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  STATUS_COLORS[r.status] ?? "bg-gray-50 text-gray-600"
                }`}
              >
                {r.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">{r.reason}</span>
              <span className="text-xs text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                {r.refundAmount.toFixed(2)} ₺
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleDateString("tr-TR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
              <Link
                to={`/returns/${r.id}`}
                className="inline-flex items-center gap-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1.5 hover:bg-orange-100 transition-colors"
              >
                Detay
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
