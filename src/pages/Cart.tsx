import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';
import { CartItem, getCartItems, updateCartItemQuantity, removeCartItem } from '@/utils/cart';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';

const Cart: React.FC = () => {
  const { session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    setCartItems(getCartItems());
  }, []);

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

  const handleCheckout = async () => {
    if (!session?.user) {
      showError('Please log in to place an order.');
      return;
    }
    if (cartItems.length === 0) {
      showError('Your cart is empty.');
      return;
    }

    setLoadingCheckout(true);
    try {
      const totalAmount = calculateSubtotal();
      const orderItems = cartItems.map(item => ({
        product_id: item.id, // Assuming product.id is sufficient
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
      });

      if (error) {
        throw error;
      }

      showSuccess('Order placed successfully!');
      localStorage.removeItem('aslam_tailor_cart'); // Clear cart after successful order
      setCartItems([]);
    } catch (err) {
      console.error('Error placing order:', err);
      showError('Failed to place order. Please try again.');
    } finally {
      setLoadingCheckout(false);
    }
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
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={`${item.id}-${item.selectedSize}`} className="flex items-center p-4 shadow-sm">
                  <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md mr-4" />
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
                </Card>
              ))}
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
                  <div className="flex justify-between font-bold text-lg text-foreground border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{calculateSubtotal().toLocaleString()}</span>
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
    </div>
  );
};

export default Cart;