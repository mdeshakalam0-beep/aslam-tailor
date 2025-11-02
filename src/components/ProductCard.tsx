import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    rating: number;
    reviewsCount: number;
    recentPurchase?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
      <CardContent className="p-3">
        <h3 className="text-base font-semibold text-foreground truncate">{product.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
            {product.discount && (
              <span className="text-xs font-medium text-green-600 ml-1">{product.discount}% off</span>
            )}
          </div>
        </div>
        <div className="flex items-center mt-1 text-sm text-muted-foreground">
          <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
          <span>{product.rating} ({product.reviewsCount})</span>
        </div>
        {product.recentPurchase && (
          <p className="text-xs text-gray-500 mt-1">
            {product.recentPurchase}
          </p>
        )}
        <Button variant="outline" size="sm" className="w-full mt-3 bg-accent text-accent-foreground hover:bg-accent/90">
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;