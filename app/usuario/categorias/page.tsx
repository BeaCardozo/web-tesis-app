'use client';

import { LayoutGrid, Clock, Search, Filter } from 'lucide-react';

export default function CategoriasPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
        <p className="text-gray-500 mt-1">Explora productos organizados por categoria</p>
      </div>

      {/* Coming soon card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-button-green via-accent-green to-accent-green-dark rounded-3xl p-10 md:p-14 text-white shadow-xl shadow-button-green/15">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute top-1/2 right-10 w-20 h-20 bg-white/8 rounded-full -translate-y-1/2" />
        <div className="absolute bottom-3 left-6 w-14 h-14 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 mb-6">
            <LayoutGrid size={36} className="text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium text-white/90 mb-4 border border-white/10">
            <Clock size={12} />
            En desarrollo
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Proximamente</h2>
          <p className="text-white/70 max-w-md leading-relaxed">
            Estamos preparando una vista dedicada de categorias para que puedas navegar y explorar productos de forma mas organizada.
          </p>
        </div>
      </div>

      {/* Preview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 bg-primary-lightest rounded-xl flex items-center justify-center">
            <LayoutGrid size={22} className="text-button-green" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-800 text-sm">Todas las categorias</p>
            <p className="text-xs text-gray-400 mt-0.5">Navega por tipo de producto</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 bg-primary-lightest rounded-xl flex items-center justify-center">
            <Search size={22} className="text-button-green" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-800 text-sm">Busqueda por categoria</p>
            <p className="text-xs text-gray-400 mt-0.5">Encuentra lo que necesitas rapido</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 bg-primary-lightest rounded-xl flex items-center justify-center">
            <Filter size={22} className="text-button-green" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-800 text-sm">Filtros avanzados</p>
            <p className="text-xs text-gray-400 mt-0.5">Subcategorias y marcas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
