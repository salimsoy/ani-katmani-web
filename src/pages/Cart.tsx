import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { PLACEHOLDER_IMAGE } from "../api/placeholderImage";
import { AlertCircle, ShoppingCart, Trash2 } from "lucide-react";
import LoadingState from "../components/LoadingState";

export default function Cart() {
  const { cartItems, loading, totalPrice, updateQuantity, removeItem, refreshCart } = useCart();
  const navigate = useNavigate();

  // Hangi item için hata var — item.id -> mesaj
  const [errorByItem, setErrorByItem] = useState<Record<number, string>>({});
  // Hangi item'da işlem yapılıyor (loading state) — çift tıklama önlemek için
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpdateQuantity(
    itemId: number,
    figurineId: number,
    currentQuantity: number,
    change: number
  ) {
    setUpdatingId(itemId);
    // Bu item için varsa eski hatayı temizle
    setErrorByItem((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });

    try {
      await updateQuantity(itemId, figurineId, currentQuantity, change);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Miktar güncellenemedi.";
      setErrorByItem((prev) => ({ ...prev, [itemId]: message }));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemoveItem(itemId: number, figurineId: number) {
    try {
      await removeItem(itemId, figurineId);
      // Silinen item'ın hatası varsa temizle
      setErrorByItem((prev) => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ürün kaldırılamadı.";
      setErrorByItem((prev) => ({ ...prev, [itemId]: message }));
    }
  }

  // Sepette stok problemi olan (stok yetersiz veya tükenmiş) ürün var mı
  const hasStockIssues = cartItems.some((item) => {
    const stock = (item.figurine as { stock?: number })?.stock ?? Infinity;
    return item.quantity > stock;
  });

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Sepetim</h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <ShoppingCart size={48} className="text-gray-300 mb-4" strokeWidth={1.5} />
          <p className="text-xl font-bold text-gray-900 mb-2">Sepetiniz şu an boş</p>
          <p className="text-gray-500 mb-6">Figürlerimize göz atın</p>
          <button
            onClick={() => navigate("/")}
            className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
          >
            Alışverişe Başla
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const stock = (item.figurine as { stock?: number })?.stock ?? Infinity;
              const outOfStock = stock === 0;
              const overStock = item.quantity > stock && stock > 0;
              const canIncrease = item.quantity < stock;
              const itemError = errorByItem[item.id];
              const isUpdating = updatingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`flex gap-4 bg-white rounded-2xl p-4 shadow-sm ${
                    outOfStock || overStock ? "border-2 border-red-200" : ""
                  }`}
                >
                  <img
                    src={item.figurine?.imageUrl || PLACEHOLDER_IMAGE}
                    alt={item.figurine?.name}
                    className={`w-24 h-24 rounded-xl object-cover bg-gray-100 ${
                      outOfStock ? "opacity-60" : ""
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">{item.figurine?.name}</p>
                    <p className="text-orange-500 font-extrabold mb-1">
                      {((item.figurine?.price ?? 0) * item.quantity).toFixed(2)} ₺
                    </p>
                    <p className="text-xs text-gray-400 mb-2">{item.figurine?.price} ₺ / adet</p>

                    {/* Stok uyarısı */}
                    {outOfStock && (
                      <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-red-600">
                        <AlertCircle size={14} />
                        Bu ürün stokta yok
                      </div>
                    )}
                    {overStock && (
                      <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-yellow-700">
                        <AlertCircle size={14} />
                        Stokta sadece {stock} adet var
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.figurineId, item.quantity, -1)
                          }
                          disabled={isUpdating}
                          className="w-8 h-8 rounded-md bg-white font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.figurineId, item.quantity, 1)
                          }
                          disabled={isUpdating || !canIncrease}
                          title={!canIncrease ? "Stok yetersiz" : ""}
                          className="w-8 h-8 rounded-md bg-white font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id, item.figurineId)}
                        className="inline-flex items-center gap-1 text-sm text-red-500 font-semibold hover:text-red-600"
                      >
                        <Trash2 size={14} />
                        Kaldır
                      </button>
                    </div>

                    {/* Bu item'a özel backend hata mesajı */}
                    {itemError && (
                      <div className="mt-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                        <p className="text-xs text-red-700 font-medium">{itemError}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
              <p className="font-bold text-gray-900 mb-4">Sipariş Özeti</p>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Ürünler ({cartItems.length})</span>
                <span className="font-semibold text-gray-900">{totalPrice.toFixed(2)} ₺</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Kargo ücreti bir sonraki adımda hesaplanacak
              </p>
              <div className="flex justify-between border-t border-gray-100 pt-4">
                <span className="font-bold text-gray-900">Ara Toplam</span>
                <span className="text-xl font-extrabold text-orange-500">
                  {totalPrice.toFixed(2)} ₺
                </span>
              </div>
            </div>

            {hasStockIssues && (
              <div className="mb-4 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3">
                <div className="flex gap-2">
                  <AlertCircle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Sepetinizde stok sorunu olan ürünler var. Devam etmeden önce miktarları
                    ayarlayın veya bu ürünleri sepetten kaldırın.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate("/checkout")}
              disabled={hasStockIssues}
              className="w-full rounded-xl bg-orange-500 py-3.5 font-bold text-white hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Siparişi Onayla →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}