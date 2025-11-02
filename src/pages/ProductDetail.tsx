import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // In a real application, you would fetch product details using the 'id'
  // For now, we'll just display the ID.
  const productName = `Product ${id}`;
  const productDescription = `Details for ${productName}. This is a placeholder for a specific product page.`;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground ml-2">{productName}</h1>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <img
            src={`https://picsum.photos/seed/product${id}/600/400`} // Placeholder image
            alt={productName}
            className="w-full h-64 object-cover rounded-md mb-4"
          />
          <h2 className="text-xl font-semibold text-foreground mb-2">{productName}</h2>
          <p className="text-muted-foreground mb-4">{productDescription}</p>
          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Add to Cart
          </Button>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default ProductDetail;