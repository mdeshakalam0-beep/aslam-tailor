import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

/**
 * Professional Admin Layout
 * - Responsive sidebar (collapsible on mobile)
 * - Top header with title + user avatar placeholder
 * - Uses Tailwind utility classes (repo has tailwind.config.ts)
 *
 * NOTE:
 * - If your project doesn't use Tailwind, either add equivalent CSS
 *   or adjust classes accordingly.
 */

const SidebarLink: React.FC<{ to: string; label: string }> = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-sm font-medium ${
          isActive
            ? "bg-slate-800 text-white"
            : "text-slate-200 hover:bg-slate-700 hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
};

const AdminLayout: React.FC = () => {
  const [open, setOpen] = useState(false); // mobile sidebar toggle

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-slate-900 text-slate-100">
          <div className="flex items-center h-16 px-4 border-b border-slate-800">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                A
              </div>
              <span className="text-lg font-semibold">Admin</span>
            </Link>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <SidebarLink to="/admin" label="Dashboard" />
            <SidebarLink to="/admin/products" label="Products" />
            <SidebarLink to="/admin/orders" label="Orders" />
            <SidebarLink to="/admin/users" label="Users" />
            <SidebarLink to="/admin/categories" label="Categories" />
            <SidebarLink to="/admin/measurement-types" label="Measurement types" />
            <SidebarLink to="/admin/notifications" label="Notifications" />
            <SidebarLink to="/admin/banners" label="Banners" />
            <SidebarLink to="/admin/brands" label="Brands" />
            <SidebarLink to="/admin/settings" label="Settings" />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <Link to="/"
              className="w-full block text-center px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              View Store
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar (overlay) */}
      <div className={`fixed inset-0 z-40 md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-slate-100 transform transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center h-16 px-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">A</div>
              <span className="text-lg font-semibold">Admin</span>
            </div>
          </div>

          <nav className="px-2 py-4 space-y-1 overflow-y-auto">
            <SidebarLink to="/admin" label="Dashboard" />
            <SidebarLink to="/admin/products" label="Products" />
            <SidebarLink to="/admin/orders" label="Orders" />
            <SidebarLink to="/admin/users" label="Users" />
            <SidebarLink to="/admin/categories" label="Categories" />
            <SidebarLink to="/admin/measurement-types" label="Measurement types" />
            <SidebarLink to="/admin/notifications" label="Notifications" />
            <SidebarLink to="/admin/banners" label="Banners" />
            <SidebarLink to="/admin/brands" label="Brands" />
            <SidebarLink to="/admin/settings" label="Settings" />
          </nav>
        </aside>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                  onClick={() => setOpen(true)}
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:bg-slate-100"
                  aria-label="Open sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <h1 className="text-lg font-semibold text-slate-900">Admin Dashboard</h1>
              </div>

              <div className="flex items-center gap-4">
                {/* Search (optional) */}
                <div className="hidden sm:block">
                  <input
                    type="search"
                    placeholder="Search..."
                    className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Search"
                  />
                </div>

                {/* User / avatar */}
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-600">Hello, Admin</div>
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center">AD</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page container */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-[1400px] mx-auto">
            {/* Breadcrumb or top controls can go here */}
            <div className="mb-4">
              {/* example small breadcrumb */}
              <div className="text-sm text-slate-500">Admin / Dashboard</div>
            </div>

            {/* Actual admin pages render here */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Optional footer */}
        <footer className="border-t border-slate-200 p-3 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Aslam Tailor — Admin
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
