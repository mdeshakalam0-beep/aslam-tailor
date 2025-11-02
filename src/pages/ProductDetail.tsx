import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import ProductCard from '@/components/ProductCard'; // Reusing ProductCard for recommendations
import MeasurementForm from '@/components/MeasurementForm'; // New measurement form

// Sample detailed product data (replace with actual API fetch in a real app)
const sampleProductDetail = {
  id: '1',
  name: 'Stylish Cotton Shirt',
  description: 'A comfortable and stylish cotton shirt perfect for casual and semi-formal occasions. Made from high-quality, breathable fabric. Available in various sizes and colors.',
  price: 899,
  originalPrice: 1299,
  discount: 30,
  rating: 4.5,
  reviewsCount: 120,
  boughtByUsers: 500,
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  images: [
    'https://picsum.photos/seed/shirt1_detail1/800/600',
    'https://picsum.photos/seed/shirt1_detail2/800/600',
    'https://picsum.photos/seed/shirt1_detail3/800/600',
    'https://picsum.photos/seed/shirt1_detail4/800/600',
  ],
};

// Sample recommended products (can be fetched from an API)
const recommendedProducts = [
  {
    id: '2',
    name: 'Premium Linen Pants',
    imageUrl: 'https://picsum.photos/seed/pant1/300/300',
    price: 1499,
    originalPrice: 1999,
    discount: 25,
    rating: 4.2,
    reviewsCount: 85,
  },
  {
    id: '3',
    name: 'Elegant Waistcoat',
    imageUrl: 'https://picsum.photos/seed/waistcoat1/300/300',
    price: 1199,
    originalPrice: 1599,
    discount: 25,
    rating: 4.7,
    reviewsCount: 60,
  },
  {
    id: '4',
    name: 'Traditional Kurta',
    imageUrl: 'https://picsum.photos/seed/kurta1/300/300',
    price: 999,
    originalPrice: 1499,
    discount: 33,
    rating: 4.3,
    reviewsCount: 95,
  },
];

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

  // In a real app, you'd fetch product details based on 'id'
  // For now, we'll use the sampleProductDetail and assume the ID matches for demonstration
  const product = sampleProductDetail; // In a real app, this would be dynamic based on 'id'

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Product not found.</p>
      </div>
    );
  }

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
            <h2 className="text-3xl font-bold text-foreground mb-2">{product.name}</h2>
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
          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">Select Size</Label>
            <RadioGroup
              onValueChange={setSelectedSize}
              value={selectedSize}
              className="flex flex-wrap gap-2"
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

          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Add to Cart
          </Button>

          {/* Measurement Form */}
          <MeasurementForm />
        </div>

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