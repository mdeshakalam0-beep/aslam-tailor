import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import ProductCard from '@/components/ProductCard';
import { getProductsByCategory, Product } from '@/utils/products';
import { getCategoryById, Category } from '@/utils/categories';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CategoryProducts: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      setLoading(true);
      
      const fetchedCategory = await getCategoryById(categoryId);
      setCategory(fetchedCategory);

      const fetchedProducts = await getProductsByCategory(categoryId);
      setProducts(fetchedProducts);
      setLoading(false);
    };
    fetchData();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-off-white-page-bg">
        <p className="text-text-primary-heading">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white-page-bg pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-0 md:p-4">
        <div className="flex items-center p-4 md:p-0 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-text-primary-heading ml-2">
            {category ? category.name : 'Category'} Products
          </h1>
        </div>

        <section className="px-4 md:px-0">
          {products.length === 0 ? (
            <div className="text-center p-8 bg-card rounded-default shadow-elev border border-card-border">
              <p className="text-lg text-text-secondary-body mb-4">No products found in this category.</p>
              <Link to="/" className="text-primary hover:underline">
                Continue Shopping
              </Link>
            </div>
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
      </main>
      <BottomNavigation />
    </div>
  );
};

export default CategoryProducts;