import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Heart as HeartIconFilled, Heart as HeartIconOutline, Ruler, X, ChevronLeft, ChevronRight, Scissors } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import ProductCard from '@/components/ProductCard';
import ProductMeasurementSelector from '@/components/ProductMeasurementSelector';
import ProductReviewForm from '@/components/ProductReviewForm';
import ProductReviewCard from '@/components/ProductReviewCard';
import { addToCart } from '@/utils/cart';
import { showError, showSuccess } from '@/utils/toast';
import { getProductById, getRecommendedProducts, Product } from '@/utils/products';
import { isProductFavorited, addFavorite, removeFavorite } from '@/utils/favorites';
import { getReviewsForProduct, ProductReview } from '@/utils/reviews';
import { useSession } from '@/components/SessionContextProvider';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import ProductMetaTags from '@/components/ProductMetaTags'; 
import ShareButton from '@/components/ShareButton'; 

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useSession();
  const navigate = useNavigate();
  const location = useLocation(); // To check state passed from previous page
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCustomMeasurementActive, setIsCustomMeasurementActive] = useState(false);
  const [isSizeSelectionActive, setIsSizeSelectionActive] = useState(true);

  // New State for Stitching Option
  const [isStitchingSelected, setIsStitchingSelected] = useState(false);

  // lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  const fetchProductAndReviews = async () => {
    if (!id) return;
    setLoading(true);
    const fetchedProduct = await getProductById(id);
    setProduct(fetchedProduct);

    if (fetchedProduct) {
      const fetchedRecommended = await getRecommendedProducts(fetchedProduct.id, fetchedProduct.category_id);
      setRecommendedProducts(fetchedRecommended);
      const fetchedReviews = await getReviewsForProduct(fetchedProduct.id);
      setReviews(fetchedReviews);
      
      // Auto-select stitching if user came from listing page with stitching toggle ON
      const state = location.state as { withStitching?: boolean };
      if (state?.withStitching && (fetchedProduct.stitchingPrice || 0) > 0) {
        setIsStitchingSelected(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductAndReviews();
    // reset lightbox on product change
    setIsLightboxOpen(false);
    setLightboxIndex(0);
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
      <div className="min-h-screen flex items-center justify-center bg-off-white-page-bg">
        <p className="text-text-primary-heading">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white-page-bg">
        <p className="text-text-primary-heading">Product not found.</p>
      </div>
    );
  }

  // Price Calculation Logic
  const currentPrice = isStitchingSelected && product.stitchingPrice
    ? product.price + product.stitchingPrice
    : product.price;

  const currentOriginalPrice = product.originalPrice 
    ? (isStitchingSelected && product.stitchingPrice ? product.originalPrice + product.stitchingPrice : product.originalPrice)
    : undefined;

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
      // Optional: Auto-enable stitching when custom measurements are active?
      // setIsStitchingSelected(true); 
    }
  };

  const handleAddToCart = () => {
    if (!session?.user) {
      showError('Please log in to add items to cart.');
      return;
    }
    
    // Logic to ensure size is selected only if measurements are NOT active
    if (!isCustomMeasurementActive && isSizeSelectionActive && !selectedSize) {
      showError('Please select a size or enable custom measurements.');
      return;
    }

    const sizeToAdd = isCustomMeasurementActive ? "Custom Fit" : selectedSize;

    addToCart({
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: currentPrice, // Updated price
      selectedSize: sizeToAdd,
      withStitching: isStitchingSelected, // Pass stitching status
    });
  };

  const handleBuyNow = () => {
    if (!session?.user) {
      showError('Please log in to buy now.');
      return;
    }

    if (!isCustomMeasurementActive && isSizeSelectionActive && !selectedSize) {
      showError('Please select a size or enable custom measurements.');
      return;
    }

    const sizeToAdd = isCustomMeasurementActive ? "Custom Fit" : selectedSize;

    addToCart({
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: currentPrice, // Updated price
      selectedSize: sizeToAdd,
      withStitching: isStitchingSelected, // Pass stitching status
    });
    navigate('/cart');
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
    fetchProductAndReviews();
  };

  // Lightbox controls
  const openLightboxAt = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };
  const closeLightbox = () => setIsLightboxOpen(false);
  const prevLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxIndex((i) => (i - 1 + product.images.length) % product.images.length);
  };
  const nextLightbox = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLightboxIndex((i) => (i + 1) % product.images.length);
  };

  return (
    <div className="min-h-screen bg-off-white-page-bg pb-16 md:pb-0">
      {product && <ProductMetaTags product={product} />} 
      <Header />
      <main className="container mx-auto p-0 md:p-4">
        <div className="bg-card p-4 md:p-6 rounded-default shadow-elev border border-card-border space-y-6">
          {/* Product Image Carousel */}
          <div className="relative w-full overflow-hidden rounded-default">
            <Carousel
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                {product.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div
                      className="w-full h-64 md:h-96 flex items-center justify-center bg-primary-pale-pink cursor-zoom-in"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); openLightboxAt(index); }}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="max-w-full max-h-full object-contain rounded-default"
                        loading="lazy"
                      />
                    </div>
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
              <h2 className="text-3xl font-bold text-text-primary-heading">{product.name}</h2>
              <Button variant="ghost" size="icon" onClick={handleToggleFavorite} className="text-accent-rose">
                {isFavorited ? (
                  <HeartIconFilled className="h-7 w-7 fill-accent-rose" />
                ) : (
                  <HeartIconOutline className="h-7 w-7" />
                )}
              </Button>
            </div>
            
            {/* Price Display */}
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-2xl font-bold text-accent-rose">₹{currentPrice.toLocaleString()}</span>
              {currentOriginalPrice && (
                <span className="text-base text-text-secondary-body line-through">₹{currentOriginalPrice.toLocaleString()}</span>
              )}
              {product.discount && !isStitchingSelected && (
                <span className="text-sm font-medium text-accent-rose ml-2">{product.discount}% off</span>
              )}
            </div>

            <div className="flex items-center text-sm text-text-secondary-body mb-4">
              <Star className="h-4 w-4 text-accent-rose mr-1 fill-accent-rose" />
              <span>{product.rating} ({product.reviewsCount})</span>
            </div>
            <p className="text-text-secondary-body leading-relaxed">{product.description}</p>
          </div>

          {/* Stitching Option Toggle */}
          {(product.stitchingPrice || 0) > 0 && (
            <div className="p-4 bg-primary-pale-pink/50 rounded-lg border border-accent-rose/20 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full text-accent-rose">
                    <Scissors size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary-heading">Add Stitching Service</h4>
                    <p className="text-sm text-text-secondary-body">
                      Get it stitched for just <span className="font-bold text-accent-rose">₹{product.stitchingPrice}</span>
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isStitchingSelected}
                  onCheckedChange={setIsStitchingSelected}
                  className="data-[state=checked]:bg-accent-rose"
                />
              </div>
            </div>
          )}

          {/* Share Button */}
          <ShareButton
            title={product.name}
            text={`Check out this amazing product: ${product.name} for ₹${currentPrice.toLocaleString()}!`}
            url={`${window.location.origin}/products/${product.id}`}
            imageUrl={product.images[0]}
          />

          {/* Size Selection */}
          <div className={cn("space-y-2")}>
            <div className="flex items-center justify-between space-x-2 p-2 border border-card-border rounded-small bg-primary-pale-pink">
              <Label htmlFor="size-selection-toggle" className="flex items-center space-x-2 cursor-pointer text-text-secondary-body">
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
              <Label className="text-base font-semibold text-text-primary-heading">Select Size</Label>
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
                      className="flex items-center justify-center rounded-small border-2 border-card-border bg-popover p-2 px-4 text-sm font-medium uppercase text-popover-foreground shadow-sm hover:bg-secondary-soft-pink hover:text-accent-dark peer-data-[state=checked]:border-accent-rose [&:has([data-state=checked])]:border-accent-rose"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* In-page Measurement Selector */}
          <div className={cn("pt-6 border-t border-card-border mt-6")}>
            <ProductMeasurementSelector
              session={session}
              isActive={isCustomMeasurementActive}
              onToggle={handleMeasurementToggle}
              isDisabled={isSizeSelectionActive}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="flex-1 bg-accent-rose text-white hover:bg-accent-dark rounded-small" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button className="flex-1 bg-primary text-primary-foreground hover:bg-accent-dark rounded-small" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>
        </div>

        {/* Product Reviews Section */}
        <section className="mt-8 px-4 md:px-0">
          <h2 className="text-2xl font-bold mb-4 text-text-primary-heading">Customer Reviews ({reviews.length})</h2>
          {session?.user ? (
            <ProductReviewForm productId={product.id} session={session} onReviewSubmitted={handleReviewSubmitted} />
          ) : (
            <p className="text-text-secondary-body text-center p-4 border border-card-border rounded-default bg-card mb-4">
              <Link to="/login" className="text-primary hover:underline">Log in</Link> to write a review.
            </p>
          )}

          <div className="mt-6 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-text-secondary-body text-center p-4 border border-card-border rounded-default bg-card">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <ProductReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </section>

        {/* Recommended Products Section */}
        <section className="mt-8 px-4 md:px-0">
          <h2 className="text-2xl font-bold mb-4 text-text-primary-heading">Recommended Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendedProducts.map((p) => (
              <Link 
                to={`/products/${p.id}`} 
                key={p.id} 
                className="block"
                // Pass stitching choice if needed, but usually recommended items reset to default
              >
                <ProductCard product={p} />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <BottomNavigation />

      {/* Lightbox modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <div className="absolute inset-0 bg-black/70" />

          <div
            className="relative z-10 max-w-[96vw] max-h-[96vh] bg-transparent rounded-default overflow-hidden flex flex-col items-stretch"
            onClick={(e) => e.stopPropagation()}
          >
            {/* top controls */}
            <div className="flex items-center justify-between p-2">
              <button onClick={closeLightbox} className="p-2 rounded-full bg-white/80" aria-label="Close">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`/products/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-small bg-white text-text-primary-heading font-medium border border-card-border"
                >
                  Open Product Page
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const link = `${window.location.origin}/products/${product.id}`;
                    navigator.clipboard?.writeText(link);
                    showSuccess('Product link copied to clipboard!');
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-small bg-white text-text-primary-heading font-medium border border-card-border"
                >
                  Copy Link
                </button>
              </div>
            </div>

            {/* image area with prev/next */}
            <div className="flex items-center justify-center flex-1 bg-black/90 p-4">
              <button
                onClick={prevLightbox}
                className="p-2 rounded-full bg-white/20 text-white mr-4"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <img
                src={product.images[lightboxIndex]}
                alt={`${product.name} - ${lightboxIndex + 1}`}
                className="max-w-[90vw] max-h-[80vh] object-contain rounded"
              />

              <button
                onClick={nextLightbox}
                className="p-2 rounded-full bg-white/20 text-white ml-4"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* thumbnails */}
            <div className="flex gap-2 items-center overflow-x-auto bg-white p-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={cn(
                    "rounded-small overflow-hidden border-2",
                    i === lightboxIndex ? "border-accent-rose" : "border-transparent"
                  )}
                >
                  <img src={img} alt={`${product.name} thumb ${i+1}`} className="w-20 h-20 object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;