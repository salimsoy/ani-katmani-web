import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { Store } from "lucide-react";

type Seller = {
  id: number;
  userId: number;
  storeName: string;
  storeDescription: string | null;
  commissionRate: number;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
};

type UserInfo = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

const STATUS_STYLES: Record<string, string> = {
  Approved: "bg-green-50 text-green-700",
  Pending: "bg-orange-50 text-orange-600",
  Rejected: "bg-red-50 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  Approved: "Onaylı",
  Pending: "Bekliyor",
  Rejected: "Reddedildi",
};

export default function AdminSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [users, setUsers] = useState<Record<number, UserInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Seller[]>("/sellers"),
      apiFetch<UserInfo[]>("/auth/admin/users"),
    ])
      .then(([sellerList, userList]) => {
        setSellers(sellerList);
        const map: Record<number, UserInfo> = {};
        userList.forEach((u) => (map[u.id] = u));
        setUsers(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">{sellers.length} satıcı</p>

      {sellers.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-400">
          <Store size={48} className="mb-4" />
          <p className="font-semibold">Henüz satıcı yok.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Mağaza</th>
                  <th className="px-4 py-3">Sahibi</th>
                  <th className="px-4 py-3">Komisyon</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellers.map((seller) => {
                  const user = users[seller.userId];
                  return (
                    <tr key={seller.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{seller.storeName}</p>
                        {seller.storeDescription && (
                          <p className="text-xs text-gray-400 truncate max-w-xs">
                            {seller.storeDescription}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {user ? `${user.firstName} ${user.lastName} — ${user.email}` : `#${seller.userId}`}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {seller.status === "Approved" ? `%${seller.commissionRate}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[seller.status]}`}
                        >
                          {STATUS_LABELS[seller.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(seller.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}