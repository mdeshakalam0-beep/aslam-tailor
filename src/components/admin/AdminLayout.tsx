import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Home, Package, ShoppingBag, Users, Settings, LogOut, Image, BellRing, LayoutList, Ruler, Megaphone, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSession } from '@/components/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Import Sheet components

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/admin' },
  { name: 'Products', icon: Package, path: '/admin/products' },
  { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
  { name: 'Users', icon: Users, path: '/admin/users' },
  { name: 'Categories', icon: LayoutList, path: '/admin/categories' },
  { name: 'Measurement Types', icon: Ruler, path: '/admin/measurement-types' },
  { name: 'Hero Banners', icon: Image, path: '/admin/banners' },
  { name: 'App Pop-ups', icon: Megaphone, path: '/admin/popups' }, 
  { name: 'Notifications', icon: BellRing, path: '/admin/notifications' },
  { name: 'App Settings', icon: Settings, path: '/admin/settings' },
];

const AdminLayout: React.FC = () => {
  const { session, userRole } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to get the current page title based on the path
  const getPageTitle = () => {
    const currentPath = location.pathname;
    const activeItem = navItems.find(item => 
      currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path + '/'))
    );
    return activeItem ? activeItem.name : 'Admin Panel';
  };

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!session) {
      navigate('/login');
    } else if (userRole !== 'admin') {
      navigate('/');
    }
  }, [session, userRole, navigate]);

  const handleLogout = async () => {
    // If there's no active session according to our context,
    // the user is effectively logged out or their session expired.
    if (!session) {
      showSuccess('You are already logged out.');
      navigate('/login');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // If the error indicates a missing session, treat it as a successful logout
        // as the user is no longer authenticated from the client's perspective.
        if (error.message.includes('Auth session missing')) {
          showSuccess('Logged out successfully!');
          navigate('/login');
          return;
        }
        throw error;
      }
      showSuccess('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      showError('Failed to log out.');
    }
  };

  if (!session || userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Access Denied. You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground p-4 border-r border-sidebar-border flex-col">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
            A
          </div>
          <span className="text-xl font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 p-2 rounded-md transition-colors duration-200",
                location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path + '/')) || (item.path === '/admin' && location.pathname === '/admin')
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-card p-4 border-b border-border flex items-center justify-between">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4 bg-sidebar text-sidebar-foreground flex flex-col">
                {/* Mobile Sidebar Content */}
                <div className="flex items-center space-x-2 mb-8">
                  <div className="w-8 h-8 bg-sidebar-primary text-sidebar-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                    A
                  </div>
                  <span className="text-xl font-bold">Admin Panel</span>
                </div>
                <nav className="flex-1 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded-md transition-colors duration-200",
                        location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path + '/')) || (item.path === '/admin' && location.pathname === '/admin')
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <h1 className="text-2xl font-bold text-foreground md:ml-0 ml-4"> {/* Adjust margin for mobile */}
            {getPageTitle()}
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Welcome, Admin!</span>
            {/* Could add admin profile dropdown here */}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;