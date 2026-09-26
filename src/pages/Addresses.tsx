import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { extractPhoneDigits, digitsFromExistingPhone, formatPhoneDisplay, toE164 } from "../utils/phone";
import type { Address } from "../types";
import { MapPin, Pencil, Trash2, Star } from "lucide-react";
import { useProvinces, useDistricts } from "../hooks/useTurkeyLocations";
import LoadingState from "../components/LoadingState";

const emptyForm = {
  title: "",
  fullName: "",
  phoneNumber: "",
  city: "",
  district: "",
  addressText: "",
  isDefault: false,
};

export default function Addresses() {
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const { provinces, loading: loadingProvinces } = useProvinces();
  const { districts, loading: loadingDistricts } = useDistricts(selectedProvinceId);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [savingDefaultId, setSavingDefaultId] = useState<number | null>(null);

  function fetchAddresses() {
    apiFetch<Address[]>("/addresses")
      .then(setAddresses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchAddresses();
  }, []);

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedProvinceId(null);
    setError(null);
    setModalOpen(true);
  }

  function openEditModal(item: Address) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      fullName: item.fullName,
      phoneNumber: digitsFromExistingPhone(item.phoneNumber),
      city: item.city,
      district: item.district,
      addressText: item.addressText,
      isDefault: item.isDefault,
    });
    const matchedProvince = provinces.find((p) => p.name === item.city);
    setSelectedProvinceId(matchedProvince?.id ?? null);
    setError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title || !form.fullName || !form.phoneNumber || !form.city || !form.district || !form.addressText) {
      setError("Tüm alanları doldurun.");
      return;
    }
    if (form.phoneNumber.length !== 10) {
      setError("Telefon numarası 10 haneli olmalıdır.");
      return;
    }

    const payload = { ...form, phoneNumber: toE164(form.phoneNumber) };

    try {
      if (editingId) {
        await apiFetch(`/addresses/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
        setModalOpen(false);
        fetchAddresses();
      } else {
        const created = await apiFetch<Address>("/addresses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setModalOpen(false);
        if (returnTo) {
          navigate(returnTo, { state: { selectedAddressId: created.id } });
        } else {
          fetchAddresses();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!window.confirm(`"${title}" adresini silmek istediğinize emin misiniz?`)) return;
    try {
      await apiFetch(`/addresses/${id}`, { method: "DELETE" });
      fetchAddresses();
    } catch {
      window.alert("Silme işlemi başarısız.");
    }
  }

  async function handleSetDefault(item: Address) {
    if (item.isDefault) return;
    setSavingDefaultId(item.id);
    try {
      await apiFetch(`/addresses/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: item.title,
          fullName: item.fullName,
          phoneNumber: item.phoneNumber,
          city: item.city,
          district: item.district,
          addressText: item.addressText,
          isDefault: true,
        }),
      });
      fetchAddresses();
    } catch {
      window.alert("Varsayılan adres güncellenemedi.");
    } finally {
      setSavingDefaultId(null);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      {returnTo && (
        <button
          onClick={() => navigate(returnTo)}
          className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1"
        >
          ← Checkout'a Dön
        </button>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Adreslerim</h1>
        <button
          onClick={openAddModal}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
        >
          + Adres Ekle
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <MapPin size={56} className="text-gray-300 mb-4" />
          <p className="text-lg font-bold text-gray-900 mb-1">Henüz kayıtlı adresiniz yok</p>
          <p className="text-gray-500">Hızlı checkout için bir adres ekleyin</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${
                item.isDefault ? "border-orange-500" : "border-transparent"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-gray-900">{item.title}</p>
                  {item.isDefault && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      <Star size={10} fill="currentColor" />
                      VARSAYILAN
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <p className="text-sm font-semibold text-gray-800">{item.fullName}</p>
              <p className="text-sm text-gray-500">{item.phoneNumber}</p>
              <p className="text-sm text-gray-500 mb-3">
                {item.addressText}, {item.district}/{item.city}
              </p>

              <div className="flex items-center justify-between">
                {!item.isDefault && (
                  <button
                    onClick={() => handleSetDefault(item)}
                    disabled={savingDefaultId === item.id}
                    className="text-xs font-semibold text-orange-500 hover:underline disabled:opacity-50"
                  >
                    {savingDefaultId === item.id ? "Kaydediliyor..." : "Varsayılan yap"}
                  </button>
                )}
                {returnTo && (
                  <button
                    onClick={() => navigate(returnTo, { state: { selectedAddressId: item.id } })}
                    className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg ml-auto"
                  >
                    Bu Adresi Kullan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6">
              {editingId ? "Adresi Düzenle" : "Yeni Adres Ekle"}
            </h2>

            <div className="space-y-4">
              <FormField
                label="Adres Etiketi *"
                value={form.title}
                onChange={(v) => setForm((p) => ({ ...p, title: v }))}
                placeholder="Ev, İş..."
              />
              <FormField
                label="Ad Soyad *"
                value={form.fullName}
                onChange={(v) => setForm((p) => ({ ...p, fullName: v }))}
                placeholder="Teslim alacak kişi"
              />
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Telefon Numarası *</label>
                <div className="flex items-center rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-orange-500">
                  <span className="pl-4 pr-2 text-sm font-semibold text-gray-500 select-none">+90</span>
                  <input
                    type="tel"
                    value={formatPhoneDisplay(form.phoneNumber)}
                    onChange={(e) => setForm((p) => ({ ...p, phoneNumber: extractPhoneDigits(e.target.value) }))}
                    placeholder="555 123 45 67"
                    className="flex-1 rounded-r-xl py-2.5 pr-4 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">İl *</label>
                  <select
                    value={selectedProvinceId ?? ""}
                    onChange={(e) => {
                      const id = Number(e.target.value) || null;
                      const province = provinces.find((p) => p.id === id);
                      setSelectedProvinceId(id);
                      setForm((p) => ({ ...p, city: province?.name ?? "", district: "" }));
                    }}
                    disabled={loadingProvinces}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    <option value="">{loadingProvinces ? "Yükleniyor..." : "Seçin"}</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">İlçe *</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
                    disabled={!selectedProvinceId || loadingDistricts}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    <option value="">
                      {!selectedProvinceId ? "Önce il seçin" : loadingDistricts ? "Yükleniyor..." : "Seçin"}
                    </option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Açık Adres *</label>
                <textarea
                  value={form.addressText}
                  onChange={(e) => setForm((p) => ({ ...p, addressText: e.target.value }))}
                  rows={3}
                  placeholder="Mahalle, sokak, bina/daire no..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                <span className="text-sm font-semibold text-gray-700">Varsayılan adres yap</span>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, isDefault: !p.isDefault }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.isDefault ? "bg-orange-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.isDefault ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

            <button
              onClick={handleSave}
              className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 mt-6"
            >
              {editingId ? "Güncelle" : "Kaydet"}
            </button>
            <button onClick={() => setModalOpen(false)} className="w-full text-center text-gray-500 py-3 mt-2">
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
  );
}