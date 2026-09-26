import { useRef, useState } from "react";
import { apiFetch } from "../api/client";
import { ImagePlus, Loader2, X } from "lucide-react";

const TYPES = ["Ürün", "Satıcı"];
const CATEGORIES = ["Hasarlı Geldi", "Yanlış Ürün", "Ulaşmadı", "Açıklamaya Uymuyor", "Diğer"];
const RESOLUTIONS = ["İade", "Değişim", "Kısmi İade", "Bilgi"];

type Props = {
  orderItemId: number;
  figurineName: string;
  onClose: () => void;
  onCreated: (complaintId: number) => void;
};

export default function ComplaintFormModal({ orderItemId, figurineName, onClose, onCreated }: Props) {
  const [type, setType] = useState("Ürün");
  const [category, setCategory] = useState("Hasarlı Geldi");
  const [requestedResolution, setRequestedResolution] = useState("İade");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFiles((prev) => [...prev, file]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    if (!subject.trim() || !message.trim()) {
      setError("Konu ve açıklama boş olamaz.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const created = await apiFetch<{ message: string; complaintId: number }>("/complaints", {
        method: "POST",
        body: JSON.stringify({
          orderItemId,
          type,
          category: type === "Ürün" ? category : null,
          requestedResolution,
          subject,
          message,
        }),
      });

      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          await apiFetch(`/complaints/${created.complaintId}/images`, {
            method: "POST",
            body: formData,
            isFormData: true,
          });
        } catch {
          // Bir görsel başarısız olsa bile diğerlerini yüklemeye devam et
        }
      }

      onCreated(created.complaintId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Şikayet oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Şikayet Oluştur</h2>
        <p className="text-sm text-gray-400 mb-6">{figurineName}</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Şikayet Tipi</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {type === "Ürün" ? "Satıcı ilgilenecek." : "Platform yönetimi ilgilenecek."}
            </p>
          </div>

          {type === "Ürün" && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Talebiniz</label>
            <select
              value={requestedResolution}
              onChange={(e) => setRequestedResolution(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {RESOLUTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Konu</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Kısa bir başlık"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Açıklama</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Sorunu detaylı anlatın"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Fotoğraflar (opsiyonel)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileSelected}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
              {pendingFiles.map((file, index) => (
                <div key={index} className="relative w-20 h-20">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Önizleme"
                    className="w-full h-full rounded-lg object-cover bg-gray-100 border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setPendingFiles((prev) => prev.filter((_, i) => i !== index))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
              >
                <ImagePlus size={20} />
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
        >
          {saving ? (<><Loader2 size={16} className="animate-spin" />Gönderiliyor...</>) : "Şikayeti Gönder"}
        </button>
        <button onClick={onClose} className="w-full text-center text-gray-500 py-3 mt-2">
          İptal
        </button>
      </div>
    </div>
  );
}