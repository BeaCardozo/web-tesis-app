import type { AuditLog, AuditAction, UserRole } from '../data/mockData';
import type { ApiAuditEvent } from './api';

type BackendRoleKey = 'admin' | 'partner' | 'consumer';

/** Claves de tipo tal como llegan desde el backend (`AuditEventV1.type`). */
const TYPE_TO_ACTION: Record<string, AuditAction> = {
  // auth
  'auth.login.success': 'user_login',
  'auth.logout': 'user_logout',
  'auth.refresh.success': 'auth_refresh',
  // admin / users
  'admin.user.created': 'user_created',
  'admin.user.updated': 'user_updated',
  'admin.user.removed': 'user_deleted',
  'admin.user.status_toggled': 'user_status_changed',
  'admin.user.supermarket_assigned': 'user_supermarket_assigned',
  // pipeline (ca-scraper)
  'pipeline.dag.completed': 'pipeline_success',
  'pipeline.dag.failed': 'pipeline_failed',
};

function mapBackendRoleToDisplay(role: string | undefined): UserRole {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'partner':
      return 'Analista';
    case 'consumer':
      return 'Usuario';
    default:
      return 'Usuario';
  }
}

function pickActorRole(payload: ApiAuditEvent['payload']): UserRole {
  const ar = payload?.actorRole;
  if (typeof ar === 'string') return mapBackendRoleToDisplay(ar);
  const role = payload?.role;
  if (typeof role === 'string' && ['admin', 'partner', 'consumer'].includes(role)) {
    return mapBackendRoleToDisplay(role as BackendRoleKey);
  }
  return 'Usuario';
}

function buildDetails(event: ApiAuditEvent): string {
  const p = event.payload;
  if (!p || typeof p !== 'object') return '';
  const skip = new Set(['actorRole']);
  const parts: string[] = [];
  for (const [k, v] of Object.entries(p)) {
    if (skip.has(k)) continue;
    if (v === undefined || v === null) continue;
    if (typeof v === 'object') {
      parts.push(`${k}: ${JSON.stringify(v)}`);
    } else {
      parts.push(`${k}: ${String(v)}`);
    }
  }
  return parts.join(' · ') || '';
}

function buildTarget(event: ApiAuditEvent): Pick<AuditLog, 'targetType' | 'targetId' | 'targetName'> {
  const r = event.resource;
  const p = event.payload ?? {};
  const ctx = event.context;

  if (event.type.startsWith('pipeline.')) {
    const dagId = typeof ctx?.dagId === 'string' ? ctx.dagId : undefined;
    const runId = typeof ctx?.runId === 'string' ? ctx.runId : undefined;
    return {
      targetType: 'pipeline',
      targetId: runId ?? dagId,
      targetName: dagId ?? runId ?? (typeof p.dagId === 'string' ? p.dagId : undefined),
    };
  }

  if (r?.kind === 'user') {
    const email = typeof p.email === 'string' ? p.email : undefined;
    return {
      targetType: 'user',
      targetId: r.id,
      targetName: email ?? (r.id ? `Usuario #${r.id}` : undefined),
    };
  }

  if (r?.kind === 'supermarket') {
    // Si el payload trae nombre/slug (lo agregamos en Fase 3) lo preferimos.
    const name = typeof p.name === 'string' ? p.name : undefined;
    const slug = typeof p.slug === 'string' ? p.slug : undefined;
    return {
      targetType: 'supermarket',
      targetId: r.id,
      targetName: name ?? slug ?? (r.id ? `Supermercado #${r.id}` : undefined),
    };
  }

  return {};
}

export function mapAuditEventToAuditLog(event: ApiAuditEvent): AuditLog {
  const payload = event.payload as Record<string, unknown> | undefined;
  const action: AuditAction = TYPE_TO_ACTION[event.type] ?? 'system_event';
  const userName =
    typeof event.actor?.name === 'string' && event.actor.name
      ? event.actor.name
      : typeof payload?.email === 'string'
        ? payload.email
        : event.actor?.kind === 'system' || event.actor?.kind === 'dag'
          ? 'Sistema'
          : '—';

  return {
    id: event.eventId,
    action,
    userId: typeof event.actor?.id === 'string' ? event.actor.id : '',
    userName,
    userRole: pickActorRole(payload),
    ...buildTarget(event),
    details: buildDetails(event) || undefined,
    ipAddress: typeof event.context?.ip === 'string' ? event.context.ip : '—',
    timestamp: event.timestamp,
  };
}

export interface AuditDashboardCardStats {
  logins: number;
  usersCreated: number;
  pipelineSuccess: number;
  pipelineFailed: number;
  total: number;
}

export function statsToDashboardCards(stats: {
  total: number;
  byType: Record<string, number>;
}): AuditDashboardCardStats {
  return {
    logins: stats.byType['auth.login.success'] ?? 0,
    usersCreated: stats.byType['admin.user.created'] ?? 0,
    pipelineSuccess: stats.byType['pipeline.dag.completed'] ?? 0,
    pipelineFailed: stats.byType['pipeline.dag.failed'] ?? 0,
    total: stats.total,
  };
}
