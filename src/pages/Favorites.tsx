import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ProductCard from '@/components/ProductCard';
import { useSession } from '@/components/SessionContextProvider';
import { getFavorites } from '@/utils/favorites';
import { getProductById } from '@/utils/products';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
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
}

const Favorites: React.FC = () => {
  const { session } = useSession();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (!session?.user) {
        setLoading(false);
        setFavoriteProducts([]);
        return;
      }

      setLoading(true);
      const favoriteProductIds = await getFavorites(session.user.id);
      const products = favoriteProductIds
        .map(id => getProductById(id))
        .filter((product): product is Product => product !== undefined); // Filter out undefined products

      setFavoriteProducts(products);
      setLoading(false);
    };

    fetchFavoriteProducts();
  }, [session]);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-foreground text-center">Your Favorites</h1>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading favorites...</p>
        ) : favoriteProducts.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-lg shadow-sm">
            <p className="text-lg text-muted-foreground mb-4">You haven't favorited any products yet.</p>
            <Link to="/" className="text-primary hover:underline">
              Start Browsing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {favoriteProducts.map((product) => (
              <Link to={`/products/${product.id}`} key={product.id} className="block">
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Favorites;