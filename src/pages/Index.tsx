import React, { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import ProductCard from '@/components/ProductCard';
import BottomNavigation from '@/components/BottomNavigation';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from 'react-router-dom';
import { getProducts, Product } from '@/utils/products';
import BrandRibbon from '@/components/BrandRibbon'; // Import BrandRibbon

const Index: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    const fetchedProducts = await getProducts();
    setProducts(fetchedProducts);
    setLoading(false);
  };

  useEffect(() => {
    if (activeSearchTerm === '') {
      fetchProducts(); // Fetch popular products only if no search is active
    }
  }, [activeSearchTerm]);

  const handleSearchResults = useCallback((results: Product[], searchTerm: string) => {
    setSearchResults(results);
    setActiveSearchTerm(searchTerm);
  }, []);

  const productsToDisplay = activeSearchTerm.trim() !== '' ? searchResults : products;
  const displaySectionTitle = activeSearchTerm.trim() !== '' ? `Search Results for "${activeSearchTerm}"` : 'Popular Products';
  const displayMessage = activeSearchTerm.trim() !== '' ? 'No products found matching your search.' : 'No products available.';

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-0 md:p-4">
        <div className="space-y-6">
          <BrandRibbon />
          <HeroCarousel />
          <SearchBar onSearch={handleSearchResults} />
          <CategoryChips />

          <section className="px-4 md:px-0">
            <h2 className="text-2xl font-bold mb-4 text-foreground">{displaySectionTitle}</h2>
            {loading && activeSearchTerm === '' ? ( // Only show loading for popular products, not for search
              <p className="text-center text-muted-foreground">Loading products...</p>
            ) : productsToDisplay.length === 0 ? (
              <div className="text-center p-8 bg-card rounded-lg shadow-sm">
                <p className="text-lg text-muted-foreground mb-4">{displayMessage}</p>
                {activeSearchTerm !== '' && (
                  <Link to="/" className="text-primary hover:underline" onClick={() => setActiveSearchTerm('')}>
                    Clear Search & View All Products
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {productsToDisplay.map((product) => (
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