import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import { PLACEHOLDER_IMAGE } from "../api/placeholderImage";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { Figurine, FavoriteItem } from "../types";
import { Loader2, Check } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [figurine, setFigurine] = useState<Figurine | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiFetch<Figurine>(`/figurines/${id}`)
      .then(setFigurine)
      .catch(() => setFigurine(null))
      .finally(() => setLoading(false));

    if (token) {
      apiFetch<FavoriteItem[]>("/favorites")
        .then((data) => setIsFavorite(data.some((f) => f.figurineId === Number(id))))
        .catch(() => {});
    } else {
      setIsFavorite(false);
    }
  }, [id, token]);

  async function toggleFavorite() {
    if (!token) {
      navigate("/login");
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await apiFetch(`/favorites/${id}`, { method: "DELETE" });
        setIsFavorite(false);
      } else {
        await apiFetch("/favorites", { method: "POST", body: JSON.stringify({ figurineId: Number(id) }) });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Favori güncellenemedi:", err);
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handleAddToCart() {
    if (!figurine) return;
    setAdding(true);
    setErrorMessage(null);
    try {
      await addToCart(figurine, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } catch (err) {
      console.error("Sepete eklenemedi:", err);
      setErrorMessage("Sepete eklenirken bir hata oluştu.");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  if (!figurine) {
    return <div className="flex justify-center py-20 text-gray-400">Figür bulunamadı!</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
        <img
          src={figurine.imageUrl || PLACEHOLDER_IMAGE}
          alt={figurine.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={toggleFavorite}
          disabled={favoriteLoading}
          className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center text-xl shadow"
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      <div>
        <span className="inline-block bg-orange-50 text-orange-500 text-xs font-bold px-3 py-1 rounded-lg mb-3">
          {figurine.filamentType}
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{figurine.name}</h1>
        <p className="text-2xl font-extrabold text-gray-900 mb-6">{figurine.price} ₺</p>

        <div className="border-t border-gray-100 pt-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <span className="font-semibold text-gray-900">Adet</span>
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg bg-white font-bold text-lg shadow-sm"
              >
                −
              </button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-lg bg-white font-bold text-lg shadow-sm"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
            <p className="text-sm font-bold text-gray-900 mb-2">Ürün Detayları</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">🛠 Malzeme</span>
              <span className="font-semibold text-gray-900">{figurine.filamentType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">📐 Ölçek</span>
              <span className="font-semibold text-gray-900">{figurine.scale}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">⏱ Üretim Süresi</span>
              <span className="font-semibold text-gray-900">{figurine.printTimeInHours} Saat</span>
            </div>
          </div>
        </div>

        {errorMessage && <p className="text-sm text-red-600 mb-4">{errorMessage}</p>}

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400">Toplam</p>
            <p className="text-xl font-extrabold text-gray-900">{(figurine.price * quantity).toFixed(2)} ₺</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className={`flex-1 rounded-xl py-3.5 font-bold text-white transition-colors duration-300 disabled:opacity-70 flex items-center justify-center gap-2 ${
              justAdded ? "bg-green-500" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {adding ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Ekleniyor...
              </>
            ) : justAdded ? (
              <>
                <Check size={18} />
                Sepete Eklendi
              </>
            ) : (
              "Sepete Ekle"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
