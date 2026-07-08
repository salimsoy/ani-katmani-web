import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { PLACEHOLDER_IMAGE } from "../api/placeholderImage";
import { useAuth } from "../context/AuthContext";
import type { Figurine, FavoriteItem, PaginatedResponse } from "../types";
import { Search } from "lucide-react";

const PAGE_SIZE = 20;

type SortOption = "default" | "priceAsc" | "priceDesc" | "nameAsc";

const SORT_LABELS: Record<SortOption, string> = {
  default: "Varsayılan",
  priceAsc: "Fiyat: Düşükten Yükseğe",
  priceDesc: "Fiyat: Yüksekten Düşüğe",
  nameAsc: "İsim: A-Z",
};

export default function Home() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [figurines, setFigurines] = useState<Figurine[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [filamentType, setFilamentType] = useState("Tümü");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const [filamentOptions, setFilamentOptions] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setSortMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchFigurines(pageToFetch: number, isNewSearch: boolean) {
    if (isNewSearch) setLoading(true);
    else setLoadingMore(true);

    const params = new URLSearchParams();
    if (appliedSearch) params.append("search", appliedSearch);
    if (filamentType !== "Tümü") params.append("filamentType", filamentType);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (sortBy !== "default") params.append("sortBy", sortBy);
    params.append("page", String(pageToFetch));
    params.append("pageSize", String(PAGE_SIZE));

    try {
      const data = await apiFetch<PaginatedResponse<Figurine>>(`/figurines?${params.toString()}`);
      setFigurines((prev) => (isNewSearch ? data.items : [...prev, ...data.items]));
      setTotalCount(data.totalCount);
      setPage(pageToFetch);
    } catch (err) {
      console.error("Figürinler çekilemedi:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // Filtre/sıralama seçenekleri için mevcut ürünlerden distinct filamentType listesi (tek seferlik geniş çekim)
  useEffect(() => {
    apiFetch<PaginatedResponse<Figurine>>(`/figurines?pageSize=1000`)
      .then((data) => {
        const distinct = Array.from(new Set(data.items.map((f) => f.filamentType).filter(Boolean)));
        setFilamentOptions(distinct);
      })
      .catch(() => {});
  }, []);

  // Filtre/sıralama değişince debounce'lu yeniden çek
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFigurines(1, true);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filamentType, minPrice, maxPrice, sortBy, appliedSearch]);

  useEffect(() => {
    if (!token) {
      setFavoriteIds([]);
      return;
    }
    apiFetch<FavoriteItem[]>("/favorites")
      .then((data) => setFavoriteIds(data.map((f) => f.figurineId)))
      .catch(() => {});
  }, [token]);

  function handleSearchSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setAppliedSearch(searchInput);
  }

  function handlePriceSearch(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setMinPrice(minPriceInput);
    setMaxPrice(maxPriceInput);
  }

  function handleLoadMore() {
    if (!loadingMore && figurines.length < totalCount) {
      fetchFigurines(page + 1, false);
    }
  }

  async function toggleFavorite(figurineId: number) {
    if (!token) {
      navigate("/login");
      return;
    }
    const isFav = favoriteIds.includes(figurineId);
    try {
      if (isFav) {
        await apiFetch(`/favorites/${figurineId}`, { method: "DELETE" });
        setFavoriteIds((prev) => prev.filter((id) => id !== figurineId));
      } else {
        await apiFetch("/favorites", { method: "POST", body: JSON.stringify({ figurineId }) });
        setFavoriteIds((prev) => [...prev, figurineId]);
      }
    } catch (err) {
      console.error("Favori güncellenemedi:", err);
    }
  }

  const hasMore = figurines.length < totalCount;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Anı Katmanı 3D</h1>
        <p className="text-gray-500 text-sm mt-1">Sana özel 3D figürler</p>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Figür ara..."
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value;
            setSearchInput(value);
            if (value === "") {
              setAppliedSearch(""); // input boşalınca aramayı anında sıfırla, "Ara"ya basmaya gerek kalmasın
            }
          }}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Ara
        </button>
      </form>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-56 md:shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:sticky md:top-24">
            <h2 className="font-bold text-gray-900 mb-4">Filtrele</h2>

            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Malzeme</p>
              <div className="space-y-1">
                <button
                  onClick={() => setFilamentType("Tümü")}
                  className={`block w-full text-left rounded-lg px-2.5 py-1.5 text-sm ${
                    filamentType === "Tümü" ? "bg-orange-50 text-orange-500 font-semibold" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Tümü
                </button>
                {filamentOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setFilamentType(opt)}
                    className={`block w-full text-left rounded-lg px-2.5 py-1.5 text-sm ${
                      filamentType === opt ? "bg-orange-50 text-orange-500 font-semibold" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Fiyat Aralığı (₺)</p>
              <form onSubmit={handlePriceSearch} className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-1/2 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-1/2 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  title="Fiyat aralığında ara"
                  className="shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-white hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  <Search size={16} strokeWidth={2.5} />
                </button>
              </form>
            </div>

            {(filamentType !== "Tümü" || minPrice || maxPrice || sortBy !== "default") && (
              <button
                onClick={() => {
                  setFilamentType("Tümü");
                  setMinPrice("");
                  setMaxPrice("");
                  setMinPriceInput("");
                  setMaxPriceInput("");
                  setSortBy("default");
                }}
                className="text-sm text-gray-400 underline"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{totalCount} ürün</p>

            <div className="relative" ref={sortMenuRef}>
              <button
                type="button"
                onClick={() => setSortMenuOpen((open) => !open)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Sırala
                {sortBy !== "default" && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
              </button>

              {sortMenuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSortBy(opt);
                        setSortMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                        sortBy === opt ? "text-orange-500 font-semibold" : "text-gray-700"
                      }`}
                    >
                      {SORT_LABELS[opt]}
                      {sortBy === opt && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>
          ) : figurines.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Ürün bulunamadı.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {figurines.map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      <img
                        src={item.imageUrl || PLACEHOLDER_IMAGE}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(item.id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
                      >
                        {favoriteIds.includes(item.id) ? "❤️" : "🤍"}
                      </button>
                      <span className="absolute top-2 left-2 bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        {item.filamentType}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{item.name}</p>
                      <p className="text-orange-500 font-extrabold">{item.price} ₺</p>
                      <p className="text-xs text-gray-400 mt-1">📐 {item.scale}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50"
                  >
                    {loadingMore ? "Yükleniyor..." : "Daha Fazla Yükle"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
