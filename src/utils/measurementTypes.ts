import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export interface MeasurementType {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all measurement types
export const getMeasurementTypes = async (): Promise<MeasurementType[]> => {
  try {
    const { data, error } = await supabase
      .from('measurement_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }
    return data as MeasurementType[];
  } catch (error) {
    console.error('Error fetching measurement types:', error);
    showError('Failed to load measurement types.');
    return [];
  }
};

// Create a new measurement type
export const createMeasurementType = async (typeData: Omit<MeasurementType, 'id' | 'created_at' | 'updated_at'>): Promise<MeasurementType | null> => {
  try {
    const { data, error } = await supabase
      .from('measurement_types')
      .insert(typeData)
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('Measurement type created successfully!');
    return data as MeasurementType;
  } catch (error) {
    console.error('Error creating measurement type:', error);
    showError('Failed to create measurement type.');
    return null;
  }
};

// Update an existing measurement type
export const updateMeasurementType = async (id: string, typeData: Partial<Omit<MeasurementType, 'id' | 'created_at'>>): Promise<MeasurementType | null> => {
  try {
    const { data, error } = await supabase
      .from('measurement_types')
      .update({ ...typeData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('Measurement type updated successfully!');
    return data as MeasurementType;
  } catch (error) {
    console.error('Error updating measurement type:', error);
    showError('Failed to update measurement type.');
    return null;
  }
};

// Delete a measurement type
export const deleteMeasurementType = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('measurement_types')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    showSuccess('Measurement type deleted successfully!');
    return true;
  } catch (error) {
    console.error('Error deleting measurement type:', error);
    showError('Failed to delete measurement type.');
    return false;
  }
};