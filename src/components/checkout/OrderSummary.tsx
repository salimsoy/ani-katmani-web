import type { ShippingOption } from "../../types";

interface OrderSummaryProps {
  rawTotal: number;
  discountAmount: number;
  shippingCost: number;
  finalPrice: number;
  selectedShipping: ShippingOption | null;
  hasShippingOptions: boolean;
  formError: string | null;
  submitting: boolean;
  disabled: boolean;
}

export default function OrderSummary({
  rawTotal,
  discountAmount,
  shippingCost,
  finalPrice,
  selectedShipping,
  hasShippingOptions,
  formError,
  submitting,
  disabled,
}: OrderSummaryProps) {
  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-2 lg:sticky lg:top-24">
        <p className="font-bold text-gray-900 mb-2">Sipariş Özeti</p>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Ara Toplam</span>
          <span className="text-gray-900">{rawTotal.toFixed(2)} ₺</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">İndirim</span>
            <span className="text-red-500 font-semibold">- {discountAmount.toFixed(2)} ₺</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Kargo{selectedShipping ? ` (${selectedShipping.name})` : ""}
          </span>
          <span className="text-gray-900">
            {!hasShippingOptions ? "—" : `${shippingCost.toFixed(2)} ₺`}
          </span>
        </div>

        <div className="flex justify-between border-t border-gray-100 pt-3 mt-1">
          <span className="font-bold text-gray-900">Toplam</span>
          <span className="text-xl font-extrabold text-orange-500">
            {finalPrice.toFixed(2)} ₺
          </span>
        </div>

        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 mt-2">
            <p className="text-sm text-red-700 font-medium">{formError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !hasShippingOptions || disabled}
          className="w-full rounded-xl bg-orange-500 py-3.5 font-bold text-white hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
        >
          {submitting ? "Gönderiliyor..." : "Siparişi Tamamla ✓"}
        </button>
      </div>
    </div>
  );
}