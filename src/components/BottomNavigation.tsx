import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Ruler, ShoppingCart, User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge'; // Import Badge component
import { useFavoritesCount } from '@/hooks/use-favorites-count';
import { useCartCount } from '@/hooks/use-cart-count';

const navItems = [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'Orders', icon: ShoppingBag, path: '/orders' },
  { name: 'Measurement', icon: Ruler, path: '/measurement' },
  { name: 'Favorites', icon: Heart, path: '/favorites', showCount: true }, // Added showCount for badge
  { name: 'Cart', icon: ShoppingCart, path: '/cart', showCount: true }, // Added showCount for badge
  { name: 'Profile', icon: User, path: '/profile' },
];

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const favoritesCount = useFavoritesCount();
  const cartCount = useCartCount();

  const getCount = (itemName: string) => {
    if (itemName === 'Favorites') return favoritesCount;
    if (itemName === 'Cart') return cartCount;
    return 0;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 md:hidden">
      <div className="flex justify-around h-16">
        {navItems.map((item) => {
          const count = getCount(item.name);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200 px-2",
                location.pathname === item.path ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              {item.name}
              {item.showCount && count > 0 && (
                <Badge variant="destructive" className="absolute top-1 right-0 h-4 w-4 p-0 flex items-center justify-center text-xs">
                  {count}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;