import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export interface Product {
  id: string;
  name: string;
  imageUrl: string; // Primary image URL
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewsCount: number;
  recentPurchase?: string;
  images: string[]; // All image URLs
  sizes: string[];
  description: string;
  boughtByUsers: number;
}

// Fetches all products from Supabase
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      imageUrl: item.image_urls[0] || 'https://picsum.photos/seed/placeholder/300/300', // Use first image as primary
      price: item.price,
      originalPrice: item.original_price,
      discount: item.discount,
      rating: item.rating,
      reviewsCount: item.reviews_count,
      recentPurchase: item.recent_purchase,
      images: item.image_urls,
      sizes: item.sizes,
      description: item.description,
      boughtByUsers: item.bought_by_users,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    showError('Failed to load products.');
    return [];
  }
};

// Fetches a single product by ID from Supabase
export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      return {
        id: data.id,
        name: data.name,
        imageUrl: data.image_urls[0] || 'https://picsum.photos/seed/placeholder/300/300',
        price: data.price,
        originalPrice: data.original_price,
        discount: data.discount,
        rating: data.rating,
        reviewsCount: data.reviews_count,
        recentPurchase: data.recent_purchase,
        images: data.image_urls,
        sizes: data.sizes,
        description: data.description,
        boughtByUsers: data.bought_by_users,
      };
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    showError('Failed to load product details.');
    return undefined;
  }
};

// Gets recommended products (simple implementation for now)
export const getRecommendedProducts = async (currentProductId: string): Promise<Product[]> => {
  try {
    const products = await getProducts();
    return products.filter(product => product.id !== currentProductId).slice(0, 3);
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    return [];
  }
};

// Admin functions for CRUD operations
export const createProduct = async (productData: Omit<Product, 'id' | 'imageUrl' | 'reviewsCount' | 'boughtByUsers'>) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        original_price: productData.originalPrice,
        discount: productData.discount,
        rating: productData.rating,
        image_urls: productData.images,
        sizes: productData.sizes,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('Product created successfully!');
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    showError('Failed to create product.');
    return null;
  }
};

export const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'imageUrl'>>) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        original_price: productData.originalPrice,
        discount: productData.discount,
        rating: productData.rating,
        image_urls: productData.images,
        sizes: productData.sizes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    showSuccess('Product updated successfully!');
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    showError('Failed to update product.');
    return null;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    showSuccess('Product deleted successfully!');
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    showError('Failed to delete product.');
    return false;
  }
};