
import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { BarChart, Package, Tag, FileText, ShoppingBag, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile on mount and on window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transition-transform duration-300 transform",
          isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Sistema de Compras</h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              <NavItem to="/" icon={<BarChart size={20} />} label="Dashboard" />
              <NavItem to="/brands" icon={<Tag size={20} />} label="Marcas" />
              <NavItem to="/products" icon={<Package size={20} />} label="Produtos" />
              <NavItem to="/requests" icon={<ShoppingBag size={20} />} label="Solicitações" />
              <NavItem to="/reports" icon={<FileText size={20} />} label="Relatórios" />
              <NavItem to="/api-endpoint" icon={<Globe size={20} />} label="API/Webhook" />
            </ul>
          </nav>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              © 2025 Sistema de Compras
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "md:ml-64" : ""
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Menu Toggle */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            {/* Page Title - will be dynamic in real implementation */}
            <div className="ml-4 text-lg font-medium">Sistema de Compras</div>
            
            {/* User Menu - placeholder */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                U
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// NavItem component
type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
};

const NavItem = ({ to, icon, label }: NavItemProps) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-4 py-3 rounded-md transition-colors",
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        )
      }
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </NavLink>
  </li>
);

export default Layout;
