import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import type { ShippingOption } from "../../types";

const emptyForm = { name: "", price: "", isActive: true };

export default function AdminShipping() {
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  function fetchOptions() {
    apiFetch<ShippingOption[]>("/shipping-options")
      .then(setOptions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchOptions();
  }, []);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEditModal(item: ShippingOption) {
    setEditingId(item.id);
    setForm({ name: item.name, price: String(item.price), isActive: item.isActive });
    setError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      setError("İsim ve fiyat zorunludur.");
      return;
    }

    try {
      if (editingId) {
        await apiFetch(`/shipping-options/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({ name: form.name, price: parseFloat(form.price), isActive: form.isActive }),
        });
      } else {
        await apiFetch("/shipping-options", {
          method: "POST",
          body: JSON.stringify({ name: form.name, price: parseFloat(form.price) }),
        });
      }
      setModalOpen(false);
      fetchOptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`"${name}" kargo seçeneğini silmek istediğinize emin misiniz?`)) return;
    try {
      await apiFetch(`/shipping-options/${id}`, { method: "DELETE" });
      fetchOptions();
    } catch {
      window.alert("Silme işlemi başarısız.");
    }
  }

  async function handleToggleActive(item: ShippingOption) {
    setTogglingId(item.id);
    try {
      await apiFetch(`/shipping-options/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: item.name, price: item.price, isActive: !item.isActive }),
      });
      setOptions((prev) => prev.map((o) => (o.id === item.id ? { ...o, isActive: !o.isActive } : o)));
    } catch {
      window.alert("Durum güncellenemedi.");
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Kargo Yönetimi</h1>
        <button
          onClick={openAddModal}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
        >
          + Ekle
        </button>
      </div>

      {options.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Henüz kargo seçeneği eklenmemiş.</p>
      ) : (
        <div className="space-y-3">
          {options.map((item) => (
            <div
              key={item.id}
              className={`flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm ${
                !item.isActive ? "opacity-60" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-gray-900">{item.name}</p>
                  {!item.isActive && (
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      PASİF
                    </span>
                  )}
                </div>
                <p className="text-orange-500 font-bold text-sm">{item.price} ₺</p>
              </div>

              <div className="flex items-center gap-3">
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
                <button
                  onClick={() => openEditModal(item)}
                  className="rounded-lg bg-gray-900 text-white text-xs font-semibold px-3 py-1.5"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="rounded-lg bg-red-50 text-red-500 text-xs font-semibold px-3 py-1.5"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">
              {editingId ? "Kargo Seçeneğini Düzenle" : "Yeni Kargo Seçeneği"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Kargo Firması Adı *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Yurtiçi Kargo"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Fiyat (₺) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="30"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {editingId && (
                <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                  <span className="text-sm font-semibold text-gray-700">Aktif</span>
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
            <button onClick={() => setModalOpen(false)} className="w-full text-center text-gray-500 py-3 mt-2">
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}