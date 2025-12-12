import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format, isBefore, isAfter } from 'date-fns';
import { UserMeasurements } from '@/types/checkout';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
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
} from '@/components/ui/alert-dialog';

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
  user_id: string;
  updated_at?: string;
  user_measurements?: UserMeasurements;
  cancellation_deadline?: string;
  return_deadline?: string;
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
      case 'returned': return 'warning';
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
      fetchOrder();
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
      fetchOrder();
    } catch (err) {
      console.error('Error returning order:', err);
      showError('Failed to request return.');
    } finally {
      setIsReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white-page-bg">
        <p className="text-text-primary-heading">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white-page-bg">
        <p className="text-destructive">{error}</p>
        <Link to="/orders" className="text-primary hover:underline ml-4">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white-page-bg">
        <p className="text-text-primary-heading">Order not found.</p>
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
    <div className="min-h-screen bg-off-white-page-bg pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-text-primary-heading ml-2">Order Details - #{order.id.substring(0, 8)}</h1>
        </div>

        <Card className="p-4 shadow-elev border border-card-border rounded-default">
          <CardContent className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold text-text-primary-heading">Order Date:</Label>
                <p className="text-text-secondary-body">{format(new Date(order.order_date), 'PPP')}</p>
              </div>
              <div>
                <Label className="font-semibold text-text-primary-heading">Total Amount:</Label>
                <p className="font-bold text-lg text-text-primary-heading">₹{order.total_amount.toLocaleString()}</p>
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
                <Label className="font-semibold text-text-primary-heading">Donation:</Label>
                <p className="text-text-secondary-body">₹{order.donation_amount.toLocaleString()}</p>
              </div>
            )}
            <div>
              <Label className="font-semibold text-text-primary-heading">Status:</Label>
              <Badge variant={getStatusBadgeVariant(order.status)} className={
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'pending' ? 'bg-primary-pale-pink text-accent-dark' :
                order.status === 'cancelled' ? 'bg-destructive text-white' :
                order.status === 'returned' ? 'bg-orange-100 text-orange-800' :
                'bg-secondary-soft-pink text-text-primary-heading'
              }>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>

            {order.cancellation_deadline && (
              <div>
                <Label className="font-semibold text-text-primary-heading">Cancellation Window:</Label>
                <p className="text-sm text-text-secondary-body">
                  {isCancellationWindowOpen ? (
                    <span className="text-accent-rose">Cancel by {format(new Date(order.cancellation_deadline), 'PPP')}</span>
                  ) : (
                    <span className="text-destructive">Cancellation window closed on {format(new Date(order.cancellation_deadline), 'PPP')}</span>
                  )}
                </p>
              </div>
            )}

            {order.return_deadline && (
              <div>
                <Label className="font-semibold text-text-primary-heading">Return Window:</Label>
                <p className="text-sm text-text-secondary-body">
                  {isReturnWindowOpen ? (
                    <span className="text-purple-600">Return by {format(new Date(order.return_deadline), 'PPP')}</span>
                  ) : (
                    <span className="text-destructive">Return window closed on {format(new Date(order.return_deadline), 'PPP')}</span>
                  )}
                </p>
              </div>
            )}

            {order.address_details && (
              <div className="border-t border-card-border pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-2 text-text-primary-heading">Shipping Address</h3>
                <p className="text-sm text-text-secondary-body">{order.address_details.fullName}, {order.address_details.phone}</p>
                <p className="text-sm text-text-secondary-body">{order.address_details.streetAddress}, {order.address_details.landmark && `${order.address_details.landmark}, `}{order.address_details.postOffice && `${order.address_details.postOffice}, `}{order.address_details.city}, {order.address_details.state} - {order.address_details.pincode}</p>
              </div>
            )}

            {order.payment_method && (
              <div className="border-t border-card-border pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-2 text-text-primary-heading">Payment Information</h3>
                <p className="text-sm text-text-secondary-body">Method: {formatPaymentMethod(order.payment_method)}</p>
                {order.transaction_id && (
                  <p className="text-sm text-text-secondary-body">Transaction ID: {order.transaction_id}</p>
                )}
              </div>
            )}

            {hasMeasurements && (
              <div className="border-t border-card-border pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-2 text-text-primary-heading">Customer Measurements</h3>
                {order.user_measurements?.measurement_type === 'women' && order.user_measurements.ladies_size && (
                  <p className="text-sm text-text-secondary-body"><span className="font-medium">Ladies' Size:</span> {order.user_measurements.ladies_size}</p>
                )}
                {order.user_measurements?.measurement_type === 'men' && menMeasurements.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 text-sm text-text-secondary-body">
                    {menMeasurements.map((m, idx) => (
                      <div key={idx}><span className="font-medium">{m.label}:</span> {m.value} inches</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {order.user_measurements?.notes && (
              <div className="border-t border-card-border pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-2 text-text-primary-heading">Additional Notes</h3>
                <p className="text-sm text-text-secondary-body whitespace-pre-wrap">{order.user_measurements.notes}</p>
              </div>
            )}

            <div className="border-t border-card-border pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2 text-text-primary-heading">Ordered Items</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-small" />
                    <div className="flex-1">
                      <p className="font-medium text-text-primary-heading">{item.name}</p>
                      <p className="text-sm text-text-secondary-body">
                        Quantity: {item.quantity} {item.selectedSize && `(Size: ${item.selectedSize})`}
                      </p>
                      <p className="text-sm text-text-secondary-body">Price: ₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 border-t border-card-border pt-4">
              {canCancel && isCancellationWindowOpen && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isCancelling} className="rounded-small">
                      {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-default shadow-elev border border-card-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-text-primary-heading">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-text-secondary-body">
                        This action cannot be undone. This will cancel your order.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-small border-card-border">No, keep order</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelOrder} disabled={isCancelling} className="bg-destructive text-white hover:bg-destructive/90 rounded-small">
                        {isCancelling ? 'Cancelling...' : 'Yes, cancel order'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {canReturn && isReturnWindowOpen && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="secondary" disabled={isReturning} className="rounded-small bg-primary-pale-pink text-accent-dark hover:bg-secondary-soft-pink">
                      {isReturning ? 'Requesting Return...' : 'Request Return'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-default shadow-elev border border-card-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-text-primary-heading">Are you sure you want to return this order?</AlertDialogTitle>
                      <AlertDialogDescription className="text-text-secondary-body">
                        This will initiate a return request for your order. Our team will contact you for further steps.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-small border-card-border">No, keep order</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReturnOrder} disabled={isReturning} className="bg-accent-rose text-white hover:bg-accent-dark rounded-small">
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