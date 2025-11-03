import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export interface Category {
  id: string;
  name: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }
    return data as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    showError('Failed to load categories.');
    return [];
  }
};

// Fetch a single category by ID
export const getCategoryById = async (id: string): Promise<Category | undefined> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }
    return data as Category;
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    showError('Failed to load category details.');
    return undefined;
  }
};

// Create a new category
export const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('Category created successfully!');
    return data as Category;
  } catch (error) {
    console.error('Error creating category:', error);
    showError('Failed to create category.');
    return null;
  }
};

// Update an existing category
export const updateCategory = async (id: string, categoryData: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...categoryData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('Category updated successfully!');
    return data as Category;
  } catch (error) {
    console.error('Error updating category:', error);
    showError('Failed to update category.');
    return null;
  }
};

// Delete a category
export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    showSuccess('Category deleted successfully!');
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    showError('Failed to delete category.');
    return false;
  }
};