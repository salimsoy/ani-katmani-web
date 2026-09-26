import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../../api/client";
import type { Figurine, FigurineImage } from "../../types";
import { ImagePlus, Loader2, X, Pencil, Trash2, Star } from "lucide-react";

const emptyForm = {
  name: "",
  price: "",
  filamentType: "",
  scale: "",
  printTimeInHours: "",
  imageUrl: "",
  fileName: "",
  stock: "",
};

export default function SellerProducts() {
  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [galleryImages, setGalleryImages] = useState<FigurineImage[]>([]);
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<File[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  function fetchFigurines() {
    apiFetch<Figurine[]>("/figurines/mine")
      .then(setFigurines)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchFigurines();
  }, []);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setGalleryImages([]);
    setPendingGalleryFiles([]);
    setError(null);
    setModalOpen(true);
  }

  async function openEditModal(item: Figurine) {
    setEditingId(item.id);
    setError(null);
    setModalOpen(true);
    setLoadingDetail(true);

    try {
      const detail = await apiFetch<Figurine>(`/figurines/${item.id}`);
      const extractedFileName = detail.imageUrl ? detail.imageUrl.split("/").pop() ?? "" : "";
      setForm({
        name: detail.name,
        price: String(detail.price),
        filamentType: detail.filamentType,
        scale: detail.scale,
        printTimeInHours: String(detail.printTimeInHours),
        imageUrl: detail.imageUrl || "",
        fileName: extractedFileName,
        stock: String(detail.stock ?? 0),
      });
      setGalleryImages(detail.images ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ürün bilgileri yüklenemedi.");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await apiFetch<{ fileName: string; imageUrl: string }>("/figurines/upload", {
        method: "POST",
        body: formData,
        isFormData: true,
      });
      setForm((prev) => ({ ...prev, imageUrl: data.imageUrl, fileName: data.fileName }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fotoğraf yüklenemedi.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleGalleryFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (editingId) {
      void uploadGalleryFileNow(file);
    } else {
      setPendingGalleryFiles((prev) => [...prev, file]);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  async function uploadGalleryFileNow(file: File) {
    if (!editingId) return;
    setUploadingGallery(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const newImage = await apiFetch<FigurineImage>(`/figurines/${editingId}/images`, {
        method: "POST",
        body: formData,
        isFormData: true,
      });
      setGalleryImages((prev) => [...prev, newImage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Galeri fotoğrafı yüklenemedi.");
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  }

  async function handleDeleteGalleryImage(imageId: number) {
    try {
      await apiFetch(`/figurines/images/${imageId}`, { method: "DELETE" });
      setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      window.alert("Galeri fotoğrafı silinemedi.");
    }
  }

  async function handleSave() {
    if (!form.name || !form.price || !form.filamentType || !form.scale || !form.printTimeInHours || form.stock === "") {
      setError("Tüm zorunlu alanları doldurun.");
      return;
    }

    const stockNum = parseInt(form.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setError("Stok 0 veya daha büyük bir sayı olmalı.");
      return;
    }

    const body = {
      name: form.name,
      price: parseFloat(form.price),
      filamentType: form.filamentType,
      scale: form.scale,
      printTimeInHours: parseInt(form.printTimeInHours, 10),
      imageUrl: form.fileName,
      stock: stockNum,
    };

    try {
      if (editingId) {
        await apiFetch(`/figurines/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        const created = await apiFetch<Figurine>("/figurines", {
          method: "POST",
          body: JSON.stringify(body),
        });

        for (const file of pendingGalleryFiles) {
          const formData = new FormData();
          formData.append("file", file);
          try {
            await apiFetch(`/figurines/${created.id}/images`, {
              method: "POST",
              body: formData,
              isFormData: true,
            });
          } catch {
            // Bir fotoğraf başarısız olsa bile diğerlerini yüklemeye devam et
          }
        }
      }

      setModalOpen(false);
      fetchFigurines();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return;
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
        <p className="text-sm text-gray-500">{figurines.length} ürün</p>
        <button
          onClick={openAddModal}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
        >
          + Ürün Ekle
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Görsel</th>
                <th className="px-4 py-3">İsim</th>
                <th className="px-4 py-3">Fiyat</th>
                <th className="px-4 py-3">Filament</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Puan</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {figurines.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Henüz ürününüz yok.
                  </td>
                </tr>
              )}
              {figurines.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                        <ImagePlus size={18} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-orange-500 font-semibold whitespace-nowrap">{item.price} ₺</td>
                  <td className="px-4 py-3 text-gray-600">{item.filamentType}</td>
                  <td className="px-4 py-3 text-gray-600">{item.stock ?? 0}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.averageRating != null ? (
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400" fill="currentColor" />
                        {item.averageRating.toFixed(1)} ({item.reviewCount})
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
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
                        onClick={() => handleDelete(item.id, item.name)}
                        className="rounded-lg bg-red-50 text-red-500 text-xs font-semibold px-3 py-1.5 flex items-center gap-1 hover:bg-red-100"
                      >
                        <Trash2 size={12} />
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">
              {editingId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
            </h2>

            {loadingDetail ? (
              <div className="flex justify-center py-12 text-gray-400">Yükleniyor...</div>
            ) : (
              <>
                <div className="space-y-4">
                  <FormField label="İsim *" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="Zeytin Kedi Figürü" />
                  <FormField label="Fiyat (₺) *" value={form.price} onChange={(v) => setForm((p) => ({ ...p, price: v }))} placeholder="350" type="number" />
                  <FormField label="Filament Tipi *" value={form.filamentType} onChange={(v) => setForm((p) => ({ ...p, filamentType: v }))} placeholder="PLA, Reçine..." />
                  <FormField label="Ölçek *" value={form.scale} onChange={(v) => setForm((p) => ({ ...p, scale: v }))} placeholder="1/6, 1/10..." />
                  <FormField label="Üretim Süresi (saat) *" value={form.printTimeInHours} onChange={(v) => setForm((p) => ({ ...p, printTimeInHours: v }))} placeholder="12" type="number" />
                  <FormField label="Stok *" value={form.stock} onChange={(v) => setForm((p) => ({ ...p, stock: v }))} placeholder="10" type="number" />

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">Ürün Fotoğrafı</label>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileSelected} disabled={uploading} className="hidden" />
                    {form.imageUrl ? (
                      <div className="flex items-center gap-4">
                        <img src={form.imageUrl} alt="Önizleme" className="w-28 h-28 rounded-xl object-cover bg-gray-100 border border-gray-200" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2">
                          {uploading ? (<><Loader2 size={16} className="animate-spin" />Yükleniyor...</>) : "Fotoğrafı Değiştir"}
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full rounded-xl border-2 border-dashed border-gray-300 py-8 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors disabled:opacity-50">
                        {uploading ? (<><Loader2 size={28} className="animate-spin" /><span className="text-sm font-semibold">Yükleniyor...</span></>) : (<><ImagePlus size={28} /><span className="text-sm font-semibold">Fotoğraf Seç</span><span className="text-xs text-gray-300">JPG veya PNG</span></>)}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Galeri Fotoğrafları</label>
                  <input ref={galleryInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleGalleryFileSelected} disabled={uploadingGallery} className="hidden" />
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingId
                      ? galleryImages.map((img) => (
                          <div key={img.id} className="relative w-20 h-20">
                            <img src={img.imageUrl} alt="Galeri" className="w-full h-full rounded-lg object-cover bg-gray-100 border border-gray-200" />
                            <button type="button" onClick={() => handleDeleteGalleryImage(img.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      : pendingGalleryFiles.map((file, index) => (
                          <div key={index} className="relative w-20 h-20">
                            <img src={URL.createObjectURL(file)} alt="Galeri önizleme" className="w-full h-full rounded-lg object-cover bg-gray-100 border border-gray-200" />
                            <button type="button" onClick={() => setPendingGalleryFiles((prev) => prev.filter((_, i) => i !== index))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                    <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={uploadingGallery} className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors disabled:opacity-50">
                      {uploadingGallery ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

                <button onClick={handleSave} className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 mt-6">
                  {editingId ? "Güncelle" : "Kaydet"}
                </button>
                <button onClick={() => setModalOpen(false)} className="w-full text-center text-gray-500 py-3 mt-2">
                  {editingId ? "Kapat" : "İptal"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
    </div>
  );
}