import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
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
import { format, parseISO } from 'date-fns'; // Import parseISO
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2, Printer, CalendarIcon } from 'lucide-react'; // Import CalendarIcon
import DeliverySlip from './DeliverySlip';
import { UserMeasurements } from '@/types/checkout'; // Import UserMeasurements
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover
import { Calendar } from '@/components/ui/calendar'; // Import Calendar
import { cn } from '@/lib/utils'; // Import cn

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

interface OrderDetailsDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: () => void;
  customerName: string;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ order, isOpen, onClose, onOrderUpdated, customerName }) => {
  const [currentStatus, setCurrentStatus] = useState(order?.status || '');
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<Date | undefined>(
    order?.delivery_date ? parseISO(order.delivery_date) : undefined
  );
  const [selectedCancellationDeadline, setSelectedCancellationDeadline] = useState<Date | undefined>(
    order?.cancellation_deadline ? parseISO(order.cancellation_deadline) : undefined
  );
  const [selectedReturnDeadline, setSelectedReturnDeadline] = useState<Date | undefined>(
    order?.return_deadline ? parseISO(order.return_deadline) : undefined
  );
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
      setSelectedDeliveryDate(order.delivery_date ? parseISO(order.delivery_date) : undefined);
      setSelectedCancellationDeadline(order.cancellation_deadline ? parseISO(order.cancellation_deadline) : undefined);
      setSelectedReturnDeadline(order.return_deadline ? parseISO(order.return_deadline) : undefined);
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
      case 'processing': return 'accent';
      case 'returned': return 'warning'; // New status variant
      default: return 'secondary';
    }
  };

  const handleUpdateOrder = async () => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const updates: Partial<Order> = {
        status: currentStatus,
        updated_at: new Date().toISOString(),
        delivery_date: selectedDeliveryDate ? selectedDeliveryDate.toISOString() : null, // Save delivery date
        cancellation_deadline: selectedCancellationDeadline ? selectedCancellationDeadline.toISOString() : null, // Save cancellation deadline
        return_deadline: selectedReturnDeadline ? selectedReturnDeadline.toISOString() : null, // Save return deadline
      };

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', order.id);

      if (error) {
        throw error;
      }
      showSuccess('Order updated successfully!');
      onOrderUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating order:', err);
      showError('Failed to update order.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrintDeliverySlip = () => {
    if (!order) {
      showError('No order data available to print.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write('<!DOCTYPE html><html><head><title>Delivery Slip</title>');
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach(style => {
        printWindow.document.head.appendChild(style.cloneNode(true));
      });
      printWindow.document.write('</head><body><div id="print-root"></div></body></html>');
      printWindow.document.close();

      const printRoot = printWindow.document.getElementById('print-root');
      if (printRoot) {
        const root = createRoot(printRoot);
        root.render(<DeliverySlip order={order} customerName={customerName} />);
      }

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    } else {
      showError('Failed to open print window. Please allow pop-ups.');
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

  const dialogTitleId = `admin-order-details-title-${order.id}`;
  const dialogDescriptionId = `admin-order-details-description-${order.id}`;

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
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant={getStatusBadgeVariant(currentStatus)}>
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Delivery Date Picker for Admin */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deliveryDate" className="text-right font-semibold">Delivery Date:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDeliveryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDeliveryDate ? format(selectedDeliveryDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDeliveryDate}
                  onSelect={setSelectedDeliveryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Cancellation Deadline Picker for Admin */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cancellationDeadline" className="text-right font-semibold">Cancellation Deadline:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedCancellationDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedCancellationDeadline ? format(selectedCancellationDeadline, "PPP") : <span>Set deadline</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedCancellationDeadline}
                  onSelect={setSelectedCancellationDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Return Deadline Picker for Admin */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="returnDeadline" className="text-right font-semibold">Return Deadline:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedReturnDeadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedReturnDeadline ? format(selectedReturnDeadline, "PPP") : <span>Set deadline</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedReturnDeadline}
                  onSelect={setSelectedReturnDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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

          {hasMeasurements && (
            <div className="col-span-4 border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Customer Measurements</h3>
              {order.user_measurements?.measurement_type === 'women' && order.user_measurements.ladies_size && (
                <p className="text-sm text-muted-foreground"><span className="font-medium">Ladies' Size:</span> {order.user_measurements.ladies_size}</p>
              )}
              {order.user_measurements?.measurement_type === 'men' && menMeasurements.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {menMeasurements.map((m, idx) => (
                    <div key={idx}><span className="font-medium">{m.label}:</span> {m.value} inches</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {order.user_measurements?.notes && (
            <div className="col-span-4 border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.user_measurements.notes}</p>
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
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Close</Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={handlePrintDeliverySlip}
              className="w-full sm:w-auto"
              disabled={!order}
            >
              <Printer className="mr-2 h-4 w-4" /> Print Delivery Slip
            </Button>
            <Button onClick={handleUpdateOrder} disabled={isUpdating} className="w-full sm:w-auto">
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;