import { AlertCircle } from "lucide-react";
import type { CartDisplayItem } from "../../context/CartContext";

interface StockWarningBannerProps {
  stockIssues: CartDisplayItem[];
  stockError: string | null;
  onGoToCart: () => void;
}

export default function StockWarningBanner({
  stockIssues,
  stockError,
  onGoToCart,
}: StockWarningBannerProps) {
  const hasStockIssues = stockIssues.length > 0;

  if (!hasStockIssues && !stockError) return null;

  return (
    <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4">
      <div className="flex gap-3">
        <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-red-800 mb-1">Stok Sorunu</p>

          {stockError ? (
            <p className="text-sm text-red-700 mb-3">{stockError}</p>
          ) : (
            <>
              <p className="text-sm text-red-700 mb-2">
                Aşağıdaki ürünlerde stok yetersiz:
              </p>
              <ul className="text-sm text-red-700 mb-3 list-disc list-inside">
                {stockIssues.map((item) => {
                  const stock = (item.figurine as { stock?: number })?.stock ?? 0;
                  return (
                    <li key={item.id}>
                      <span className="font-semibold">{item.figurine?.name}</span> — istenen:{" "}
                      {item.quantity}, mevcut: {stock}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <button
            type="button"
            onClick={onGoToCart}
            className="text-sm font-bold text-red-700 underline hover:text-red-800"
          >
            Sepete Dön ve Düzenle →
          </button>
        </div>
      </div>
    </div>
  );
}