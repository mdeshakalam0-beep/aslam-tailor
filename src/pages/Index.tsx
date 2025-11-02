import React from 'react';
import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import ProductCard from '@/components/ProductCard';
import BottomNavigation from '@/components/BottomNavigation';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from 'react-router-dom';
import { getSampleProducts } from '@/utils/products'; // Import centralized product data

const Index: React.FC = () => {
  const sampleProducts = getSampleProducts();

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
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
                <Link to={`/products/${product.id}`} key={product.id} className="block">
                  <ProductCard product={product} />
                </Link>
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