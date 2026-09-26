import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { Store, Clock, CheckCircle2, XCircle } from "lucide-react";
import LoadingState from "../components/LoadingState";

type SellerApplication = {
  id: number;
  userId: number;
  storeName: string;
  storeDescription: string | null;
  commissionRate: number;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
};

export default function SellerApply() {
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<SellerApplication | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<SellerApplication>("/sellers/me")
      .then((data) => setApplication(data))
      .catch(() => setApplication(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!storeName.trim()) {
      setError("Mağaza adı boş olamaz.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiFetch<SellerApplication>("/sellers/apply", {
        method: "POST",
        body: JSON.stringify({ storeName, storeDescription: storeDescription || null }),
      });
      setApplication(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Başvuru gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (application) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          {application.status === "Pending" && (
            <>
              <Clock size={48} className="text-orange-400 mx-auto mb-4" />
              <h1 className="text-xl font-extrabold text-gray-900 mb-2">Başvurunuz İnceleniyor</h1>
              <p className="text-gray-500">
                <strong>{application.storeName}</strong> için satıcı başvurunuz alındı. En kısa
                sürede değerlendirilecek.
              </p>
            </>
          )}
          {application.status === "Approved" && (
            <>
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-extrabold text-gray-900 mb-2">Zaten Onaylı Satıcısınız</h1>
              <p className="text-gray-500">
                <strong>{application.storeName}</strong> mağazanız aktif.
              </p>
            </>
          )}
          {application.status === "Rejected" && (
            <>
              <XCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-extrabold text-gray-900 mb-2">Başvurunuz Reddedildi</h1>
              <p className="text-gray-500">
                <strong>{application.storeName}</strong> için yaptığınız başvuru onaylanmadı.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <Store size={28} className="text-orange-500" />
          <h1 className="text-xl font-extrabold text-gray-900">Satıcı Ol</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Anı Katmanı 3D'de kendi mağazanızı açın, ürünlerinizi satın. Başvurunuz
          incelendikten sonra size dönüş yapılacaktır.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Mağaza Adı *</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Örn: Zeytin 3D Atölyesi"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Mağaza Açıklaması (isteğe bağlı)
            </label>
            <textarea
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              placeholder="Ne tür ürünler satacaksınız?"
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}