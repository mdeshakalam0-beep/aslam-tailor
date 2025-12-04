import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Orders from './pages/Orders';
import Measurement from './pages/Measurement';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import Favorites from './pages/Favorites';
import CheckoutAddress from './pages/CheckoutAddress';
import CheckoutPayment from './pages/CheckoutPayment';
import CategoryProducts from './pages/CategoryProducts';
import OrderDetailsPage from './pages/OrderDetailsPage';

// admin pages (kept as in your repo)
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import MeasurementTypeManagement from './pages/admin/MeasurementTypeManagement';
import BrandManagement from './pages/admin/BrandManagement';
import AppPopupManagement from './pages/admin/AppPopupManagement';
import AppSettings from './pages/admin/AppSettings';
import NotificationManagement from './pages/admin/NotificationManagement';
// <-- Changed this import to the actual file present in your repo -->
import HeroBannerManagement from './pages/admin/HeroBannerManagement';
import ProductManagement from './pages/admin/ProductManagement';

// other components used around routes
import SessionContextProvider from './components/SessionContextProvider';
import RecentPurchaseNotification from './components/RecentPurchaseNotification';
import AppPopupDisplay from './components/AppPopupDisplay';

// create react query client
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <SessionContextProvider>
            {/* Routes: Note - no global "redirect to /login" here.
                Individual protected/admin routes should still handle auth internally 
                (so we did not remove any admin or protected routes). */}
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order/:id" element={<OrderDetailsPage />} />
              <Route path="/measurement" element={<Measurement />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/categories/:categoryId" element={<CategoryProducts />} />
              <Route path="/checkout/address" element={<CheckoutAddress />} />
              <Route path="/checkout/payment" element={<CheckoutPayment />} />
              {/* Make /products publicly accessible via categories route or add explicit /products if you want */}
              <Route path="/products" element={<CategoryProducts />} />

              {/* Admin routes (kept as before) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="measurement-types" element={<MeasurementTypeManagement />} />
                {/* use the HeroBannerManagement component that exists in your repo */}
                <Route path="banners" element={<HeroBannerManagement />} />
                <Route path="notifications" element={<NotificationManagement />} />
                <Route path="brands" element={<BrandManagement />} />
                <Route path="popups" element={<AppPopupManagement />} />
                <Route path="settings" element={<AppSettings />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Keep site-wide UI components */}
            <RecentPurchaseNotification />
            <AppPopupDisplay />
          </SessionContextProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
