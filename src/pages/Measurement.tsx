import React from 'react';
import { Link } from 'react-router-dom';

const Measurement: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4 text-foreground">Measurement Details</h1>
      <p className="text-lg text-muted-foreground mb-6 text-center">
        Here you can save and manage your measurements.
      </p>
      <Link to="/" className="text-primary hover:underline">
        Return to Home
      </Link>
    </div>
  );
};

export default Measurement;