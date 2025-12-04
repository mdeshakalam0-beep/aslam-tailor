import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Favorites from "./pages/Favorites";
import CategoryProducts from "./pages/CategoryProducts";
import Login from "./pages/Login";

// Protected pages
import Orders from "./pages/Orders";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import Measurement from "./pages/Measurement";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import CheckoutAddress from "./pages/CheckoutAddress";
import CheckoutPayment from "./pages/CheckoutPayment";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import UserManagement from "./pages/admin/UserManagement";
import AppSettings from "./pages/admin/AppSettings";
import CategoryManagement from "./pages/admin/CategoryManagement";
import MeasurementTypeManagement from "./pages/admin/MeasurementTypeManagement";
import HeroBannerManagement from "./pages/admin/HeroBannerManagement";
import NotificationManagement from "./pages/admin/NotificationManagement";
import BrandManagement from "./pages/admin/BrandManagement";
import AppPopupManagement from "./pages/admin/AppPopupManagement";

// Components
import { SessionContextProvider } from "./components/SessionContextProvider";
import RecentPurchaseNotification from "./components/RecentPurchaseNotification";
import AppPopupDisplay from "./components/AppPopupDisplay";

// Protected wrappers
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtected from "./components/AdminProtected";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SessionContextProvider>
            <Routes>

              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/categories/:categoryId" element={<CategoryProducts />} />

              {/* Protected User Routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
              <Route path="/measurement" element={<ProtectedRoute><Measurement /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout/address" element={<ProtectedRoute><CheckoutAddress /></ProtectedRoute>} />
              <Route path="/checkout/payment" element={<ProtectedRoute><CheckoutPayment /></ProtectedRoute>} />

              {/* PROTECTED ADMIN ROUTES */}
              <Route
                path="/admin"
                element={
                  <AdminProtected>
                    <AdminLayout />
                  </AdminProtected>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="measurement-types" element={<MeasurementTypeManagement />} />
                <Route path="banners" element={<HeroBannerManagement />} />
                <Route path="notifications" element={<NotificationManagement />} />
                <Route path="brands" element={<BrandManagement />} />
                <Route path="popups" element={<AppPopupManagement />} />
                <Route path="settings" element={<AppSettings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Global popups */}
            <RecentPurchaseNotification />
            <AppPopupDisplay />
          </SessionContextProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
  }
