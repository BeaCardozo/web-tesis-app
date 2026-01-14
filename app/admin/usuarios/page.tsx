'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  UserCheck,
  UserX,
  X,
  Check
} from 'lucide-react';
import { mockUsers, User, UserRole } from '../../data/mockData';

// ============================================
// MODAL DE USUARIO
// ============================================
function UserModal({
  user,
  isOpen,
  onClose,
  onSave,
  mode
}: {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
  mode: 'create' | 'edit';
}) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'Usuario' as UserRole,
    status: user?.status || 'activo' as 'activo' | 'inactivo',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-accent-green outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-accent-green outline-none"
              required
            />
          </div>

          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-accent-green outline-none"
                required={mode === 'create'}
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
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-accent-green outline-none"
            >
              <option value="Usuario">Usuario</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'activo' | 'inactivo' })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-accent-green outline-none"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-button-green text-white hover:bg-accent-green-dark transition-colors"
            >
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
  message
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
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
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PÁGINA DE GESTIÓN DE USUARIOS
// ============================================
export default function UsersPage() {
  // Estado local que simula la base de datos
  // TODO: Reemplazar con llamadas a API
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'activo' | 'inactivo'>('all');

  // Estados de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // ============================================
  // HANDLERS - TODO: Reemplazar con llamadas a API
  // ============================================
  const handleCreateUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: String(Date.now()),
      name: userData.name || '',
      email: userData.email || '',
      password: userData.password || '',
      role: userData.role || 'Usuario',
      status: userData.status || 'activo',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: '-',
    };
    setUsers([...users, newUser]);
    // TODO: Llamar a API
    // await fetch('/api/users', { method: 'POST', body: JSON.stringify(newUser) });
  };

  const handleEditUser = (userData: Partial<User>) => {
    if (!editingUser) return;
    setUsers(users.map(u =>
      u.id === editingUser.id ? { ...u, ...userData } : u
    ));
    setEditingUser(null);
    // TODO: Llamar a API
    // await fetch(`/api/users/${editingUser.id}`, { method: 'PUT', body: JSON.stringify(userData) });
  };

  const handleDeleteUser = () => {
    if (!deletingUser) return;
    setUsers(users.filter(u => u.id !== deletingUser.id));
    setDeletingUser(null);
    // TODO: Llamar a API
    // await fetch(`/api/users/${deletingUser.id}`, { method: 'DELETE' });
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'activo' ? 'inactivo' : 'activo';
    setUsers(users.map(u =>
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    setActiveMenu(null);
    // TODO: Llamar a API
    // await fetch(`/api/users/${user.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-gray-500">Administra los usuarios de la plataforma</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-button-green text-white rounded-xl hover:bg-accent-green-dark transition-colors"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-accent-green outline-none"
            />
          </div>

          {/* Filtro por rol */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'all' | UserRole)}
            className="px-4 py-2.5 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-accent-green outline-none min-w-[160px]"
          >
            <option value="all">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Usuario">Usuario</option>
          </select>

          {/* Filtro por estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'activo' | 'inactivo')}
            className="px-4 py-2.5 rounded-xl bg-gray-100 border-0 focus:ring-2 focus:ring-accent-green outline-none min-w-[160px]"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Usuario</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Rol</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Registro</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Último acceso</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-accent-green-dark font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Administrador'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === 'activo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.status === 'activo' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      {user.status === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.createdAt}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 relative">
                      <button
                        onClick={() => setEditingUser(user)}
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

                      {/* Dropdown menu */}
                      {activeMenu === user.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-[160px]">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {user.status === 'activo' ? (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje si no hay resultados */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron usuarios con los filtros aplicados</p>
          </div>
        )}

        {/* Footer con info */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-500">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </p>
        </div>
      </div>

      {/* Modales */}
      <UserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateUser}
        mode="create"
      />

      <UserModal
        user={editingUser || undefined}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleEditUser}
        mode="edit"
      />

      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        title="Eliminar usuario"
        message={`¿Estás seguro de que deseas eliminar a ${deletingUser?.name}? Esta acción no se puede deshacer.`}
      />

      {/* Click fuera para cerrar menú */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}
