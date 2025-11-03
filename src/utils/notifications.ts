import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export interface Notification {
  id: string;
  user_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Fetch notifications for the current user (or general notifications)
export const getNotifications = async (userId: string | null): Promise<Notification[]> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      // Fetch notifications for the user OR general notifications
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    } else {
      // If no user (e.g., not logged in), only fetch general notifications
      query = query.is('user_id', null);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }
    return data as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    showError('Failed to load notifications.');
    return [];
  }
};

// Create a new notification (admin only)
export const createNotification = async (message: string, userId: string | null = null): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ message, user_id: userId })
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('Notification sent successfully!');
    return data as Notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    showError('Failed to send notification.');
    return null;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, created_at: new Date().toISOString() }) // Update created_at to trigger realtime
      .eq('id', notificationId);

    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    showError('Failed to mark notification as read.');
    return false;
  }
};

// Delete a notification (admin only)
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      throw error;
    }
    showSuccess('Notification deleted successfully!');
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    showError('Failed to delete notification.');
    return false;
  }
};