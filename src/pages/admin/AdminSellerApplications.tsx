import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { Check, X, Store } from "lucide-react";

type SellerApplication = {
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
  role: string;
  createdAt: string;
};

export default function AdminSellerApplications() {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [users, setUsers] = useState<Record<number, UserInfo>>({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [commissionInputs, setCommissionInputs] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  function fetchData() {
    setLoading(true);
    Promise.all([
      apiFetch<SellerApplication[]>("/sellers/pending"),
      apiFetch<UserInfo[]>("/auth/admin/users"),
    ])
      .then(([apps, allUsers]) => {
        setApplications(apps);
        const userMap: Record<number, UserInfo> = {};
        allUsers.forEach((u) => (userMap[u.id] = u));
        setUsers(userMap);
      })
      .catch(() => setError("Veriler yüklenemedi."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleApprove(id: number) {
    const rateText = commissionInputs[id];
    const rate = parseFloat(rateText);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setError("Geçerli bir komisyon oranı girin (0-100).");
      return;
    }

    setProcessingId(id);
    setError(null);
    try {
      await apiFetch(`/sellers/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ commissionRate: rate }),
      });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onaylama başarısız.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: number) {
    if (!window.confirm("Bu başvuruyu reddetmek istediğinize emin misiniz?")) return;

    setProcessingId(id);
    setError(null);
    try {
      await apiFetch(`/sellers/${id}/reject`, { method: "POST" });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reddetme başarısız.");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">{applications.length} bekleyen başvuru</p>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-400">
          <Store size={48} className="mb-4" />
          <p className="font-semibold">Bekleyen satıcı başvurusu yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const user = users[app.userId];
            return (
              <div key={app.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{app.storeName}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {user ? `${user.firstName} ${user.lastName} — ${user.email}` : `Kullanıcı #${app.userId}`}
                    </p>
                    {app.storeDescription && (
                      <p className="text-sm text-gray-600 mt-2">{app.storeDescription}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Başvuru: {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:w-56 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      placeholder="Komisyon %"
                      value={commissionInputs[app.id] ?? ""}
                      onChange={(e) =>
                        setCommissionInputs((prev) => ({ ...prev, [app.id]: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(app.id)}
                        disabled={processingId === app.id}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green-500 text-white text-sm font-semibold py-2 hover:bg-green-600 disabled:opacity-50"
                      >
                        <Check size={15} />
                        Onayla
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        disabled={processingId === app.id}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-semibold py-2 hover:bg-red-100 disabled:opacity-50"
                      >
                        <X size={15} />
                        Reddet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}