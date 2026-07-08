import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "./AuthContext";
import type { CartItem, Figurine } from "../types";
import {
  getLocalCart,
  addToLocalCart,
  updateLocalCartItem,
  removeFromLocalCart,
  clearLocalCart,
  type LocalCartItem,
} from "../api/localCart";

// Sepet ekranında gösterilecek birleşik tip (guest ve login'li kullanıcı için ortak arayüz)
export interface CartDisplayItem {
  id: number; // login'li: backend CartItem.id, guest: array index
  figurineId: number;
  quantity: number;
  figurine: LocalCartItem["figurine"] | Figurine | null;
}

interface CartContextType {
  cartItems: CartDisplayItem[];
  loading: boolean;
  totalPrice: number;
  refreshCart: () => Promise<void>;
  addToCart: (figurine: Figurine, quantity: number) => Promise<void>;
  updateQuantity: (id: number, figurineId: number, currentQuantity: number, change: number) => Promise<void>;
  removeItem: (id: number, figurineId: number) => Promise<void>;
  mergeGuestCartToServer: () => Promise<void>;
  clearCartAfterGuestOrder: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    setLoading(true);

    if (!token) {
      const localCart = getLocalCart();
      const formatted: CartDisplayItem[] = localCart.map((item, index) => ({
        id: index,
        figurineId: item.figurineId,
        quantity: item.quantity,
        figurine: item.figurine,
      }));
      setCartItems(formatted);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<CartItem[]>("/cart");
      setCartItems(data);
    } catch (err) {
      console.error("Sepet çekilemedi:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // AuthContext localStorage'dan token'ı okuyup bitirdikten sonra sepeti bir kez çek;
  // token değiştikçe (login/logout) de yeniden çeker.
  useEffect(() => {
    if (authLoading) return;
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, token]);

  async function addToCart(figurine: Figurine, quantity: number) {
    if (!token) {
      addToLocalCart({
        figurineId: figurine.id,
        quantity,
        figurine: {
          id: figurine.id,
          name: figurine.name,
          price: figurine.price,
          filamentType: figurine.filamentType,
          scale: figurine.scale,
          imageUrl: figurine.imageUrl,
        },
      });
      await refreshCart();
      return;
    }

    await apiFetch("/cart", {
      method: "POST",
      body: JSON.stringify({ figurineId: figurine.id, quantity }),
    });
    await refreshCart();
  }

  async function removeItem(id: number, figurineId: number) {
    if (!token) {
      removeFromLocalCart(figurineId);
      await refreshCart();
      return;
    }

    await apiFetch(`/cart/${id}`, { method: "DELETE" });
    await refreshCart();
  }

  async function updateQuantity(id: number, figurineId: number, currentQuantity: number, change: number) {
    const newQuantity = currentQuantity + change;

    if (!token) {
      updateLocalCartItem(figurineId, newQuantity);
      await refreshCart();
      return;
    }

    if (newQuantity <= 0) {
      await removeItem(id, figurineId);
      return;
    }

    await apiFetch(`/cart/${id}`, {
      method: "PUT",
      body: JSON.stringify({ quantity: newQuantity }),
    });
    await refreshCart();
  }

  // Login sonrası guest sepetini backend'e taşır — login sayfası, login() çağrısından hemen sonra bunu çağıracak
  async function mergeGuestCartToServer() {
    const localCart = getLocalCart();
    if (localCart.length === 0) return;

    await Promise.all(
      localCart.map((item) =>
        apiFetch("/cart", {
          method: "POST",
          body: JSON.stringify({ figurineId: item.figurineId, quantity: item.quantity }),
        })
      )
    );
    clearLocalCart();
    await refreshCart();
  }

  // Misafir siparişi tamamlandıktan sonra local sepeti temizler (backend'e hiç gitmediği için refreshCart tek başına yetmez)
  async function clearCartAfterGuestOrder() {
    clearLocalCart();
    await refreshCart();
  }

  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.figurine?.price ?? 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ cartItems, loading, totalPrice, refreshCart, addToCart, updateQuantity, removeItem, mergeGuestCartToServer, clearCartAfterGuestOrder }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart, CartProvider içinde kullanılmalı");
  return context;
}