import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { Figurine, PaginatedResponse } from "../../types";
import { ImagePlus, Loader2 } from "lucide-react";

const emptyForm = { name: "", price: "", filamentType: "", scale: "", printTimeInHours: "", imageUrl: "" };

export default function AdminFigurines() {
  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function fetchFigurines() {
    apiFetch<PaginatedResponse<Figurine>>("/figurines?pageSize=1000")
      .then((data) => setFigurines(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchFigurines();
  }, []);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEditModal(item: Figurine) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      price: String(item.price),
      filamentType: item.filamentType,
      scale: item.scale,
      printTimeInHours: String(item.printTimeInHours),
      imageUrl: item.imageUrl || "",
    });
    setError(null);
    setModalOpen(true);
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await apiFetch<{ imageUrl: string }>("/figurines/upload", {
        method: "POST",
        body: formData,
        isFormData: true,
      });
      setForm((prev) => ({ ...prev, imageUrl: data.imageUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fotoğraf yüklenemedi.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.filamentType || !form.scale || !form.printTimeInHours) {
      setError("Tüm zorunlu alanları doldurun.");
      return;
    }

    const body = {
      name: form.name,
      price: parseFloat(form.price),
      filamentType: form.filamentType,
      scale: form.scale,
      printTimeInHours: parseInt(form.printTimeInHours, 10),
      imageUrl: form.imageUrl,
    };

    try {
      await apiFetch(editingId ? `/figurines/${editingId}` : "/figurines", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      setModalOpen(false);
      fetchFigurines();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`"${name}" figürünü silmek istediğinize emin misiniz?`)) return;
    try {
      await apiFetch(`/figurines/${id}`, { method: "DELETE" });
      fetchFigurines();
    } catch {
      window.alert("Silme işlemi başarısız.");
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Admin Paneli</h1>
        <button
          onClick={openAddModal}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
        >
          + Ekle
        </button>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          to="/admin-dashboard"
          className="flex-1 min-w-[140px] text-center rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700"
        >
          📊 Dashboard
        </Link>
        <Link
          to="/admin-orders"
          className="flex-1 min-w-[140px] text-center rounded-xl bg-gray-900 py-3 font-bold text-white hover:bg-gray-800"
        >
          📋 Sipariş Yönetimi
        </Link>
        <Link
          to="/admin-coupons"
          className="flex-1 min-w-[140px] text-center rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600"
        >
          🎟️ Kupon Yönetimi
        </Link>
        <Link
          to="/admin-shipping"
          className="flex-1 min-w-[140px] text-center rounded-xl bg-purple-600 py-3 font-bold text-white hover:bg-purple-700"
        >
          🚚 Kargo Yönetimi
        </Link>
      </div>

      <div className="space-y-3">
        {figurines.map((item) => (
          <div key={item.id} className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm">
            <div>
              <p className="font-bold text-gray-900">{item.name}</p>
              <p className="text-orange-500 font-semibold text-sm">{item.price} ₺</p>
              <p className="text-xs text-gray-400">
                {item.filamentType} • {item.scale}
              </p>
            </div>
            <div className="flex flex-col gap-2">
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">
              {editingId ? "Figürü Düzenle" : "Yeni Figür Ekle"}
            </h2>

            <div className="space-y-4">
              <FormField
                label="İsim *"
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="Zeytin Kedi Figürü"
              />
              <FormField
                label="Fiyat (₺) *"
                value={form.price}
                onChange={(v) => setForm((p) => ({ ...p, price: v }))}
                placeholder="350"
                type="number"
              />
              <FormField
                label="Filament Tipi *"
                value={form.filamentType}
                onChange={(v) => setForm((p) => ({ ...p, filamentType: v }))}
                placeholder="PLA, Reçine..."
              />
              <FormField
                label="Ölçek *"
                value={form.scale}
                onChange={(v) => setForm((p) => ({ ...p, scale: v }))}
                placeholder="1/6, 1/10..."
              />
              <FormField
                label="Üretim Süresi (saat) *"
                value={form.printTimeInHours}
                onChange={(v) => setForm((p) => ({ ...p, printTimeInHours: v }))}
                placeholder="12"
                type="number"
              />

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Ürün Fotoğrafı</label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileSelected}
                  disabled={uploading}
                  className="hidden"
                />

                {form.imageUrl ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={form.imageUrl}
                      alt="Önizleme"
                      className="w-28 h-28 rounded-xl object-cover bg-gray-100 border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Yükleniyor...
                        </>
                      ) : (
                        "Fotoğrafı Değiştir"
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full rounded-xl border-2 border-dashed border-gray-300 py-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={28} className="animate-spin" />
                        <span className="text-sm font-semibold">Yükleniyor...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus size={28} />
                        <span className="text-sm font-semibold">Fotoğraf Seç</span>
                        <span className="text-xs text-gray-300">JPG veya PNG</span>
                      </>
                    )}
                  </button>
                )}
              </div>
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

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
  );
}
