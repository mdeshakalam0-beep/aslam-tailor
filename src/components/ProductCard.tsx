import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart as HeartIconFilled, Heart as HeartIconOutline, X } from 'lucide-react';
import { addToCart } from '@/utils/cart';
import { showError } from '@/utils/toast';
import { isProductFavorited, addFavorite, removeFavorite } from '@/utils/favorites';
import { useSession } from '@/components/SessionContextProvider';
import { Link } from 'react-router-dom';

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

  // modal state for image lightbox
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    // Prevent Link navigation when clicking this button
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
    // Prevent Link navigation when clicking favorite
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

  // Image click opens modal (prevent Link navigation)
  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // WhatsApp share link (text + product link)
  const getWhatsAppShareUrl = () => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    const text = `${product.name}\nPrice: ₹${product.price}\n\nView: ${productUrl}\n`;
    // use wa.me link which works on mobile & desktop
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <>
      {/* Wrap the whole card with Link so clicking anywhere (except buttons/image which handle clicks) opens product detail. */}
      <Link to={`/product/${product.id}`} aria-label={`Open ${product.name}`}>
        <Card className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow relative">
          {/* Image area - make image responsive and clickable to open modal */}
          <div
            className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden cursor-zoom-in"
            onClick={handleImageClick}
            role="button"
            aria-label={`Preview ${product.name}`}
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              // object-contain to ensure full image visible, responsive sizing
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>

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
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      </Link>

      {/* Modal / Lightbox for image preview */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* modal content */}
          <div
            className="relative z-10 max-w-[96vw] max-h-[96vh] bg-transparent rounded-md overflow-hidden"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside content
          >
            {/* close button top-right */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-900"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* image area */}
            <div className="flex items-center justify-center bg-white p-4">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-w-[90vw] max-h-[80vh] object-contain rounded"
              />
            </div>

            {/* actions: share to WhatsApp & open product page in new tab */}
            <div className="flex items-center gap-2 justify-between bg-white p-3">
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 text-white font-medium shadow"
                onClick={(e) => {
                  // prevent modal close on click
                  e.stopPropagation();
                }}
              >
                Send on WhatsApp
              </a>

              <div className="flex items-center gap-2">
                <a
                  href={`/product/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-100 text-slate-900 font-medium border"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open Product Page
                </a>
                <button
                  onClick={() => {
                    // copy product page link to clipboard
                    const link = `${window.location.origin}/product/${product.id}`;
                    navigator.clipboard?.writeText(link);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 text-slate-900 font-medium border"
                  aria-label="Copy link"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
