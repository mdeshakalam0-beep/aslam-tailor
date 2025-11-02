import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Ruler, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'होम', icon: Home, path: '/' },
  { name: 'ऑर्डर्स', icon: ShoppingBag, path: '/orders' },
  { name: 'माप', icon: Ruler, path: '/measurement' },
  { name: 'कार्ट', icon: ShoppingCart, path: '/cart' },
  { name: 'प्रोफ़ाइल', icon: User, path: '/profile' },
];

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 md:hidden">
      <div className="flex justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200",
              location.pathname === item.path ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;