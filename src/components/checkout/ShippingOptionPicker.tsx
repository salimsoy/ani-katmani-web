import { Truck } from "lucide-react";
import type { ShippingOption } from "../../types";

interface ShippingOptionPickerProps {
  shippingOptions: ShippingOption[];
  selectedShippingId: number | null;
  loading: boolean;
  onSelect: (id: number) => void;
}

export default function ShippingOptionPicker({
  shippingOptions,
  selectedShippingId,
  loading,
  onSelect,
}: ShippingOptionPickerProps) {
  return (
    <>
      <h2 className="font-bold text-gray-900 pt-2 flex items-center gap-1.5">
        <Truck size={16} className="text-orange-500" />
        Kargo Seçeneği
      </h2>

      {loading ? (
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
                  onChange={() => onSelect(option.id)}
                  className="accent-orange-500"
                />
                <span className="font-semibold text-gray-900">{option.name}</span>
              </span>
              <span className="font-bold text-orange-500">{option.price} ₺</span>
            </label>
          ))}
        </div>
      )}
    </>
  );
}