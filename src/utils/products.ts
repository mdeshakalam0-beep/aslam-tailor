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
  category_id?: string; // New: Link to category
  category_name?: string; // New: Category name for display
}

// Fetches all products from Supabase
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories ( name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      imageUrl: item.image_urls[0] || 'https://picsum.photos/seed/placeholder/300/300', // Use first image as primary
      price: item.price ?? 0, // Ensure price is always a number
      originalPrice: item.original_price ?? undefined,
      discount: item.discount ?? undefined,
      rating: item.rating ?? 0, // Default to 0 if null
      reviewsCount: item.reviews_count ?? 0, // Default to 0 if null
      recentPurchase: item.recent_purchase ?? undefined,
      images: item.image_urls || [], // Ensure images is an array
      sizes: item.sizes || [], // Ensure sizes is an array
      description: item.description ?? '', // Ensure description is a string
      boughtByUsers: item.bought_by_users ?? 0, // Default to 0 if null
      category_id: item.category_id ?? undefined,
      category_name: item.categories?.name || 'Uncategorized',
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
      .select(`
        *,
        categories ( name )
      `)
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
        price: data.price ?? 0, // Ensure price is always a number
        originalPrice: data.original_price ?? undefined,
        discount: data.discount ?? undefined,
        rating: data.rating ?? 0, // Default to 0 if null
        reviewsCount: data.reviews_count ?? 0, // Default to 0 if null
        recentPurchase: data.recent_purchase ?? undefined,
        images: data.image_urls || [], // Ensure images is an array
        sizes: data.sizes || [], // Ensure sizes is an array
        description: data.description ?? '', // Ensure description is a string
        boughtByUsers: data.bought_by_users ?? 0, // Default to 0 if null
        category_id: data.category_id ?? undefined,
        category_name: data.categories?.name || 'Uncategorized',
      };
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    showError('Failed to load product details.');
    return undefined;
  }
};

// Fetches products by category ID
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories ( name )
      `)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      imageUrl: item.image_urls[0] || 'https://picsum.photos/seed/placeholder/300/300',
      price: item.price ?? 0, // Ensure price is always a number
      originalPrice: item.original_price ?? undefined,
      discount: item.discount ?? undefined,
      rating: item.rating ?? 0, // Default to 0 if null
      reviewsCount: item.reviews_count ?? 0, // Default to 0 if null
      recentPurchase: item.recent_purchase ?? undefined,
      images: item.image_urls || [], // Ensure images is an array
      sizes: item.sizes || [], // Ensure sizes is an array
      description: item.description ?? '', // Ensure description is a string
      boughtByUsers: item.bought_by_users ?? 0, // Default to 0 if null
      category_id: item.category_id ?? undefined,
      category_name: item.categories?.name || 'Uncategorized',
    }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    showError('Failed to load products for this category.');
    return [];
  }
};

// Fetches recommended products (e.g., a random subset, excluding the current product)
export const getRecommendedProducts = async (currentProductId: string, limit: number = 4): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories ( name )
      `)
      .neq('id', currentProductId) // Exclude the current product
      .limit(limit); // Limit the number of recommended products

    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      imageUrl: item.image_urls[0] || 'https://picsum.photos/seed/placeholder/300/300',
      price: item.price ?? 0, // Ensure price is always a number
      originalPrice: item.original_price ?? undefined,
      discount: item.discount ?? undefined,
      rating: item.rating ?? 0, // Default to 0 if null
      reviewsCount: item.reviews_count ?? 0, // Default to 0 if null
      recentPurchase: item.recent_purchase ?? undefined,
      images: item.image_urls || [], // Ensure images is an array
      sizes: item.sizes || [], // Ensure sizes is an array
      description: item.description ?? '', // Ensure description is a string
      boughtByUsers: item.bought_by_users ?? 0, // Default to 0 if null
      category_id: item.category_id ?? undefined,
      category_name: item.categories?.name || 'Uncategorized',
    }));
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    showError('Failed to load recommended products.');
    return [];
  }
};


// Admin functions for CRUD operations
export const createProduct = async (productData: Omit<Product, 'id' | 'imageUrl' | 'reviewsCount' | 'boughtByUsers' | 'category_name'>) => {
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
        category_id: productData.category_id, // New: Include category_id
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

export const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'imageUrl' | 'category_name'>>) => {
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
        category_id: productData.category_id, // New: Include category_id
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