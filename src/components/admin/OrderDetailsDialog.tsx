import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

// Re-using interfaces from src/pages/Orders.tsx
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
}

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: () => void; // Callback to refresh orders list
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ order, isOpen, onClose, onOrderUpdated }) => {
  const [currentStatus, setCurrentStatus] = useState(order?.status || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
    }
  }, [order]);

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
      default: return 'secondary';
    }
  };

  const handleStatusChange = async () => {
    if (!order || currentStatus === order.status) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: currentStatus, updated_at: new Date().toISOString() })
        .eq('id', order.id);

      if (error) {
        throw error;
      }
      showSuccess('Order status updated successfully!');
      onOrderUpdated(); // Refresh the parent list
      onClose(); // Close dialog after update
    } catch (err) {
      console.error('Error updating order status:', err);
      showError('Failed to update order status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - #{order.id.substring(0, 8)}</DialogTitle>
          <DialogDescription>
            View and manage the details of this order.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Order Date:</Label>
            <span className="col-span-3">{format(new Date(order.order_date), 'PPP')}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-semibold">Total Amount:</Label>
            <span className="col-span-3 font-bold text-lg">₹{order.total_amount.toLocaleString()}</span>
          </div>
          {order.donation_amount && order.donation_amount > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-semibold">Donation:</Label>
              <span className="col-span-3">₹{order.donation_amount.toLocaleString()}</span>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right font-semibold">Status:</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Select value={currentStatus} onValueChange={setCurrentStatus} disabled={isUpdating}>
                <SelectTrigger id="status" className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant={getStatusBadgeVariant(currentStatus)}>
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </Badge>
            </div>
          </div>

          {order.address_details && (
            <div className="col-span-4 border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
              <p className="text-sm text-muted-foreground">{order.address_details.fullName}, {order.address_details.phone}</p>
              <p className="text-sm text-muted-foreground">{order.address_details.streetAddress}, {order.address_details.landmark && `${order.address_details.landmark}, `}{order.address_details.postOffice && `${order.address_details.postOffice}, `}{order.address_details.city}, {order.address_details.state} - {order.address_details.pincode}</p>
            </div>
          )}

          {order.payment_method && (
            <div className="col-span-4 border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
              <p className="text-sm text-muted-foreground">Method: {formatPaymentMethod(order.payment_method)}</p>
              {order.transaction_id && (
                <p className="text-sm text-muted-foreground">Transaction ID: {order.transaction_id}</p>
              )}
            </div>
          )}

          <div className="col-span-4 border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Ordered Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} {item.selectedSize && `(Size: ${item.selectedSize})`}
                    </p>
                    <p className="text-sm text-muted-foreground">Price: ₹{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleStatusChange} disabled={isUpdating || currentStatus === order.status}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;