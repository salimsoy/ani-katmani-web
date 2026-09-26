import { CreditCard } from "lucide-react";
import {
  detectCardBrand,
  validateExpiry,
  formatCardNumber,
  formatExpiryDate,
} from "../../utils/payment";

interface PaymentFormProps {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  onCardNumberChange: (value: string) => void;
  onCardNameChange: (value: string) => void;
  onExpiryDateChange: (value: string) => void;
  onCvvChange: (value: string) => void;
}

export default function PaymentForm({
  cardNumber,
  cardName,
  expiryDate,
  cvv,
  onCardNumberChange,
  onCardNameChange,
  onExpiryDateChange,
  onCvvChange,
}: PaymentFormProps) {
  const cardDigits = cardNumber.replace(/\s/g, "");
  const cardBrand = detectCardBrand(cardDigits);
  const expiryError = expiryDate.length === 5 ? validateExpiry(expiryDate) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      <h2 className="font-bold text-gray-900 flex items-center gap-1.5">
        <CreditCard size={16} className="text-orange-500" />
        Ödeme Bilgileri
      </h2>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Kart Üzerindeki İsim
        </label>
        <input
          type="text"
          placeholder="AHMET YILMAZ"
          value={cardName}
          onChange={(e) =>
            onCardNameChange(
              e.target.value.toLocaleUpperCase("tr-TR").replace(/[^A-ZÇĞİÖŞÜ\s]/g, "")
            )
          }
          autoComplete="cc-name"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
          Kart Numarası
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => onCardNumberChange(formatCardNumber(e.target.value))}
            autoComplete="cc-number"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-24 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {cardBrand && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 select-none">
              {cardBrand}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Son Kullanma
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="AA/YY"
            value={expiryDate}
            onChange={(e) => onExpiryDateChange(formatExpiryDate(e.target.value))}
            autoComplete="cc-exp"
            className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              expiryError ? "border-red-300 bg-red-50" : "border-gray-200"
            }`}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">CVV</label>
          <input
            type="password"
            inputMode="numeric"
            placeholder="•••"
            value={cvv}
            onChange={(e) => onCvvChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
            autoComplete="cc-csc"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {expiryError && <p className="text-xs text-red-600">{expiryError}</p>}
    </div>
  );
}