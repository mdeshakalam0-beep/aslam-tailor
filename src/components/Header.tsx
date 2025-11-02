import React from 'react';
import { Heart, Bell, ShoppingCart } from 'lucide-react'; // Import ShoppingCart icon
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge'; // Import Badge component
import { useFavoritesCount } from '@/hooks/use-favorites-count';
import { useCartCount } from '@/hooks/use-cart-count';

const Header: React.FC = () => {
  const favoritesCount = useFavoritesCount();
  const cartCount = useCartCount();

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border sticky top-0 z-10">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
          A
        </div>
        <Link to="/" className="text-xl font-bold text-foreground">
          ASLAM TAILOR
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/favorites" className="relative">
          <Heart className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
          {favoritesCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs">
              {favoritesCount}
            </Badge>
          )}
        </Link>
        <Link to="/cart" className="relative"> {/* Link ShoppingCart icon to Cart page */}
          <ShoppingCart className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
          {cartCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs">
              {cartCount}
            </Badge>
          )}
        </Link>
        <Bell className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;