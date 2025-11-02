import React from 'react';
import { Link } from 'react-router-dom';

const Orders: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4 text-foreground">आपके ऑर्डर्स</h1>
      <p className="text-lg text-muted-foreground mb-6 text-center">
        यहाँ आपके सभी ऑर्डर्स की सूची होगी।
      </p>
      <Link to="/" className="text-primary hover:underline">
        होम पर वापस जाएँ
      </Link>
    </div>
  );
};

export default Orders;