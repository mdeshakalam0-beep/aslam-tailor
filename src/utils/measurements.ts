import { supabase } from '@/integrations/supabase/client';

export interface MeasurementType {
  id: string;
  name: string;
  description: string | null;
  relevant_fields: string[]; // Assuming this is a JSONB array of field names
}

export interface Measurement {
  id: string;
  user_id: string;
  updated_at: string;
  measurement_type: string | null;
  notes: string | null;
  men_shirt_length: number | null;
  men_shirt_chest: number | null;
  men_shirt_waist: number | null;
  men_shirt_sleeve_length: number | null;
  men_shirt_shoulder: number | null;
  men_shirt_neck: number | null;
  men_pant_length: number | null;
  men_pant_waist: number | null;
  men_pant_hip: number | null;
  men_pant_thigh: number | null;
  men_pant_bottom: number | null;
  men_coat_length: number | null;
  men_coat_chest: number | null;
  men_coat_waist: number | null;
  men_coat_sleeve_length: number | null;
  men_coat_shoulder: number | null;
  ladies_size: string | null;
}

export const getMeasurementTypes = async (): Promise<MeasurementType[]> => {
  const { data, error } = await supabase
    .from('measurement_types')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching measurement types:', error);
    return [];
  }
  return data;
};

export const getMeasurementsByUserId = async (userId: string): Promise<Measurement[]> => {
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching measurements:', error);
    return [];
  }
  return data;
};

export const getMeasurementById = async (id: string): Promise<Measurement | null> => {
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching measurement:', error);
    return null;
  }
  return data;
};

export const upsertMeasurement = async (measurement: Partial<Measurement>): Promise<Measurement | null> => {
  const { data, error } = await supabase
    .from('measurements')
    .upsert(measurement)
    .select()
    .single();

  if (error) {
    console.error('Error upserting measurement:', error);
    throw error;
  }
  return data;
};

export const deleteMeasurement = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('measurements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting measurement:', error);
    return false;
  }
  return true;
};