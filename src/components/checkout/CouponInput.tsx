import { CheckCircle2 } from "lucide-react";

interface CouponInputProps {
  couponCode: string;
  appliedCouponCode: string | null;
  couponMessage: { text: string; type: "error" | "success" } | null;
  applyingCoupon: boolean;
  onCouponCodeChange: (code: string) => void;
  onApply: () => void;
  onRemove: () => void;
}

export default function CouponInput({
  couponCode,
  appliedCouponCode,
  couponMessage,
  applyingCoupon,
  onCouponCodeChange,
  onApply,
  onRemove,
}: CouponInputProps) {
  if (appliedCouponCode) {
    return (
      <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-xl p-4">
        <span className="text-green-700 font-bold flex items-center gap-1.5">
          <CheckCircle2 size={16} className="text-green-600" />
          {appliedCouponCode} uygulandı!
        </span>
        <button type="button" onClick={onRemove} className="text-red-500 font-semibold text-sm">
          İptal Et
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex">
        <input
          type="text"
          placeholder="İndirim Kodu"
          value={couponCode}
          onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
          className="flex-1 rounded-l-xl border border-gray-200 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="button"
          onClick={onApply}
          disabled={applyingCoupon}
          className="rounded-r-xl bg-gray-900 px-5 font-bold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {applyingCoupon ? "..." : "Uygula"}
        </button>
      </div>
      {couponMessage && (
        <p
          className={`text-sm mt-2 ${
            couponMessage.type === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {couponMessage.text}
        </p>
      )}
    </div>
  );
}