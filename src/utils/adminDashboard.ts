import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

interface OrderItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  selectedSize?: string;
}

interface Order {
  id: string;
  order_date: string;
  total_amount: number;
  status: string;
  items: OrderItem[];
  user_id: string;
}

interface Product {
  id: string;
  name: string;
  image_urls: string[];
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string; // Added email to Profile interface
}

export interface IncomeMetrics {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface CancelledOrdersCount {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface TopProduct {
  id: string;
  name: string;
  imageUrl: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  totalOrders: number;
}

// Helper to get date ranges
const getTodayRange = () => {
  const today = new Date();
  return { start: today, end: addDays(today, 1) };
};

const getWeekRange = () => {
  const today = new Date();
  return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) };
};

const getMonthRange = () => {
  const today = new Date();
  return { start: startOfMonth(today), end: endOfMonth(today) };
};

const getYearRange = () => {
  const today = new Date();
  return { start: startOfYear(today), end: endOfYear(today) };
};

// Main function to fetch and process all dashboard data
export const getAdminDashboardData = async () => {
  try {
    // Fetch all necessary raw data
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_date, total_amount, status, items, user_id');
    if (ordersError) throw ordersError;

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, name, image_urls');
    if (productsError) throw productsError;

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email'); // Fetch email from profiles
    if (profilesError) throw profilesError;

    const allOrders: Order[] = ordersData as Order[];
    const allProducts: Product[] = productsData as Product[];
    const allProfiles: Profile[] = profilesData as Profile[];

    const now = new Date();
    const todayRange = getTodayRange();
    const weekRange = getWeekRange();
    const monthRange = getMonthRange();
    const yearRange = getYearRange();

    let dailyIncome = 0;
    let weeklyIncome = 0;
    let monthlyIncome = 0;
    let yearlyIncome = 0;

    let dailyCancelled = 0;
    let weeklyCancelled = 0;
    let monthlyCancelled = 0;
    let yearlyCancelled = 0;

    const productSalesMap = new Map<string, { totalQuantity: number; totalRevenue: number }>();
    const customerSpendingMap = new Map<string, { totalSpent: number; totalOrders: number }>();

    for (const order of allOrders) {
      const orderDate = new Date(order.order_date);

      // Income & Cancelled Orders
      if (order.status !== 'cancelled') { // Only count non-cancelled orders for income
        const amount = parseFloat(order.total_amount.toString());
        if (isWithinInterval(orderDate, { start: todayRange.start, end: todayRange.end })) dailyIncome += amount;
        if (isWithinInterval(orderDate, { start: weekRange.start, end: weekRange.end })) weeklyIncome += amount;
        if (isWithinInterval(orderDate, { start: monthRange.start, end: monthRange.end })) monthlyIncome += amount;
        if (isWithinInterval(orderDate, { start: yearRange.start, end: yearRange.end })) yearlyIncome += amount;
      } else { // Count cancelled orders
        if (isWithinInterval(orderDate, { start: todayRange.start, end: todayRange.end })) dailyCancelled++;
        if (isWithinInterval(orderDate, { start: weekRange.start, end: weekRange.end })) weeklyCancelled++;
        if (isWithinInterval(orderDate, { start: monthRange.start, end: monthRange.end })) monthlyCancelled++;
        if (isWithinInterval(orderDate, { start: yearRange.start, end: yearRange.end })) yearlyCancelled++;
      }

      // Top Selling Products
      for (const item of order.items) {
        const current = productSalesMap.get(item.id) || { totalQuantity: 0, totalRevenue: 0 };
        current.totalQuantity += item.quantity;
        current.totalRevenue += item.quantity * item.price;
        productSalesMap.set(item.id, current);
      }

      // Top Customers
      const customer = customerSpendingMap.get(order.user_id) || { totalSpent: 0, totalOrders: 0 };
      customer.totalSpent += parseFloat(order.total_amount.toString());
      customer.totalOrders++;
      customerSpendingMap.set(order.user_id, customer);
    }

    // Process Top Selling Products
    const topSellingProducts: TopProduct[] = Array.from(productSalesMap.entries())
      .map(([productId, data]) => {
        const productInfo = allProducts.find(p => p.id === productId);
        return {
          id: productId,
          name: productInfo?.name || 'Unknown Product',
          imageUrl: productInfo?.image_urls[0] || 'https://picsum.photos/seed/placeholder/50/50',
          totalQuantitySold: data.totalQuantity,
          totalRevenue: data.totalRevenue,
        };
      })
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, 5); // Top 5 products

    // Process Top Customers
    const topCustomers: TopCustomer[] = Array.from(customerSpendingMap.entries())
      .map(([userId, data]) => {
        const profileInfo = allProfiles.find(p => p.id === userId);
        return {
          id: userId,
          name: profileInfo ? `${profileInfo.first_name || ''} ${profileInfo.last_name || ''}`.trim() || profileInfo.email : profileInfo?.email || `User ID: ${userId.substring(0, 4)}`,
          email: profileInfo?.email || `user_${userId.substring(0, 4)}@example.com`, // Use real email or placeholder
          totalSpent: data.totalSpent,
          totalOrders: data.totalOrders,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5); // Top 5 customers

    return {
      income: {
        daily: dailyIncome,
        weekly: weeklyIncome,
        monthly: monthlyIncome,
        yearly: yearlyIncome,
      },
      cancelledOrders: {
        daily: dailyCancelled,
        weekly: weeklyCancelled,
        monthly: monthlyCancelled,
        yearly: yearlyCancelled,
      },
      topSellingProducts,
      topCustomers,
      allOrders, // Return all orders for full export
      allProducts, // Return all products for full export
      allProfiles, // Return all profiles for full export
    };

  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    showError('Failed to load dashboard data.');
    return {
      income: { daily: 0, weekly: 0, monthly: 0, yearly: 0 },
      cancelledOrders: { daily: 0, weekly: 0, monthly: 0, yearly: 0 },
      topSellingProducts: [],
      topCustomers: [],
      allOrders: [],
      allProducts: [],
      allProfiles: [],
    };
  }
};