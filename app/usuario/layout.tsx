import { RoleLayout } from '../components/RoleLayout';
import { USUARIO_NAV_ITEMS } from '../components/RoleSidebar';

export default function UsuarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayout
      role="Usuario"
      sidebarItems={USUARIO_NAV_ITEMS}
      sidebarSubtitle="Compara y ahorra"
      matchSubpaths
    >
      {children}
    </RoleLayout>
  );
}
