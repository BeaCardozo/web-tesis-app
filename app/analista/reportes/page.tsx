'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  File,
  Package,
  TrendingUp,
  BarChart3,
  Calendar,
  Check,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  mockSupermarkets,
  supermarketProducts,
  priceComparison,
  supermarketStats
} from '../../data/mockData';
import { MockDataBanner } from '../../components/MockDataBanner';

// ============================================
// TIPOS DE REPORTES
// ============================================
interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'products',
    name: 'Inventario de Productos',
    description: 'Lista completa de todos los productos con precios, categorías y estados.',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'comparison',
    name: 'Comparación con Competencia',
    description: 'Análisis comparativo de precios frente al promedio del mercado.',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'trends',
    name: 'Tendencias de Precios',
    description: 'Evolución de precios y estadísticas de cambios recientes.',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'summary',
    name: 'Resumen Ejecutivo',
    description: 'Métricas clave, posición en ranking y estadísticas generales.',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

// ============================================
// PÁGINA DE REPORTES
// ============================================
export default function ReportsPage() {
  const { user } = useAuth();
  const supermarket = mockSupermarkets.find(s => s.id === user?.supermarketId);
  const products = supermarketProducts[user?.supermarketId || '1'] || [];
  const comparison = priceComparison[user?.supermarketId || '1'] || [];
  const stats = supermarketStats[user?.supermarketId || '1'];

  const [selectedReport, setSelectedReport] = useState<string>('products');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const selectedReportData = reportTypes.find(r => r.id === selectedReport);

  // Simular exportación
  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    // Simular delay de generación
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsExporting(false);
    setExportSuccess(true);

    // Reset success message después de 3 segundos
    setTimeout(() => setExportSuccess(false), 3000);
  };

  // Renderizar preview del reporte
  const renderReportPreview = () => {
    switch (selectedReport) {
      case 'products':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Producto</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">SKU</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Categoría</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Precio</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map(product => (
                  <tr key={product.id} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-800">{product.name}</td>
                    <td className="py-2 px-3 text-gray-500 font-mono">{product.sku || '-'}</td>
                    <td className="py-2 px-3 text-gray-600">{product.category}</td>
                    <td className="py-2 px-3 text-right font-medium" style={{ color: supermarket?.color }}>
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        product.status === 'actualizado' ? 'bg-green-100 text-green-700' :
                        product.status === 'nuevo' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Mostrando 5 de {products.length} productos
            </p>
          </div>
        );

      case 'comparison':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Producto</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Tu Precio</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Competencia</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-800">{item.product}</td>
                    <td className="py-2 px-3 text-right font-medium" style={{ color: supermarket?.color }}>
                      ${item.ownPrice.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-600">
                      ${item.avgCompetition.toFixed(2)}
                    </td>
                    <td className={`py-2 px-3 text-right font-medium ${
                      item.difference < 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {item.difference > 0 ? '+' : ''}{item.difference.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Precio promedio actual</p>
                <p className="text-lg font-bold" style={{ color: supermarket?.color }}>
                  ${stats?.averagePrice?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Cambio semanal</p>
                <p className={`text-lg font-bold ${(stats?.priceChangeLastWeek || 0) >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {(stats?.priceChangeLastWeek || 0) >= 0 ? '+' : ''}{stats?.priceChangeLastWeek || 0}%
                </p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Productos por estado</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Actualizados</span>
                  <span className="text-sm font-medium text-green-600">
                    {products.filter(p => p.status === 'actualizado').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Desactualizados</span>
                  <span className="text-sm font-medium text-orange-600">
                    {products.filter(p => p.status === 'desactualizado').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nuevos</span>
                  <span className="text-sm font-medium text-blue-600">
                    {products.filter(p => p.status === 'nuevo').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Resumen de {supermarket?.name}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Total productos</p>
                  <p className="font-bold text-gray-800">{stats?.totalProducts || products.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Posición ranking</p>
                  <p className="font-bold text-gray-800">#{stats?.positionInRanking || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Vistas totales</p>
                  <p className="font-bold text-gray-800">{stats?.totalViews?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Última carga</p>
                  <p className="font-bold text-gray-800">{stats?.lastUpload || '-'}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Rendimiento</h4>
              <p className="text-sm text-gray-600">
                Tu supermercado está en la posición <strong>#{stats?.positionInRanking || '-'}</strong> del ranking
                con un total de <strong>{stats?.totalViews?.toLocaleString() || '0'}</strong> vistas
                y un incremento del <strong>{stats?.viewsChangeLastWeek || 0}%</strong> esta semana.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reportes y Exportar</h1>
        <p className="text-gray-500">Genera reportes de tu supermercado en diferentes formatos</p>
      </div>

      <MockDataBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tipos de reportes */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Tipo de Reporte</h3>
            <div className="space-y-2">
              {reportTypes.map(report => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedReport === report.id
                        ? 'bg-primary/50 ring-2 ring-button-green'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${report.bgColor}`}>
                        <Icon size={18} className={report.color} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{report.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{report.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formato de exportación */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Formato de Exportación</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat('pdf')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  exportFormat === 'pdf'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <File size={24} className={exportFormat === 'pdf' ? 'text-red-500 mx-auto' : 'text-gray-400 mx-auto'} />
                <p className={`text-sm font-medium mt-2 ${exportFormat === 'pdf' ? 'text-red-600' : 'text-gray-600'}`}>
                  PDF
                </p>
              </button>
              <button
                onClick={() => setExportFormat('excel')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  exportFormat === 'excel'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileSpreadsheet size={24} className={exportFormat === 'excel' ? 'text-green-500 mx-auto' : 'text-gray-400 mx-auto'} />
                <p className={`text-sm font-medium mt-2 ${exportFormat === 'excel' ? 'text-green-600' : 'text-gray-600'}`}>
                  Excel
                </p>
              </button>
            </div>
          </div>

          {/* Botón exportar */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              exportSuccess
                ? 'bg-green-500 text-white'
                : 'bg-button-green text-white hover:bg-accent-green-dark'
            } ${isExporting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isExporting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generando...
              </>
            ) : exportSuccess ? (
              <>
                <Check size={20} />
                Descargado
              </>
            ) : (
              <>
                <Download size={20} />
                Exportar {exportFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>

        {/* Vista previa */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header del reporte */}
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedReportData && (
                    <div className={`p-2 rounded-lg ${selectedReportData.bgColor}`}>
                      <selectedReportData.icon size={20} className={selectedReportData.color} />
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-gray-800">{selectedReportData?.name}</h2>
                    <p className="text-sm text-gray-500">{selectedReportData?.description}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date().toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido del reporte */}
            <div className="p-6">
              <div className="mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: supermarket?.color }}
                  >
                    {supermarket?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{supermarket?.name}</p>
                    <p className="text-xs text-gray-500">Reporte generado automáticamente</p>
                  </div>
                </div>
              </div>

              {/* Vista previa del contenido */}
              {renderReportPreview()}

              <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
                Vista previa - El documento completo se generará al exportar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
