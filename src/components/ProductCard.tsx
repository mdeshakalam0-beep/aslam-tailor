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
    stitchingPrice?: number;
    originalPrice?: number;
    discount?: number;
    rating: number;
    reviewsCount: number;
    recentPurchase?: string;
    sizes?: string[];
  };
  showStitchingPrice?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, showStitchingPrice = false }) => {
  const { session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);

  // Logic to calculate final price based on stitching selection
  const isStitchingActive = showStitchingPrice && (product.stitchingPrice || 0) > 0;
  
  const finalPrice = isStitchingActive 
    ? product.price + (product.stitchingPrice || 0) 
    : product.price;

  const finalOriginalPrice = product.originalPrice 
    ? (isStitchingActive ? product.originalPrice + (product.stitchingPrice || 0) : product.originalPrice)
    : undefined;

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

    // Yahan par changes kiye gaye hain:
    addToCart({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: finalPrice, // Total price (Cloth + Stitching if active)
      selectedSize: selectedSize,
      withStitching: isStitchingActive, // Yeh line bataegi ki stitching included hai ya nahi
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
    <Card className="overflow-hidden rounded-default shadow-elev hover:shadow-md transition-shadow relative bg-white border border-card-border">
      <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-t-default" />
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-accent-rose bg-white/70 rounded-full p-1"
        onClick={handleToggleFavorite}
      >
        {isFavorited ? (
          <HeartIconFilled className="h-5 w-5 fill-accent-rose" />
        ) : (
          <HeartIconOutline className="h-5 w-5" />
        )}
      </Button>
      <CardContent className="p-3">
        <h3 className="text-base font-semibold text-text-primary-heading truncate">{product.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-wrap items-baseline gap-x-1">
            <span className="text-lg font-bold text-accent-rose">₹{finalPrice.toLocaleString()}</span>
            
            {finalOriginalPrice && (
              <span className="text-sm text-text-secondary-body line-through">₹{finalOriginalPrice.toLocaleString()}</span>
            )}
            
            {product.discount && !isStitchingActive && (
              <span className="text-xs font-medium text-accent-rose ml-1">{product.discount}% off</span>
            )}
            
            {isStitchingActive && (
              <span className="text-[10px] bg-accent-rose/10 text-accent-rose px-1.5 py-0.5 rounded-full font-medium ml-1">
                + Stitching
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center mt-1 text-sm text-text-secondary-body">
          <Star className="h-4 w-4 text-accent-rose mr-1 fill-accent-rose" />
          <span>{product.rating} ({product.reviewsCount})</span>
        </div>
        {product.recentPurchase && (
          <p className="text-xs text-muted-text mt-1">
            {product.recentPurchase}
          </p>
        )}
        <Button variant="outline" size="sm" className="w-full mt-3 bg-primary-pale-pink text-accent-dark hover:bg-secondary-soft-pink" onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;