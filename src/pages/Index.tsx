import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import ProductCard from '@/components/ProductCard';
import BottomNavigation from '@/components/BottomNavigation';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from 'react-router-dom';
import { getProducts, Product } from '@/utils/products'; // Import getProducts and Product interface

const Index: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      setLoading(false);
    };
    fetchProducts();
  }, []);

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
            {loading ? (
              <p className="text-center text-muted-foreground">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-center text-muted-foreground">No products available.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <Link to={`/products/${product.id}`} key={product.id} className="block">
                    <ProductCard product={product} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <BottomNavigation />
      <MadeWithDyad />
    </div>
  );
};

export default Index;