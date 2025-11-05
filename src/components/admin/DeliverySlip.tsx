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
  delivery_date?: string; // Added delivery_date
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
  cancellation_deadline?: string; // New: Cancellation deadline
  return_deadline?: string; // New: Return deadline
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

  const hasMeasurements = order.user_measurements && (
    (order.user_measurements.measurement_type === 'men' && Object.values(order.user_measurements).some(val => (typeof val === 'number' && val !== null && val !== undefined))) ||
    (order.user_measurements.measurement_type === 'women' && order.user_measurements.ladies_size)
  );

  const menMeasurements = order.user_measurements?.measurement_type === 'men' ? [
    { label: 'Shirt Length', value: order.user_measurements.men_shirt_length },
    { label: 'Shirt Chest', value: order.user_measurements.men_shirt_chest },
    { label: 'Shirt Waist', value: order.user_measurements.men_shirt_waist },
    { label: 'Sleeve Length', value: order.user_measurements.men_shirt_sleeve_length },
    { label: 'Shoulder', value: order.user_measurements.men_shirt_shoulder },
    { label: 'Neck', value: order.user_measurements.men_shirt_neck },
    { label: 'Pant Length', value: order.user_measurements.men_pant_length },
    { label: 'Pant Waist', value: order.user_measurements.men_pant_waist },
    { label: 'Pant Hip', value: order.user_measurements.men_pant_hip },
    { label: 'Pant Thigh', value: order.user_measurements.men_pant_thigh },
    { label: 'Pant Bottom', value: order.user_measurements.men_pant_bottom },
    { label: 'Coat Length', value: order.user_measurements.men_coat_length },
    { label: 'Coat Chest', value: order.user_measurements.men_coat_chest },
    { label: 'Coat Waist', value: order.user_measurements.men_coat_waist },
    { label: 'Coat Sleeve Length', value: order.user_measurements.men_coat_sleeve_length },
    { label: 'Coat Shoulder', value: order.user_measurements.men_coat_shoulder },
  ].filter(m => m.value !== null && m.value !== undefined) : [];

  return (
    <div className="p-6 bg-white text-gray-900 min-h-screen print:p-0 print:text-black print:bg-white print:min-h-0">
      <div className="max-w-3xl mx-auto border border-gray-300 p-8 print:border-0 print:p-0 print:max-w-full">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6 print:border-b-2 print:border-black print:pb-2 print:mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl print:bg-black print:text-white">
              A
            </div>
            <h1 className="text-3xl font-bold print:text-2xl">ASLAM TAILOR</h1>
          </div>
          <h2 className="text-2xl font-semibold print:text-xl">DELIVERY SLIP</h2>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 print:mb-4 print:gap-2">
          <div>
            <p className="text-sm font-semibold print:text-xs">Order ID:</p>
            <p className="text-lg font-bold print:text-base">#{order.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold print:text-xs">Order Date:</p>
            <p className="text-lg font-bold print:text-base">{format(new Date(order.order_date), 'dd MMM yyyy')}</p>
          </div>
          {order.delivery_date && (
            <div className="col-span-2 text-center mt-2">
              <p className="text-base font-semibold text-green-700 print:text-sm">Estimated Delivery Date:</p>
              <p className="text-xl font-bold text-green-700 print:text-lg">{format(new Date(order.delivery_date), 'dd MMM yyyy')}</p>
            </div>
          )}
          {order.cancellation_deadline && (
            <div className="col-span-2 text-center mt-2">
              <p className="text-base font-semibold text-blue-700 print:text-sm">Cancellation Deadline:</p>
              <p className="text-xl font-bold text-blue-700 print:text-lg">{format(new Date(order.cancellation_deadline), 'dd MMM yyyy')}</p>
            </div>
          )}
          {order.return_deadline && (
            <div className="col-span-2 text-center mt-2">
              <p className="text-base font-semibold text-purple-700 print:text-sm">Return Deadline:</p>
              <p className="text-xl font-bold text-purple-700 print:text-lg">{format(new Date(order.return_deadline), 'dd MMM yyyy')}</p>
            </div>
          )}
        </div>

        {/* Customer & Shipping Address */}
        <div className="mb-6 border p-4 rounded-md bg-gray-50 print:border-2 print:border-black print:bg-white print:p-2 print:mb-4 print:break-inside-avoid">
          <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">Shipping Address:</h3>
          {order.address_details ? (
            <>
              <p className="font-semibold print:text-sm">{order.address_details.fullName}</p>
              <p className="print:text-sm">{order.address_details.streetAddress}</p>
              {order.address_details.landmark && <p className="print:text-sm">Landmark: {order.address_details.landmark}</p>}
              {order.address_details.postOffice && <p className="print:text-sm">Post Office: {order.address_details.postOffice}</p>}
              <p className="print:text-sm">{order.address_details.city}, {order.address_details.state} - {order.address_details.pincode}</p>
              <p className="print:text-sm">Phone: {order.address_details.phone}</p>
            </>
          ) : (
            <p className="print:text-sm">Address details not available.</p>
          )}
        </div>

        {/* Customer Measurements */}
        {hasMeasurements && (
          <div className="mb-6 border p-4 rounded-md bg-gray-50 print:border-2 print:border-black print:bg-white print:p-2 print:mb-4 print:break-inside-avoid">
            <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">Customer Measurements:</h3>
            {order.user_measurements?.measurement_type === 'women' && order.user_measurements.ladies_size && (
              <p className="text-sm text-gray-700 print:text-xs"><span className="font-semibold">Ladies' Size:</span> {order.user_measurements.ladies_size}</p>
            )}
            {order.user_measurements?.measurement_type === 'men' && menMeasurements.length > 0 && (
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 print:text-xs print:gap-x-4">
                {menMeasurements.map((m, idx) => (
                  <div key={idx}><span className="font-semibold">{m.label}:</span> {m.value} inches</div>
                ))}
              </div>
            )}
          </div>
        )}

        {order.user_measurements?.notes && (
          <div className="mb-6 border p-4 rounded-md bg-gray-50 print:border-2 print:border-black print:bg-white print:p-2 print:mb-4 print:break-inside-avoid">
            <h3 className="text-lg font-bold mb-2 print:text-base print:mb-1">Additional Notes:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap print:text-xs">{order.user_measurements.notes}</p>
          </div>
        )}

        {/* Ordered Items */}
        <div className="mb-6 print:mb-4 print:break-inside-avoid">
          <h3 className="text-lg font-bold mb-3 border-b pb-2 print:border-b-2 print:border-black print:text-base print:mb-2 print:pb-1">Ordered Items:</h3>
          <div className="space-y-4 print:space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 border-b last:border-b-0 pb-3 last:pb-0 print:border-b-2 print:border-black print:pb-1 print:last:pb-0 print:space-x-2">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md border border-gray-200 print:w-12 print:h-12 print:border-black" />
                <div className="flex-1">
                  <p className="font-semibold print:text-sm">{item.name}</p>
                  <p className="text-sm text-gray-600 print:text-xs">Qty: {item.quantity} {item.selectedSize && `(Size: ${item.selectedSize})`}</p>
                  <p className="text-sm font-medium print:text-xs">₹{item.price.toLocaleString()} each</p>
                </div>
                <p className="font-bold print:text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="border-t pt-4 mt-6 space-y-2 print:border-t-2 print:border-black print:pt-2 print:mt-4 print:space-y-1 print:break-inside-avoid">
          <div className="flex justify-between print:text-sm">
            <span className="font-semibold">Subtotal:</span>
            <span>₹{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between print:text-sm">
            <span className="font-semibold">Shipping:</span>
            <span>Free</span>
          </div>
          {order.donation_amount && order.donation_amount > 0 && (
            <div className="flex justify-between print:text-sm">
              <span className="font-semibold">Donation:</span>
              <span>₹{order.donation_amount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2 print:border-t-2 print:border-black print:text-lg print:pt-1 print:mt-1">
            <span>Total Amount:</span>
            <span>₹{order.total_amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mt-6 border-t pt-4 print:border-t-2 print:border-black print:mt-4 print:pt-2 print:break-inside-avoid">
          <p className="font-semibold print:text-sm">Payment Method:</p>
          <p className="text-lg font-bold print:text-base">{formatPaymentMethod(order.payment_method)}</p>
          {order.payment_method === 'qr_code' && order.transaction_id && (
            <p className="text-sm text-gray-600 print:text-xs">Transaction ID: {order.transaction_id}</p>
          )}
        </div>

        {/* Footer / Signature */}
        <div className="mt-10 text-center text-sm text-gray-600 print:mt-8 print:text-xs print:break-inside-avoid">
          <p>Thank you for your order!</p>
          <p className="mt-4 print:mt-2">_________________________</p>
          <p>Recipient's Signature</p>
        </div>
      </div>
    </div>
  );
};

export default DeliverySlip;