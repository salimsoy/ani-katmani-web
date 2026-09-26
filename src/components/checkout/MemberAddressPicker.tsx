import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import type { Address } from "../../types";

interface MemberAddressPickerProps {
  addresses: Address[];
  loading: boolean;
  selectedAddressId: number | null;
  onSelectAddress: (id: number) => void;
  onNavigateToAddresses: () => void;
}

export default function MemberAddressPicker({
  addresses,
  loading,
  selectedAddressId,
  onSelectAddress,
  onNavigateToAddresses,
}: MemberAddressPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900 flex items-center gap-1.5">
          <MapPin size={16} className="text-orange-500" />
          Teslimat Adresi
        </h2>
        <button
          type="button"
          onClick={onNavigateToAddresses}
          className="text-sm font-semibold text-orange-500 hover:underline"
        >
          Ekle / Değiştir
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Adresler yükleniyor...</p>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-gray-500">
          Henüz kayıtlı adresiniz yok, yukarıdaki "Ekle / Değiştir" ile ekleyebilirsiniz.
        </p>
      ) : selectedAddress && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full text-left rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">
                {selectedAddress.title}
              </span>
              {selectedAddress.isDefault && (
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  VARSAYILAN
                </span>
              )}
            </div>
            {addresses.length > 1 && <ChevronDown size={16} className="text-gray-400" />}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {selectedAddress.fullName} · {selectedAddress.phoneNumber}
          </p>
          <p className="text-sm text-gray-500">
            {selectedAddress.addressText}, {selectedAddress.district}/{selectedAddress.city}
          </p>
        </button>
      ) : (
        <div className="space-y-2">
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                selectedAddressId === addr.id
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="deliveryAddress"
                checked={selectedAddressId === addr.id}
                onChange={() => {
                  onSelectAddress(addr.id);
                  setExpanded(false);
                }}
                className="mt-1 accent-orange-500"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{addr.title}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      VARSAYILAN
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {addr.fullName} · {addr.phoneNumber}
                </p>
                <p className="text-sm text-gray-500">
                  {addr.addressText}, {addr.district}/{addr.city}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}