import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/client";
import type { AdminOrder, PaginatedResponse } from "../../types";
import { Eye } from "lucide-react";

const STATUS_OPTIONS = ["Beklemede", "Hazırlanıyor", "Kargoda", "Teslim Edildi", "İptal Edildi"];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Beklemede: { bg: "bg-yellow-50", text: "text-yellow-700" },
  Hazırlanıyor: { bg: "bg-blue-50", text: "text-blue-700" },
  Kargoda: { bg: "bg-purple-50", text: "text-purple-700" },
  "Teslim Edildi": { bg: "bg-green-50", text: "text-green-700" },
  "İptal Edildi": { bg: "bg-red-50", text: "text-red-700" },
};

const PAGE_SIZE = 20;

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  async function fetchOrders(pageToFetch: number, isNewSearch: boolean) {
    if (isNewSearch) setSearching(true);
    else setLoadingMore(true);

    const params = new URLSearchParams();
    if (appliedSearch.trim()) params.append("search", appliedSearch.trim());
    if (statusFilter !== "Tümü") params.append("status", statusFilter);
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      params.append("dateTo", to.toISOString());
    }
    params.append("page", String(pageToFetch));
    params.append("pageSize", String(PAGE_SIZE));

    try {
      const data = await apiFetch<PaginatedResponse<AdminOrder>>(`/orders/admin?${params.toString()}`);
      setOrders((prev) => (isNewSearch ? data.items : [...prev, ...data.items]));
      setTotalCount(data.totalCount);
      setPage(pageToFetch);
    } catch (err) {
      console.error("Siparişler çekilemedi:", err);
    } finally {
      setInitialLoading(false);
      setSearching(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1, true);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch, statusFilter, dateFrom, dateTo]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAppliedSearch(searchInput);
  }

  function handleLoadMore() {
    if (!loadingMore && orders.length < totalCount) {
      fetchOrders(page + 1, false);
    }
  }

  function clearFilters() {
    setSearchInput("");
    setAppliedSearch("");
    setStatusFilter("Tümü");
    setDateFrom("");
    setDateTo("");
  }

  const hasActiveFilters = appliedSearch || statusFilter !== "Tümü" || dateFrom || dateTo;
  const hasMore = orders.length < totalCount;

  return (
    <div>
      {/* Filtre kutusu */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_180px_160px_160px_auto] gap-3 items-end">
          <form onSubmit={handleSearchSubmit} className="min-w-0">
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Müşteri adı / Sipariş no
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchInput(value);
                  if (value === "") {
                    setAppliedSearch("");
                  }
                }}
                placeholder="Ara..."
                className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Ara
              </button>
            </div>
          </form>

          <div className="min-w-0">
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Tümü">Tümü</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Başlangıç</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="min-w-0">
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Bitiş</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-800 underline px-1 py-2 justify-self-start whitespace-nowrap"
            >
              Filtreleri temizle
            </button>
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>
      </div>

      {initialLoading ? (
        <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {searching ? "Aranıyor..." : `${totalCount} sipariş bulundu`}
          </p>

          {/* Tablo */}
          <div
            className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-opacity ${
              searching ? "opacity-50" : "opacity-100"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Sipariş No</th>
                    <th className="px-4 py-3">Müşteri</th>
                    <th className="px-4 py-3">Tarih</th>
                    <th className="px-4 py-3">Tutar</th>
                    <th className="px-4 py-3">Durum</th>
                    <th className="px-4 py-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length === 0 && !searching && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                        Filtreye uyan sipariş yok.
                      </td>
                    </tr>
                  )}
                  {orders.map((order) => {
                    const colors = STATUS_COLORS[order.status] ?? {
                      bg: "bg-gray-100",
                      text: "text-gray-700",
                    };
                    return (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/admin-orders/${order.id}`)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-3 font-bold text-gray-900">#{order.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">{order.fullName}</span>
                            {!order.userId && (
                              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                MİSAFİR
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="px-4 py-3 font-extrabold text-gray-900 whitespace-nowrap">
                          {order.totalPrice.toFixed(2)} ₺
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full ${colors.bg} px-2.5 py-1 text-xs font-semibold ${colors.text}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin-orders/${order.id}`);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 hover:bg-gray-800"
                          >
                            <Eye size={12} />
                            Detay
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
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
  );
}