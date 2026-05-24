// ============================================
// TIPOS COMPARTIDOS DEL FRONTEND
// ============================================
// Display types (rol en español). Los DTOs del backend viven en `lib/api.ts`.

export type UserRole = 'Administrador' | 'Usuario' | 'Analista';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: string;
  status: 'activo' | 'inactivo';
  avatar?: string;
  supermarketId?: string;
}

// ============================================
// AUDITORÍA (modelo de display)
// ============================================

export type AuditAction =
  | 'user_login'
  | 'user_logout'
  | 'auth_refresh'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_status_changed'
  | 'user_supermarket_assigned'
  | 'pipeline_success'
  | 'pipeline_failed'
  | 'data_uploaded'
  | 'data_deleted'
  | 'system_event';

export interface AuditLog {
  id: string;
  action: AuditAction;
  userId: string;
  userName: string;
  userRole: UserRole;
  targetType?: 'user' | 'supermarket' | 'product' | 'upload' | 'pipeline';
  targetId?: string;
  targetName?: string;
  details?: string;
  ipAddress: string;
  timestamp: string;
}
