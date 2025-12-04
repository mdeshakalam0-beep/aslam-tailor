import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart as HeartIconFilled, Heart as HeartIconOutline } from 'lucide-react';
import { addToCart } from '@/utils/cart';
import { showError } from '@/utils/toast';
import { isProductFavorited, addFavorite, removeFavorite } from '@/utils/favorites';
import { useSession } from '@/components/SessionContextProvider';

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
    sizes?: string[];
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (session?.user && product.id) {
        const favorited = await isProductFavorited(session.user.id, product.id);
        setIsFavorited(favorited);
      }
    };
    checkFavoriteStatus();
  }, [session, product.id]);

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!product.sizes || product.sizes.length === 0) {
      showError('This product does not have size options. Cannot add to cart.');
      return;
    }

    const selectedSize = product.sizes[0];

    addToCart({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      selectedSize: selectedSize,
    });
  };

  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!session?.user) {
      showError('Please log in to favorite products.');
      return;
    }
    if (isFavorited) {
      const success = await removeFavorite(session.user.id, product.id);
      if (success) setIsFavorited(false);
    } else {
      const success = await addFavorite(session.user.id, product.id);
      if (success) setIsFavorited(true);
    }
  };

  return (
    <Card className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow relative">
      <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-primary bg-background/70 rounded-full p-1"
        onClick={handleToggleFavorite}
      >
        {isFavorited ? (
          <HeartIconFilled className="h-5 w-5 fill-primary" />
        ) : (
          <HeartIconOutline className="h-5 w-5" />
        )}
      </Button>
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
        <Button variant="outline" size="sm" className="w-full mt-3 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
