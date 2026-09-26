import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import type { CurrentUser } from "../types";
import { User } from "lucide-react";
import LoadingState from "../components/LoadingState";

export default function AccountInfo() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<CurrentUser>("/auth/me")
      .then(setCurrentUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Bilgilerim</h1>

      {currentUser && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
            <User size={24} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-gray-900">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <p className="text-sm text-gray-500">{currentUser.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}