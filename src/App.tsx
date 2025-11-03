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
import CategoryProducts from "./pages/CategoryProducts"; // Import new CategoryProducts page
import { SessionContextProvider } from "./components/SessionContextProvider";
import AdminLayout from "./components/admin/AdminLayout";
import ProductManagement from "./pages/admin/ProductManagement";
import AdminDashboard from "./pages/admin/Dashboard";
import OrderManagement from "./pages/admin/OrderManagement";
import UserManagement from "./pages/admin/UserManagement";
import AppSettings from "./pages/admin/AppSettings";
import HeroBannerManagement from "./pages/admin/HeroBannerManagement";
import NotificationManagement from "./pages/admin/NotificationManagement";
import CategoryManagement from "./pages/admin/CategoryManagement"; // Import new admin category management

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <SessionContextProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/measurement" element={<Measurement />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/categories/:categoryId" element={<CategoryProducts />} /> {/* New user category products route */}
            <Route path="/checkout/address" element={<CheckoutAddress />} />
            <Route path="/checkout/payment" element={<CheckoutPayment />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="categories" element={<CategoryManagement />} /> {/* New admin category route */}
              <Route path="banners" element={<HeroBannerManagement />} />
              <Route path="notifications" element={<NotificationManagement />} />
              <Route path="settings" element={<AppSettings />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;