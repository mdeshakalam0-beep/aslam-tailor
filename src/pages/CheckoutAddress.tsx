import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AddressForm from '@/components/AddressForm';
import { showError } from '@/utils/toast';
import { CheckoutAddress, CheckoutItem } from '@/types/checkout';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';

const CheckoutAddress: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [address, setAddress] = useState<CheckoutAddress>({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    postOffice: '',
    landmark: '',
  });
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('checkout_cart_items');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    } else {
      showError('No items in cart to checkout. Please add items to cart first.');
      navigate('/cart');
    }

    const fetchAndSetAddress = async () => {
      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone, street_address, city, state, pincode, post_office, landmark')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile address:', profileError);
          showError('Failed to load saved address.');
        }

        if (profileData) {
          setAddress({
            fullName: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
            phone: profileData.phone || '',
            streetAddress: profileData.street_address || '',
            city: profileData.city || '',
            state: profileData.state || '',
            pincode: profileData.pincode || '',
            postOffice: profileData.post_office || '',
            landmark: profileData.landmark || '',
          });
        }
      } else {
        const storedAddress = localStorage.getItem('checkout_address_details');
        if (storedAddress) {
          setAddress(JSON.parse(storedAddress));
        }
      }
    };

    fetchAndSetAddress();
  }, [navigate, session]);

  const handleAddressChange = (field: string, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateAddress = () => {
    const requiredFields: Array<keyof CheckoutAddress> = ['fullName', 'phone', 'streetAddress', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!address[field]) {
        showError(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} in the address details.`);
        return false;
      }
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateAddress()) {
      return;
    }
    localStorage.setItem('checkout_address_details', JSON.stringify(address));
    navigate('/checkout/payment');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-off-white-page-bg pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/cart">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-text-primary-heading ml-2">Shipping Address</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4 shadow-elev border border-card-border">
              <CardContent>
                <AddressForm address={address} onAddressChange={handleAddressChange} />
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
                <div className="flex justify-between font-bold text-lg text-text-primary-heading border-t border-card-border pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{calculateSubtotal().toLocaleString()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-accent-rose text-white hover:bg-accent-dark rounded-small"
                  onClick={handleContinueToPayment}
                  disabled={cartItems.length === 0}
                >
                  Continue to Payment
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default CheckoutAddress;