import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/utils/products'; // Import Product interface

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'imageUrl' | 'reviewsCount' | 'boughtByUsers'>) => Promise<void>;
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
    }
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const productData = {
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      discount: discount ? parseInt(discount) : undefined,
      rating: rating ? parseFloat(rating) : undefined,
      images: imageUrls.split('\n').map(url => url.trim()).filter(url => url !== ''),
      sizes: sizes.split(',').map(s => s.trim()).filter(s => s !== ''),
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
          <div>
            <Label htmlFor="imageUrls">Image URLs (one per line)</Label>
            <Textarea
              id="imageUrls"
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              rows={5}
              required
            />
          </div>
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
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
            {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Add Product')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;