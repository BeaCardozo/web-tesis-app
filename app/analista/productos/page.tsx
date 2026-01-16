'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Package,
  Filter,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supermarketProducts, SupermarketProduct, mockCategories, mockSupermarkets } from '../../data/mockData';
import { Pagination } from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

// ============================================
// MODAL DE PRODUCTO
// ============================================
function ProductModal({
  product,
  isOpen,
  onClose,
  onSave,
  mode
}: {
  product?: SupermarketProduct;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SupermarketProduct>) => void;
  mode: 'create' | 'edit';
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || mockCategories[0],
    price: product?.price || 0,
    sku: product?.sku || '',
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        sku: product.sku || '',
      });
    } else {
      setFormData({
        name: '',
        category: mockCategories[0],
        price: 0,
        sku: '',
      });
    }
  }, [product, isOpen]);

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
            {mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
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
              Nombre del producto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
              placeholder="Ej: Leche Completa 1L"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU / Código
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none font-mono"
              placeholder="Ej: LAC001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none cursor-pointer"
            >
              {mockCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
              required
            />
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
// PÁGINA DE GESTIÓN DE PRODUCTOS
// ============================================
export default function ProductsPage() {
  const { user } = useAuth();
  const supermarket = mockSupermarkets.find(s => s.id === user?.supermarketId);

  const [products, setProducts] = useState<SupermarketProduct[]>(
    supermarketProducts[user?.supermarketId || '1'] || []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'actualizado' | 'desactualizado' | 'nuevo'>('all');

  // Estados de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupermarketProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<SupermarketProduct | null>(null);

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Paginacion
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedData: paginatedProducts,
    totalItems,
    resetToFirstPage
  } = usePagination({ data: filteredProducts, initialItemsPerPage: 10 });

  // Reset página al cambiar filtros
  useEffect(() => {
    resetToFirstPage();
  }, [searchTerm, filterCategory, filterStatus, resetToFirstPage]);

  // Obtener categorías únicas
  const categories = [...new Set(products.map(p => p.category))];

  // Estadísticas
  const stats = {
    total: products.length,
    updated: products.filter(p => p.status === 'actualizado').length,
    outdated: products.filter(p => p.status === 'desactualizado').length,
    new: products.filter(p => p.status === 'nuevo').length,
  };

  // Handlers
  const handleCreateProduct = (data: Partial<SupermarketProduct>) => {
    const newProduct: SupermarketProduct = {
      id: `p${Date.now()}`,
      name: data.name || '',
      category: data.category || 'Abarrotes',
      price: data.price || 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'nuevo',
      sku: data.sku,
    };
    setProducts([newProduct, ...products]);
  };

  const handleEditProduct = (data: Partial<SupermarketProduct>) => {
    if (!editingProduct) return;
    setProducts(products.map(p =>
      p.id === editingProduct.id
        ? { ...p, ...data, lastUpdated: new Date().toISOString().split('T')[0], status: 'actualizado' as const }
        : p
    ));
    setEditingProduct(null);
  };

  const handleDeleteProduct = () => {
    if (!deletingProduct) return;
    setProducts(products.filter(p => p.id !== deletingProduct.id));
    setDeletingProduct(null);
  };

  const getStatusConfig = (status: SupermarketProduct['status']) => {
    switch (status) {
      case 'actualizado':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Actualizado' };
      case 'desactualizado':
        return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Desactualizado' };
      case 'nuevo':
        return { icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Nuevo' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
          <p className="text-gray-500">Administra los productos de {supermarket?.name}</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-button-green text-white rounded-xl hover:bg-accent-green-dark transition-colors"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${supermarket?.color}20` }}>
              <Package size={20} style={{ color: supermarket?.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-500">Total productos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.updated}</p>
              <p className="text-xs text-gray-500">Actualizados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.outdated}</p>
              <p className="text-xs text-gray-500">Desactualizados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.new}</p>
              <p className="text-xs text-gray-500">Nuevos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none min-w-[180px] cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none min-w-[160px] cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="actualizado">Actualizado</option>
            <option value="desactualizado">Desactualizado</option>
            <option value="nuevo">Nuevo</option>
          </select>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Producto</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">SKU</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Categoría</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Precio</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actualización</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => {
                const statusConfig = getStatusConfig(product.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{product.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-500">{product.sku || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold" style={{ color: supermarket?.color }}>
                        ${product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.lastUpdated}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(product)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mensaje si no hay resultados */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron productos con los filtros aplicados</p>
          </div>
        )}

        {/* Paginación */}
        {filteredProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            itemName="productos"
          />
        )}
      </div>

      {/* Modales */}
      <ProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateProduct}
        mode="create"
      />

      <ProductModal
        product={editingProduct || undefined}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleEditProduct}
        mode="edit"
      />

      <ConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
        title="Eliminar producto"
        message={`¿Estás seguro de que deseas eliminar "${deletingProduct?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
