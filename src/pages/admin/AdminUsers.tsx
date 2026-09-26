import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import type { AdminUser } from "../../types";
import { LogOut, ShieldCheck, Store } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminUser | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  function fetchUsers() {
    apiFetch<AdminUser[]>("/auth/admin/users")
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleForceLogout() {
    if (!confirmTarget) return;
    setRevokingId(confirmTarget.id);
    try {
      const result = await apiFetch<{ message: string }>(
        `/auth/admin/revoke/${confirmTarget.id}`,
        {
          method: "POST",
        }
      );
      setResultMessage(result.message);
    } catch {
      setResultMessage("İşlem başarısız.");
    } finally {
      setRevokingId(null);
      setConfirmTarget(null);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{users.length} kullanıcı</p>

      {/* Tablo */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Kullanıcı</th>
                <th className="px-4 py-3">E-posta</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Kayıt Tarihi</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    Henüz kullanıcı yok.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {user.firstName?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.role === "SuperAdmin" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
                        <ShieldCheck size={12} />
                        Süper Admin
                      </span>
                    ) : user.role === "Seller" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        <Store size={12} />
                        Satıcı
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                        Müşteri
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setConfirmTarget(user)}
                      disabled={revokingId === user.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-50 text-red-500 text-xs font-semibold px-3 py-1.5 hover:bg-red-100 disabled:opacity-50"
                    >
                      <LogOut size={12} />
                      {revokingId === user.id ? "..." : "Çıkışa Zorla"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onay modalı */}
      {confirmTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <LogOut size={22} className="text-red-500" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900 mb-2">Çıkışa zorla</h2>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-semibold text-gray-700">
                {confirmTarget.firstName} {confirmTarget.lastName}
              </span>{" "}
              kullanıcısını tüm cihazlardan çıkışa zorlamak istediğinize emin misiniz? Bu işlem
              geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Vazgeç
              </button>
              <button
                onClick={handleForceLogout}
                disabled={revokingId !== null}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {revokingId !== null ? "İşleniyor..." : "Evet, Çıkışa Zorla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {resultMessage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center">
            <p className="text-sm text-gray-700 mb-6">{resultMessage}</p>
            <button
              onClick={() => setResultMessage(null)}
              className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}