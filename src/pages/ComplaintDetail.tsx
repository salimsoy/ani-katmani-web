import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft, Send, AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import ReturnFormModal from "../components/ReturnFormModal";
import LoadingState from "../components/LoadingState";
import type { ComplaintDetail as ComplaintDetailType } from "../types";

const STATUS_COLORS: Record<string, string> = {
  "Açık": "bg-orange-50 text-orange-600",
  "İnceleniyor": "bg-blue-50 text-blue-600",
  "Çözüldü": "bg-green-50 text-green-600",
};

const RESOLUTIONS = ["İade", "Değişim", "Kısmi İade", "Bilgi"];

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isSeller } = useAuth();
  const [complaint, setComplaint] = useState<ComplaintDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState("İade");
  const [showReturnModal, setShowReturnModal] = useState(false);

  const canManage = isAdmin || isSeller;

  function fetchComplaint() {
    apiFetch<ComplaintDetailType>(`/complaints/${id}`)
      .then(setComplaint)
      .catch(() => setComplaint(null))
      .finally(() => setLoading(false));
  }

  useEffect(fetchComplaint, [id]);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    try {
      await apiFetch(`/complaints/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      setMessage("");
      fetchComplaint();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Mesaj gönderilemedi.");
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    try {
      await apiFetch(`/complaints/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
          resolutionOutcome: newStatus === "Çözüldü" ? outcome : null,
        }),
      });
      fetchComplaint();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Durum güncellenemedi.");
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!complaint) {
    return <div className="flex justify-center py-20 text-gray-400">Şikayet bulunamadı.</div>;
  }

  const isResolved = complaint.status === "Çözüldü";
  const backTo = isAdmin ? "/admin-complaints" : isSeller ? "/seller-complaints" : "/complaints";

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ChevronLeft size={16} />
        Şikayetlere Dön
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <h1 className="text-2xl font-extrabold text-gray-900">{complaint.subject}</h1>
        <div className="flex items-center gap-2">
          {complaint.escalatedToAdmin && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={12} />
              Yönetime İletildi
            </span>
          )}
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              STATUS_COLORS[complaint.status] ?? "bg-gray-50 text-gray-600"
            }`}
          >
            {complaint.status}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Ürün</span>
          <span className="font-semibold text-gray-900">{complaint.figurineName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Sipariş</span>
          <span className="font-semibold text-gray-900">#{complaint.orderId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tip</span>
          <span className="font-semibold text-gray-900">
            {complaint.type}{complaint.category ? ` · ${complaint.category}` : ""}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Talep</span>
          <span className="font-semibold text-gray-900">{complaint.requestedResolution}</span>
        </div>
        {canManage && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Müşteri</span>
            <span className="font-semibold text-gray-900">{complaint.customerName}</span>
          </div>
        )}
        {complaint.resolutionOutcome && (
          <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
            <span className="text-gray-500">Çözüm</span>
            <span className="font-semibold text-green-600">{complaint.resolutionOutcome}</span>
          </div>
        )}
      </div>

      {!canManage && (
        <button
          onClick={() => setShowReturnModal(true)}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-50 text-orange-600 text-sm font-semibold px-4 py-2.5 hover:bg-orange-100 transition-colors mb-6"
        >
          <RotateCcw size={16} />
          İade Talebi Oluştur
        </button>
      )}

      {complaint.images.length > 0 && (
        <>
          <h2 className="font-bold text-gray-900 mb-3">Fotoğraflar</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {complaint.images.map((img) => (
              <a key={img.id} href={img.imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={img.imageUrl}
                  alt="Şikayet görseli"
                  className="w-24 h-24 rounded-xl object-cover bg-gray-100 border border-gray-200 hover:opacity-80 transition-opacity"
                />
              </a>
            ))}
          </div>
        </>
      )}

      <h2 className="font-bold text-gray-900 mb-3">Mesajlar</h2>
      <div className="space-y-3 mb-6">
        {complaint.comments.map((c) => {
          const isCustomer = c.authorRole === "Customer";
          return (
            <div
              key={c.id}
              className={`rounded-2xl p-4 shadow-sm ${isCustomer ? "bg-white" : "bg-orange-50"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-gray-900">
                  {c.authorName}
                  <span className="ml-2 text-xs font-semibold text-gray-400">
                    {c.authorRole === "Customer" ? "Müşteri" : c.authorRole === "Seller" ? "Satıcı" : "Yönetim"}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString("tr-TR", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.message}</p>
            </div>
          );
        })}
      </div>

      {isResolved ? (
        <div className="bg-green-50 text-green-700 rounded-2xl p-4 text-sm font-semibold text-center">
          Bu şikayet çözüldü olarak kapatıldı.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Mesajınızı yazın..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="w-full rounded-xl bg-orange-500 py-2.5 font-bold text-white hover:bg-orange-600 disabled:opacity-50 mt-3 flex items-center justify-center gap-2"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Gönder
            </button>
          </div>

          {canManage && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-600 mb-3">Şikayet Yönetimi</p>
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {RESOLUTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <button
                  onClick={() => handleStatusChange("Çözüldü")}
                  className="rounded-xl bg-green-600 text-white text-sm font-semibold px-4 py-2 hover:bg-green-700"
                >
                  Çözüldü Olarak Kapat
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showReturnModal && (
        <ReturnFormModal
          orderItemId={complaint.orderItemId}
          figurineName={complaint.figurineName}
          complaintId={complaint.id}
          onClose={() => setShowReturnModal(false)}
          onCreated={(returnId) => {
            setShowReturnModal(false);
            navigate(`/returns/${returnId}`);
          }}
        />
      )}
    </div>
  );
}