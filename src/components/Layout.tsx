import { Link, Outlet } from "react-router-dom";
import { ShoppingCart, Heart, User } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Layout() {
  const { cartItems } = useCart();
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold text-gray-900">
            Anı Katmanı <span className="text-orange-500">3D</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link to="/cart" className="relative flex items-center gap-1.5 hover:text-orange-500">
              <ShoppingCart size={20} />
              Sepetim
              {totalItemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </Link>
            <Link to="/favorites" className="flex items-center gap-1.5 hover:text-orange-500">
              <Heart size={20} />
              Favoriler
            </Link>
            <Link to="/profile" className="flex items-center gap-1.5 hover:text-orange-500">
              <User size={20} />
              Profil
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
