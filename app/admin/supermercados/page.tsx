'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Store,
  X,
  Users,
  Globe,
  Loader2,
} from 'lucide-react';
import { adminSupermarketsApi, AdminSupermarket } from '../../lib/api';
import { supermarketLogoSrc } from '../../components/SupermarketLogo';
import { Pagination } from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

// ============================================
// PÁGINA DE GESTIÓN DE SUPERMERCADOS
// ============================================
export default function SupermarketsPage() {
  const [supermarkets, setSupermarkets] = useState<AdminSupermarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'activo' | 'inactivo'>('all');
  const [reloadToken, setReloadToken] = useState(0);

  // Cargar supermercados
  useEffect(() => {
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
    fetchSupermarkets();
  }, [reloadToken]);

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Gestion de Supermercados</h1>
        <p className="text-gray-500">Supermercados registrados en la plataforma</p>
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
            {paginatedSupermarkets.map((sm) => {
              const logo = supermarketLogoSrc(sm.name) || sm.logoUrl;
              return (
              <div
                key={sm.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-shadow hover:shadow-md ${
                  sm.isActive ? 'border-gray-100' : 'border-gray-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {logo ? (
                      <div className="relative w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm p-1.5 overflow-hidden flex-shrink-0">
                        <Image
                          src={logo}
                          alt={sm.name}
                          fill
                          sizes="48px"
                          className="object-contain p-1.5"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary-lighter/40 flex items-center justify-center text-accent-green-dark font-bold text-xl shadow-sm flex-shrink-0">
                        {sm.name.charAt(0)}
                      </div>
                    )}
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
                <div className="space-y-2">
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
                    <Users size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{sm.analystCount} analista{sm.analystCount !== 1 ? 's' : ''} asignado{sm.analystCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              );
            })}
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
    </div>
  );
}
