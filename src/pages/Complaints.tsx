import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import { MessageSquare, ChevronRight, AlertTriangle } from "lucide-react";
import type { Complaint } from "../types";
import LoadingState from "../components/LoadingState";

const STATUS_COLORS: Record<string, string> = {
  "Açık": "bg-orange-50 text-orange-600",
  "İnceleniyor": "bg-blue-50 text-blue-600",
  "Çözüldü": "bg-green-50 text-green-600",
};

export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Complaint[]>("/complaints/mine")
      .then(setComplaints)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (complaints.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <MessageSquare size={48} className="mb-4" />
        <p className="font-semibold">Henüz şikayetiniz yok.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Şikayetlerim</h1>

      <div className="space-y-4">
        {complaints.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{c.subject}</p>
                <p className="text-sm text-gray-500">{c.figurineName}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.escalatedToAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                    <AlertTriangle size={12} />
                    Yönetime İletildi
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    STATUS_COLORS[c.status] ?? "bg-gray-50 text-gray-600"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">{c.type}</span>
              {c.category && (
                <span className="text-xs text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">{c.category}</span>
              )}
              <span className="text-xs text-gray-500 bg-gray-50 rounded-full px-2.5 py-1">
                Talep: {c.requestedResolution}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleDateString("tr-TR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
                {" · "}
                {c.commentCount} mesaj
              </p>
              <Link
                to={`/complaints/${c.id}`}
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