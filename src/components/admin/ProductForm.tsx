import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/utils/products';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { getCategories, Category } from '@/utils/categories'; // Import getCategories

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'imageUrl' | 'reviewsCount' | 'boughtByUsers' | 'category_name'>) => Promise<void>;
  loading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, loading }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price.toString() || '');
  const [originalPrice, setOriginalPrice] = useState(initialData?.originalPrice?.toString() || '');
  const [discount, setDiscount] = useState(initialData?.discount?.toString() || '');
  const [rating, setRating] = useState(initialData?.rating?.toString() || '');
  const [imageUrls, setImageUrls] = useState(initialData?.images.join('\n') || '');
  const [sizes, setSizes] = useState(initialData?.sizes.join(', ') || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(initialData?.category_id || undefined); // New state for category
  const [categories, setCategories] = useState<Category[]>([]); // State to store available categories

  const [isCancellable, setIsCancellable] = useState(initialData?.is_cancellable ?? false); // New state
  const [cancellationWindowDays, setCancellationWindowDays] = useState(initialData?.cancellation_window_days?.toString() || '0'); // New state
  const [isReturnable, setIsReturnable] = useState(initialData?.is_returnable ?? false); // New state
  const [returnWindowDays, setReturnWindowDays] = useState(initialData?.return_window_days?.toString() || '0'); // New state

  const [useUrlInput, setUseUrlInput] = useState(true); // State to toggle between URL and file upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setPrice(initialData.price.toString());
      setOriginalPrice(initialData.originalPrice?.toString() || '');
      setDiscount(initialData.discount?.toString() || '');
      setRating(initialData.rating?.toString() || '');
      setImageUrls(initialData.images.join('\n'));
      setSizes(initialData.sizes.join(', '));
      setSelectedCategoryId(initialData.category_id || undefined); // Set initial category
      setIsCancellable(initialData.is_cancellable ?? false);
      setCancellationWindowDays(initialData.cancellation_window_days?.toString() || '0');
      setIsReturnable(initialData.is_returnable ?? false);
      setReturnWindowDays(initialData.return_window_days?.toString() || '0');
      // If initialData has images, assume URL input was used or display them as URLs
      setUseUrlInput(true); 
      setSelectedFiles([]); // Clear selected files on edit
    } else {
      // Reset for new product
      setUseUrlInput(true);
      setSelectedFiles([]);
      setSelectedCategoryId(undefined); // Clear selected category for new product
      setIsCancellable(false);
      setCancellationWindowDays('0');
      setIsReturnable(false);
      setReturnWindowDays('0');
    }
  }, [initialData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const uploadFilesToSupabase = async (files: File[]): Promise<string[]> => {
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `public/${fileName}`; // Store in a 'public' subfolder within the bucket

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }
      showSuccess('Images uploaded successfully!');
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      showError('Failed to upload images.');
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let finalImageUrls: string[] = [];

    if (useUrlInput) {
      finalImageUrls = imageUrls.split('\n').map(url => url.trim()).filter(url => url !== '');
    } else {
      if (selectedFiles.length > 0) {
        finalImageUrls = await uploadFilesToSupabase(selectedFiles);
        if (finalImageUrls.length === 0) {
          showError('Image upload failed. Please try again.');
          return;
        }
      } else if (!initialData?.images || initialData.images.length === 0) {
        // If no new files selected and no initial images, and not using URL input
        showError('Please upload at least one image or provide image URLs.');
        return;
      } else {
        // If editing and no new files selected, keep existing images
        finalImageUrls = initialData.images;
      }
    }

    if (finalImageUrls.length === 0) {
      showError('Please provide at least one image for the product.');
      return;
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      discount: discount ? parseInt(discount) : undefined,
      rating: rating ? parseFloat(rating) : undefined,
      images: finalImageUrls,
      sizes: sizes.split(',').map(s => s.trim()).filter(s => s !== ''),
      category_id: selectedCategoryId, // New: Include selected category ID
      is_cancellable: isCancellable,
      cancellation_window_days: isCancellable ? parseInt(cancellationWindowDays) : 0,
      is_returnable: isReturnable,
      return_window_days: isReturnable ? parseInt(returnWindowDays) : 0,
    };

    await onSubmit(productData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          {initialData ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Stylish Cotton Shirt"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the product"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 899"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="originalPrice">Original Price (₹) (Optional)</Label>
              <Input
                id="originalPrice"
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="e.g., 1299"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount">Discount (%) (Optional)</Label>
              <Input
                id="discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="e.g., 30"
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="rating">Rating (1-5) (Optional)</Label>
              <Input
                id="rating"
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="e.g., 4.5"
                min="1"
                max="5"
                step="0.1"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload Options */}
          <div className="flex items-center justify-between space-x-2 p-2 border rounded-md bg-muted/50">
            <Label htmlFor="image-upload-toggle" className="flex items-center space-x-2 cursor-pointer">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <span>Upload Images via URL</span>
            </Label>
            <Switch
              id="image-upload-toggle"
              checked={useUrlInput}
              onCheckedChange={setUseUrlInput}
            />
          </div>

          {useUrlInput ? (
            <div>
              <Label htmlFor="imageUrls">Image URLs (one per line)</Label>
              <Textarea
                id="imageUrls"
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                rows={5}
                required={!initialData || initialData.images.length === 0}
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="device-images">Upload Images from Device</Label>
              <Input
                id="device-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadingImages}
                className="file:text-primary file:bg-primary-foreground file:border-primary file:hover:bg-primary/90 file:hover:text-primary-foreground"
              />
              {selectedFiles.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedFiles.length} file(s) selected.
                </p>
              )}
              {initialData?.images && initialData.images.length > 0 && selectedFiles.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No new files selected. Existing {initialData.images.length} image(s) will be kept.
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="sizes">Available Sizes (comma-separated)</Label>
            <Input
              id="sizes"
              type="text"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder="e.g., S, M, L, XL"
              required
            />
          </div>

          {/* Cancellation Settings */}
          <div className="flex items-center justify-between space-x-2 p-2 border rounded-md bg-muted/50">
            <Label htmlFor="isCancellable">Allow Cancellation</Label>
            <Switch
              id="isCancellable"
              checked={isCancellable}
              onCheckedChange={setIsCancellable}
            />
          </div>
          {isCancellable && (
            <div>
              <Label htmlFor="cancellationWindowDays">Cancellation Window (Days after order)</Label>
              <Input
                id="cancellationWindowDays"
                type="number"
                value={cancellationWindowDays}
                onChange={(e) => setCancellationWindowDays(e.target.value)}
                placeholder="e.g., 7"
                min="0"
              />
            </div>
          )}

          {/* Return Settings */}
          <div className="flex items-center justify-between space-x-2 p-2 border rounded-md bg-muted/50">
            <Label htmlFor="isReturnable">Allow Return</Label>
            <Switch
              id="isReturnable"
              checked={isReturnable}
              onCheckedChange={setIsReturnable}
            />
          </div>
          {isReturnable && (
            <div>
              <Label htmlFor="returnWindowDays">Return Window (Days after delivery)</Label>
              <Input
                id="returnWindowDays"
                type="number"
                value={returnWindowDays}
                onChange={(e) => setReturnWindowDays(e.target.value)}
                placeholder="e.g., 14"
                min="0"
              />
            </div>
          )}

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading || uploadingImages}>
            {loading || uploadingImages ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadingImages ? 'Uploading Images...' : 'Saving...'}
              </>
            ) : (initialData ? 'Update Product' : 'Add Product')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;