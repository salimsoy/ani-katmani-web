import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import type { Coupon } from "../../types";
import { Pencil, Trash2, Ticket } from "lucide-react";

const emptyForm = {
  code: "",
  discountType: "Percentage",
  discountValue: "",
  minimumCartAmount: "",
  expiryDate: "",
  isActive: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  function fetchCoupons() {
    apiFetch<Coupon[]>("/coupons")
      .then(setCoupons)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEditModal(item: Coupon) {
    setEditingId(item.id);
    setForm({
      code: item.code,
      discountType: item.discountType,
      discountValue: String(item.discountValue),
      minimumCartAmount: item.minimumCartAmount ? String(item.minimumCartAmount) : "",
      expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : "",
      isActive: item.isActive,
    });
    setError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.code || !form.discountValue) {
      setError("Kupon kodu ve indirim değeri zorunludur.");
      return;
    }

    const body = {
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minimumCartAmount: form.minimumCartAmount ? parseFloat(form.minimumCartAmount) : 0,
      expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await apiFetch(`/coupons/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        // Create endpoint isActive almıyor (Coupon entity'sinde default true)
        const { isActive: _isActive, ...createBody } = body;
        void _isActive;
        await apiFetch("/coupons", { method: "POST", body: JSON.stringify(createBody) });
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    }
  }

  async function handleDelete(id: number, code: string) {
    if (!window.confirm(`"${code}" kuponunu silmek istediğinize emin misiniz?`)) return;
    try {
      await apiFetch(`/coupons/${id}`, { method: "DELETE" });
      fetchCoupons();
    } catch {
      window.alert("Silme işlemi başarısız.");
    }
  }

  async function handleToggleActive(item: Coupon) {
    setTogglingId(item.id);
    const body = {
      code: item.code,
      discountType: item.discountType,
      discountValue: item.discountValue,
      minimumCartAmount: item.minimumCartAmount,
      expiryDate: item.expiryDate,
      isActive: !item.isActive,
    };

    try {
      await apiFetch(`/coupons/${item.id}`, { method: "PUT", body: JSON.stringify(body) });
      setCoupons((prev) => prev.map((c) => (c.id === item.id ? { ...c, isActive: !c.isActive } : c)));
    } catch {
      window.alert("Durum güncellenemedi.");
    } finally {
      setTogglingId(null);
    }
  }

  function isExpired(expiryDate: string | null | undefined): boolean {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{coupons.length} kupon</p>
        <button
          onClick={openAddModal}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
        >
          + Ekle
        </button>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Kod</th>
                <th className="px-4 py-3">İndirim</th>
                <th className="px-4 py-3">Min. Sepet</th>
                <th className="px-4 py-3">Son Kullanma</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Ticket size={32} className="mx-auto mb-2 text-gray-300" />
                    Henüz kupon oluşturulmamış.
                  </td>
                </tr>
              )}
              {coupons.map((item) => {
                const expired = isExpired(item.expiryDate);
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 ${!item.isActive ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900 tracking-wide">{item.code}</span>
                    </td>
                    <td className="px-4 py-3 text-orange-500 font-semibold whitespace-nowrap">
                      {item.discountType === "Percentage"
                        ? `%${item.discountValue}`
                        : `${item.discountValue} ₺`}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {item.minimumCartAmount > 0 ? `${item.minimumCartAmount} ₺` : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.expiryDate ? (
                        <span className={expired ? "text-red-600 font-semibold" : "text-gray-600"}>
                          {new Date(item.expiryDate).toLocaleDateString("tr-TR")}
                          {expired && " (süresi doldu)"}
                        </span>
                      ) : (
                        <span className="text-gray-400">Süresiz</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(item)}
                        disabled={togglingId === item.id}
                        title={item.isActive ? "Pasif yap" : "Aktif yap"}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          item.isActive ? "bg-orange-500" : "bg-gray-300"
                        } ${togglingId === item.id ? "opacity-50" : ""}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            item.isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded-lg bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 flex items-center gap-1 hover:bg-gray-800"
                        >
                          <Pencil size={12} />
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.code)}
                          className="rounded-lg bg-red-50 text-red-500 text-xs font-semibold px-3 py-1.5 flex items-center gap-1 hover:bg-red-100"
                        >
                          <Trash2 size={12} />
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">
              {editingId ? "Kuponu Düzenle" : "Yeni Kupon Oluştur"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Kupon Kodu *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="INDIRIM10"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">İndirim Tipi *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, discountType: "Percentage" }))}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${
                      form.discountType === "Percentage"
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    Yüzde (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, discountType: "Fixed" }))}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${
                      form.discountType === "Fixed"
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    Sabit Tutar (₺)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  İndirim Değeri * {form.discountType === "Percentage" ? "(%)" : "(₺)"}
                </label>
                <input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))}
                  placeholder={form.discountType === "Percentage" ? "10" : "50"}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Minimum Sepet Tutarı (₺)
                </label>
                <input
                  type="number"
                  value={form.minimumCartAmount}
                  onChange={(e) => setForm((p) => ({ ...p, minimumCartAmount: e.target.value }))}
                  placeholder="0 (opsiyonel)"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Son Kullanma Tarihi
                </label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {editingId && (
                <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                  <span className="text-sm font-semibold text-gray-700">Kupon Aktif</span>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      form.isActive ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        form.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

            <button
              onClick={handleSave}
              className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 mt-6"
            >
              {editingId ? "Güncelle" : "Kaydet"}
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="w-full text-center text-gray-500 py-3 mt-2"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}