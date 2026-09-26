import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft, Check, X, Truck, PackageCheck, Wallet } from "lucide-react";
import type { Return } from "../types";
import LoadingState from "../components/LoadingState";
import Stepper from "../components/Stepper";

const STATUS_COLORS: Record<string, string> = {
  "Talep Edildi": "bg-orange-50 text-orange-600",
  "Onaylandı": "bg-blue-50 text-blue-600",
  "Reddedildi": "bg-red-50 text-red-600",
  "Kargoya Verildi": "bg-purple-50 text-purple-600",
  "Satıcıya Ulaştı": "bg-indigo-50 text-indigo-600",
  "Ücret İadesi Yapıldı": "bg-green-50 text-green-600",
};

const STEPS = ["Talep Edildi", "Onaylandı", "Kargoya Verildi", "Satıcıya Ulaştı", "Ücret İadesi Yapıldı"];

export default function ReturnDetail() {
  const { id } = useParams();
  const { isAdmin, isSeller } = useAuth();
  const [ret, setRet] = useState<Return | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  function fetchReturn() {
    apiFetch<Return>(`/returns/${id}`)
      .then(setRet)
      .catch(() => setRet(null))
      .finally(() => setLoading(false));
  }

  useEffect(fetchReturn, [id]);

  async function handleStatusChange(newStatus: string, rejReason?: string) {
    setBusy(true);
    try {
      await apiFetch(`/returns/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus, rejectionReason: rejReason ?? null }),
      });
      setShowRejectInput(false);
      setRejectionReason("");
      fetchReturn();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Durum güncellenemedi.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!ret) {
    return <div className="flex justify-center py-20 text-gray-400">İade talebi bulunamadı.</div>;
  }

  const backTo = isAdmin ? "/admin-returns" : isSeller ? "/seller-returns" : "/returns";
  const isRejected = ret.status === "Reddedildi";
  const isTerminal = isRejected || ret.status === "Ücret İadesi Yapıldı";
  const currentStepIndex = STEPS.indexOf(ret.status);

  const sellerCanAct = isSeller && ["Talep Edildi", "Kargoya Verildi", "Satıcıya Ulaştı"].includes(ret.status);
  const customerCanAct = !isAdmin && !isSeller && ret.status === "Onaylandı";
  const hasAction = sellerCanAct || customerCanAct;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <ChevronLeft size={16} />
        İadelere Dön
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-2 mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">{ret.figurineName}</h1>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            STATUS_COLORS[ret.status] ?? "bg-gray-50 text-gray-600"
          }`}
        >
          {ret.status}
        </span>
      </div>

      {!isRejected && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <Stepper steps={STEPS.map((step, idx) => ({ label: step, done: idx <= currentStepIndex }))} />
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Sipariş</span>
          <span className="font-semibold text-gray-900">#{ret.orderId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Sebep</span>
          <span className="font-semibold text-gray-900">{ret.reason}</span>
        </div>
        {(isAdmin || isSeller) && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Müşteri</span>
            <span className="font-semibold text-gray-900">{ret.customerName}</span>
          </div>
        )}
        {isAdmin && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Mağaza</span>
            <span className="font-semibold text-gray-900">{ret.sellerStoreName || "—"}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Adet</span>
          <span className="font-semibold text-gray-900">{ret.quantity}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
          <span className="text-gray-500">İade Tutarı</span>
          <span className="font-bold text-orange-500">{ret.refundAmount.toFixed(2)} ₺</span>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <span className="text-gray-500 text-sm block mb-1">Açıklama</span>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{ret.description}</p>
        </div>
        {ret.rejectionReason && (
          <div className="border-t border-gray-100 pt-3">
            <span className="text-gray-500 text-sm block mb-1">Red Sebebi</span>
            <p className="text-sm text-red-600 whitespace-pre-wrap">{ret.rejectionReason}</p>
          </div>
        )}
        {ret.refundedAt && (
          <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
            <span className="text-gray-500">İade Tarihi</span>
            <span className="font-semibold text-green-600">
              {new Date(ret.refundedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        )}
      </div>

      {isTerminal ? (
        <div
          className={`rounded-2xl p-4 text-sm font-semibold text-center ${
            isRejected ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {isRejected ? "Bu iade talebi reddedildi." : "Bu iade tamamlandı, ücret iadesi yapıldı."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          {isSeller && ret.status === "Talep Edildi" && !showRejectInput && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange("Onaylandı")}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-green-700 disabled:opacity-50"
              >
                <Check size={16} />
                Onayla
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold px-4 py-2.5 hover:bg-red-100 disabled:opacity-50"
              >
                <X size={16} />
                Reddet
              </button>
            </div>
          )}

          {isSeller && (ret.status === "Talep Edildi" || ret.status === "Satıcıya Ulaştı") && showRejectInput && (
            <div className="space-y-2">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Red sebebini yazın"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange("Reddedildi", rejectionReason)}
                  disabled={busy || !rejectionReason.trim()}
                  className="rounded-xl bg-red-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-red-700 disabled:opacity-50"
                >
                  Reddi Onayla
                </button>
                <button
                  onClick={() => setShowRejectInput(false)}
                  disabled={busy}
                  className="rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold px-4 py-2.5 hover:bg-gray-200"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          )}

          {!isAdmin && !isSeller && ret.status === "Onaylandı" && (
            <button
              onClick={() => handleStatusChange("Kargoya Verildi")}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 text-white text-sm font-semibold px-4 py-3 hover:bg-orange-600 disabled:opacity-50"
            >
              <Truck size={16} />
              Kargoya Verdim
            </button>
          )}

          {isSeller && ret.status === "Kargoya Verildi" && (
            <button
              onClick={() => handleStatusChange("Satıcıya Ulaştı")}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 text-white text-sm font-semibold px-4 py-3 hover:bg-orange-600 disabled:opacity-50"
            >
              <PackageCheck size={16} />
              Ürün Ulaştı
            </button>
          )}

          {isSeller && ret.status === "Satıcıya Ulaştı" && !showRejectInput && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange("Ücret İadesi Yapıldı")}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-green-700 disabled:opacity-50"
              >
                <Wallet size={16} />
                Ücret İadesini Tamamla
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold px-4 py-2.5 hover:bg-red-100 disabled:opacity-50"
              >
                <X size={16} />
                Reddet
              </button>
            </div>
          )}

          {isAdmin && (
            <p className="text-sm text-gray-400 text-center py-2">
              Bu iade talebi ilgili taraflarca yönetiliyor. Yönetici sadece görüntüleyebilir.
            </p>
          )}

          {!isAdmin && !hasAction && !showRejectInput && (
            <p className="text-sm text-gray-400 text-center py-2">
              {isSeller ? "Müşterinin ürünü kargoya vermesi bekleniyor." : "Satıcının değerlendirmesi bekleniyor."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
