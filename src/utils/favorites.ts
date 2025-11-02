import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export const isProductFavorited = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      throw error;
    }
    return !!data;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

export const addFavorite = async (userId: string, productId: string) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, product_id: productId });

    if (error) {
      throw error;
    }
    showSuccess('Added to favorites!');
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    showError('Failed to add to favorites.');
    return false;
  }
};

export const removeFavorite = async (userId: string, productId: string) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      throw error;
    }
    showSuccess('Removed from favorites!');
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    showError('Failed to remove from favorites.');
    return false;
  }
};

export const getFavorites = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
    return data.map(item => item.product_id);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    showError('Failed to load favorites.');
    return [];
  }
};