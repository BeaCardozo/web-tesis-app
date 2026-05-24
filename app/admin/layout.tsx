import { RoleLayout } from '../components/RoleLayout';
import { ADMIN_NAV_ITEMS } from '../components/RoleSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayout
      role="Administrador"
      sidebarItems={ADMIN_NAV_ITEMS}
      sidebarSubtitle="Panel de administracion"
      showFxRate
    >
      {children}
    </RoleLayout>
  );
}
