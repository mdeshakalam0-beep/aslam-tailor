import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'; // Import Outlet
import { Home, Package, ShoppingBag, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSession } from '@/components/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/admin' },
  { name: 'Products', icon: Package, path: '/admin/products' },
  { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
  { name: 'Users', icon: Users, path: '/admin/users' },
  { name: 'App Settings', icon: Settings, path: '/admin/settings' },
];

const AdminLayout: React.FC = () => { // Removed AdminLayoutProps as children is no longer directly used
  const { session, userRole } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!session) {
      navigate('/login');
    } else if (userRole !== 'admin') {
      navigate('/');
    }
  }, [session, userRole, navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showSuccess('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      showError('Failed to log out.');
    }
  };

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const activeItem = navItems.find(item => 
      item.path === currentPath || 
      (item.path !== '/admin' && currentPath.startsWith(item.path + '/')) ||
      (item.path === '/admin' && currentPath === '/admin')
    );
    return activeItem ? activeItem.name : 'Admin Dashboard';
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
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 border-r border-sidebar-border flex flex-col">
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
          <h1 className="text-2xl font-bold text-foreground">
            {getPageTitle()}
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Welcome, Admin!</span>
            {/* Could add admin profile dropdown here */}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet /> {/* This will render the matched child route component */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;