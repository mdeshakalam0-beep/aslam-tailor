import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
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

  const formatPaymentMethod = (method?: string) => {
    switch (method) {
      case 'cod':
        return 'Cash on Delivery';
      case 'qr_code':
        return 'QR Code Payment';
      case 'phonepe':
        return 'PhonePe';
      default:
        return 'N/A';
    }
  };

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
              <Card key={order.id} className="shadow-sm">
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
                  <p className="text-lg font-bold text-foreground mb-4">
                    Total: ₹{order.total_amount.toLocaleString()}
                    {order.donation_amount && order.donation_amount > 0 && (
                      <span className="text-xs text-muted-foreground ml-2">(Incl. ₹{order.donation_amount} Donation)</span>
                    )}
                  </p>

                  {order.address_details && (
                    <div className="mb-4 p-3 border rounded-md bg-muted/50">
                      <h4 className="font-semibold text-foreground mb-1">Shipping Address:</h4>
                      <p className="text-sm text-muted-foreground">{order.address_details.fullName}, {order.address_details.phone}</p>
                      <p className="text-sm text-muted-foreground">{order.address_details.streetAddress}, {order.address_details.landmark && `${order.address_details.landmark}, `}{order.address_details.postOffice && `${order.address_details.postOffice}, `}{order.address_details.city}, {order.address_details.state} - {order.address_details.pincode}</p>
                    </div>
                  )}

                  {order.payment_method && (
                    <div className="mb-4 p-3 border rounded-md bg-muted/50">
                      <h4 className="font-semibold text-foreground mb-1">Payment Method:</h4>
                      <p className="text-sm text-muted-foreground">{formatPaymentMethod(order.payment_method)}</p>
                      {order.payment_method === 'qr_code' && order.transaction_id && (
                        <p className="text-sm text-muted-foreground">Transaction ID: {order.transaction_id}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center space-x-4 border-t pt-3 first:border-t-0 first:pt-0">
                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} {item.selectedSize && `(Size: ${item.selectedSize})`}
                          </p>
                          <p className="text-sm text-muted-foreground">Price: ₹{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Orders;