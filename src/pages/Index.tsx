import React, { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import ProductCard from '@/components/ProductCard';
import BottomNavigation from '@/components/BottomNavigation';
import { Link } from 'react-router-dom';
import { getProducts, Product } from '@/utils/products';
import BrandRibbon from '@/components/BrandRibbon';

const Index: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [heroActive, setHeroActive] = useState(false);
  
  // New State for stitching toggle
  const [viewWithStitching, setViewWithStitching] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const fetchedProducts = await getProducts();
    setProducts(fetchedProducts);
    setLoading(false);
  };

  useEffect(() => {
    if (activeSearchTerm === '') {
      fetchProducts();
    }
  }, [activeSearchTerm]);

  const handleSearchResults = useCallback(
    (results: Product[], searchTerm: string) => {
      setSearchResults(results);
      setActiveSearchTerm(searchTerm);
    },
    []
  );

  const productsToDisplay =
    activeSearchTerm.trim() !== '' ? searchResults : products;

  const displaySectionTitle =
    activeSearchTerm.trim() !== ''
      ? `Search Results for "${activeSearchTerm}"`
      : 'Popular Products';

  const displayMessage =
    activeSearchTerm.trim() !== ''
      ? 'No products found matching your search.'
      : 'No products available.';

  return (
    <div className="min-h-screen bg-bg-offwhite pb-16 md:pb-0">
      <Header />

      <main className="container mx-auto px-0 md:px-2">
        <div className="space-y-8">
          <BrandRibbon />

          {/* HERO CLEAN WRAPPER */}
          <div
            onClick={() => setHeroActive(true)}
            className={`relative rounded-3xl overflow-hidden cursor-pointer shadow-elev transition ${
              heroActive ? '' : 'hero-clean'
            }`}
          >
            <HeroCarousel />
          </div>

          <div className="px-4 md:px-0">
            <SearchBar onSearch={handleSearchResults} />
          </div>

          <div className="px-4 md:px-0">
            <CategoryChips />
          </div>

          <section className="px-4 md:px-0">
            {/* Header Area with Stitching Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                {displaySectionTitle}
              </h2>

              {/* STITCHING TOGGLE BUTTON */}
              <div 
                className="flex items-center bg-white border border-card-border rounded-full p-1 cursor-pointer w-fit shadow-sm"
                onClick={() => setViewWithStitching(!viewWithStitching)}
              >
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !viewWithStitching 
                      ? 'bg-accent-rose text-white shadow-md' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Cloth Only
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    viewWithStitching 
                      ? 'bg-accent-rose text-white shadow-md' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  With Stitching
                </button>
              </div>
            </div>

            {loading && activeSearchTerm === '' ? (
              <p className="text-text-secondary">
                Loading products...
              </p>
            ) : productsToDisplay.length === 0 ? (
              <div className="text-center p-10 bg-white rounded-2xl shadow-elev border border-card-border">
                <p className="text-lg text-text-secondary mb-5">
                  {displayMessage}
                </p>

                {activeSearchTerm !== '' && (
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center rounded-full bg-accent-rose px-8 py-3 text-white hover:bg-accent-dark transition"
                    onClick={() => setActiveSearchTerm('')}
                  >
                    Clear Search & View All Products
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
                {productsToDisplay.map((product) => (
                  <Link
                    to={`/products/${product.id}`}
                    key={product.id}
                    state={{ withStitching: viewWithStitching }} // Passing choice to details page
                    className="block"
                  >
                    {/* Passing the stitching state to ProductCard to update price display */}
                    <ProductCard 
                      product={product} 
                      showStitchingPrice={viewWithStitching} 
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNavigation />

      {/* LOCAL STYLE TO CONTROL HERO OVERLAY */}
      <style>{`
        .hero-clean *[class*="overlay"],
        .hero-clean *[class*="title"],
        .hero-clean *[class*="button"],
        .hero-clean *[class*="cta"] {
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
};

export default Index;