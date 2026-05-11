'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  Edit2,
  Trash2,
  Upload,
  Key,
  Shield,
  Store,
  Clock,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { AuditLog, AuditAction } from '../../data/mockData';
import { Pagination } from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { adminAuditApi } from '../../lib/api';
import {
  mapAuditEventToAuditLog,
  statsToDashboardCards,
  type AuditDashboardCardStats,
} from '../../lib/audit-mapper';

// ============================================
// CONFIGURACIÓN DE ACCIONES
// ============================================
const actionConfig: Record<AuditAction, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  user_login: { label: 'Inicio de sesión', icon: LogIn, color: 'text-green-600', bgColor: 'bg-green-100' },
  user_logout: { label: 'Cierre de sesión', icon: LogOut, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  auth_refresh: { label: 'Sesión renovada', icon: RefreshCw, color: 'text-teal-600', bgColor: 'bg-teal-100' },
  user_created: { label: 'Usuario creado', icon: UserPlus, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  user_updated: { label: 'Usuario actualizado', icon: Edit2, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  user_deleted: { label: 'Usuario eliminado', icon: UserMinus, color: 'text-red-600', bgColor: 'bg-red-100' },
  user_status_changed: { label: 'Estado cambiado', icon: Shield, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  supermarket_created: { label: 'Supermercado creado', icon: Store, color: 'text-green-600', bgColor: 'bg-green-100' },
  supermarket_updated: { label: 'Supermercado actualizado', icon: Store, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  supermarket_deleted: { label: 'Supermercado eliminado', icon: Store, color: 'text-red-600', bgColor: 'bg-red-100' },
  data_uploaded: { label: 'Datos cargados', icon: Upload, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  data_deleted: { label: 'Datos eliminados', icon: Trash2, color: 'text-red-600', bgColor: 'bg-red-100' },
  password_changed: { label: 'Contraseña cambiada', icon: Key, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  role_changed: { label: 'Rol cambiado', icon: Shield, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  system_event: { label: 'Otro evento', icon: Activity, color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

const actionCategories = [
  { value: 'all', label: 'Todas las acciones' },
  { value: 'auth', label: 'Autenticación', actions: ['user_login', 'user_logout', 'auth_refresh'] },
  { value: 'users', label: 'Usuarios', actions: ['user_created', 'user_updated', 'user_deleted', 'user_status_changed', 'role_changed', 'password_changed'] },
  { value: 'supermarkets', label: 'Supermercados', actions: ['supermarket_created', 'supermarket_updated', 'supermarket_deleted'] },
  { value: 'data', label: 'Datos', actions: ['data_uploaded', 'data_deleted'] },
];

// ============================================
// PÁGINA DE AUDITORÍA
// ============================================
const emptyCards: AuditDashboardCardStats = {
  logins: 0,
  usersCreated: 0,
  dataLoads: 0,
  total: 0,
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [cardStats, setCardStats] = useState<AuditDashboardCardStats>(emptyCards);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await adminAuditApi.getEvents({ limit: 500 });
        if (cancelled) return;
        setCardStats(statsToDashboardCards(data.stats));
        setLogs(data.events.map(mapAuditEventToAuditLog));
      } catch (e) {
        if (!cancelled) {
          setLoadError((e as Error).message ?? 'No se pudo cargar la auditoría');
          setLogs([]);
          setCardStats(emptyCards);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtrar logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesCategory = true;
    if (filterCategory !== 'all') {
      const category = actionCategories.find(c => c.value === filterCategory);
      if (category?.actions) {
        matchesCategory = category.actions.includes(log.action);
      }
    }

    const matchesRole = filterRole === 'all' || log.userRole === filterRole;

    return matchesSearch && matchesCategory && matchesRole;
  });

  // Paginacion
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedData: paginatedLogs,
    totalItems,
    resetToFirstPage
  } = usePagination({ data: filteredLogs, initialItemsPerPage: 10 });

  // Reset página al cambiar filtros
  useEffect(() => {
    resetToFirstPage();
  }, [searchTerm, filterCategory, filterRole, resetToFirstPage]);

  // Formatear fecha
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Obtener configuración de acción
  const getActionConfig = (action: AuditAction) => {
    return actionConfig[action] || { label: action, icon: Activity, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Auditoría del Sistema</h1>
        <p className="text-gray-500">Historial de actividades y acciones en la plataforma</p>
      </div>

      {loadError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      )}

      {/* Estadísticas rápidas (totales desde API / ventana de tiempo) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <LogIn size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {loading ? '…' : cardStats.logins}
              </p>
              <p className="text-xs text-gray-500">Inicios de sesión</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {loading ? '…' : cardStats.usersCreated}
              </p>
              <p className="text-xs text-gray-500">Usuarios creados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Upload size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {loading ? '…' : cardStats.dataLoads}
              </p>
              <p className="text-xs text-gray-500">Cargas de datos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{loading ? '…' : cardStats.total}</p>
              <p className="text-xs text-gray-500">Total de eventos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por usuario, destino o detalle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
            />
          </div>

          {/* Filtro por categoría */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none min-w-[180px] cursor-pointer"
          >
            {actionCategories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Filtro por rol */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none min-w-[160px] cursor-pointer"
          >
            <option value="all">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Analista">Analista</option>
            <option value="Usuario">Usuario</option>
          </select>
        </div>
      </div>

      {/* Lista de logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha/Hora</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Acción</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Usuario</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Destino</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Detalles</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">IP</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => {
                const config = getActionConfig(log.action);
                const Icon = config.icon;
                const { date, time } = formatDate(log.timestamp);

                return (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800">{date}</p>
                          <p className="text-gray-500">{time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
                          <Icon size={16} className={config.color} />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{config.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                          {log.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{log.userName}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            log.userRole === 'Administrador' ? 'bg-purple-100 text-purple-700' :
                            log.userRole === 'Analista' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {log.userRole}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.targetName ? (
                        <div className="text-sm">
                          <p className="font-medium text-gray-800">{log.targetName}</p>
                          <p className="text-gray-500 capitalize">{log.targetType}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-[200px] truncate" title={log.details}>
                        {log.details || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-500">{log.ipAddress}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mensaje si no hay resultados */}
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron registros con los filtros aplicados</p>
          </div>
        )}

        {/* Paginación */}
        {filteredLogs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            itemName="registros"
          />
        )}
      </div>
    </div>
  );
}
