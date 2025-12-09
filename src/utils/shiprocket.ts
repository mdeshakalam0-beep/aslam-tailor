import axios from 'axios';
import { showError, showSuccess } from '@/utils/toast';
import { CheckoutAddress, CheckoutItem, UserMeasurements } from '@/types/checkout';

// Replace with your backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'; 

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string; // YYYY-MM-DD HH:MM
  customer_email: string;
  address_details: CheckoutAddress;
  items: Array<{
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    quantity: number;
    selectedSize?: string;
  }>;
  total_amount: number;
  payment_method: string; // 'cod' or 'prepaid'
  user_measurements?: UserMeasurements | null;
}

export interface ShiprocketOrderResponse {
  message: string;
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  awb_code: string;
  courier_company_id: number;
  courier_name: string;
  is_recommendation: boolean;
  // Add other fields as per Shiprocket's response
}

export interface CourierServiceabilityPayload {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number; // in kg
  cod_amount: number; // COD amount if applicable
  order_amount: number; // Total order amount
  dimensions?: {
    length: number;
    breadth: number;
    height: number;
  };
}

export interface CourierServiceabilityResponse {
  status: number;
  message: string;
  data: {
    available_courier_companies: Array<{
      courier_company_id: string;
      courier_name: string;
      // ... other courier details
    }>;
    // ... other serviceability data
  };
}

/**
 * Sends customer checkout order to the backend to create a Shiprocket order.
 * @param payload The order data to send to Shiprocket.
 * @returns Shiprocket's order creation response.
 */
export const createShiprocketOrder = async (payload: ShiprocketOrderPayload): Promise<ShiprocketOrderResponse | null> => {
  try {
    const response = await api.post('/create-order', payload);
    showSuccess('Shiprocket order created successfully!');
    return response.data as ShiprocketOrderResponse;
  } catch (error) {
    console.error('Error creating Shiprocket order:', error);
    showError('Failed to create Shiprocket order. Please try again.');
    return null;
  }
};

/**
 * Checks available courier services via the backend.
 * @param payload The shipment details for serviceability check.
 * @returns Available courier services.
 */
export const checkCourierServices = async (payload: CourierServiceabilityPayload): Promise<CourierServiceabilityResponse | null> => {
  try {
    const response = await api.post('/check-courier', payload);
    showSuccess('Courier serviceability checked!');
    return response.data as CourierServiceabilityResponse;
  } catch (error) {
    console.error('Error checking courier serviceability:', error);
    showError('Failed to check courier serviceability. Please try again.');
    return null;
  }
};