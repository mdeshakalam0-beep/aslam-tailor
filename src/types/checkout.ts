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
  id?: string; // Added for potential updates
  user_id?: string; // Added for potential updates
  measurement_type?: 'men' | 'women' | null;
  notes?: string | null;
  ladies_size?: string | null;

  // Men's Shirt/Kurta/Bandi Measurements
  men_shirt_length?: number | null;
  men_shirt_chest?: number | null;
  men_shirt_waist?: number | null;
  men_shirt_sleeve_length?: number | null;
  men_shirt_shoulder?: number | null;
  men_shirt_neck?: number | null;

  // Men's Pant/Paijama Measurements
  men_pant_length?: number | null;
  men_pant_waist?: number | null;
  men_pant_hip?: number | null;
  men_pant_thigh?: number | null;
  men_pant_bottom?: number | null;

  // Men's Coat/Washcoat/Bajezar Measurements
  men_coat_length?: number | null;
  men_coat_chest?: number | null;
  men_coat_waist?: number | null;
  men_coat_sleeve_length?: number | null;
  men_coat_shoulder?: number | null;
}