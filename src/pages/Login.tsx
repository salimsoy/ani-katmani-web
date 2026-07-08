import { useState, type SubmitEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, continueAsGuest } = useAuth();
  const { mergeGuestCartToServer } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password) {
      setError("Email ve şifre alanları boş bırakılamaz.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      await mergeGuestCartToServer();
      navigate(from, { replace: true });
    } catch {
      setError("Email veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  }

  function handleGuest() {
    continueAsGuest();
    navigate("/");
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Giriş Yap</h1>
      <p className="text-gray-500 mb-8">Anı Katmanı 3D'ye hoş geldiniz</p>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 disabled:bg-orange-300 transition-colors"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Hesabın yok mu?{" "}
        <Link to="/register" className="text-orange-500 font-semibold">
          Kayıt ol
        </Link>
      </p>

      <button
        onClick={handleGuest}
        className="w-full text-center text-sm text-gray-400 underline mt-4"
      >
        Misafir olarak devam et
      </button>
    </div>
  );
}
