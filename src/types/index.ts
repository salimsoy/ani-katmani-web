// ==================== Entities ====================

export interface Figurine {
  id: number;
  name: string;
  price: number;
  filamentType: string;
  scale: string;
  printTimeInHours: number;
  imageUrl?: string;
  sellerStoreName: string;
  images?: FigurineImage[];
  stock: number;  // ← Bu satırı ekle
  averageRating: number | null;
  reviewCount: number;
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

export type FavoriteItem = {
  id: number;
  figurineId: number;
  figurine: Figurine | null;
  createdAt?: string;
};

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
  status: OrderStatus;
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
  overallStatus: OrderStatus;
  orderItems: OrderItem[];
  user: User | null;
  couponId: number | null;
  coupon: Coupon | null;
  discountAmount: number;
  shippingOptionId: number | null;
  shippingOption: ShippingOption | null;
  shippingCost: number;
}

export interface FigurineImage {
  id: number;
  figurineId: number;
  imageUrl: string;
  sortOrder: number;
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
  role: "Customer" | "Seller" | "SuperAdmin";
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
export interface OrderUser {
  firstName: string;
  email: string;
}

export interface AdminOrder extends Omit<Order, "user"> {
  user: OrderUser | null;
}

export interface Address {
  id: number;
  userId: number;
  title: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  district: string;
  addressText: string;
  isDefault: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  firstName: string;
  isAdmin: boolean;
  refreshToken: string;
}

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "Customer" | "Seller" | "SuperAdmin";
  createdAt: string;
}

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

// --- Dashboard ---

export interface RevenueMetrics {
  today: number;
  todayOrderCount: number;
  yesterday: number;
  last7Days: number;
  previous7Days: number;
  thisMonth: number;
  lastMonth: number;
}

export interface GeneralMetrics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  guestOrderPercentage: number;
}

export interface TopFigurine {
  figurineId: number;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RecentOrder {
  id: number;
  fullName: string;
  createdAt: string;
  totalPrice: number;
  status: string;
  isGuest: boolean;
}

export interface LowStockFigurine {
  id: number;
  name: string;
  stock: number;
  imageUrl?: string;
}

export interface DashboardData {
  revenue: RevenueMetrics;
  general: GeneralMetrics;
  statusCounts: Record<string, number>;
  topFigurines: TopFigurine[];
  dailyRevenue: DailyRevenue[];
  recentOrders: RecentOrder[];
  lowStockFigurines: LowStockFigurine[];
}

export interface ComplaintImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

export interface ComplaintComment {
  id: number;
  userId: number;
  authorName: string;
  authorRole: string;
  message: string;
  createdAt: string;
}

export interface Complaint {
  id: number;
  orderItemId: number;
  orderId: number;
  figurineName: string;
  figurineImageUrl: string | null;
  customerName: string;
  sellerStoreName: string;
  type: string;
  category: string | null;
  requestedResolution: string;
  subject: string;
  status: string;
  resolutionOutcome: string | null;
  createdAt: string;
  escalatedToAdmin: boolean;
  commentCount: number;
}

export interface ComplaintDetail extends Complaint {
  comments: ComplaintComment[];
  images: ComplaintImage[];
}

export interface Return {
  id: number;
  orderItemId: number;
  orderId: number;
  complaintId: number | null;
  figurineName: string;
  figurineImageUrl: string | null;
  customerName: string;
  sellerStoreName: string;
  reason: string;
  description: string;
  status: string;
  rejectionReason: string | null;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  createdAt: string;
  refundedAt: string | null;
}