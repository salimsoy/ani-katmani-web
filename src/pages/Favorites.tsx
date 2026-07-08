import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import { PLACEHOLDER_IMAGE } from "../api/placeholderImage";
import type { FavoriteItem } from "../types";

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
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Favorilerim</h1>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <span className="text-5xl mb-4">🤍</span>
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
              <span className="text-5xl mb-4">🔍</span>
              <p className="text-lg font-bold text-gray-900 mb-1">Arama sonucu bulunamadı</p>
              <p className="text-gray-500">Farklı bir kelime deneyin</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl p-3 shadow-sm">
                  <Link to={`/product/${item.figurineId}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={item.figurine?.imageUrl || PLACEHOLDER_IMAGE}
                      alt={item.figurine?.name}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.figurine?.name}</p>
                      <p className="text-orange-500 font-extrabold">{item.figurine?.price} ₺</p>
                      <p className="text-xs text-gray-400">
                        {item.figurine?.filamentType} • {item.figurine?.scale}
                      </p>
                    </div>
                  </Link>
                  <button onClick={() => removeFavorite(item.figurineId)} className="p-2 text-xl shrink-0">
                    ❤️
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
