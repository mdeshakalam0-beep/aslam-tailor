import React from 'react';
import { Heart, UserCog } from 'lucide-react'; // Removed ShoppingCart icon
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useFavoritesCount } from '@/hooks/use-favorites-count';
import { useCartCount } from '@/hooks/use-cart-count'; // Still need this for other components if they use it
import { useSession } from '@/components/SessionContextProvider';
import NotificationDropdown from '@/components/NotificationDropdown';

const Header: React.FC = () => {
  const favoritesCount = useFavoritesCount();
  // const cartCount = useCartCount(); // Cart count is no longer needed in Header

  const { userRole } = useSession();

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
        {userRole === 'admin' && (
          <Link to="/admin" className="relative">
            <UserCog className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
          </Link>
        )}
        <Link to="/favorites" className="relative">
          <Heart className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
          {favoritesCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs">
              {favoritesCount}
            </Badge>
          )}
        </Link>
        {/* Cart icon removed from here */}
        <NotificationDropdown />
      </div>
    </header>
  );
};

export default Header;