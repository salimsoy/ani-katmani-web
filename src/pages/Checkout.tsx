import { useEffect, useState, type SubmitEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { ShippingOption, Address } from "../types";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toE164 } from "../utils/phone";
import { luhnCheck, validateExpiry } from "../utils/payment";

import StockWarningBanner from "../components/checkout/StockWarningBanner";
import OrderSummary from "../components/checkout/OrderSummary";
import CouponInput from "../components/checkout/CouponInput";
import PaymentForm from "../components/checkout/PaymentForm";
import ShippingOptionPicker from "../components/checkout/ShippingOptionPicker";
import MemberAddressPicker from "../components/checkout/MemberAddressPicker";
import GuestAddressForm from "../components/checkout/GuestAddressForm";
import Stepper from "../components/Stepper";

interface CouponValidateResponse {
  message: string;
  couponId: number;
  discountAmount: number;
  finalPrice: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const isGuest = !token;
  const { cartItems, totalPrice: rawTotal, refreshCart, clearCartAfterGuestOrder } = useCart();

  // Misafir alanları
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [addressText, setAddressText] = useState("");
  const [email, setEmail] = useState("");

  // Üye adres
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Ödeme
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Kupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Kargo
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(true);

  // Form durumu
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);

  // Stok kontrolü
  const stockIssues = cartItems.filter((item) => {
    const stock = (item.figurine as { stock?: number })?.stock ?? Infinity;
    return item.quantity > stock;
  });
  const hasStockIssues = stockIssues.length > 0;

  useEffect(() => {
    apiFetch<ShippingOption[]>("/shipping-options/active")
      .then((data) => {
        setShippingOptions(data);
        if (data.length > 0) setSelectedShippingId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingShipping(false));
  }, []);

  useEffect(() => {
    if (isGuest) {
      setLoadingAddresses(false);
      return;
    }
    apiFetch<Address[]>("/addresses")
      .then((data) => {
        setAddresses(data);
        const passedId = (location.state as { selectedAddressId?: number } | null)?.selectedAddressId;
        if (passedId) {
          setSelectedAddressId(passedId);
        } else {
          const defaultAddr = data.find((a) => a.isDefault);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else if (data.length > 0) setSelectedAddressId(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingAddresses(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;
  const selectedShipping = shippingOptions.find((s) => s.id === selectedShippingId) ?? null;
  const shippingCost = selectedShipping?.price ?? 0;
  const finalPrice = rawTotal - discountAmount + shippingCost;

  // Stepper — sadece görsel yönlendirme, formu bölmez
  const deliveryStepDone = isGuest
    ? Boolean(fullName && city && district && addressText && phoneNumber)
    : Boolean(selectedAddress);
  const paymentStepDone =
    Boolean(selectedShippingId) && cardNumber.replace(/\s/g, "").length === 16 && cvv.length === 3;
  const checkoutSteps = [
    { label: "Teslimat", done: deliveryStepDone },
    { label: "Kargo & Ödeme", done: paymentStepDone },
    { label: "Onayla", done: false },
  ];

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
    const cardDigits = cardNumber.replace(/\s/g, "");
    if (cardDigits.length !== 16) return "Kart numarası 16 haneli olmalıdır.";
    if (!luhnCheck(cardDigits)) return "Kart numarası geçersiz, kontrol edin.";
    if (cardName.trim().length < 5 || !cardName.trim().includes(" "))
      return "Kart üzerindeki ismi ad ve soyad olarak girin.";
    const expErr = validateExpiry(expiryDate);
    if (expErr) return expErr;
    if (cvv.length !== 3) return "CVV 3 haneli olmalıdır.";
    return null;
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setStockError(null);

    if (hasStockIssues) {
      setStockError(
        "Sepetinizde stok sorunu olan ürünler var. Devam etmeden önce sepetinize dönün ve düzenleyin."
      );
      return;
    }

    if (isGuest) {
      if (!fullName || !city || !district || !addressText || !phoneNumber) {
        setFormError("Lütfen tüm teslimat bilgilerini eksiksiz doldurun.");
        return;
      }
      if (phoneNumber.length !== 10) {
        setFormError("Telefon numarası 10 haneli olmalıdır.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setFormError("Lütfen geçerli bir e-posta adresi girin.");
        return;
      }
    } else {
      if (!selectedAddress) {
        setFormError("Lütfen bir teslimat adresi seçin.");
        return;
      }
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
      if (isGuest) {
        await apiFetch("/orders/guest", {
          method: "POST",
          body: JSON.stringify({
            fullName,
            city,
            district,
            addressText,
            phoneNumber: toE164(phoneNumber),
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
            addressId: selectedAddress!.id,
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
      const message = err instanceof Error ? err.message : "Sipariş oluşturulamadı.";
      if (message.toLowerCase().includes("adet") || message.toLowerCase().includes("stok")) {
        setStockError(message);
        await refreshCart();
      } else {
        setFormError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Sipariş tamamlandı ekranı
  if (orderComplete) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4" />
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

  // Sepet boşsa
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
    <div>
      <button
        onClick={() => navigate("/cart")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeft size={16} />
        Sepete Dön
      </button>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Teslimat Bilgileri</h1>
      <p className="text-gray-500 mb-6">
        {isGuest ? "Misafir olarak sipariş veriyorsunuz." : "Siparişinizin teslim edileceği bilgileri girin"}
      </p>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <Stepper steps={checkoutSteps} />
      </div>

      <StockWarningBanner
        stockIssues={stockIssues}
        stockError={stockError}
        onGoToCart={() => navigate("/cart")}
      />

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {isGuest ? (
            <GuestAddressForm
              fullName={fullName}
              phoneNumber={phoneNumber}
              email={email}
              city={city}
              district={district}
              selectedProvinceId={selectedProvinceId}
              addressText={addressText}
              onFullNameChange={setFullName}
              onPhoneNumberChange={setPhoneNumber}
              onEmailChange={setEmail}
              onProvinceChange={(id, name) => {
                setSelectedProvinceId(id);
                setCity(name);
                setDistrict("");
              }}
              onDistrictChange={setDistrict}
              onAddressTextChange={setAddressText}
            />
          ) : (
            <MemberAddressPicker
              addresses={addresses}
              loading={loadingAddresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
              onNavigateToAddresses={() =>
                navigate("/addresses", { state: { returnTo: "/checkout" } })
              }
            />
          )}

          <ShippingOptionPicker
            shippingOptions={shippingOptions}
            selectedShippingId={selectedShippingId}
            loading={loadingShipping}
            onSelect={setSelectedShippingId}
          />

          <PaymentForm
            cardNumber={cardNumber}
            cardName={cardName}
            expiryDate={expiryDate}
            cvv={cvv}
            onCardNumberChange={setCardNumber}
            onCardNameChange={setCardName}
            onExpiryDateChange={setExpiryDate}
            onCvvChange={setCvv}
          />

          {!isGuest && (
            <CouponInput
              couponCode={couponCode}
              appliedCouponCode={appliedCouponCode}
              couponMessage={couponMessage}
              applyingCoupon={applyingCoupon}
              onCouponCodeChange={setCouponCode}
              onApply={handleApplyCoupon}
              onRemove={handleRemoveCoupon}
            />
          )}
        </div>

        <OrderSummary
          rawTotal={rawTotal}
          discountAmount={discountAmount}
          shippingCost={shippingCost}
          finalPrice={finalPrice}
          selectedShipping={selectedShipping}
          hasShippingOptions={shippingOptions.length > 0}
          formError={formError}
          submitting={submitting}
          disabled={hasStockIssues}
        />
      </form>
    </div>
  );
}


