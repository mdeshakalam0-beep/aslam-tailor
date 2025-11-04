import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export interface AppPopup {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Uploads an app popup image to Supabase Storage
export const uploadAppPopupImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `popup_${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `public/${fileName}`; // Store in a 'public' subfolder within the bucket

    const { error: uploadError } = await supabase.storage
      .from('app-popup-images') // Use a dedicated bucket for app pop-up images
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('app-popup-images').getPublicUrl(filePath);
    showSuccess('Pop-up image uploaded successfully!');
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading pop-up image:', error);
    showError('Failed to upload pop-up image.');
    return null;
  }
};

// Fetch all app pop-ups (admin only, or active for public)
export const getAppPopups = async (isAdmin: boolean = false): Promise<AppPopup[]> => {
  try {
    let query = supabase
      .from('app_popups')
      .select('*')
      .order('order', { ascending: true });

    if (!isAdmin) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }
    return data as AppPopup[];
  } catch (error) {
    console.error('Error fetching app pop-ups:', error);
    showError('Failed to load app pop-ups.');
    return [];
  }
};

// Create a new app pop-up
export const createAppPopup = async (popupData: Omit<AppPopup, 'id' | 'created_at' | 'updated_at'>): Promise<AppPopup | null> => {
  try {
    const { data, error } = await supabase
      .from('app_popups')
      .insert(popupData)
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('App pop-up created successfully!');
    return data as AppPopup;
  } catch (error) {
    console.error('Error creating app pop-up:', error);
    showError('Failed to create app pop-up.');
    return null;
  }
};

// Update an existing app pop-up
export const updateAppPopup = async (id: string, popupData: Partial<Omit<AppPopup, 'id' | 'created_at'>>): Promise<AppPopup | null> => {
  try {
    const { data, error } = await supabase
      .from('app_popups')
      .update({ ...popupData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('App pop-up updated successfully!');
    return data as AppPopup;
  } catch (error) {
    console.error('Error updating app pop-up:', error);
    showError('Failed to update app pop-up.');
    return null;
  }
};

// Delete an app pop-up
export const deleteAppPopup = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('app_popups')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    showSuccess('App pop-up deleted successfully!');
    return true;
  } catch (error) {
    console.error('Error deleting app pop-up:', error);
    showError('Failed to delete app pop-up.');
    return false;
  }
};