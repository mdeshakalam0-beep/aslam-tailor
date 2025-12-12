import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { CheckoutAddress, CheckoutItem, UserMeasurements } from '@/types/checkout';
import { addDays } from 'date-fns';
import { getProductById } from '@/utils/products';
import { createShiprocketOrder, ShiprocketOrderResponse } from '@/utils/shiprocket';

interface AppSettings {
  qr_code_url?: string;
  phonepe_deep_link?: string;
}

const CheckoutPayment: React.FC = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [address, setAddress] = useState<CheckoutAddress | null>(null);
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurements | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
  const [transactionId, setTransactionId] = useState<string>('');
  const [donateAmount, setDonateAmount] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  const [showOrderSuccessDialog, setShowOrderSuccessDialog] = useState(false);
  const [shiprocketTrackingId, setShiprocketTrackingId] = useState<string | null>(null);

  useEffect(() => {
    const storedCart = localStorage.getItem('checkout_cart_items');
    const storedAddress = localStorage.getItem('checkout_address_details');

    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    } else {
      showError('No items in cart to checkout. Please add items to cart first.');
      navigate('/cart');
      return;
    }

    if (storedAddress) {
      setAddress(JSON.parse(storedAddress));
    } else {
      showError('Shipping address not found. Please provide your address.');
      navigate('/checkout/address');
      return;
    }

    fetchAppSettings();
    fetchUserMeasurements();
  }, [navigate, session]);

  const fetchAppSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');

      if (error) throw error;

      const settings: AppSettings = {};
      data.forEach(item => {
        if (item.key === 'qr_code_url') settings.qr_code_url = item.value;
        if (item.key === 'phonepe_deep_link') settings.phonepe_deep_link = item.value;
      });
      setAppSettings(settings);
    } catch (error) {
      console.error('Error fetching app settings:', error);
      showError('Failed to load payment settings.');
    }
  };

  const fetchUserMeasurements = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select(`
          measurement_type, notes, ladies_size,
          men_shirt_length, men_shirt_chest, men_shirt_waist, men_shirt_sleeve_length, men_shirt_shoulder, men_shirt_neck,
          men_pant_length, men_pant_waist, men_pant_hip, men_pant_thigh, men_pant_bottom,
          men_coat_length, men_coat_chest, men_coat_waist, men_coat_sleeve_length, men_coat_shoulder
        `)
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setUserMeasurements(data || null);
    } catch (error) {
      console.error('Error fetching user measurements:', error);
      showError('Failed to load your measurements.');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTotalAmount = () => {
    let total = calculateSubtotal();
    if (donateAmount) {
      total += 10;
    }
    return total;
  };

  const handleCheckout = async () => {
    if (!session?.user) {
      showError('Please log in to place an order.');
      return;
    }
    if (cartItems.length === 0) {
      showError('Your cart is empty.');
      return;
    }
    if (!address) {
      showError('Shipping address is missing. Please go back and fill it.');
      return;
    }

    if (selectedPaymentMethod === 'qr_code' && !transactionId) {
      showError('Please enter the transaction ID for QR Code payment.');
      return;
    }

    setLoadingCheckout(true);
    try {
      const totalAmount = calculateTotalAmount();
      const orderItems = cartItems.map(item => ({
        product_id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
      }));

      const orderDate = new Date();
      const deliveryDate = addDays(orderDate, 10);

      let cancellationDeadline: Date | null = null;
      let returnDeadline: Date | null = null;

      if (cartItems.length > 0) {
        const firstProductDetails = await getProductById(cartItems[0].id);
        if (firstProductDetails) {
          if (firstProductDetails.is_cancellable && firstProductDetails.cancellation_window_days > 0) {
            cancellationDeadline = addDays(orderDate, firstProductDetails.cancellation_window_days);
          }
          if (firstProductDetails.is_returnable && firstProductDetails.return_window_days > 0) {
            returnDeadline = addDays(deliveryDate, firstProductDetails.return_window_days);
          }
        }
      }

      // 1. Create order in Supabase
      const { data: supabaseOrder, error: supabaseError } = await supabase.from('orders').insert({
        user_id: session.user.id,
        order_date: orderDate.toISOString(),
        delivery_date: deliveryDate.toISOString(),
        total_amount: totalAmount,
        status: 'pending',
        items: orderItems,
        address_details: address,
        payment_method: selectedPaymentMethod,
        transaction_id: selectedPaymentMethod === 'qr_code' ? transactionId : null,
        donation_amount: donateAmount ? 10 : null,
        user_measurements: userMeasurements,
        cancellation_deadline: cancellationDeadline?.toISOString() || null,
        return_deadline: returnDeadline?.toISOString() || null,
      }).select().single();

      if (supabaseError) {
        throw supabaseError;
      }

      // 2. Create order in Shiprocket
      let shiprocketResponse: ShiprocketOrderResponse | null = null;
      try {
        shiprocketResponse = await createShiprocketOrder({
          order_id: supabaseOrder.id,
          order_date: orderDate.toISOString().slice(0, 16).replace('T', ' '),
          customer_email: session.user.email || 'customer@example.com',
          address_details: address,
          items: cartItems,
          total_amount: totalAmount,
          payment_method: selectedPaymentMethod,
          user_measurements: userMeasurements,
        });

        if (shiprocketResponse && shiprocketResponse.awb_code) {
          setShiprocketTrackingId(shiprocketResponse.awb_code);
          await supabase.from('orders').update({
            shiprocket_order_id: shiprocketResponse.order_id,
            shiprocket_shipment_id: shiprocketResponse.shipment_id,
            awb_code: shiprocketResponse.awb_code,
            courier_name: shiprocketResponse.courier_name,
          }).eq('id', supabaseOrder.id);
        }
      } catch (shiprocketErr) {
        console.error('Failed to create Shiprocket order after Supabase order:', shiprocketErr);
        showError('Order placed, but failed to create Shiprocket shipment. Please contact support.');
      }

      showSuccess('Order placed successfully!');
      localStorage.removeItem('aslam_tailor_cart');
      localStorage.removeItem('checkout_cart_items');
      localStorage.removeItem('checkout_address_details');
      setCartItems([]);
      setAddress(null);
      setSelectedPaymentMethod('cod');
      setTransactionId('');
      setDonateAmount(false);
      setShowOrderSuccessDialog(true);
    } catch (err) {
      console.error('Error placing order:', err);
      showError('Failed to place order. Please try again.');
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handlePhonePePayment = () => {
    if (!appSettings.phonepe_deep_link) {
      showError('PhonePe payment link is not configured by admin.');
      return;
    }
    if (!address) {
      showError('Shipping address is missing. Please go back and fill it.');
      return;
    }

    const totalAmount = calculateTotalAmount();
    const deepLink = `${appSettings.phonepe_deep_link}${totalAmount}`;
    window.location.href = deepLink;
    showSuccess('Redirecting to PhonePe. Please complete your payment.');
  };

  return (
    <div className="min-h-screen bg-off-white-page-bg pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/checkout/address">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-text-primary-heading ml-2">Payment Method</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 shadow-elev border border-card-border">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-text-primary-heading">Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup onValueChange={setSelectedPaymentMethod} value={selectedPaymentMethod} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="text-text-secondary-body">Cash on Delivery (COD)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="qr_code" id="qr_code" />
                    <Label htmlFor="qr_code" className="text-text-secondary-body">QR Code Payment</Label>
                  </div>
                  {selectedPaymentMethod === 'qr_code' && (
                    <div className="ml-6 space-y-3 p-3 border border-card-border rounded-small bg-primary-pale-pink">
                      {appSettings.qr_code_url ? (
                        <>
                          <img src={appSettings.qr_code_url} alt="QR Code" className="w-48 h-48 object-contain mx-auto border border-card-border p-2 rounded-small" />
                          <a href={appSettings.qr_code_url} download="QR_Code_Payment.png" className="flex items-center justify-center text-primary hover:underline text-sm">
                            <Download className="h-4 w-4 mr-2" /> Download QR Code
                          </a>
                          <div>
                            <Label htmlFor="transactionId">Transaction ID</Label>
                            <Input
                              id="transactionId"
                              type="text"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              placeholder="Enter transaction ID after payment"
                              required
                              className="border border-card-border rounded-small focus:ring-accent-rose"
                            />
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-text-secondary-body">QR Code URL not configured by admin.</p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phonepe" id="phonepe" />
                    <Label htmlFor="phonepe" className="text-text-secondary-body">PhonePe</Label>
                  </div>
                  {selectedPaymentMethod === 'phonepe' && (
                    <div className="ml-6 space-y-3 p-3 border border-card-border rounded-small bg-primary-pale-pink">
                      <Button
                        onClick={handlePhonePePayment}
                        className="w-full bg-accent-rose text-white hover:bg-accent-dark rounded-small"
                        disabled={!appSettings.phonepe_deep_link}
                      >
                        Pay with PhonePe (₹{calculateTotalAmount().toLocaleString()})
                      </Button>
                      {!appSettings.phonepe_deep_link && (
                        <p className="text-sm text-destructive">PhonePe deep link not configured by admin.</p>
                      )}
                    </div>
                  )}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-4 shadow-elev border border-card-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-text-primary-heading">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-text-secondary-body">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-secondary-body">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex items-center justify-between text-text-secondary-body">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="donate"
                      checked={donateAmount}
                      onCheckedChange={(checked) => setDonateAmount(!!checked)}
                    />
                    <Label htmlFor="donate">Donate ₹10</Label>
                  </div>
                  <span>₹{donateAmount ? '10' : '0'}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-text-primary-heading border-t border-card-border pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{calculateTotalAmount().toLocaleString()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-accent-rose text-white hover:bg-accent-dark rounded-small"
                  onClick={handleCheckout}
                  disabled={loadingCheckout || cartItems.length === 0 || !address}
                >
                  {loadingCheckout ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <BottomNavigation />

      {/* Order Success Dialog */}
      <Dialog open={showOrderSuccessDialog} onOpenChange={setShowOrderSuccessDialog}>
        <DialogContent 
          className="sm:max-w-[425px] rounded-default shadow-elev border border-card-border"
          aria-labelledby="order-success-title"
          aria-describedby="order-success-description"
        >
          <DialogHeader className="flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 className="h-20 w-20 text-accent-rose animate-pop-in" />
            <DialogTitle id="order-success-title" className="text-accent-rose text-2xl font-bold">Order Placed Successfully!</DialogTitle>
            <DialogDescription id="order-success-description" className="text-text-secondary-body">
              Your order has been placed and will be processed shortly. Thank you for shopping with us!
              {shiprocketTrackingId && (
                <p className="mt-2 text-sm font-semibold text-text-primary-heading">
                  Tracking ID: {shiprocketTrackingId}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2 mt-4">
            <Button asChild variant="outline" className="w-full sm:w-auto border-card-border rounded-small">
              <Link to="/orders" onClick={() => setShowOrderSuccessDialog(false)}>
                View Orders
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto bg-accent-rose text-white hover:bg-accent-dark rounded-small">
              <Link to="/" onClick={() => setShowOrderSuccessDialog(false)}>
                Continue Shopping
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPayment;