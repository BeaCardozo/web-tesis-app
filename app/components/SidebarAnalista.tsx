'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  LogOut,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Store,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { mockSupermarkets } from '../data/mockData';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/analista/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: 'Cargar Datos',
    href: '/analista/cargas',
    icon: <Upload size={20} />,
  },
];

export function SidebarAnalista() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isCollapsed, toggle, isMobile, setIsCollapsed } = useSidebar();

  // Obtener el supermercado del analista
  const supermarket = mockSupermarkets.find(s => s.id === user?.supermarketId);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      {isMobile && isCollapsed && (
        <button
          onClick={toggle}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
      )}

      {/* Overlay para móvil */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-white shadow-lg z-50
          transition-all duration-300 ease-in-out
          ${isMobile
            ? isCollapsed
              ? '-translate-x-full w-64'
              : 'translate-x-0 w-64'
            : isCollapsed
              ? 'w-20'
              : 'w-64'
          }
        `}
      >
        {/* Header con logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-button-green" size={28} />
              <span className="font-bold text-lg">
                <span className="text-button-green">Caracas</span>
                <span className="text-accent-green-dark">Ahorra</span>
              </span>
            </div>
          )}
          {isCollapsed && !isMobile && (
            <ShoppingCart className="text-button-green mx-auto" size={28} />
          )}
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            {isMobile ? (
              <ChevronLeft size={18} />
            ) : isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* Información del usuario y supermercado */}
        <div className={`p-4 border-b border-gray-100 ${isCollapsed && !isMobile ? 'text-center' : ''}`}>
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white
            ${isCollapsed && !isMobile ? 'mx-auto' : ''}
          `} style={{ backgroundColor: supermarket?.color || '#77A14B' }}>
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="mt-2">
              <p className="font-medium text-gray-800 text-sm truncate">
                {user?.name || 'Analista'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'analista@email.com'}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Store size={14} className="text-gray-400" />
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${supermarket?.color}20`,
                    color: supermarket?.color
                  }}
                >
                  {supermarket?.name || 'Supermercado'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navegación */}
        <nav className="p-3 flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200
                      ${isActive
                        ? 'bg-primary text-accent-green-dark font-medium shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                      ${isCollapsed && !isMobile ? 'justify-center' : ''}
                    `}
                    title={isCollapsed && !isMobile ? item.name : undefined}
                  >
                    <span className={isActive ? 'text-accent-green-dark' : ''}>
                      {item.icon}
                    </span>
                    {(!isCollapsed || isMobile) && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-red-600 hover:bg-red-50 transition-colors
              ${isCollapsed && !isMobile ? 'justify-center' : ''}
            `}
            title={isCollapsed && !isMobile ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={20} />
            {(!isCollapsed || isMobile) && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
