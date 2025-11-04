import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { UserMeasurements } from '@/types/checkout';

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
  user_measurements?: UserMeasurements;
}

interface OrderDetailsDialogUserProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsDialogUser: React.FC<OrderDetailsDialogUserProps> = ({ order, isOpen, onClose }) => {
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'shipped': return 'outline';
      case 'cancelled': return 'destructive';
      case 'processing': return 'accent';
      default: return 'secondary';
    }
  };

  if (!order) return null;

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

  const dialogTitleId = `order-details-title-${order.id}`;
  const dialogDescriptionId = `order-details-description-${order.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" 
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
      >
        <DialogHeader>
          <DialogTitle id={dialogTitleId}>Order Details - #{order.id.substring(0, 8)}</DialogTitle>
          <DialogDescription id={dialogDescriptionId}>
            आपके ऑर्डर का विस्तृत विवरण।
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Order Date:</Label>
            <span className="col-span-3 break-words">{format(new Date(order.order_date), 'PPP')}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Total Amount:</Label>
            <span className="col-span-3 font-bold text-lg break-words">₹{order.total_amount.toLocaleString()}</span>
          </div>
          {order.donation_amount && order.donation_amount > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-semibold">Donation:</Label>
              <span className="col-span-3 break-words">₹{order.donation_amount.toLocaleString()}</span>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Status:</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </div>

          {order.address_details && (
            <div className="col-span-4 border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
              <p className="text-sm text-muted-foreground break-words">{order.address_details.fullName}, {order.address_details.phone}</p>
              <p className="text-sm text-muted-foreground break-words">{order.address_details.streetAddress}, {order.address_details.landmark && `${order.address_details.landmark}, `}{order.address_details.postOffice && `${order.address_details.postOffice}, `}{order.address_details.city}, {order.address_details.state} - {order.address_details.pincode}</p>
            </div>
          )}

          {order.payment_method && (
            <div className="col-span-4 border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
              <p className="text-sm text-muted-foreground break-words">Method: {formatPaymentMethod(order.payment_method)}</p>
              {order.transaction_id && (
                <p className="text-sm text-muted-foreground break-words">Transaction ID: {order.transaction_id}</p>
              )}
            </div>
          )}

          {hasMeasurements && (
            <div className="col-span-4 border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Customer Measurements</h3>
              {order.user_measurements?.measurement_type === 'women' && order.user_measurements.ladies_size && (
                <p className="text-sm text-muted-foreground break-words"><span className="font-medium">Ladies' Size:</span> {order.user_measurements.ladies_size}</p>
              )}
              {order.user_measurements?.measurement_type === 'men' && menMeasurements.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {menMeasurements.map((m, idx) => (
                    <div key={idx} className="break-words"><span className="font-medium">{m.label}:</span> {m.value} inches</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {order.user_measurements?.notes && (
            <div className="col-span-4 border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{order.user_measurements.notes}</p>
            </div>
          )}

          <div className="col-span-4 border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Ordered Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground break-words">{item.name}</p>
                    <p className="text-sm text-muted-foreground break-words">
                      Quantity: {item.quantity} {item.selectedSize && `(Size: ${item.selectedSize})`}
                    </p>
                    <p className="text-sm text-muted-foreground break-words">Price: ₹{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialogUser;