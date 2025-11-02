import React from 'react';
import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import ProductCard from '@/components/ProductCard';
import BottomNavigation from '@/components/BottomNavigation';
import { MadeWithDyad } from "@/components/made-with-dyad";

const sampleProducts = [
  {
    id: '1',
    name: 'Stylish Cotton Shirt',
    imageUrl: 'https://via.placeholder.com/300x300/A0D995/FFFFFF?text=Shirt+1',
    price: 899,
    originalPrice: 1299,
    discount: 30,
    rating: 4.5,
    reviewsCount: 120,
    recentPurchase: 'Rahul purchased 5 days ago',
  },
  {
    id: '2',
    name: 'Premium Linen Pants',
    imageUrl: 'https://via.placeholder.com/300x300/FFC7EA/FFFFFF?text=Pant+1',
    price: 1499,
    originalPrice: 1999,
    discount: 25,
    rating: 4.2,
    reviewsCount: 85,
    recentPurchase: 'Anjali purchased 2 hours ago',
  },
  {
    id: '3',
    name: 'Elegant Waistcoat',
    imageUrl: 'https://via.placeholder.com/300x300/B0E0E6/FFFFFF?text=Waistcoat+1',
    price: 1199,
    originalPrice: 1599,
    discount: 25,
    rating: 4.7,
    reviewsCount: 60,
    recentPurchase: 'Amit purchased yesterday',
  },
  {
    id: '4',
    name: 'Traditional Kurta',
    imageUrl: 'https://via.placeholder.com/300x300/FFDAB9/FFFFFF?text=Kurta+1',
    price: 999,
    originalPrice: 1499,
    discount: 33,
    rating: 4.3,
    reviewsCount: 95,
    recentPurchase: 'Pooja purchased 3 days ago',
  },
  {
    id: '5',
    name: 'Formal Blazer',
    imageUrl: 'https://via.placeholder.com/300x300/ADD8E6/FFFFFF?text=Blazer+1',
    price: 2499,
    originalPrice: 3499,
    discount: 28,
    rating: 4.8,
    reviewsCount: 45,
    recentPurchase: 'Vikas purchased 1 week ago',
  },
  {
    id: '6',
    name: 'Casual Denim Shirt',
    imageUrl: 'https://via.placeholder.com/300x300/87CEEB/FFFFFF?text=Denim+Shirt+1',
    price: 799,
    originalPrice: 1099,
    discount: 27,
    rating: 4.1,
    reviewsCount: 110,
    recentPurchase: 'Neha purchased just now',
  },
];

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0"> {/* Added padding-bottom for mobile nav */}
      <Header />
      <main className="container mx-auto p-0 md:p-4">
        <div className="space-y-6">
          <HeroCarousel />
          <SearchBar />
          <CategoryChips />

          <section className="px-4 md:px-0">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Popular Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sampleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <BottomNavigation />
      <MadeWithDyad />
    </div>
  );
};

export default Index;