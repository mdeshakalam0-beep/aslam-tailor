import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  selectedSize?: string;
}

interface AddressDetails {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  postOffice?: string;
  landmark?: string;
}

interface Order {
  id: string;
  order_date: string;
  total_amount: number;
  status: string;
  items: OrderItem[];
  address_details?: AddressDetails;
  payment_method?: string;
  transaction_id?: string;
  donation_amount?: number;
  user_id: string; // Added user_id to link with profiles
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrdersAndProfiles = async () => {
      setLoading(true);
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('order_date', { ascending: false });

        if (ordersError) throw ordersError;

        setOrders(ordersData as Order[]);

        // Fetch profiles for all unique user_ids in orders
        const uniqueUserIds = Array.from(new Set(ordersData.map(order => order.user_id)));
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', uniqueUserIds);

        if (profilesError) throw profilesError;

        const profilesMap: Record<string, Profile> = {};
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
        setProfiles(profilesMap);

      } catch (err) {
        console.error('Error fetching orders or profiles:', err);
        setError('Failed to load orders. Please try again.');
        showError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndProfiles();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'shipped': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getCustomerName = (userId: string) => {
    const profile = profiles[userId];
    return profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'N/A' : 'N/A';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Order Management</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading orders...</p>
          ) : error ? (
            <p className="text-center text-destructive">{error}</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-muted-foreground">No orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                      <TableCell>{getCustomerName(order.user_id)}</TableCell>
                      <TableCell>₹{order.total_amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(order.order_date), 'PPP')}</TableCell>
                      <TableCell className="text-right">
                        {/* Add action buttons here, e.g., View Details, Update Status */}
                        <span className="text-muted-foreground text-sm">View / Edit</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;