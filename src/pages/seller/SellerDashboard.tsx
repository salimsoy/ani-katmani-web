import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { PLACEHOLDER_IMAGE } from "../../api/placeholderImage";
import { TrendingUp, ShoppingBag, AlertTriangle, Trophy } from "lucide-react";
import LoadingState from "../../components/LoadingState";

type TopFigurine = {
  figurineId: number;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
};

type LowStockFigurine = {
  id: number;
  name: string;
  stock: number;
  imageUrl: string | null;
};

type SellerDashboard = {
  revenueToday: number;
  revenueThisMonth: number;
  orderCountToday: number;
  topFigurines: TopFigurine[];
  lowStockFigurines: LowStockFigurine[];
};

export default function SellerDashboard() {
  const [data, setData] = useState<SellerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<SellerDashboard>("/dashboard/seller")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (!data) {
    return <div className="text-center py-20 text-gray-400">Veriler yüklenemedi.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Üst metrik kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Bugünkü Ciro</p>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{data.revenueToday.toFixed(2)} ₺</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Bu Ayki Ciro</p>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{data.revenueThisMonth.toFixed(2)} ₺</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <ShoppingBag size={16} />
            <p className="text-xs font-semibold uppercase tracking-wide">Bugünkü Sipariş</p>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{data.orderCountToday}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En çok satanlar */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-orange-500" />
            <h2 className="font-bold text-gray-900">En Çok Satan Ürünler</h2>
          </div>
          {data.topFigurines.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Henüz satış verisi yok.</p>
          ) : (
            <div className="space-y-3">
              {data.topFigurines.map((f, i) => (
                <div key={f.figurineId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{f.name}</p>
                      <p className="text-xs text-gray-400">{f.totalQuantity} adet satıldı</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-orange-500 shrink-0 ml-2">
                    {f.totalRevenue.toFixed(2)} ₺
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Düşük stok uyarısı */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="font-bold text-gray-900">Düşük Stoklu Ürünler</h2>
          </div>
          {data.lowStockFigurines.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Düşük stoklu ürün yok.</p>
          ) : (
            <div className="space-y-3">
              {data.lowStockFigurines.map((f) => (
                <div key={f.id} className="flex items-center gap-3">
                  <img
                    src={f.imageUrl || PLACEHOLDER_IMAGE}
                    alt={f.name}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <p className="text-sm font-semibold text-gray-900 flex-1 truncate">{f.name}</p>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full shrink-0">
                    {f.stock} adet
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}