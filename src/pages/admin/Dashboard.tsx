import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag, Users, DollarSign, XCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { getAdminDashboardData, IncomeMetrics, CancelledOrdersCount, TopProduct, TopCustomer } from '@/utils/adminDashboard';
import { exportToCsv } from '@/utils/exportToCsv';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Dashboard: React.FC = () => {
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [incomeMetrics, setIncomeMetrics] = useState<IncomeMetrics>({ daily: 0, weekly: 0, monthly: 0, yearly: 0 });
  const [cancelledOrdersCount, setCancelledOrdersCount] = useState<CancelledOrdersCount>({ daily: 0, weekly: 0, monthly: 0, yearly: 0 });
  const [topSellingProducts, setTopSellingProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  // Raw data for export
  const [allOrdersData, setAllOrdersData] = useState<any[]>([]);
  const [allProductsData, setAllProductsData] = useState<any[]>([]);
  const [allProfilesData, setAllProfilesData] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch basic counts
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('id', { count: 'exact' });
      if (productsError) throw productsError;
      setTotalProducts(productsCount);

      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('id', { count: 'exact' });
      if (ordersError) throw ordersError;
      setTotalOrders(ordersCount);

      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });
      if (usersError) throw usersError;
      setActiveUsers(usersCount);

      // Fetch and process detailed dashboard data
      const dashboardData = await getAdminDashboardData();
      setIncomeMetrics(dashboardData.income);
      setCancelledOrdersCount(dashboardData.cancelledOrders);
      setTopSellingProducts(dashboardData.topSellingProducts);
      setTopCustomers(dashboardData.topCustomers);
      setAllOrdersData(dashboardData.allOrders);
      setAllProductsData(dashboardData.allProducts);
      setAllProfilesData(dashboardData.allProfiles);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup Supabase Realtime subscriptions
    const ordersChannel = supabase
      .channel('dashboard_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Realtime order change:', payload);
        fetchData(); // Re-fetch all data on any order change
      })
      .subscribe();

    const productsChannel = supabase
      .channel('dashboard_products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('Realtime product change:', payload);
        fetchData(); // Re-fetch all data on any product change
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('dashboard_profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        console.log('Realtime profile change:', payload);
        fetchData(); // Re-fetch all data on any profile change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []); // Empty dependency array to run once on mount and cleanup on unmount

  const handleDownloadOrders = () => {
    const columns = [
      { header: 'Order ID', key: 'id' },
      { header: 'User ID', key: 'user_id' },
      { header: 'Order Date', key: 'order_date' },
      { header: 'Total Amount', key: 'total_amount' },
      { header: 'Status', key: 'status' },
      { header: 'Items', key: 'items' },
      { header: 'Address Details', key: 'address_details' },
      { header: 'Payment Method', key: 'payment_method' },
      { header: 'Transaction ID', key: 'transaction_id' },
      { header: 'Donation Amount', key: 'donation_amount' },
      { header: 'User Measurements', key: 'user_measurements' },
      { header: 'Updated At', key: 'updated_at' },
    ];
    exportToCsv(allOrdersData, 'all_orders_data', columns);
  };

  const handleDownloadProducts = () => {
    const columns = [
      { header: 'Product ID', key: 'id' },
      { header: 'Name', key: 'name' },
      { header: 'Description', key: 'description' },
      { header: 'Price', key: 'price' },
      { header: 'Original Price', key: 'original_price' },
      { header: 'Discount', key: 'discount' },
      { header: 'Rating', key: 'rating' },
      { header: 'Reviews Count', key: 'reviews_count' },
      { header: 'Recent Purchase', key: 'recent_purchase' },
      { header: 'Image URLs', key: 'image_urls' },
      { header: 'Sizes', key: 'sizes' },
      { header: 'Bought By Users', key: 'bought_by_users' },
      { header: 'Created At', key: 'created_at' },
      { header: 'Updated At', key: 'updated_at' },
      { header: 'Category ID', key: 'category_id' },
    ];
    exportToCsv(allProductsData, 'all_products_data', columns);
  };

  const handleDownloadCustomers = () => {
    const columns = [
      { header: 'User ID', key: 'id' },
      { header: 'First Name', key: 'first_name' },
      { header: 'Last Name', key: 'last_name' },
      { header: 'Avatar URL', key: 'avatar_url' },
      { header: 'Updated At', key: 'updated_at' },
      { header: 'Role', key: 'role' },
      { header: 'Gender', key: 'gender' },
    ];
    exportToCsv(allProfilesData, 'all_customer_profiles_data', columns);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Admin Dashboard</h2>
      {loading ? (
        <p className="text-center text-muted-foreground">Loading dashboard data...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card key="total-products-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts !== null ? totalProducts.toLocaleString() : 'N/A'}</div>
                <p className="text-xs text-muted-foreground">Overall products in store</p>
              </CardContent>
            </Card>
            <Card key="total-orders-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders !== null ? totalOrders.toLocaleString() : 'N/A'}</div>
                <p className="text-xs text-muted-foreground">Overall orders placed</p>
              </CardContent>
            </Card>
            <Card key="active-users-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeUsers !== null ? activeUsers.toLocaleString() : 'N/A'}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>
            <Card key="daily-income-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{incomeMetrics.daily.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total revenue today</p>
              </CardContent>
            </Card>
          </div>

          {/* Income Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Card key="weekly-income-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{incomeMetrics.weekly.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Revenue this week</p>
              </CardContent>
            </Card>
            <Card key="monthly-income-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{incomeMetrics.monthly.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Revenue this month</p>
              </CardContent>
            </Card>
            <Card key="yearly-income-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yearly Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{incomeMetrics.yearly.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Revenue this year</p>
              </CardContent>
            </Card>
            <Card key="daily-cancelled-orders-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled Orders (Today)</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cancelledOrdersCount.daily}</div>
                <p className="text-xs text-muted-foreground">Orders cancelled today</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Selling Products */}
          <Card key="top-selling-products-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-foreground">Top Selling Products</CardTitle>
              <Button variant="outline" size="sm" onClick={handleDownloadProducts}>
                <Download className="h-4 w-4 mr-2" /> Download Products
              </Button>
            </CardHeader>
            <CardContent>
              {topSellingProducts.length === 0 ? (
                <p className="text-center text-muted-foreground">No products sold yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Quantity Sold</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topSellingProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.totalQuantitySold}</TableCell>
                          <TableCell className="text-right">₹{product.totalRevenue.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card key="top-customers-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-foreground">Top Customers</CardTitle>
              <Button variant="outline" size="sm" onClick={handleDownloadCustomers}>
                <Download className="h-4 w-4 mr-2" /> Download Customers
              </Button>
            </CardHeader>
            <CardContent>
              {topCustomers.length === 0 ? (
                <p className="text-center text-muted-foreground">No customer data available yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Total Orders</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.totalOrders}</TableCell>
                          <TableCell className="text-right">₹{customer.totalSpent.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Download Section */}
          <Card key="data-download-card-section">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Download Data</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button onClick={handleDownloadOrders} variant="secondary">
                <Download className="h-4 w-4 mr-2" /> Download All Orders
              </Button>
              <Button onClick={handleDownloadProducts} variant="secondary">
                <Download className="h-4 w-4 mr-2" /> Download All Products
              </Button>
              <Button onClick={handleDownloadCustomers} variant="secondary">
                <Download className="h-4 w-4 mr-2" /> Download All Customer Profiles
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;