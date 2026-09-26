import { Link, Outlet } from "react-router-dom";
import { ShoppingCart, Heart, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import Footer from "./Footer";

export default function Layout() {
  const { cartItems } = useCart();
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="sticky top-0 z-10 bg-paper/90 backdrop-blur-sm border-b border-line">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex flex-col gap-[3px]" aria-hidden="true">
              <span className="block w-6 h-[3px] rounded-full bg-orange-500" />
              <span className="block w-6 h-[3px] rounded-full bg-ink" />
              <span className="block w-6 h-[3px] rounded-full bg-spool" />
            </span>
            <span className="font-display text-xl font-bold text-ink tracking-tight">
              Anı Katmanı <span className="text-orange-500">3D</span>
            </span>
          </Link>

          <nav className="flex items-center gap-7 text-sm font-semibold text-gray-700">
            <Link to="/cart" className="relative flex items-center gap-1.5 hover:text-orange-600 transition-colors">
              <ShoppingCart size={19} strokeWidth={2.2} />
              Sepetim
              {totalItemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </Link>
            <Link to="/favorites" className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
              <Heart size={19} strokeWidth={2.2} />
              Favoriler
            </Link>
            <Link to="/orders" className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
              <User size={19} strokeWidth={2.2} />
              Profil
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-6 pb-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
