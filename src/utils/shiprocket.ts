// src/utils/shiprocket.ts
export interface AddressDetails {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  postOffice?: string;
  landmark?: string;
}

export interface CheckoutItemSimple {
  id: string;
  name: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  selectedSize?: string;
}

export interface ShiprocketOrderPayload {
  order_id: string | number;
  order_date: string; // "YYYY-MM-DD HH:MM"
  customer_email: string;
  address_details: AddressDetails;
  items: CheckoutItemSimple[];
  total_amount: number;
  payment_method: string;
  user_measurements?: any;
}

export interface ShiprocketOrderResponse {
  message?: string;
  order_id?: number | string;
  shipment_id?: number | string;
  status?: string;
  status_code?: number;
  awb_code?: string;
  courier_name?: string;
  [k: string]: any;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export async function createShiprocketOrder(payload: ShiprocketOrderPayload): Promise<ShiprocketOrderResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Shiprocket create-order failed: ${res.status}`);
    }

    const data = await res.json();
    return data as ShiprocketOrderResponse;
  } catch (error) {
    console.error('createShiprocketOrder error:', error);
    throw error;
  }
}

export async function loginShiprocket(): Promise<any> {
  try {
    const res = await fetch(`${BACKEND_URL}/login-shiprocket`, {
      method: 'POST'
    });
    return res.ok ? await res.json() : null;
  } catch (err) {
    console.error('loginShiprocket error:', err);
    return null;
  }
}

export async function checkCourierService(body: {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod_amount: number;
  order_amount: number;
  dimensions?: { length: number; breadth: number; height: number; };
}) {
  try {
    const res = await fetch(`${BACKEND_URL}/check-courier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message || `Serviceability check failed: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('checkCourierService error:', err);
    throw err;
  }
}