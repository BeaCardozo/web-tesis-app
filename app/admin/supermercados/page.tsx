'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Store,
  X,
  Check,
  Users
} from 'lucide-react';
import { mockSupermarkets, Supermarket, mockUsers } from '../../data/mockData';
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
  mode
}: {
  supermarket?: Supermarket;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Supermarket>) => void;
  mode: 'create' | 'edit';
}) {
  const [formData, setFormData] = useState({
    name: supermarket?.name || '',
    color: supermarket?.color || '#77A14B',
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
            {mode === 'create' ? 'Nuevo Supermercado' : 'Editar Supermercado'}
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
              Nombre del supermercado
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
              placeholder="Ej: Supermercado XYZ"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color identificativo
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none font-mono"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-2">Vista previa:</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: formData.color }}
              >
                {formData.name.charAt(0).toUpperCase() || 'S'}
              </div>
              <span className="font-medium text-gray-800">
                {formData.name || 'Nombre del supermercado'}
              </span>
            </div>
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
// PÁGINA DE GESTIÓN DE SUPERMERCADOS
// ============================================
export default function SupermarketsPage() {
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>(mockSupermarkets);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSupermarket, setEditingSupermarket] = useState<Supermarket | null>(null);
  const [deletingSupermarket, setDeletingSupermarket] = useState<Supermarket | null>(null);

  // Filtrar supermercados
  const filteredSupermarkets = supermarkets.filter(supermarket =>
    supermarket.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginacion
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedData: paginatedSupermarkets,
    totalItems
  } = usePagination({ data: filteredSupermarkets, initialItemsPerPage: 10 });

  // Contar analistas por supermercado
  const getAnalystCount = (supermarketId: string) => {
    return mockUsers.filter(
      user => user.role === 'Analista' && user.supermarketId === supermarketId
    ).length;
  };

  // Handlers
  const handleCreateSupermarket = (data: Partial<Supermarket>) => {
    const newSupermarket: Supermarket = {
      id: String(Date.now()),
      name: data.name || '',
      color: data.color || '#77A14B',
    };
    setSupermarkets([...supermarkets, newSupermarket]);
  };

  const handleEditSupermarket = (data: Partial<Supermarket>) => {
    if (!editingSupermarket) return;
    setSupermarkets(supermarkets.map(s =>
      s.id === editingSupermarket.id ? { ...s, ...data } : s
    ));
    setEditingSupermarket(null);
  };

  const handleDeleteSupermarket = () => {
    if (!deletingSupermarket) return;
    setSupermarkets(supermarkets.filter(s => s.id !== deletingSupermarket.id));
    setDeletingSupermarket(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Supermercados</h1>
          <p className="text-gray-500">Administra los supermercados registrados en la plataforma</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-button-green text-white rounded-xl hover:bg-accent-green-dark transition-colors"
        >
          <Plus size={20} />
          Nuevo Supermercado
        </button>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar supermercado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Grid de supermercados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedSupermarkets.map((supermarket) => (
          <div
            key={supermarket.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: supermarket.color }}
                >
                  {supermarket.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{supermarket.name}</h3>
                  <p className="text-sm text-gray-500">ID: {supermarket.id}</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: supermarket.color }}
                />
                <span className="font-mono">{supermarket.color}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} />
                <span>{getAnalystCount(supermarket.id)} analista(s) asignado(s)</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setEditingSupermarket(supermarket)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Edit2 size={16} />
                Editar
              </button>
              <button
                onClick={() => setDeletingSupermarket(supermarket)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje si no hay resultados */}
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
            itemName="supermercados"
          />
        </div>
      )}

      {/* Modales */}
      <SupermarketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSupermarket}
        mode="create"
      />

      <SupermarketModal
        supermarket={editingSupermarket || undefined}
        isOpen={!!editingSupermarket}
        onClose={() => setEditingSupermarket(null)}
        onSave={handleEditSupermarket}
        mode="edit"
      />

      <ConfirmModal
        isOpen={!!deletingSupermarket}
        onClose={() => setDeletingSupermarket(null)}
        onConfirm={handleDeleteSupermarket}
        title="Eliminar supermercado"
        message={`¿Estás seguro de que deseas eliminar "${deletingSupermarket?.name}"? Esta acción no se puede deshacer y podría afectar a los analistas asignados.`}
      />
    </div>
  );
}
