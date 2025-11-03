import React from 'react';
import { format } from 'date-fns';
import { UserMeasurements } from '@/types/checkout'; // Import UserMeasurements

interface OrderItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  selectedSize?: string;
}

interface AddressDetails {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  postOffice?: string;
  landmark?: string;
}

interface Order {
  id: string;
  order_date: string;
  total_amount: number;
  status: string;
  items: OrderItem[];
  address_details?: AddressDetails;
  payment_method?: string;
  transaction_id?: string;
  donation_amount?: number;
  user_id: string;
  updated_at?: string;
  user_measurements?: UserMeasurements; // Added user_measurements
}

interface DeliverySlipProps {
  order: Order;
  customerName: string;
}

const DeliverySlip: React.FC<DeliverySlipProps> = ({ order, customerName }) => {
  const formatPaymentMethod = (method?: string) => {
    switch (method) {
      case 'cod':
        return 'Cash on Delivery';
      case 'qr_code':
        return 'QR Code Payment';
      case 'phonepe':
        return 'PhonePe';
      default:
        return 'N/A';
    }
  };

  const hasMeasurements = order.user_measurements && Object.values(order.user_measurements).some(val => val !== null && val !== undefined);

  return (
    <div className="p-6 bg-white text-gray-900 min-h-screen print:p-0 print:text-black">
      <div className="max-w-3xl mx-auto border border-gray-300 p-8 print:border-0 print:p-0">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6 print:border-b-2 print:border-black">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">
              A
            </div>
            <h1 className="text-3xl font-bold">ASLAM TAILOR</h1>
          </div>
          <h2 className="text-2xl font-semibold">DELIVERY SLIP</h2>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold">Order ID:</p>
            <p className="text-lg font-bold">#{order.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">Order Date:</p>
            <p className="text-lg font-bold">{format(new Date(order.order_date), 'dd MMM yyyy')}</p>
          </div>
        </div>

        {/* Customer & Shipping Address */}
        <div className="mb-6 border p-4 rounded-md bg-gray-50 print:border-2 print:border-black print:bg-white">
          <h3 className="text-lg font-bold mb-2">Shipping Address:</h3>
          {order.address_details ? (
            <>
              <p className="font-semibold">{order.address_details.fullName}</p>
              <p>{order.address_details.streetAddress}</p>
              {order.address_details.landmark && <p>Landmark: {order.address_details.landmark}</p>}
              {order.address_details.postOffice && <p>Post Office: {order.address_details.postOffice}</p>}
              <p>{order.address_details.city}, {order.address_details.state} - {order.address_details.pincode}</p>
              <p>Phone: {order.address_details.phone}</p>
            </>
          ) : (
            <p>Address details not available.</p>
          )}
        </div>

        {/* Customer Measurements */}
        {hasMeasurements && (
          <div className="mb-6 border p-4 rounded-md bg-gray-50 print:border-2 print:border-black print:bg-white">
            <h3 className="text-lg font-bold mb-2">Customer Measurements (inches):</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              {order.user_measurements?.chest && <div><span className="font-semibold">Chest:</span> {order.user_measurements.chest}</div>}
              {order.user_measurements?.waist && <div><span className="font-semibold">Waist:</span> {order.user_measurements.waist}</div>}
              {order.user_measurements?.sleeve_length && <div><span className="font-semibold">Sleeve Length:</span> {order.user_measurements.sleeve_length}</div>}
              {order.user_measurements?.shoulder && <div><span className="font-semibold">Shoulder:</span> {order.user_measurements.shoulder}</div>}
              {order.user_measurements?.neck && <div><span className="font-semibold">Neck:</span> {order.user_measurements.neck}</div>}
            </div>
          </div>
        )}

        {/* Ordered Items */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 border-b pb-2 print:border-b-2 print:border-black">Ordered Items:</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 border-b last:border-b-0 pb-3 last:pb-0 print:border-b-2 print:border-black">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md border border-gray-200 print:border-black" />
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity} {item.selectedSize && `(Size: ${item.selectedSize})`}</p>
                  <p className="text-sm font-medium">₹{item.price.toLocaleString()} each</p>
                </div>
                <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="border-t pt-4 mt-6 space-y-2 print:border-t-2 print:border-black">
          <div className="flex justify-between">
            <span className="font-semibold">Subtotal:</span>
            <span>₹{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Shipping:</span>
            <span>Free</span>
          </div>
          {order.donation_amount && order.donation_amount > 0 && (
            <div className="flex justify-between">
              <span className="font-semibold">Donation:</span>
              <span>₹{order.donation_amount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2 print:border-t-2 print:border-black">
            <span>Total Amount:</span>
            <span>₹{order.total_amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mt-6 border-t pt-4 print:border-t-2 print:border-black">
          <p className="font-semibold">Payment Method:</p>
          <p className="text-lg font-bold">{formatPaymentMethod(order.payment_method)}</p>
          {order.payment_method === 'qr_code' && order.transaction_id && (
            <p className="text-sm text-gray-600">Transaction ID: {order.transaction_id}</p>
          )}
        </div>

        {/* Footer / Signature */}
        <div className="mt-10 text-center text-sm text-gray-600 print:mt-10">
          <p>Thank you for your order!</p>
          <p className="mt-4">_________________________</p>
          <p>Recipient's Signature</p>
        </div>
      </div>
    </div>
  );
};

export default DeliverySlip;