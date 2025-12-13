import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

export interface Product {
  id: string;
  imageUrl: string; // Primary image URL
  price: number;
  stitchingPrice?: number; // New: Price for stitching
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
  name: string;
  is_cancellable: boolean; // New: Is product cancellable
  cancellation_window_days: number; // New: Days for cancellation window
  is_returnable: boolean; // New: Is product returnable
  return_window_days: number; // New: Days for return window
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
      stitchingPrice: item.stitching_price ?? 0, // New: Map stitching price
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
      is_cancellable: item.is_cancellable ?? false,
      cancellation_window_days: item.cancellation_window_days ?? 0,
      is_returnable: item.is_returnable ?? false,
      return_window_days: item.return_window_days ?? 0,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    showError('Failed to load products.');
    return [];
  }
};

// Fetches a single product by ID from Supabase
export const getProductById = async (id: string | undefined): Promise<Product | undefined> => {
  if (!id) {
    console.warn('getProductById called with undefined ID.');
    return undefined;
  }
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
        stitchingPrice: data.stitching_price ?? 0, // New: Map stitching price
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
        is_cancellable: data.is_cancellable ?? false,
        cancellation_window_days: data.cancellation_window_days ?? 0,
        is_returnable: data.is_returnable ?? false,
        return_window_days: data.return_window_days ?? 0,
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
      stitchingPrice: item.stitching_price ?? 0, // New: Map stitching price
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
      is_cancellable: item.is_cancellable ?? false,
      cancellation_window_days: item.cancellation_window_days ?? 0,
      is_returnable: item.is_returnable ?? false,
      return_window_days: item.return_window_days ?? 0,
    }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    showError('Failed to load products for this category.');
    return [];
  }
};

// Fetches recommended products (e.g., a random subset, excluding the current product)
export const getRecommendedProducts = async (currentProductId: string, currentProductCategoryId?: string, limit: number = 4): Promise<Product[]> => {
  try {
    let recommendedProducts: Product[] = [];

    // 1. Try to fetch products from the same category
    if (currentProductCategoryId) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories ( name )
        `)
        .eq('category_id', currentProductCategoryId)
        .neq('id', currentProductId)
        .limit(limit);

      if (error) {
        console.error('Error fetching recommended products by category:', error);
        // Don't throw, try general recommendations next
      } else if (data) {
        recommendedProducts = data.map(item => ({
          id: item.id,
          name: item.name,
          imageUrl: item.image_urls[0] || 'https://picsum.photos/seed/placeholder/300/300',
          price: item.price ?? 0,
          stitchingPrice: item.stitching_price ?? 0, // New: Map stitching price
          originalPrice: item.original_price ?? undefined,
          discount: item.discount ?? undefined,
          rating: item.rating ?? 0,
          reviewsCount: item.reviews_count ?? 0,
          recentPurchase: item.recent_purchase ?? undefined,
          images: item.image_urls || [],
          sizes: item.sizes || [],
          description: item.description ?? '',
          boughtByUsers: item.bought_by_users ?? 0,
          category_id: item.category_id ?? undefined,
          category_name: item.categories?.name || 'Uncategorized',
          is_cancellable: item.is_cancellable ?? false,
          cancellation_window_days: item.cancellation_window_days ?? 0,
          is_returnable: item.is_returnable ?? false,
          return_window_days: item.return_window_days ?? 0,
        }));
      }
    }

    // 2. If not enough products, fetch general popular products (excluding current product)
    if (recommendedProducts.length < limit) {
      const remainingLimit = limit - recommendedProducts.length;
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories ( name )
        `)
        .neq('id', currentProductId)
        .limit(remainingLimit); // Fetch remaining needed products

      if (error) {
        throw error; // Throw if general fetch fails
      }

      if (data) {
        const generalProducts = data.map(item => ({
          id: item.id,
          name: item.name,
          imageUrl: item.image_urls[0] || 'https://picsum.photos/seed/placeholder/300/300',
          price: item.price ?? 0,
          stitchingPrice: item.stitching_price ?? 0, // New: Map stitching price
          originalPrice: item.original_price ?? undefined,
          discount: item.discount ?? undefined,
          rating: item.rating ?? 0,
          reviewsCount: item.reviews_count ?? 0,
          recentPurchase: item.recent_purchase ?? undefined,
          images: item.image_urls || [],
          sizes: item.sizes || [],
          description: item.description ?? '',
          boughtByUsers: item.bought_by_users ?? 0,
          category_id: item.category_id ?? undefined,
          category_name: item.categories?.name || 'Uncategorized',
          is_cancellable: item.is_cancellable ?? false,
          cancellation_window_days: item.cancellation_window_days ?? 0,
          is_returnable: item.is_returnable ?? false,
          return_window_days: item.return_window_days ?? 0,
        }));
        // Filter out any duplicates if some were already fetched from the same category
        const uniqueGeneralProducts = generalProducts.filter(gp => !recommendedProducts.some(rp => rp.id === gp.id));
        recommendedProducts = [...recommendedProducts, ...uniqueGeneralProducts];
      }
    }
    
    // Shuffle the final list to provide varied recommendations
    return recommendedProducts.sort(() => Math.random() - 0.5).slice(0, limit);

  } catch (error) {
    console.error('Error fetching recommended products:', error);
    showError('Failed to load recommended products.');
    return [];
  }
};

// New: Search products by name, description, or category name
export const searchProducts = async (query: string, limit: number = 10): Promise<Product[]> => {
  if (!query.trim()) {
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories ( name )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`) // Removed categories.name from the OR clause
      .limit(limit);

    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      imageUrl: item.image_urls[0] || 'https://picsum.photos/seed/placeholder/300/300',
      price: item.price ?? 0,
      stitchingPrice: item.stitching_price ?? 0, // New: Map stitching price
      originalPrice: item.original_price ?? undefined,
      discount: item.discount ?? undefined,
      rating: item.rating ?? 0,
      reviewsCount: item.reviews_count ?? 0,
      recentPurchase: item.recent_purchase ?? undefined,
      images: item.image_urls || [],
      sizes: item.sizes || [],
      description: item.description ?? '',
      boughtByUsers: item.bought_by_users ?? 0,
      category_id: item.category_id ?? undefined,
      category_name: item.categories?.name || 'Uncategorized',
      is_cancellable: item.is_cancellable ?? false,
      cancellation_window_days: item.cancellation_window_days ?? 0,
      is_returnable: item.is_returnable ?? false,
      return_window_days: item.return_window_days ?? 0,
    }));
  } catch (error) {
    console.error('Error searching products:', error);
    showError('Failed to search products.');
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
        stitching_price: productData.stitchingPrice, // New: Insert stitching price
        original_price: productData.originalPrice,
        discount: productData.discount,
        rating: productData.rating,
        image_urls: productData.images,
        sizes: productData.sizes,
        category_id: productData.category_id, // New: Include category_id
        is_cancellable: productData.is_cancellable,
        cancellation_window_days: productData.cancellation_window_days,
        is_returnable: productData.is_returnable,
        return_window_days: productData.return_window_days,
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
        stitching_price: productData.stitchingPrice, // New: Update stitching price
        original_price: productData.originalPrice,
        discount: productData.discount,
        rating: productData.rating,
        image_urls: productData.images,
        sizes: productData.sizes,
        category_id: productData.category_id, // New: Include category_id
        is_cancellable: productData.is_cancellable,
        cancellation_window_days: productData.cancellation_window_days,
        is_returnable: productData.is_returnable,
        return_window_days: productData.return_window_days,
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