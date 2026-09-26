import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { MessageSquare, ChevronRight, AlertTriangle } from "lucide-react";
import type { Complaint } from "../../types";

const STATUS_COLORS: Record<string, string> = {
  "Açık": "bg-orange-50 text-orange-600",
  "İnceleniyor": "bg-blue-50 text-blue-600",
  "Çözüldü": "bg-green-50 text-green-600",
};

export default function SellerComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Complaint[]>("/complaints/seller")
      .then(setComplaints)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  if (complaints.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <MessageSquare size={48} className="mb-4" />
        <p className="font-semibold">Henüz şikayet yok.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">{complaints.length} şikayet</p>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Konu</th>
                <th className="px-4 py-3">Ürün</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Talep</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{c.subject}</p>
                    {c.category && <p className="text-xs text-gray-400">{c.category}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.figurineName}</td>
                  <td className="px-4 py-3 text-gray-600">{c.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{c.requestedResolution}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_COLORS[c.status] ?? "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {c.status}
                      </span>
                      {c.escalatedToAdmin && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-red-50 text-red-600">
                          <AlertTriangle size={11} />
                          Gecikti
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/seller-complaints/${c.id}`}
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