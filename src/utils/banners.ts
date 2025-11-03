import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export interface HeroBanner {
  id: string;
  image_url: string;
  headline: string;
  cta_text: string;
  cta_link: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

// Fetch all hero banners
export const getHeroBanners = async (): Promise<HeroBanner[]> => {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      throw error;
    }
    return data as HeroBanner[];
  } catch (error) {
    console.error('Error fetching hero banners:', error);
    showError('Failed to load hero banners.');
    return [];
  }
};

// Create a new hero banner
export const createHeroBanner = async (bannerData: Omit<HeroBanner, 'id' | 'created_at' | 'updated_at'>): Promise<HeroBanner | null> => {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .insert(bannerData)
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('Hero banner created successfully!');
    return data as HeroBanner;
  } catch (error) {
    console.error('Error creating hero banner:', error);
    showError('Failed to create hero banner.');
    return null;
  }
};

// Update an existing hero banner
export const updateHeroBanner = async (id: string, bannerData: Partial<Omit<HeroBanner, 'id' | 'created_at'>>): Promise<HeroBanner | null> => {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .update({ ...bannerData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('Hero banner updated successfully!');
    return data as HeroBanner;
  } catch (error) {
    console.error('Error updating hero banner:', error);
    showError('Failed to update hero banner.');
    return null;
  }
};

// Delete a hero banner
export const deleteHeroBanner = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('hero_banners')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    showSuccess('Hero banner deleted successfully!');
    return true;
  } catch (error) {
    console.error('Error deleting hero banner:', error);
    showError('Failed to delete hero banner.');
    return false;
  }
};