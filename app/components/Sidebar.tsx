'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  LogOut,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Menu,
  Store,
  ClipboardList,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={22} /> },
  { name: 'Usuarios', href: '/admin/usuarios', icon: <Users size={22} /> },
  { name: 'Supermercados', href: '/admin/supermercados', icon: <Store size={22} /> },
  { name: 'Auditoria', href: '/admin/auditoria', icon: <ClipboardList size={22} /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isCollapsed, toggle, isMobile, setIsCollapsed } = useSidebar();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const closeSidebar = () => {
    if (isMobile) setIsCollapsed(true);
  };

  const expanded = !isCollapsed || isMobile;

  return (
    <>
      {/* Boton hamburguesa movil */}
      {isMobile && isCollapsed && (
        <button
          onClick={toggle}
          className="fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
          aria-label="Abrir menu"
        >
          <Menu size={22} className="text-gray-600" />
        </button>
      )}

      {/* Overlay movil */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-white border-r border-gray-200/60 z-50
          transition-all duration-300 ease-in-out flex flex-col
          ${isMobile
            ? isCollapsed ? '-translate-x-full w-[272px]' : 'translate-x-0 w-[272px]'
            : isCollapsed ? 'w-20' : 'w-[272px]'
          }
        `}
      >
        {/* Logo */}
        <div className={`shrink-0 ${expanded ? 'px-6 py-6' : 'px-3 py-6 flex justify-center'}`}>
          <div className={`flex items-center ${expanded ? 'gap-3' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-button-green to-accent-green-dark rounded-xl flex items-center justify-center shrink-0">
              <ShoppingCart className="text-white" size={20} />
            </div>
            {expanded && (
              <div>
                <p className="font-bold text-[17px] tracking-tight leading-tight">
                  <span className="text-gray-900">Caracas</span>
                  <span className="text-button-green">Ahorra</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Panel de administracion</p>
              </div>
            )}
          </div>
          {isMobile && expanded && (
            <button onClick={closeSidebar} className="absolute top-5 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Separador */}
        <div className={`h-px bg-gray-100 shrink-0 ${expanded ? 'mx-6' : 'mx-4'}`} />

        {/* Navegacion */}
        <nav className="flex-1 px-3 pt-8 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={`
                      flex items-center gap-4 py-3.5 rounded-2xl
                      transition-all duration-200
                      ${isActive
                        ? 'bg-gray-50 text-gray-900 font-semibold'
                        : 'text-gray-500 hover:bg-gray-50/80 hover:text-gray-700'
                      }
                      ${expanded ? 'px-4' : 'justify-center px-3'}
                    `}
                    title={!expanded ? item.name : undefined}
                  >
                    <span className={`shrink-0 ${isActive ? 'text-button-green' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    {expanded && <span className="text-[15px]">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Cerrar sesion */}
        <div className="px-3 pb-6 pt-2 shrink-0">
          <div className={`h-px bg-gray-100 mb-4 ${expanded ? 'mx-3' : 'mx-2'}`} />
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-4 py-3.5 rounded-2xl
              text-gray-500 hover:bg-gray-50/80 hover:text-gray-700 transition-all duration-200
              ${expanded ? 'px-4' : 'justify-center px-3'}
            `}
            title={!expanded ? 'Cerrar sesion' : undefined}
          >
            <LogOut size={22} className="shrink-0" />
            {expanded && <span className="text-[15px]">Cerrar sesion</span>}
          </button>
        </div>

        {/* Toggle flotante (solo desktop) */}
        {!isMobile && (
          <button
            onClick={toggle}
            className="absolute -right-3 top-8 w-6 h-6 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-600"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </aside>
    </>
  );
}
