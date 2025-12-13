import { showSuccess, showError } from '@/utils/toast';

export interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  withStitching?: boolean; // New: Added stitching flag
}

const CART_STORAGE_KEY = 'aslam_tailor_cart';

// Custom event for cart updates
const dispatchCartUpdate = () => {
  window.dispatchEvent(new CustomEvent('cart-updated'));
};

export const getCartItems = (): CartItem[] => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error('Failed to parse cart from local storage:', error);
    return [];
  }
};

export const saveCartItems = (cartItems: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    dispatchCartUpdate(); // Dispatch event on update
  } catch (error) {
    console.error('Failed to save cart to local storage:', error);
  }
};

export const addToCart = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
  const cartItems = getCartItems();
  
  // Update logic: Check ID, Size, AND Stitching status
  const existingItemIndex = cartItems.findIndex(
    (item) => 
      item.id === product.id && 
      item.selectedSize === product.selectedSize &&
      (item.withStitching || false) === (product.withStitching || false)
  );

  if (existingItemIndex > -1) {
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    cartItems.push({ ...product, quantity });
  }
  saveCartItems(cartItems);
  
  // Custom message based on stitching choice
  const message = product.withStitching 
    ? `${product.name} (with Stitching) added to cart!` 
    : `${product.name} added to cart!`;
    
  showSuccess(message);
};

// Update logic: Added withStitching parameter to identify correct item
export const updateCartItemQuantity = (
  itemId: string, 
  selectedSize: string | undefined, 
  withStitching: boolean | undefined, 
  quantity: number
) => {
  let cartItems = getCartItems();
  
  const itemIndex = cartItems.findIndex(
    (item) => 
      item.id === itemId && 
      item.selectedSize === selectedSize &&
      (item.withStitching || false) === (withStitching || false)
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      cartItems.splice(itemIndex, 1); // Remove item if quantity is 0 or less
      showSuccess('Item removed from cart.');
    } else {
      cartItems[itemIndex].quantity = quantity;
      showSuccess('Cart updated.');
    }
  }
  saveCartItems(cartItems);
  return cartItems;
};

// Update logic: Added withStitching parameter to identify correct item
export const removeCartItem = (
  itemId: string, 
  selectedSize: string | undefined,
  withStitching: boolean | undefined
) => {
  let cartItems = getCartItems();
  
  cartItems = cartItems.filter(
    (item) => !(
      item.id === itemId && 
      item.selectedSize === selectedSize &&
      (item.withStitching || false) === (withStitching || false)
    )
  );
  
  saveCartItems(cartItems);
  showSuccess('Item removed from cart.');
  return cartItems;
};

export const clearCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
  dispatchCartUpdate(); // Dispatch event on update
  showSuccess('Cart cleared.');
};

export const getCartTotalItemsCount = (): number => {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};