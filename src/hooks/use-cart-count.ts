import React, { useState, useEffect } from 'react';
import { getCartTotalItemsCount } from '@/utils/cart';

export const useCartCount = () => {
  const [cartCount, setCartCount] = useState(0);

  const fetchCount = () => {
    const count = getCartTotalItemsCount();
    setCartCount(count);
  };

  useEffect(() => {
    fetchCount(); // Fetch count on initial load

    // Listen for custom event to re-fetch count
    window.addEventListener('cart-updated', fetchCount);
    return () => {
      window.removeEventListener('cart-updated', fetchCount);
    };
  }, []);

  return cartCount;
};