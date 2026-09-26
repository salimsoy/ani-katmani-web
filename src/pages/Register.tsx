import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LayerStack from "../components/LayerStack";

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
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(message || "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Hesabınız oluşturuldu!</h1>
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
    <div className="grid lg:grid-cols-2 gap-8 items-center py-6 lg:py-10">
      <div className="hidden lg:flex flex-col justify-center rounded-3xl bg-ink text-paper px-10 py-14 h-full">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-orange-400 mb-3">
          Katman katman, anı anı
        </p>
        <h2 className="font-display text-3xl font-bold leading-tight mb-4">Aramıza katıl.</h2>
        <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
          Bağımsız üreticilerin sana özel bastığı figürlere ulaş, siparişlerini kolayca takip et.
        </p>
        <LayerStack className="mt-10" />
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8 sm:p-10 max-w-md w-full mx-auto lg:mx-0">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Kayıt Ol</h1>
        <p className="text-gray-500 mb-8">Hesap oluşturmak sadece birkaç saniye sürer</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
          </div>
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
          <Link to="/login" className="text-orange-600 font-semibold">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
