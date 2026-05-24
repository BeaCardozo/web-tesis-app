import { RoleLayout } from '../components/RoleLayout';
import { ANALISTA_NAV_ITEMS } from '../components/RoleSidebar';

export default function AnalistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayout
      role="Analista"
      sidebarItems={ANALISTA_NAV_ITEMS}
      sidebarSubtitle="Panel de analisis"
      showFxRate
    >
      {children}
    </RoleLayout>
  );
}
