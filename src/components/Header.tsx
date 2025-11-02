import React from 'react';
import { Heart, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border sticky top-0 z-10">
      <div className="flex items-center space-x-2">
        {/* App Logo - Placeholder for now, can be an image later */}
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
          A
        </div>
        <Link to="/" className="text-xl font-bold text-foreground">
          ASLAM TAILOR
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/favorites"> {/* Link Heart icon to Favorites page */}
          <Heart className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
        </Link>
        <Bell className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;