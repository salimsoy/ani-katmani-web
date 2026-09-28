import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { CurrentUser } from "../types";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import LoadingState from "../components/LoadingState";

const MIN_PASSWORD_LENGTH = 6;

export default function AccountInfo() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<CurrentUser>("/auth/me")
      .then(setCurrentUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Tüm alanları doldurun.");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Yeni şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Yeni şifreler eşleşmiyor.");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError("Yeni şifre mevcut şifreden farklı olmalı.");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Şifreniz değiştirildi. Güvenliğiniz için tekrar giriş yapmanız gerekiyor...");

      // Backend şifre değişince tüm oturumları geçersiz kılıyor — yeniden girişe yönlendir
      setTimeout(async () => {
        await logout();
        navigate("/login");
      }, 2000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Şifre değiştirilemedi.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

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

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 font-extrabold text-gray-900">
            <Lock size={18} className="text-orange-500" />
            Şifre Değiştir
          </h2>
          <button
            type="button"
            onClick={() => setShowPasswords((prev) => !prev)}
            className="text-gray-400 hover:text-gray-700"
            aria-label={showPasswords ? "Şifreleri gizle" : "Şifreleri göster"}
          >
            {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {passwordSuccess ? (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <p className="text-sm font-semibold text-green-700">{passwordSuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Mevcut şifre"
              autoComplete="current-password"
              className={inputClass}
            />
            <input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={`Yeni şifre (en az ${MIN_PASSWORD_LENGTH} karakter)`}
              autoComplete="new-password"
              className={inputClass}
            />
            <input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Yeni şifre (tekrar)"
              autoComplete="new-password"
              className={inputClass}
            />

            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? "Kaydediliyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
