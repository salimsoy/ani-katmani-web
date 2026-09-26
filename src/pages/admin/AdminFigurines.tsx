import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { ImagePlus, Power, PowerOff } from "lucide-react";

type AdminFigurine = {
  id: number;
  name: string;
  price: number;
  filamentType: string;
  scale: string;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  sellerStoreName: string;
};

export default function AdminFigurines() {
  const [figurines, setFigurines] = useState<AdminFigurine[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function fetchFigurines() {
    setLoading(true);
    apiFetch<AdminFigurine[]>("/figurines/admin")
      .then(setFigurines)
      .catch(() => setError("Ürünler yüklenemedi."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchFigurines();
  }, []);

  async function handleToggleStatus(item: AdminFigurine) {
    setProcessingId(item.id);
    setError(null);
    try {
      const updated = await apiFetch<AdminFigurine>(`/figurines/admin/${item.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      setFigurines((prev) => prev.map((f) => (f.id === item.id ? updated : f)));
    } catch {
      setError("Durum güncellenemedi.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{figurines.length} ürün (tüm satıcılar)</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Görsel</th>
                <th className="px-4 py-3">İsim</th>
                <th className="px-4 py-3">Satıcı</th>
                <th className="px-4 py-3">Fiyat</th>
                <th className="px-4 py-3">Filament</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {figurines.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    Henüz hiç ürün yok.
                  </td>
                </tr>
              )}
              {figurines.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 ${!item.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                        <ImagePlus size={18} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600">{item.sellerStoreName || "—"}</td>
                  <td className="px-4 py-3 text-orange-500 font-semibold whitespace-nowrap">
                    {item.price} ₺
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.filamentType}</td>
                  <td className="px-4 py-3 text-gray-600">{item.stock ?? 0}</td>
                  <td className="px-4 py-3">
                    {item.isActive ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                        Pasif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        disabled={processingId === item.id}
                        className={`inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold px-3 py-1.5 disabled:opacity-50 ${
                          item.isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {item.isActive ? <PowerOff size={12} /> : <Power size={12} />}
                        {item.isActive ? "Pasife Al" : "Aktif Et"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}