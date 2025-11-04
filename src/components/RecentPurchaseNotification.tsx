import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const customerNames = [
  'Ravi Kumar', 'Priya Sharma', 'Amit Singh', 'Neha Gupta', 'Sanjay Patel',
  'Anjali Devi', 'Vikram Yadav', 'Pooja Kumari', 'Rahul Verma', 'Meena Rani',
  'Deepak Joshi', 'Kavita Singh', 'Gaurav Mishra', 'Swati Agarwal', 'Rajesh Kumar',
];

const productNames = [
  'Stylish Cotton Shirt', 'Elegant Silk Saree', 'Men\'s Formal Suit', 'Designer Kurti',
  'Casual Denim Jeans', 'Traditional Lehenga', 'Kids\' Party Wear', 'Winter Jacket',
  'Custom Tailored Blouse', 'Hand-embroidered Dupatta', 'Classic Trousers', 'Ethnic Sherwani',
];

const timeAgoOptions = [
  'just now', '1 minute ago', '2 minutes ago', '3 minutes ago', '5 minutes ago',
  '7 minutes ago', '10 minutes ago', '12 minutes ago', '15 minutes ago',
];

const RecentPurchaseNotification: React.FC = () => {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const showFakeNotification = () => {
      const randomCustomer = customerNames[Math.floor(Math.random() * customerNames.length)];
      const randomProduct = productNames[Math.floor(Math.random() * productNames.length)];
      const randomTimeAgo = timeAgoOptions[Math.floor(Math.random() * timeAgoOptions.length)];

      toast.success(
        `${randomCustomer} just bought a ${randomProduct} (${randomTimeAgo})`,
        {
          duration: 5000, // Notification stays for 5 seconds
          position: 'bottom-left', // Position at bottom-left
        }
      );
    };

    // Show a notification with a randomized interval between 5 seconds and 5 minutes
    const minInterval = 5000;   // 5 seconds
    const maxInterval = 300000; // 5 minutes (300 * 1000 ms)

    const startInterval = () => {
      const randomInterval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
      intervalRef.current = window.setTimeout(() => {
        showFakeNotification();
        startInterval(); // Schedule the next notification
      }, randomInterval);
    };

    startInterval(); // Start the first notification cycle

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  return null; // This component doesn't render anything visible itself
};

export default RecentPurchaseNotification;