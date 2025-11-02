import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MinusCircle, PlusCircle, Trash2, Download } from 'lucide-react';
import { CartItem, getCartItems, updateCartItemQuantity, removeCartItem } from '@/utils/cart';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import AddressForm from '@/components/AddressForm'; // Import AddressForm
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
} from '@/components/ui/dialog'; // Import Dialog components

interface AppSettings {
  qr_code_url?: string;
  phonepe_deep_link?: string;
}

const Cart: React.FC = () => {
  const { session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    postOffice: '',
    landmark: '',
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
  const [transactionId, setTransactionId] = useState<string>('');
  const [donateAmount, setDonateAmount] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  const [showOrderSuccessDialog, setShowOrderSuccessDialog] = useState(false); // State for success dialog

  useEffect(() => {
    setCartItems(getCartItems());
    fetchAppSettings();
  }, []);

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

  const handleAddressChange = (field: string, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    const updatedCart = updateCartItemQuantity(item.id, item.selectedSize, newQuantity);
    setCartItems(updatedCart);
  };

  const handleRemoveItem = (item: CartItem) => {
    const updatedCart = removeCartItem(item.id, item.selectedSize);
    setCartItems(updatedCart);
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

  const validateAddress = () => {
    const requiredFields = ['fullName', 'phone', 'streetAddress', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!address[field as keyof typeof address]) {
        showError(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} in the address details.`);
        return false;
      }
    }
    return true;
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
    if (!validateAddress()) {
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
      });

      if (error) {
        throw error;
      }

      showSuccess('Order placed successfully!');
      localStorage.removeItem('aslam_tailor_cart'); // Clear cart after successful order
      setCartItems([]);
      setAddress({
        fullName: '', phone: '', streetAddress: '', city: '', state: '', pincode: '', postOffice: '', landmark: '',
      });
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
    if (!validateAddress()) {
      return;
    }

    const totalAmount = calculateTotalAmount();
    const deepLink = `${appSettings.phonepe_deep_link}${totalAmount}`;
    window.location.href = deepLink;
    // Note: For PhonePe, we assume the user completes payment and then returns.
    // A more robust solution would involve server-side callbacks.
    showSuccess('Redirecting to PhonePe. Please complete your payment.');
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-foreground text-center">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-lg shadow-sm">
            <p className="text-lg text-muted-foreground mb-4">Your cart is empty.</p>
            <Link to="/" className="text-primary hover:underline">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items */}
              <Card className="p-4 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">Items in Cart</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}`} className="flex items-center p-2 border rounded-md">
                      <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md mr-4" />
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-foreground">{item.name}</h2>
                        <p className="text-muted-foreground text-sm">
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                        </p>
                        <p className="text-primary font-bold mt-1">₹{item.price.toLocaleString()}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item)}
                            className="text-destructive hover:text-destructive/90 ml-auto"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Address Form */}
              <Card className="p-4 shadow-sm">
                <CardContent>
                  <AddressForm address={address} onAddressChange={handleAddressChange} />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="p-4 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">Payment Method</CardTitle>
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
                    disabled={loadingCheckout || cartItems.length === 0}
                  >
                    {loadingCheckout ? 'Placing Order...' : 'Proceed to Checkout'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
      <BottomNavigation />

      {/* Order Success Dialog */}
      <Dialog open={showOrderSuccessDialog} onOpenChange={setShowOrderSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600 text-2xl font-bold">Order Placed Successfully!</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
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

export default Cart;