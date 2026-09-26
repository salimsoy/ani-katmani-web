import { extractPhoneDigits, formatPhoneDisplay } from "../../utils/phone";
import { useProvinces, useDistricts } from "../../hooks/useTurkeyLocations";

interface GuestAddressFormProps {
  fullName: string;
  phoneNumber: string;
  email: string;
  city: string;
  district: string;
  selectedProvinceId: number | null;
  addressText: string;
  onFullNameChange: (v: string) => void;
  onPhoneNumberChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onProvinceChange: (id: number | null, name: string) => void;
  onDistrictChange: (v: string) => void;
  onAddressTextChange: (v: string) => void;
}

export default function GuestAddressForm({
  fullName,
  phoneNumber,
  email,
  district,
  selectedProvinceId,
  addressText,
  onFullNameChange,
  onPhoneNumberChange,
  onEmailChange,
  onProvinceChange,
  onDistrictChange,
  onAddressTextChange,
}: GuestAddressFormProps) {
  const { provinces, loading: loadingProvinces } = useProvinces();
  const { districts, loading: loadingDistricts } = useDistricts(selectedProvinceId);

  return (
    <>
      <input
        type="text"
        placeholder="Ad Soyad"
        value={fullName}
        onChange={(e) => onFullNameChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      />

      <div className="flex items-center rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-orange-500">
        <span className="pl-4 pr-2 text-sm font-semibold text-gray-500 select-none">+90</span>
        <input
          type="tel"
          value={formatPhoneDisplay(phoneNumber)}
          onChange={(e) => onPhoneNumberChange(extractPhoneDigits(e.target.value))}
          placeholder="555 123 45 67"
          className="flex-1 rounded-r-xl py-3 pr-4 text-sm focus:outline-none"
        />
      </div>

      <input
        type="email"
        placeholder="E-posta Adresi"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      />

      <div className="flex gap-3">
        <select
          value={selectedProvinceId ?? ""}
          onChange={(e) => {
            const id = Number(e.target.value) || null;
            const province = provinces.find((p) => p.id === id);
            onProvinceChange(id, province?.name ?? "");
          }}
          disabled={loadingProvinces}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
        >
          <option value="">{loadingProvinces ? "Yükleniyor..." : "İl seçin"}</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={district}
          onChange={(e) => onDistrictChange(e.target.value)}
          disabled={!selectedProvinceId || loadingDistricts}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
        >
          <option value="">
            {!selectedProvinceId
              ? "Önce il seçin"
              : loadingDistricts
              ? "Yükleniyor..."
              : "İlçe seçin"}
          </option>
          {districts.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <textarea
        placeholder="Açık Adres"
        value={addressText}
        onChange={(e) => onAddressTextChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </>
  );
}
