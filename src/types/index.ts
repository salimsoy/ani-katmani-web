// ==================== Entities ====================

export interface Figurine {
  id: number;
  name: string;
  price: number;
  filamentType: string; // serbest metin (örn: "PLA", "Reçine") — enum değil, filtrede sabit liste öneririz
  scale: string; // "1/10", "1/6" vb.
  printTimeInHours: number;
  imageUrl: string; // backend null değil, boş string ("") döndürüyor
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface CartItem {
  id: number;
  userId: number;
  figurineId: number;
  quantity: number;
  figurine: Figurine | null;
}

export interface FavoriteItem {
  id: number;
  userId: number;
  figurineId: number;
  figurine: Figurine | null;
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  isActive: boolean;
  expiryDate: string | null;
  createdAt: string;
  minimumCartAmount: number;
}

export interface CouponUsage {
  id: number;
  couponId: number;
  userId: number;
  usedAt: string;
  coupon: Coupon | null;
  user: User | null;
}

// TODO: Admin paneli yazılırken gerçek Türkçe status değerleri netleşince union type yapılacak
export type OrderStatus = string;

export interface OrderItem {
  id: number;
  orderId: number;
  order: Order | null;
  figurineId: number;
  figurine: Figurine | null;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  userId: number | null; // misafir siparişlerinde null
  email: string | null; // misafir siparişlerinde dolu, üye siparişlerinde null
  fullName: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
  totalPrice: number;
  status: OrderStatus;
  orderItems: OrderItem[];
  user: User | null;
  couponId: number | null;
  coupon: Coupon | null;
  discountAmount: number;
  shippingOptionId: number | null;
  shippingOption: ShippingOption | null;
  shippingCost: number;
}

// ==================== API Response Wrapper'ları ====================

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface GuestCartItemPayload {
  figurineId: number;
  quantity: number;
}

// Login/Register endpoint'lerini test edince gerçek response'a göre teyit edeceğiz
export interface AuthResponse {
  token: string;
  id: number; // userId değil, id
  firstName: string;
  isAdmin: boolean;
}

export interface CouponValidationResponse {
  isValid: boolean;
  message: string;
  coupon: Coupon | null;
}

export interface ShippingOption {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
}