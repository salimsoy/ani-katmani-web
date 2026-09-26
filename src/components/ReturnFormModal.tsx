import { useState } from "react";
import { apiFetch } from "../api/client";
import { Loader2 } from "lucide-react";

const REASONS = ["Ayıplı Ürün", "Cayma Hakkı"];

type Props = {
  orderItemId: number;
  figurineName: string;
  complaintId?: number;
  onClose: () => void;
  onCreated: (returnId: number) => void;
};

export default function ReturnFormModal({ orderItemId, figurineName, complaintId, onClose, onCreated }: Props) {
  const [reason, setReason] = useState("Ayıplı Ürün");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!description.trim()) {
      setError("Açıklama boş olamaz.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const created = await apiFetch<{ message: string; returnId: number }>("/returns", {
        method: "POST",
        body: JSON.stringify({
          orderItemId,
          reason,
          description,
          complaintId: complaintId ?? null,
        }),
      });

      onCreated(created.returnId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İade talebi oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">İade Talebi Oluştur</h2>
        <p className="text-sm text-gray-400 mb-6">{figurineName}</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Sebep</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="İade sebebinizi detaylı anlatın"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
        >
          {saving ? (<><Loader2 size={16} className="animate-spin" />Gönderiliyor...</>) : "İade Talebini Gönder"}
        </button>
        <button onClick={onClose} className="w-full text-center text-gray-500 py-3 mt-2">
          İptal
        </button>
      </div>
    </div>
  );
}
