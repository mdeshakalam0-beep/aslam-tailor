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
  delivery_date?: string;
  total_amount: number;
  status: string;
  items: OrderItem[];
  address_details?: AddressDetails;
  payment_method?: string;
  transaction_id?: string;
  donation_amount?: number;
  updated_at?: string;
  user_measurements?: UserMeasurements;
  cancellation_deadline?: string;
  return_deadline?: string;
}

const Orders: React.FC = () => {
  const { session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-off-white-page-bg pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-text-primary-heading text-center">Your Orders</h1>

        {loading ? (
          <p className="text-center text-text-secondary-body">Loading orders...</p>
        ) : error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : orders.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-default shadow-elev border border-card-border">
            <p className="text-lg text-text-secondary-body mb-4">You haven't placed any orders yet.</p>
            <Link to="/" className="text-primary hover:underline">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Link 
                key={order.id} 
                to={`/orders/${order.id}`}
                className="block"
              >
                <Card 
                  className="shadow-elev border border-card-border rounded-default cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold text-text-primary-heading">Order #{order.id.substring(0, 8)}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-primary-pale-pink text-accent-dark' :
                      order.status === 'cancelled' ? 'bg-destructive text-white' :
                      order.status === 'returned' ? 'bg-orange-100 text-orange-800' :
                      'bg-secondary-soft-pink text-text-primary-heading'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-text-secondary-body mb-2">
                      Order Date: {format(new Date(order.order_date), 'PPP')}
                    </p>
                    {order.delivery_date && (
                      <p className="text-sm text-green-600 font-semibold mb-2">
                        Estimated Delivery: {format(new Date(order.delivery_date), 'PPP')}
                      </p>
                    )}
                    {order.cancellation_deadline && new Date(order.cancellation_deadline) > new Date() && (
                      <p className="text-sm text-accent-rose font-semibold mb-2">
                        Cancel by: {format(new Date(order.cancellation_deadline), 'PPP')}
                      </p>
                    )}
                    {order.return_deadline && new Date(order.return_deadline) > new Date() && order.status === 'completed' && (
                      <p className="text-sm text-purple-600 font-semibold mb-2">
                        Return by: {format(new Date(order.return_deadline), 'PPP')}
                      </p>
                    )}
                    <p className="text-lg font-bold text-text-primary-heading mb-4">
                      Total: ₹{order.total_amount.toLocaleString()}
                      {order.donation_amount && order.donation_amount > 0 && (
                        <span className="text-xs text-text-secondary-body ml-2">(Incl. ₹{order.donation_amount} Donation)</span>
                      )}
                    </p>
                    
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-4 border-t border-card-border pt-3 first:border-t-0 first:pt-0">
                          <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-small mr-2" />
                          <div className="flex-1">
                            <p className="font-medium text-text-primary-heading">{item.name}</p>
                            <p className="text-sm text-text-secondary-body">
                              Qty: {item.quantity} {item.selectedSize && `(Size: ${item.selectedSize})`}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-text-secondary-body mt-2">
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