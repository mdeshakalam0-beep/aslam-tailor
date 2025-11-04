import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { // Joined profile data
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

// Uploads a review image to Supabase Storage
export const uploadReviewImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `review-images/${fileName}`; // Store in a 'review-images' subfolder

    const { error: uploadError } = await supabase.storage
      .from('product-images') // Using the existing product-images bucket
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    showSuccess('Review image uploaded successfully!');
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading review image:', error);
    showError('Failed to upload review image.');
    return null;
  }
};

// Submits a new product review
export const submitProductReview = async (
  productId: string,
  userId: string,
  rating: number,
  reviewText: string,
  imageUrl: string | null = null
): Promise<ProductReview | null> => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating,
        review_text: reviewText.trim() || null,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('Review submitted successfully!');
    return data as ProductReview;
  } catch (error) {
    console.error('Error submitting review:', error);
    showError('Failed to submit review.');
    return null;
  }
};

// Fetches all reviews for a specific product, including reviewer's profile info
export const getReviewsForProduct = async (productId: string): Promise<ProductReview[]> => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        profiles ( first_name, last_name, avatar_url )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data as ProductReview[];
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    showError('Failed to load reviews.');
    return [];
  }
};