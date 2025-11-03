export interface CheckoutAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  postOffice?: string;
  landmark?: string;
}

export interface CheckoutItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  selectedSize?: string;
}

export interface UserMeasurements {
  chest?: number | null;
  waist?: number | null;
  sleeve_length?: number | null;
  shoulder?: number | null;
  neck?: number | null;
}