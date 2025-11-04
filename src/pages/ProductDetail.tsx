import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Heart as HeartIconFilled, Heart as HeartIconOutline, Ruler } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import ProductCard from '@/components/ProductCard';
import ProductMeasurementSelector from '@/components/ProductMeasurementSelector';
import ProductReviewForm from '@/components/ProductReviewForm'; // Import ProductReviewForm
import ProductReviewCard from '@/components/ProductReviewCard'; // Import ProductReviewCard
import { addToCart } from '@/utils/cart';
import { showError, showSuccess } from '@/utils/toast';
import { getProductById, getRecommendedProducts, Product } from '@/utils/products';
import { isProductFavorited, addFavorite, removeFavorite } from '@/utils/favorites';
import { getReviewsForProduct, ProductReview } from '@/utils/reviews'; // Import review utilities
import { useSession } from '@/components/SessionContextProvider';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useSession();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]); // State for reviews
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCustomMeasurementActive, setIsCustomMeasurementActive] = useState(false);
  const [isSizeSelectionActive, setIsSizeSelectionActive] = useState(true);

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  const fetchProductAndReviews = async () => {
    if (!id) return;
    setLoading(true);
    const fetchedProduct = await getProductById(id);
    setProduct(fetchedProduct);

    if (fetchedProduct) {
      const fetchedRecommended = await getRecommendedProducts(fetchedProduct.id);
      setRecommendedProducts(fetchedRecommended);
      const fetchedReviews = await getReviewsForProduct(fetchedProduct.id); // Fetch reviews
      setReviews(fetchedReviews);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductAndReviews();
  }, [id]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (session?.user && product?.id) {
        const favorited = await isProductFavorited(session.user.id, product.id);
        setIsFavorited(favorited);
      }
    };
    checkFavoriteStatus();
  }, [session, product?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Product not found.</p>
      </div>
    );
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setIsCustomMeasurementActive(false);
    setIsSizeSelectionActive(true);
  };

  const handleSizeToggle = (checked: boolean) => {
    setIsSizeSelectionActive(checked);
    if (checked) {
      setIsCustomMeasurementActive(false);
    } else {
      setSelectedSize(undefined);
    }
  };

  const handleMeasurementToggle = (isActive: boolean) => {
    setIsCustomMeasurementActive(isActive);
    if (isActive) {
      setSelectedSize(undefined);
      setIsSizeSelectionActive(false);
    }
  };

  const handleAddToCart = () => {
    if (isCustomMeasurementActive) {
      addToCart({
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: product.price,
        selectedSize: "Custom Fit",
      });
      showSuccess('Product added to cart with custom measurement option!');
    } else if (isSizeSelectionActive && selectedSize) {
      addToCart({
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: product.price,
        selectedSize: selectedSize,
      });
    } else {
      showError('Please select a size or enable custom measurements.');
    }
  };

  const handleBuyNow = () => {
    if (isCustomMeasurementActive) {
      addToCart({
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: product.price,
        selectedSize: "Custom Fit",
      });
      showSuccess('Product added to cart with custom measurement option!');
      navigate('/cart');
    } else if (isSizeSelectionActive && selectedSize) {
      addToCart({
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: product.price,
        selectedSize: selectedSize,
      });
      navigate('/cart');
    } else {
      showError('Please select a size or enable custom measurements.');
    }
  };

  const handleToggleFavorite = async () => {
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

  const handleReviewSubmitted = () => {
    fetchProductAndReviews(); // Re-fetch reviews after a new one is submitted
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-0 md:p-4">
        <div className="flex items-center p-4 md:p-0 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground ml-2">{product.name}</h1>
        </div>

        <div className="bg-card p-4 md:p-6 rounded-lg shadow-sm space-y-6">
          {/* Product Image Carousel */}
          <div className="relative w-full overflow-hidden rounded-lg">
            <Carousel
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                {product.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <img
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-64 md:h-96 object-cover rounded-md"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2" />
            </Carousel>
          </div>

          {/* Product Details */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-3xl font-bold text-foreground">{product.name}</h2>
              <Button variant="ghost" size="icon" onClick={handleToggleFavorite} className="text-primary">
                {isFavorited ? (
                  <HeartIconFilled className="h-7 w-7 fill-primary" />
                ) : (
                  <HeartIconOutline className="h-7 w-7" />
                )}
              </Button>
            </div>
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-2xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-base text-muted-foreground line-through">₹{product.originalPrice.toLocaleString()}</span>
              )}
              {product.discount && (
                <span className="text-sm font-medium text-green-600 ml-2">{product.discount}% off</span>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
              <span>{product.rating} ({product.reviewsCount} reviews)</span>
              <span className="ml-4">Bought by {product.boughtByUsers} users</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Size Selection */}
          <div className={cn("space-y-2")}>
            <div className="flex items-center justify-between space-x-2 p-2 border rounded-md bg-muted/50">
              <Label htmlFor="size-selection-toggle" className="flex items-center space-x-2 cursor-pointer">
                <Ruler className="h-5 w-5 text-muted-foreground" />
                <span>Enable Size Selection</span>
              </Label>
              <Switch
                id="size-selection-toggle"
                checked={isSizeSelectionActive}
                onCheckedChange={handleSizeToggle}
                disabled={isCustomMeasurementActive}
              />
            </div>
            <div className={cn(!isSizeSelectionActive && "opacity-50 pointer-events-none")}>
              <Label className="text-base font-semibold text-foreground">Select Size</Label>
              <RadioGroup
                onValueChange={handleSizeSelect}
                value={selectedSize}
                className="flex flex-wrap gap-2"
                disabled={!isSizeSelectionActive}
              >
                {product.sizes.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                    <Label
                      htmlFor={`size-${size}`}
                      className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 px-4 text-sm font-medium uppercase text-popover-foreground shadow-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* In-page Measurement Selector */}
          <div className={cn("pt-6 border-t border-border mt-6")}>
            <ProductMeasurementSelector 
              session={session} 
              isActive={isCustomMeasurementActive}
              onToggle={handleMeasurementToggle}
              isDisabled={isSizeSelectionActive}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>
        </div>

        {/* Product Reviews Section */}
        <section className="mt-8 px-4 md:px-0">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Customer Reviews ({reviews.length})</h2>
          {session?.user ? (
            <ProductReviewForm productId={product.id} session={session} onReviewSubmitted={handleReviewSubmitted} />
          ) : (
            <p className="text-muted-foreground text-center p-4 border rounded-lg bg-card mb-4">
              <Link to="/login" className="text-primary hover:underline">Log in</Link> to write a review.
            </p>
          )}

          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center p-4 border rounded-lg bg-card">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <ProductReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </section>

        {/* Recommended Products Section */}
        <section className="mt-8 px-4 md:px-0">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Recommended Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendedProducts.map((product) => (
              <Link to={`/products/${product.id}`} key={product.id} className="block">
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default ProductDetail;