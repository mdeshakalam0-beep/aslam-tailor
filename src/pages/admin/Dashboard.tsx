import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

const Dashboard: React.FC = () => {
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Total Products
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('id', { count: 'exact' });
        if (productsError) throw productsError;
        setTotalProducts(productsCount);

        // Fetch Total Orders
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('id', { count: 'exact' });
        if (ordersError) throw ordersError;
        setTotalOrders(ordersCount);

        // Fetch Active Users (counting profiles as active users)
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' });
        if (usersError) throw usersError;
        setActiveUsers(usersCount);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Admin Dashboard</h2>
      {loading ? (
        <p className="text-center text-muted-foreground">Loading dashboard data...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts !== null ? totalProducts.toLocaleString() : 'N/A'}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p> {/* Placeholder */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders !== null ? totalOrders.toLocaleString() : 'N/A'}</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p> {/* Placeholder */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers !== null ? activeUsers.toLocaleString() : 'N/A'}</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p> {/* Placeholder */}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No recent activity to display.</p> {/* Placeholder */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;