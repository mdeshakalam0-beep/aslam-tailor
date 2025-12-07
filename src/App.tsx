import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import Measurement from "./pages/Measurement";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import Favorites from "./pages/Favorites";
import CheckoutAddress from "./pages/CheckoutAddress";
import CheckoutPayment from "./pages/CheckoutPayment";
import CategoryProducts from "./pages/CategoryProducts";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import { SessionContextProvider } from "./components/SessionContextProvider";
import AdminLayout from "./components/admin/AdminLayout";
import ProductManagement from "./pages/admin/ProductManagement";
import AdminDashboard from "./pages/admin/Dashboard";
import OrderManagement from "./pages/admin/OrderManagement";
import UserManagement from "./pages/admin/UserManagement";
import AppSettings from "./pages/admin/AppSettings";
import HeroBannerManagement from "./pages/admin/HeroBannerManagement";
import NotificationManagement from "./pages/admin/NotificationManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import MeasurementTypeManagement from "./pages/admin/MeasurementTypeManagement";
import RecentPurchaseNotification from "./components/RecentPurchaseNotification";
import AppPopupManagement from "./pages/admin/AppPopupManagement";
import AppPopupDisplay from "./components/AppPopupDisplay";
import BrandManagement from "./pages/admin/BrandManagement";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <SessionContextProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            
            {/* Protected User Routes */}
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
            <Route path="/measurement" element={<ProtectedRoute><Measurement /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/checkout/address" element={<ProtectedRoute><CheckoutAddress /></ProtectedRoute>} />
            <Route path="/checkout/payment" element={<ProtectedRoute><CheckoutPayment /></ProtectedRoute>} />

            {/* Public Routes (can be accessed without login) */}
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/categories/:categoryId" element={<CategoryProducts />} />

            {/* Admin Routes (already protected by AdminLayout) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="measurement-types" element={<MeasurementTypeManagement />} />
              <Route path="banners" element={<HeroBannerManagement />} />
              <Route path="popups" element={<AppPopupManagement />} />
              <Route path="notifications" element={<NotificationManagement />} />
              <Route path="brands" element={<BrandManagement />} />
              <Route path="settings" element={<AppSettings />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <RecentPurchaseNotification />
          <AppPopupDisplay />
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
