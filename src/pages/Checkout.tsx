import { useEffect, useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { ShippingOption } from "../types";

// /coupons/validate'in gerçek yanıt şekli types/index.ts'teki CouponValidationResponse ile uyuşmuyor
interface CouponValidateResponse {
  message: string;
  couponId: number;
  discountAmount: number;
  finalPrice: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const isGuest = !token;
  const { cartItems, totalPrice: rawTotal, refreshCart, clearCartAfterGuestOrder } = useCart();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState(""); // sadece misafirde kullanılıyor

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    apiFetch<ShippingOption[]>("/shipping-options/active")
      .then((data) => {
        setShippingOptions(data);
        if (data.length > 0) setSelectedShippingId(data[0].id); // varsayılan olarak ilkini seç
      })
      .catch(() => {})
      .finally(() => setLoadingShipping(false));
  }, []);

  const selectedShipping = shippingOptions.find((s) => s.id === selectedShippingId) ?? null;
  const shippingCost = selectedShipping?.price ?? 0;
  const finalPrice = rawTotal - discountAmount + shippingCost;

  function formatCardNumber(text: string) {
    const cleaned = text.replace(/\D/g, "").slice(0, 16);
    return cleaned.match(/.{1,4}/g)?.join(" ") ?? "";
  }

  function formatExpiryDate(text: string) {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 3) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponMessage(null);
    try {
      const data = await apiFetch<CouponValidateResponse>("/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code: couponCode.trim(), totalPrice: rawTotal }),
      });
      setCouponMessage({ text: data.message, type: "success" });
      setDiscountAmount(data.discountAmount);
      setAppliedCouponCode(couponCode.trim());
    } catch (err) {
      setCouponMessage({ text: err instanceof Error ? err.message : "Kupon geçersiz.", type: "error" });
      setDiscountAmount(0);
      setAppliedCouponCode(null);
    } finally {
      setApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setDiscountAmount(0);
    setAppliedCouponCode(null);
    setCouponCode("");
    setCouponMessage(null);
  }

  function validateCardInfo(): string | null {
    if (cardNumber.replace(/\s/g, "").length !== 16) return "Kart numarası 16 haneli olmalıdır.";
    if (!cardName.trim()) return "Kart üzerindeki ismi girin.";
    if (expiryDate.length !== 5) return "Son kullanma tarihini AA/YY formatında girin.";
    if (cvv.length !== 3) return "CVV 3 haneli olmalıdır.";
    return null;
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!fullName || !address || !phoneNumber) {
      setFormError("Lütfen tüm teslimat bilgilerini eksiksiz doldurun.");
      return;
    }

    if (isGuest && !/^\S+@\S+\.\S+$/.test(email)) {
      setFormError("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    if (!selectedShippingId) {
      setFormError("Lütfen bir kargo seçeneği seçin.");
      return;
    }

    const cardError = validateCardInfo();
    if (cardError) {
      setFormError(cardError);
      return;
    }

    setSubmitting(true);
    try {
      // Kart bilgileri hiçbir yere gönderilmiyor, sadece doğrulama simülasyonu
      if (isGuest) {
        await apiFetch("/orders/guest", {
          method: "POST",
          body: JSON.stringify({
            fullName,
            address,
            phoneNumber,
            email,
            shippingOptionId: selectedShippingId,
            cartItems: cartItems.map((item) => ({
              figurineId: item.figurineId,
              quantity: item.quantity,
            })),
          }),
        });
      } else {
        await apiFetch("/orders", {
          method: "POST",
          body: JSON.stringify({
            fullName,
            address,
            phoneNumber,
            couponCode: appliedCouponCode,
            shippingOptionId: selectedShippingId,
          }),
        });
      }
      if (isGuest) {
        await clearCartAfterGuestOrder();
      } else {
        await refreshCart();
      }
      setOrderComplete(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Sipariş oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  if (orderComplete) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <span className="text-5xl mb-4 block">🎉</span>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Sipariş Alındı!</h1>
        <p className="text-gray-500 mb-8">
          {isGuest
            ? "Siparişiniz başarıyla oluşturuldu. Sipariş detayları e-posta adresinize gönderilecektir."
            : "Siparişiniz başarıyla oluşturuldu."}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="rounded-xl bg-gray-100 px-6 py-3 font-semibold text-gray-900 hover:bg-gray-200"
          >
            Anasayfa
          </button>
          {!isGuest && (
            <button
              onClick={() => navigate("/orders")}
              className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
            >
              Siparişlerim
            </button>
          )}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <p className="text-gray-500 mb-6">Sepetiniz boş, önce sepete ürün ekleyin.</p>
        <Link to="/" className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600">
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Teslimat Bilgileri</h1>
      <p className="text-gray-500 mb-6">
        {isGuest ? "Misafir olarak sipariş veriyorsunuz." : "Siparişinizin teslim edileceği bilgileri girin"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Ad Soyad"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="tel"
          placeholder="Telefon Numarası"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {isGuest && (
          <input
            type="email"
            placeholder="E-posta Adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        )}

        <textarea
          placeholder="Açık Adres"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <h2 className="font-bold text-gray-900 pt-2">🚚 Kargo Seçeneği</h2>

        {loadingShipping ? (
          <p className="text-sm text-gray-400">Kargo seçenekleri yükleniyor...</p>
        ) : shippingOptions.length === 0 ? (
          <p className="text-sm text-red-600">Şu anda kullanılabilir kargo seçeneği yok.</p>
        ) : (
          <div className="space-y-2">
            {shippingOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                  selectedShippingId === option.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingOption"
                    checked={selectedShippingId === option.id}
                    onChange={() => setSelectedShippingId(option.id)}
                    className="accent-orange-500"
                  />
                  <span className="font-semibold text-gray-900">{option.name}</span>
                </span>
                <span className="font-bold text-orange-500">{option.price} ₺</span>
              </label>
            ))}
          </div>
        )}

        <h2 className="font-bold text-gray-900 pt-2">💳 Ödeme Bilgileri</h2>

        <input
          type="text"
          placeholder="Kart Üzerindeki İsim"
          value={cardName}
          onChange={(e) => setCardName(e.target.value.toUpperCase())}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="text"
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="AA/YY"
            value={expiryDate}
            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            placeholder="CVV"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {!isGuest && (
          <div>
            {!appliedCouponCode ? (
              <>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="İndirim Kodu"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 rounded-l-xl border border-gray-200 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="rounded-r-xl bg-gray-900 px-5 font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {applyingCoupon ? "..." : "Uygula"}
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-sm mt-2 ${couponMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>
                    {couponMessage.text}
                  </p>
                )}
              </>
            ) : (
              <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-xl p-4">
                <span className="text-green-700 font-bold">🎉 {appliedCouponCode} uygulandı!</span>
                <button type="button" onClick={handleRemoveCoupon} className="text-red-500 font-semibold text-sm">
                  İptal Et
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
          {discountAmount > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ara Toplam</span>
                <span className="text-gray-400 line-through">{rawTotal.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">İndirim</span>
                <span className="text-red-500 font-semibold">- {discountAmount.toFixed(2)} ₺</span>
              </div>
            </>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Kargo{selectedShipping ? ` (${selectedShipping.name})` : ""}</span>
            <span className="font-semibold text-gray-900">
              {shippingOptions.length === 0 ? "—" : `${shippingCost.toFixed(2)} ₺`}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2">
            <span className="font-bold text-gray-900">Toplam</span>
            <span className="text-xl font-extrabold text-orange-500">{finalPrice.toFixed(2)} ₺</span>
          </div>
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={submitting || shippingOptions.length === 0}
          className="w-full rounded-xl bg-orange-500 py-3.5 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {submitting ? "Gönderiliyor..." : "Siparişi Tamamla ✓"}
        </button>
      </form>
    </div>
  );
}