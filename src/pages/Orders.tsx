import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { UserMeasurements } from '@/types/checkout'; 
// Removed import for OrderDetailsDialogUser as it's no longer used

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
  delivery_date?: string; // Added delivery_date
  total_amount: number;
  status: string;
  items: OrderItem[];
  address_details?: AddressDetails;
  payment_method?: string;
  transaction_id?: string;
  donation_amount?: number;
  updated_at?: string;
  user_measurements?: UserMeasurements; // Added user_measurements
}

const Orders: React.FC = () => {
  const { session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed states for dialog: isOrderDetailsDialogOpen, selectedOrder

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('order_date', { ascending: false });

        if (error) {
          throw error;
        }

        setOrders(data as Order[]);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
        showError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session]);

  // Removed renderMeasurements function as it's now in OrderDetailsPage
  // Removed handleViewOrderDetails function as it's replaced by Link navigation

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-foreground text-center">Your Orders</h1>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading orders...</p>
        ) : error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : orders.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-lg shadow-sm">
            <p className="text-lg text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Link to="/" className="text-primary hover:underline">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Link 
                key={order.id} 
                to={`/orders/${order.id}`} // Navigate to new OrderDetailsPage
                className="block"
              >
                <Card 
                  className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold">Order #{order.id.substring(0, 8)}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Order Date: {format(new Date(order.order_date), 'PPP')}
                    </p>
                    {order.delivery_date && (
                      <p className="text-sm text-green-600 font-semibold mb-2">
                        Estimated Delivery: {format(new Date(order.delivery_date), 'PPP')}
                      </p>
                    )}
                    <p className="text-lg font-bold text-foreground mb-4">
                      Total: ₹{order.total_amount.toLocaleString()}
                      {order.donation_amount && order.donation_amount > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">(Incl. ₹{order.donation_amount} Donation)</span>
                      )}
                    </p>
                    
                    {/* Display only a summary of items here, full details in dialog */}
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item, itemIndex) => ( // Show first 3 items as summary
                        <div key={itemIndex} className="flex items-center space-x-4 border-t pt-3 first:border-t-0 first:pt-0">
                          <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} {item.selectedSize && `(Size: ${item.selectedSize})`}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          +{order.items.length - 3} more items. Click to view full order details.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Orders;