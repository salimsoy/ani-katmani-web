import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import AccountLayout from "./components/AccountLayout";

import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminFigurines from "./pages/admin/AdminFigurines";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminShipping from "./pages/admin/AdminShipping";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminLayout from "./components/AdminLayout";
import Addresses from "./pages/Addresses";
import AccountInfo from "./pages/AccountInfo";
import SellerApply from "./pages/SellerApply";
import AdminSellerApplications from "./pages/admin/AdminSellerApplications";
import RequireSeller from "./components/RequireSeller";
import SellerLayout from "./components/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerOrders from "./pages/seller/SellerOrders";
import AdminSellers from "./pages/admin/AdminSellers";
import AdminReviews from "./pages/admin/AdminReviews";
import SellerOrderDetail from "./pages/seller/SellerOrderDetail";
import Complaints from "./pages/Complaints";
import ComplaintDetail from "./pages/ComplaintDetail";
import SellerComplaints from "./pages/seller/SellerComplaints";
import AdminComplaints from "./pages/admin/AdminComplaints";
import Returns from "./pages/Returns";
import ReturnDetail from "./pages/ReturnDetail";
import SellerReturns from "./pages/seller/SellerReturns";
import AdminReturns from "./pages/admin/AdminReturns";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      {/* Ana site — Layout ile navbar + footer */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<RequireAuth />}>
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/seller-apply" element={<SellerApply />} />

          <Route element={<AccountLayout />}>
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/account" element={<AccountInfo />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/complaints/:id" element={<ComplaintDetail />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/returns/:id" element={<ReturnDetail />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin paneli — kendi tam ekran layout'unda, ana Layout yok */}
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminFigurines />} />
          <Route path="/admin-orders" element={<AdminOrders />} />
          <Route path="/admin-orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-coupons" element={<AdminCoupons />} />
          <Route path="/admin-shipping" element={<AdminShipping />} />
          <Route path="/admin-users" element={<AdminUsers />} />
          <Route path="/admin-sellers" element={<AdminSellerApplications />} />
          <Route path="/admin-sellers-list" element={<AdminSellers />} />
          <Route path="/admin-reviews" element={<AdminReviews />} />
          <Route path="/admin-complaints" element={<AdminComplaints />} />
          <Route path="/admin-complaints/:id" element={<ComplaintDetail />} />
          <Route path="/admin-returns" element={<AdminReturns />} />
          <Route path="/admin-returns/:id" element={<ReturnDetail />} />
        </Route>
      </Route>

      {/* Satıcı paneli */}
      <Route element={<RequireSeller />}>
        <Route element={<SellerLayout />}>
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/seller-products" element={<SellerProducts />} />
          <Route path="/seller-orders" element={<SellerOrders />} />
          <Route path="/seller-orders/:orderId" element={<SellerOrderDetail />} />
          <Route path="/seller-complaints" element={<SellerComplaints />} />
          <Route path="/seller-complaints/:id" element={<ComplaintDetail />} />
          <Route path="/seller-returns" element={<SellerReturns />} />
          <Route path="/seller-returns/:id" element={<ReturnDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}