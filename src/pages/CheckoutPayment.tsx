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
import { CheckoutAddress, CheckoutItem, UserMeasurements } from '@/types/checkout'; // Import UserMeasurements type

interface AppSettings {
  qr_code_url?: string;
  phonepe_deep_link?: string;
}

const CheckoutPayment: React.FC = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [address, setAddress] = useState<CheckoutAddress | null>(null);
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurements | null>(null); // New state for measurements
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
  const [transactionId, setTransactionId] = useState<string>('');
  const [donateAmount, setDonateAmount] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  const [showOrderSuccessDialog, setShowOrderSuccessDialog] = useState(false);

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
    fetchUserMeasurements(); // Fetch user measurements
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
        .select('chest, waist, sleeve_length, shoulder, neck')
        .eq('user_id', session.user.id)
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

      const { error } = await supabase.from('orders').insert({
        user_id: session.user.id,
        total_amount: totalAmount,
        status: 'pending',
        items: orderItems,
        address_details: address,
        payment_method: selectedPaymentMethod,
        transaction_id: selectedPaymentMethod === 'qr_code' ? transactionId : null,
        donation_amount: donateAmount ? 10 : null,
        user_measurements: userMeasurements, // Include user measurements
      });

      if (error) {
        throw error;
      }

      showSuccess('Order placed successfully!');
      localStorage.removeItem('aslam_tailor_cart'); // Clear main cart
      localStorage.removeItem('checkout_cart_items'); // Clear checkout cart
      localStorage.removeItem('checkout_address_details'); // Clear checkout address
      setCartItems([]);
      setAddress(null);
      setSelectedPaymentMethod('cod');
      setTransactionId('');
      setDonateAmount(false);
      setShowOrderSuccessDialog(true); // Show success dialog
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
    // In a real app, you'd likely have a callback from PhonePe to confirm payment
    // For now, we'll assume success and proceed to checkout after a short delay or user action.
    // For simplicity, we'll just show a toast and let the user manually confirm.
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/checkout/address">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground ml-2">Payment Method</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method */}
            <Card className="p-4 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup onValueChange={setSelectedPaymentMethod} value={selectedPaymentMethod} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">Cash on Delivery (COD)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="qr_code" id="qr_code" />
                    <Label htmlFor="qr_code">QR Code Payment</Label>
                  </div>
                  {selectedPaymentMethod === 'qr_code' && (
                    <div className="ml-6 space-y-3 p-3 border rounded-md bg-muted/50">
                      {appSettings.qr_code_url ? (
                        <>
                          <img src={appSettings.qr_code_url} alt="QR Code" className="w-48 h-48 object-contain mx-auto border p-2 rounded-md" />
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
                            />
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">QR Code URL not configured by admin.</p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phonepe" id="phonepe" />
                    <Label htmlFor="phonepe">PhonePe</Label>
                  </div>
                  {selectedPaymentMethod === 'phonepe' && (
                    <div className="ml-6 space-y-3 p-3 border rounded-md bg-muted/50">
                      <Button
                        onClick={handlePhonePePayment}
                        className="w-full bg-purple-600 text-white hover:bg-purple-700"
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
            <Card className="p-4 shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
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
                <div className="flex justify-between font-bold text-lg text-foreground border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{calculateTotalAmount().toLocaleString()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center justify-center text-center space-y-4">
            <CheckCircle2 className="h-20 w-20 text-green-500 animate-pop-in" />
            <DialogTitle className="text-green-600 text-2xl font-bold">Order Placed Successfully!</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Your order has been placed and will be processed shortly. Thank you for shopping with us!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2 mt-4">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/orders" onClick={() => setShowOrderSuccessDialog(false)}>
                View Orders
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
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