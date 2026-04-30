'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Store,
  X,
  Users,
  MapPin,
  Globe,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { adminSupermarketsApi, AdminSupermarket } from '../../lib/api';
import { Pagination } from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

// ============================================
// MODAL DE SUPERMERCADO
// ============================================
function SupermarketModal({
  supermarket,
  isOpen,
  onClose,
  onSave,
  mode,
  isSaving,
  error,
}: {
  supermarket?: AdminSupermarket;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; website: string; logoUrl: string; isActive: boolean }) => void;
  mode: 'create' | 'edit';
  isSaving: boolean;
  error: string;
}) {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    logoUrl: '',
    isActive: true,
  });

  useEffect(() => {
    if (isOpen && supermarket && mode === 'edit') {
      setFormData({
        name: supermarket.name,
        website: supermarket.website || '',
        logoUrl: supermarket.logoUrl || '',
        isActive: supermarket.isActive,
      });
    } else if (isOpen && mode === 'create') {
      setFormData({ name: '', website: '', logoUrl: '', isActive: true });
    }
  }, [isOpen, supermarket, mode]);

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
            {mode === 'create' ? 'Nuevo Supermercado' : 'Editar Supermercado'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del supermercado
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green outline-none"
              placeholder="Ej: Supermercado XYZ"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sitio web
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green outline-none"
              placeholder="https://ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL del logo
            </label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border-0 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green outline-none"
              placeholder="https://ejemplo.com/logo.png"
            />
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

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-2">Vista previa:</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-button-green flex items-center justify-center text-white font-bold">
                {formData.name.charAt(0).toUpperCase() || 'S'}
              </div>
              <div>
                <span className="font-medium text-gray-800">
                  {formData.name || 'Nombre del supermercado'}
                </span>
                {formData.website && (
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">{formData.website}</p>
                )}
              </div>
            </div>
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
// PÁGINA DE GESTIÓN DE SUPERMERCADOS
// ============================================
export default function SupermarketsPage() {
  const [supermarkets, setSupermarkets] = useState<AdminSupermarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'activo' | 'inactivo'>('all');

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSupermarket, setEditingSupermarket] = useState<AdminSupermarket | null>(null);
  const [deletingSupermarket, setDeletingSupermarket] = useState<AdminSupermarket | null>(null);
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar supermercados
  const fetchSupermarkets = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminSupermarketsApi.list();
      setSupermarkets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar supermercados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupermarkets();
  }, []);

  // Filtrar
  const filteredSupermarkets = useMemo(() => {
    return supermarkets.filter((sm) => {
      const matchesSearch = sm.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'activo' && sm.isActive) ||
        (filterStatus === 'inactivo' && !sm.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [supermarkets, searchTerm, filterStatus]);

  // Paginación
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedData: paginatedSupermarkets,
    totalItems,
  } = usePagination({ data: filteredSupermarkets, initialItemsPerPage: 9 });

  // Handlers
  const handleCreate = async (formData: { name: string; website: string; logoUrl: string; isActive: boolean }) => {
    setIsSaving(true);
    setModalError('');
    try {
      const created = await adminSupermarketsApi.create({
        name: formData.name,
        website: formData.website || undefined,
        logoUrl: formData.logoUrl || undefined,
        isActive: formData.isActive,
      });
      setSupermarkets((prev) => [...prev, created]);
      setIsCreateModalOpen(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (formData: { name: string; website: string; logoUrl: string; isActive: boolean }) => {
    if (!editingSupermarket) return;
    setIsSaving(true);
    setModalError('');
    try {
      const updated = await adminSupermarketsApi.update(editingSupermarket.id, {
        name: formData.name,
        website: formData.website || undefined,
        logoUrl: formData.logoUrl || undefined,
        isActive: formData.isActive,
      });
      setSupermarkets((prev) => prev.map((s) => (s.id === editingSupermarket.id ? updated : s)));
      setEditingSupermarket(null);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSupermarket) return;
    setIsDeleting(true);
    try {
      await adminSupermarketsApi.remove(deletingSupermarket.id);
      setSupermarkets((prev) => prev.filter((s) => s.id !== deletingSupermarket.id));
      setDeletingSupermarket(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      setDeletingSupermarket(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (sm: AdminSupermarket) => {
    try {
      const updated = await adminSupermarketsApi.toggleStatus(sm.id);
      setSupermarkets((prev) => prev.map((s) => (s.id === sm.id ? updated : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion de Supermercados</h1>
          <p className="text-gray-500">Administra los supermercados registrados en la plataforma</p>
        </div>
        <button
          onClick={() => { setModalError(''); setIsCreateModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-button-green text-white rounded-xl hover:bg-accent-green-dark transition-colors"
        >
          <Plus size={20} />
          Nuevo Supermercado
        </button>
      </div>

      {/* Error general */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar supermercado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
            />
          </div>
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

      {/* Grid de supermercados */}
      {!isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedSupermarkets.map((sm) => (
              <div
                key={sm.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-shadow hover:shadow-md ${
                  sm.isActive ? 'border-gray-100' : 'border-gray-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-button-green flex items-center justify-center text-white font-bold text-xl">
                      {sm.logoUrl ? (
                        <img
                          src={sm.logoUrl}
                          alt={sm.name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        sm.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{sm.name}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        sm.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sm.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {sm.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  {sm.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe size={14} className="text-gray-400 flex-shrink-0" />
                      <a
                        href={sm.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-button-green hover:underline truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {sm.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{sm.storeCount} tienda{sm.storeCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{sm.analystCount} analista{sm.analystCount !== 1 ? 's' : ''} asignado{sm.analystCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => { setModalError(''); setEditingSupermarket(sm); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 size={15} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleStatus(sm)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    title={sm.isActive ? 'Desactivar' : 'Activar'}
                  >
                    {sm.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    onClick={() => setDeletingSupermarket(sm)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Estado vacío */}
          {filteredSupermarkets.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <Store size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No se encontraron supermercados</p>
            </div>
          )}

          {/* Paginación */}
          {filteredSupermarkets.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemsPerPageOptions={[6, 9, 12]}
                itemName="supermercados"
              />
            </div>
          )}
        </>
      )}

      {/* Modales */}
      <SupermarketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
        mode="create"
        isSaving={isSaving}
        error={modalError}
      />

      <SupermarketModal
        supermarket={editingSupermarket || undefined}
        isOpen={!!editingSupermarket}
        onClose={() => setEditingSupermarket(null)}
        onSave={handleEdit}
        mode="edit"
        isSaving={isSaving}
        error={modalError}
      />

      <ConfirmModal
        isOpen={!!deletingSupermarket}
        onClose={() => setDeletingSupermarket(null)}
        onConfirm={handleDelete}
        title="Eliminar supermercado"
        message={`Estas seguro de que deseas eliminar "${deletingSupermarket?.name}"? Esta accion no se puede deshacer.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
