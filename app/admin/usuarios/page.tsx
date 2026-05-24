'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  UserCheck,
  UserX,
  X,
  Loader2,
} from 'lucide-react';
import { UserRole } from '../../types';
import { adminUsersApi, BackendUser, BackendRole } from '../../lib/api';
import { Pagination } from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

// ============================================
// MAPEO DE ROLES
// ============================================
const ROLE_MAP: Record<BackendRole, UserRole> = {
  admin: 'Administrador',
  partner: 'Analista',
  consumer: 'Usuario',
};

const REVERSE_ROLE_MAP: Record<UserRole, BackendRole> = {
  Administrador: 'admin',
  Analista: 'partner',
  Usuario: 'consumer',
};

function mapRole(backendRole: BackendRole): UserRole {
  return ROLE_MAP[backendRole] || 'Usuario';
}

function buildName(user: BackendUser): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
}

// ============================================
// MODAL DE USUARIO
// ============================================
function UserModal({
  user,
  isOpen,
  onClose,
  onSave,
  mode,
  isSaving,
  error,
}: {
  user?: BackendUser;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
  }) => void;
  mode: 'create' | 'edit';
  isSaving: boolean;
  error: string;
}) {
  // El padre debe pasar `key` (el id del usuario o 'create') para que este
  // estado se inicialice fresco cada vez que cambia el usuario editado.
  const [formData, setFormData] = useState(() =>
    mode === 'edit' && user
      ? {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          password: '',
          role: mapRole(user.role),
          isActive: user.isActive,
        }
      : {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'Usuario' as UserRole,
          isActive: true,
        },
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green outline-none"
              required
            />
          </div>

          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contrasena
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green outline-none"
                required
                placeholder="Min 8 caracteres, mayuscula, numero y simbolo"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 text-gray-800 focus:ring-2 focus:ring-accent-green outline-none cursor-pointer"
            >
              <option value="Usuario">Usuario</option>
              <option value="Analista">Analista</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.isActive ? 'activo' : 'inactivo'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'activo' })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 text-gray-800 focus:ring-2 focus:ring-accent-green outline-none cursor-pointer"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-button-green text-white hover:bg-accent-green-dark transition-colors disabled:opacity-60"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// MODAL DE CONFIRMACIÓN
// ============================================
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// BADGE DE ROL
// ============================================
function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    Administrador: 'bg-purple-100 text-purple-700',
    Analista: 'bg-amber-100 text-amber-700',
    Usuario: 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
      {role}
    </span>
  );
}

// ============================================
// PÁGINA DE GESTIÓN DE USUARIOS
// ============================================
export default function UsersPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'activo' | 'inactivo'>('all');

  // Estados de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<BackendUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<BackendUser | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await adminUsersApi.list();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [reloadToken]);

  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const name = buildName(user).toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || mapRole(user.role) === filterRole;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'activo' && user.isActive) ||
        (filterStatus === 'inactivo' && !user.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  // Paginación
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedData: paginatedUsers,
    totalItems,
    resetToFirstPage,
  } = usePagination({ data: filteredUsers, initialItemsPerPage: 10 });

  useEffect(() => {
    resetToFirstPage();
  }, [searchTerm, filterRole, filterStatus, resetToFirstPage]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleCreateUser = async (formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    setIsSaving(true);
    setModalError('');
    try {
      const newUser = await adminUsersApi.create({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        role: REVERSE_ROLE_MAP[formData.role],
      });
      setUsers((prev) => [...prev, newUser]);
      setIsCreateModalOpen(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = async (formData: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  }) => {
    if (!editingUser) return;
    setIsSaving(true);
    setModalError('');
    try {
      const updated = await adminUsersApi.update(editingUser.id, {
        firstName: formData.firstName,
        lastName: formData.lastName || undefined,
        email: formData.email,
        role: REVERSE_ROLE_MAP[formData.role],
        isActive: formData.isActive,
      });
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
      setEditingUser(null);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Error al actualizar usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      await adminUsersApi.remove(deletingUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
      setDeletingUser(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (user: BackendUser) => {
    setActiveMenu(null);
    try {
      const updated = await adminUsersApi.toggleStatus(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion de Usuarios</h1>
          <p className="text-gray-500">Administra los usuarios de la plataforma</p>
        </div>
        <button
          onClick={() => { setModalError(''); setIsCreateModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-button-green text-white rounded-xl hover:bg-accent-green-dark transition-colors"
        >
          <Plus size={20} />
          Nuevo
        </button>
      </div>

      {/* Error general */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex flex-wrap items-center justify-between gap-2">
          <span className="min-w-0 break-words flex-1">{error}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setReloadToken((t) => t + 1)}
              className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-700 font-medium hover:bg-red-100/50 transition-colors"
            >
              Reintentar
            </button>
            <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-red-600 p-1" aria-label="Cerrar aviso">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'all' | UserRole)}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none min-w-[160px] cursor-pointer"
          >
            <option value="all">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Analista">Analista</option>
            <option value="Usuario">Usuario</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'activo' | 'inactivo')}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none min-w-[160px] cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-button-green" />
        </div>
      )}

      {/* Tabla de usuarios */}
      {!isLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Usuario</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Rol</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Registro</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const name = buildName(user);
                  const role = mapRole(user.role);

                  return (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-accent-green-dark font-semibold">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={role} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1 relative">
                          <button
                            onClick={() => { setModalError(''); setEditingUser(user); }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {activeMenu === user.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-[160px]">
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                {user.isActive ? (
                                  <>
                                    <UserX size={16} />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <UserCheck size={16} />
                                    Activar
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingUser(user);
                                  setActiveMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron usuarios con los filtros aplicados</p>
            </div>
          )}

          {filteredUsers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemName="usuarios"
            />
          )}
        </div>
      )}

      {/* Modales (conditional render para que el estado interno arranque fresco) */}
      {isCreateModalOpen && (
        <UserModal
          isOpen
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateUser}
          mode="create"
          isSaving={isSaving}
          error={modalError}
        />
      )}

      {editingUser && (
        <UserModal
          key={editingUser.id}
          user={editingUser}
          isOpen
          onClose={() => setEditingUser(null)}
          onSave={handleEditUser}
          mode="edit"
          isSaving={isSaving}
          error={modalError}
        />
      )}

      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        title="Eliminar usuario"
        message={`Estas seguro de que deseas eliminar a ${deletingUser ? buildName(deletingUser) : ''}? Esta accion no se puede deshacer.`}
        isLoading={isDeleting}
      />

      {activeMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}
