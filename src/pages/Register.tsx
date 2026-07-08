import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      setError("Tüm alanlar doldurulmalıdır.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await register(firstName, lastName, email, password);
      setSuccess(true);
    } catch {
      setError("Bu email adresi zaten kullanılıyor.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Hesabınız oluşturuldu!</h1>
        <p className="text-gray-500 mb-8">Şimdi giriş yapabilirsiniz.</p>
        <button
          onClick={() => navigate("/login", { replace: true })}
          className="rounded-xl bg-orange-500 px-8 py-3 font-bold text-white hover:bg-orange-600 transition-colors"
        >
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Kayıt Ol</h1>
      <p className="text-gray-500 mb-8">Hesap oluşturmak sadece birkaç saniye sürer</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Ad"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="text"
          placeholder="Soyad"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="password"
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 disabled:bg-orange-300 transition-colors"
        >
          {loading ? "Kaydediliyor..." : "Kayıt Ol"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Zaten hesabın var mı?{" "}
        <Link to="/login" className="text-orange-500 font-semibold">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
