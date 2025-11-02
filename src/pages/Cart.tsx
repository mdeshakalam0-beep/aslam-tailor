import React from 'react';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4 text-foreground">आपकी कार्ट</h1>
      <p className="text-lg text-muted-foreground mb-6 text-center">
        आपकी कार्ट में कोई आइटम नहीं है।
      </p>
      <Link to="/" className="text-primary hover:underline">
        खरीदारी जारी रखें
      </Link>
    </div>
  );
};

export default Cart;