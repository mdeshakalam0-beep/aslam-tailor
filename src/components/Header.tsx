import React, { useState, useEffect } from 'react';
import { Heart, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useFavoritesCount } from '@/hooks/use-favorites-count';
import { useSession } from '@/components/SessionContextProvider';
import NotificationDropdown from '@/components/NotificationDropdown';
import { getAppSettings } from '@/utils/appSettings'; // Import getAppSettings

const Header: React.FC = () => {
  const favoritesCount = useFavoritesCount();
  const { userRole } = useSession();
  const [shopLogoUrl, setShopLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopLogo = async () => {
      const settings = await getAppSettings();
      const logoSetting = settings.find(setting => setting.key === 'shop_logo_url');
      if (logoSetting && logoSetting.value) {
        setShopLogoUrl(logoSetting.value);
      }
    };
    fetchShopLogo();
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-off-white-page-bg border-b border-card-border sticky top-0 z-10">
      <div className="flex items-center space-x-2">
        {shopLogoUrl ? (
          <img src={shopLogoUrl} alt="Shop Logo" className="w-10 h-10 object-contain" />
        ) : (
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
            A
          </div>
        )}
        <div className="flex flex-col items-start">
          <Link to="/" className="text-xl font-bold text-text-primary-heading leading-none">
            ASLAM TAILOR
          </Link>
          <span className="text-sm text-text-secondary-body leading-none mt-0.5">& Clothes</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {userRole === 'admin' && (
          <Link to="/admin" className="relative">
            <UserCog className="h-6 w-6 text-text-secondary-body hover:text-primary cursor-pointer" />
          </Link>
        )}
        <Link to="/favorites" className="relative">
          <Heart className="h-6 w-6 text-text-secondary-body hover:text-primary cursor-pointer" />
          {favoritesCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs bg-accent-rose text-white">
              {favoritesCount}
            </Badge>
          )}
        </Link>
        <NotificationDropdown />
      </div>
    </header>
  );
};

export default Header;