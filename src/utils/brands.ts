import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export interface Brand {
  id: string;
  name: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

// Fetch all brands
export const getBrands = async (): Promise<Brand[]> => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      throw error;
    }
    return data as Brand[];
  } catch (error) {
    console.error('Error fetching brands:', error);
    showError('Failed to load brands.');
    return [];
  }
};

// Create a new brand
export const createBrand = async (brandData: Omit<Brand, 'id' | 'created_at' | 'updated_at'>): Promise<Brand | null> => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .insert(brandData)
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('Brand created successfully!');
    return data as Brand;
  } catch (error) {
    console.error('Error creating brand:', error);
    showError('Failed to create brand.');
    return null;
  }
};

// Update an existing brand
export const updateBrand = async (id: string, brandData: Partial<Omit<Brand, 'id' | 'created_at'>>): Promise<Brand | null> => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .update({ ...brandData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('Brand updated successfully!');
    return data as Brand;
  } catch (error) {
    console.error('Error updating brand:', error);
    showError('Failed to update brand.');
    return null;
  }
};

// Delete a brand
export const deleteBrand = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    showSuccess('Brand deleted successfully!');
    return true;
  } catch (error) {
    console.error('Error deleting brand:', error);
    showError('Failed to delete brand.');
    return false;
  }
};