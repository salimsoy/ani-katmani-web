import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { PLACEHOLDER_IMAGE } from "../api/placeholderImage";

export default function Cart() {
  const { cartItems, loading, totalPrice, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Sepetim</h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <span className="text-5xl mb-4">🛒</span>
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
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm">
                <img
                  src={item.figurine?.imageUrl || PLACEHOLDER_IMAGE}
                  alt={item.figurine?.name}
                  className="w-24 h-24 rounded-xl object-cover bg-gray-100"
                />
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-1">{item.figurine?.name}</p>
                  <p className="text-orange-500 font-extrabold mb-1">
                    {((item.figurine?.price ?? 0) * item.quantity).toFixed(2)} ₺
                  </p>
                  <p className="text-xs text-gray-400 mb-3">{item.figurine?.price} ₺ / adet</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.figurineId, item.quantity, -1)}
                        className="w-8 h-8 rounded-md bg-white font-bold shadow-sm"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.figurineId, item.quantity, 1)}
                        className="w-8 h-8 rounded-md bg-white font-bold shadow-sm"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.figurineId)}
                      className="text-sm text-red-500 font-semibold"
                    >
                      🗑 Kaldır
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
              <p className="font-bold text-gray-900 mb-4">Sipariş Özeti</p>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Ürünler ({cartItems.length})</span>
                <span className="font-semibold text-gray-900">{totalPrice.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-500">Kargo</span>
                <span className="font-semibold text-green-600">Ücretsiz</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-4">
                <span className="font-bold text-gray-900">Toplam</span>
                <span className="text-xl font-extrabold text-orange-500">{totalPrice.toFixed(2)} ₺</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full rounded-xl bg-orange-500 py-3.5 font-bold text-white hover:bg-orange-600"
            >
              Siparişi Onayla →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
