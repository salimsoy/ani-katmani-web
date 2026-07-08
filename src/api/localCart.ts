import type { Figurine } from "../types";

const CART_KEY = "local_cart";

export interface LocalCartItem {
  figurineId: number;
  quantity: number;
  figurine: Pick<Figurine, "id" | "name" | "price" | "filamentType" | "scale" | "imageUrl">;
}

export function getLocalCart(): LocalCartItem[] {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToLocalCart(item: LocalCartItem): void {
  const cart = getLocalCart();
  const existing = cart.find((c) => c.figurineId === item.figurineId);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function updateLocalCartItem(figurineId: number, newQuantity: number): void {
  if (newQuantity <= 0) {
    removeFromLocalCart(figurineId);
    return;
  }
  const cart = getLocalCart();
  const item = cart.find((c) => c.figurineId === figurineId);
  if (item) {
    item.quantity = newQuantity;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
}

export function removeFromLocalCart(figurineId: number): void {
  const cart = getLocalCart();
  const filtered = cart.filter((c) => c.figurineId !== figurineId);
  localStorage.setItem(CART_KEY, JSON.stringify(filtered));
}

export function clearLocalCart(): void {
  localStorage.removeItem(CART_KEY);
}