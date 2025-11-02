import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';
import { CartItem, getCartItems, updateCartItemQuantity, removeCartItem } from '@/utils/cart';
import { showError } from '@/utils/toast';
import { CheckoutItem } from '@/types/checkout'; // Import CheckoutItem type

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

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

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      showError('Your cart is empty. Please add items before proceeding to checkout.');
      return;
    }
    // Save cart items to local storage for the checkout flow
    localStorage.setItem('checkout_cart_items', JSON.stringify(cartItems));
    navigate('/checkout/address');
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
                    onClick={handleProceedToCheckout}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
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