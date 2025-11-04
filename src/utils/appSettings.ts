import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

export interface AppSetting {
  key: string;
  value: string | null;
}

// Fetch all app settings
export const getAppSettings = async (): Promise<AppSetting[]> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value');

    if (error) {
      throw error;
    }
    return data as AppSetting[];
  } catch (error) {
    console.error('Error fetching app settings:', error);
    showError('Failed to load app settings.');
    return [];
  }
};

// Update or insert an app setting
export const upsertAppSetting = async (key: string, value: string | null): Promise<AppSetting | null> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .upsert({ key, value }, { onConflict: 'key' })
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data as AppSetting;
  } catch (error) {
    console.error(`Error upserting app setting for key "${key}":`, error);
    showError(`Failed to save setting for ${key}.`);
    return null;
  }
};

// Uploads an image to the 'app-settings' bucket
export const uploadAppSettingImage = async (file: File, folder: string = 'public'): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('app-settings')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('app-settings').getPublicUrl(filePath);
    showSuccess('Image uploaded successfully!');
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    showError('Failed to upload image.');
    return null;
  }
};

// Deletes an image from the 'app-settings' bucket
export const deleteAppSettingImage = async (imageUrl: string): Promise<boolean> => {
  try {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2]; // Assuming 'public' folder

    if (!fileName || !folder) {
      console.warn('Invalid image URL for deletion:', imageUrl);
      return false;
    }

    const { error } = await supabase.storage.from('app-settings').remove([`${folder}/${fileName}`]);

    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};