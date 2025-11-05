import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format, isBefore, isAfter } from 'date-fns'; // Import isBefore, isAfter
import { UserMeasurements } from '@/types/checkout';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast'; // Import showSuccess
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // Import AlertDialog components

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
  user_id: string;
  updated_at?: string;
  user_measurements?: UserMeasurements;
  cancellation_deadline?: string; // New: Cancellation deadline
  return_deadline?: string; // New: Return deadline
}

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) {
      setError('Order ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data as Order);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
      showError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'shipped': return 'outline';
      case 'cancelled': return 'destructive';
      case 'processing': return 'accent';
      case 'returned': return 'warning'; // New status variant
      default: return 'secondary';
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', order.id);

      if (error) throw error;
      showSuccess('Order cancelled successfully!');
      fetchOrder(); // Re-fetch order to update status
    } catch (err) {
      console.error('Error cancelling order:', err);
      showError('Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReturnOrder = async () => {
    if (!order) return;
    setIsReturning(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'returned', updated_at: new Date().toISOString() })
        .eq('id', order.id);

      if (error) throw error;
      showSuccess('Order return requested successfully!');
      fetchOrder(); // Re-fetch order to update status
    } catch (err) {
      console.error('Error returning order:', err);
      showError('Failed to request return.');
    } finally {
      setIsReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">{error}</p>
        <Link to="/orders" className="text-primary hover:underline ml-4">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Order not found.</p>
        <Link to="/orders" className="text-primary hover:underline ml-4">
          Back to Orders
        </Link>
      </div>
    );
  }

  const hasMeasurements = order.user_measurements && (
    (order.user_measurements.measurement_type === 'men' && Object.values(order.user_measurements).some(val => (typeof val === 'number' && val !== null && val !== undefined))) ||
    (order.user_measurements.measurement_type === 'women' && order.user_measurements.ladies_size)
  );

  const menMeasurements = order.user_measurements?.measurement_type === 'men' ? [
    { label: 'Shirt Length', value: order.user_measurements.men_shirt_length },
    { label: 'Shirt Chest', value: order.user_measurements.men_shirt_chest },
    { label: 'Shirt Waist', value: order.user_measurements.men_shirt_waist },
    { label: 'Sleeve Length', value: order.user_measurements.men_shirt_sleeve_length },
    { label: 'Shoulder', value: order.user_measurements.men_shirt_shoulder },
    { label: 'Neck', value: order.user_measurements.men_shirt_neck },
    { label: 'Pant Length', value: order.user_measurements.men_pant_length },
    { label: 'Pant Waist', value: order.user_measurements.men_pant_waist },
    { label: 'Pant Hip', value: order.user_measurements.men_pant_hip },
    { label: 'Pant Thigh', value: order.user_measurements.men_pant_thigh },
    { label: 'Pant Bottom', value: order.user_measurements.men_pant_bottom },
    { label: 'Coat Length', value: order.user_measurements.men_coat_length },
    { label: 'Coat Chest', value: order.user_measurements.men_coat_chest },
    { label: 'Coat Waist', value: order.user_measurements.men_coat_waist },
    { label: 'Coat Sleeve Length', value: order.user_measurements.men_coat_sleeve_length },
    { label: 'Coat Shoulder', value: order.user_measurements.men_coat_shoulder },
  ].filter(m => m.value !== null && m.value !== undefined) : [];

  const canCancel = order.status === 'pending' || order.status === 'processing' || order.status === 'shipped';
  const isCancellationWindowOpen = order.cancellation_deadline && isAfter(new Date(order.cancellation_deadline), new Date());

  const canReturn = order.status === 'completed';
  const isReturnWindowOpen = order.return_deadline && isAfter(new Date(order.return_deadline), new Date());

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground ml-2">Order Details - #{order.id.substring(0, 8)}</h1>
        </div>

        <Card className="p-4 shadow-sm">
          <CardContent className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Order Date:</Label>
                <p>{format(new Date(order.order_date), 'PPP')}</p>
              </div>
              <div>
                <Label className="font-semibold">Total Amount:</Label>
                <p className="font-bold text-lg">₹{order.total_amount.toLocaleString()}</p>
              </div>
            </div>
            {order.delivery_date && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold text-green-600">Estimated Delivery:</Label>
                  <p className="text-green-600 font-bold">{format(new Date(order.delivery_date), 'PPP')}</p>
                </div>
              </div>
            )}
            {order.donation_amount && order.donation_amount > 0 && (
              <div>
                <Label className="font-semibold">Donation:</Label>
                <p>₹{order.donation_amount.toLocaleString()}</p>
              </div>
            )}
            <div>
              <Label className="font-semibold">Status:</Label>
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>

            {order.cancellation_deadline && (
              <div>
                <Label className="font-semibold">Cancellation Window:</Label>
                <p className="text-sm text-muted-foreground">
                  {isCancellationWindowOpen ? (
                    <span className="text-blue-600">Cancel by {format(new Date(order.cancellation_deadline), 'PPP')}</span>
                  ) : (
                    <span className="text-red-600">Cancellation window closed on {format(new Date(order.cancellation_deadline), 'PPP')}</span>
                  )}
                </p>
              </div>
            )}

            {order.return_deadline && (
              <div>
                <Label className="font-semibold">Return Window:</Label>
                <p className="text-sm text-muted-foreground">
                  {isReturnWindowOpen ? (
                    <span className="text-purple-600">Return by {format(new Date(order.return_deadline), 'PPP')}</span>
                  ) : (
                    <span className="text-red-600">Return window closed on {format(new Date(order.return_deadline), 'PPP')}</span>
                  )}
                </p>
              </div>
            )}

            {order.address_details && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                <p className="text-sm text-muted-foreground">{order.address_details.fullName}, {order.address_details.phone}</p>
                <p className="text-sm text-muted-foreground">{order.address_details.streetAddress}, {order.address_details.landmark && `${order.address_details.landmark}, `}{order.address_details.postOffice && `${order.address_details.postOffice}, `}{order.address_details.city}, {order.address_details.state} - {order.address_details.pincode}</p>
              </div>
            )}

            {order.payment_method && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
                <p className="text-sm text-muted-foreground">Method: {formatPaymentMethod(order.payment_method)}</p>
                {order.transaction_id && (
                  <p className="text-sm text-muted-foreground">Transaction ID: {order.transaction_id}</p>
                )}
              </div>
            )}

            {hasMeasurements && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-2">Customer Measurements</h3>
                {order.user_measurements?.measurement_type === 'women' && order.user_measurements.ladies_size && (
                  <p className="text-sm text-muted-foreground"><span className="font-medium">Ladies' Size:</span> {order.user_measurements.ladies_size}</p>
                )}
                {order.user_measurements?.measurement_type === 'men' && menMeasurements.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {menMeasurements.map((m, idx) => (
                      <div key={idx}><span className="font-medium">{m.label}:</span> {m.value} inches</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {order.user_measurements?.notes && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.user_measurements.notes}</p>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Ordered Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
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
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 border-t pt-4">
              {canCancel && isCancellationWindowOpen && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isCancelling}>
                      {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will cancel your order.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No, keep order</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelOrder} disabled={isCancelling}>
                        {isCancelling ? 'Cancelling...' : 'Yes, cancel order'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {canReturn && isReturnWindowOpen && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="secondary" disabled={isReturning}>
                      {isReturning ? 'Requesting Return...' : 'Request Return'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to return this order?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will initiate a return request for your order. Our team will contact you for further steps.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No, keep order</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReturnOrder} disabled={isReturning}>
                        {isReturning ? 'Requesting...' : 'Yes, request return'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default OrderDetailsPage;