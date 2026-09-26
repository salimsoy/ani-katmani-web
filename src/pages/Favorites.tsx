import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import { PLACEHOLDER_IMAGE } from "../api/placeholderImage";
import type { FavoriteItem } from "../types";
import { Heart, Search, Ruler } from "lucide-react";
import LoadingState from "../components/LoadingState";

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  function fetchFavorites() {
    setLoading(true);
    apiFetch<FavoriteItem[]>("/favorites")
      .then(setFavorites)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchFavorites();
  }, []);

  function removeFavorite(figurineId: number) {
    apiFetch(`/favorites/${figurineId}`, { method: "DELETE" })
      .then(() => setFavorites((prev) => prev.filter((f) => f.figurineId !== figurineId)))
      .catch(() => {});
  }

  const filtered = favorites.filter((item) => {
    const q = searchText.toLowerCase();
    return (
      item.figurine?.name.toLowerCase().includes(q) ||
      item.figurine?.filamentType.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Favorilerim</h1>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <Heart size={56} className="text-gray-300 mb-4" />
          <p className="text-lg font-bold text-gray-900 mb-1">Henüz favori ürününüz yok</p>
          <p className="text-gray-500">Beğendiğiniz ürünlere kalp ikonuna dokunun</p>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Favorilerimde ara..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20">
              <Search size={48} className="text-gray-300 mb-4" strokeWidth={1.5} />
              <p className="text-lg font-bold text-gray-900 mb-1">Arama sonucu bulunamadı</p>
              <p className="text-gray-500">Farklı bir kelime deneyin</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.figurineId}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <div className="relative aspect-square bg-gray-100">
                    <img
                      src={item.figurine?.imageUrl || PLACEHOLDER_IMAGE}
                      alt={item.figurine?.name || "Ürün bulunamadı"}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFavorite(item.figurineId);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
                    >
                      <Heart size={16} className="text-red-500" fill="currentColor" />
                    </button>
                    {item.figurine?.filamentType && (
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        {item.figurine.filamentType}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                      {item.figurine?.name || "Bu ürün artık mevcut değil"}
                    </p>
                    {item.figurine && (
                      <>
                        <p className="font-display text-orange-600 font-bold">{item.figurine.price} ₺</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Ruler size={12} />
                          {item.figurine.scale}
                        </p>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}