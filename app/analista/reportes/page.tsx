'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  File,
  Package,
  TrendingUp,
  BarChart3,
  Calendar,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  analystApi,
  AnalystComparisonReport,
  AnalystComparisonReportItem,
} from '../../lib/api';

// ============================================
// CONFIG
// ============================================
const RANGES = [
  { value: 7, label: '7d' },
  { value: 14, label: '14d' },
  { value: 30, label: '30d' },
  { value: 60, label: '60d' },
  { value: 90, label: '90d' },
];

const OWN_COLOR = '#77A14B';

interface ReportType {
  id: 'products' | 'comparison' | 'trends';
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'products',
    name: 'Inventario de Productos',
    description: 'Lista completa de tus productos con precio actual y categoría.',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'comparison',
    name: 'Comparación con Competencia',
    description: 'Tu precio vs el promedio de competencia por producto.',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'trends',
    name: 'Tendencias de Precios',
    description: 'Variación de precios en la ventana seleccionada y productos con mayor cambio.',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
];

// ============================================
// HELPERS
// ============================================
function fmt(v: number | null | undefined, decimals = 2): string {
  if (v == null || !Number.isFinite(v)) return '—';
  return `$${v.toFixed(decimals)}`;
}

function pct(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
}

function downloadCsv(filename: string, rows: string[][]): void {
  const escape = (s: string) => {
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = rows.map((r) => r.map((c) => escape(c)).join(',')).join('\n');
  const bom = '﻿'; // Excel reconoce UTF-8 con BOM
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildCsvRows(
  reportId: ReportType['id'],
  report: AnalystComparisonReport,
): string[][] {
  if (reportId === 'products') {
    const rows: string[][] = [['Producto', 'Categoría', 'Marca', 'Unidad', 'Precio actual (USD)']];
    for (const it of report.items) {
      rows.push([
        it.productName,
        it.categoryName ?? '—',
        it.brandName ?? '—',
        `${it.baseAmount} ${it.unitType}`,
        it.ownPrice != null ? it.ownPrice.toFixed(2) : '',
      ]);
    }
    return rows;
  }
  if (reportId === 'comparison') {
    const rows: string[][] = [
      ['Producto', 'Categoría', 'Tu precio (USD)', 'Prom. competencia (USD)', 'Diferencia (%)'],
    ];
    for (const it of report.items) {
      rows.push([
        it.productName,
        it.categoryName ?? '—',
        it.ownPrice != null ? it.ownPrice.toFixed(2) : '',
        it.avgCompetition != null ? it.avgCompetition.toFixed(2) : '',
        it.diffPct != null ? it.diffPct.toFixed(1) : '',
      ]);
    }
    return rows;
  }
  // trends
  const rows: string[][] = [
    ['Producto', 'Categoría', 'Precio actual (USD)', 'Variación en ventana (%)', 'Observaciones'],
  ];
  for (const it of report.items) {
    rows.push([
      it.productName,
      it.categoryName ?? '—',
      it.ownPrice != null ? it.ownPrice.toFixed(2) : '',
      it.priceChangePct != null ? it.priceChangePct.toFixed(1) : '',
      String(it.observations),
    ]);
  }
  return rows;
}

function downloadPdf(
  reportId: ReportType['id'],
  reportName: string,
  report: AnalystComparisonReport,
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(16);
  doc.setTextColor(33, 33, 33);
  doc.text(reportName, 40, 50);
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Cadena: ${report.supermarketName}`, 40, 68);
  doc.text(
    `Ventana: últimos ${report.daysWindow} días · Generado: ${new Date(report.generatedAt).toLocaleString('es-VE')}`,
    40,
    82,
  );

  // Línea decorativa verde institucional
  doc.setDrawColor(119, 161, 75);
  doc.setLineWidth(2);
  doc.line(40, 92, PAGE_WIDTH - 40, 92);

  // Body
  const csvRows = buildCsvRows(reportId, report);
  const head = [csvRows[0]];
  const body = csvRows.slice(1);

  autoTable(doc, {
    startY: 110,
    head,
    body,
    headStyles: {
      fillColor: [119, 161, 75],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 40, right: 40 },
    columnStyles: {
      // las columnas numéricas a la derecha
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
  });

  // Footer en cada página
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount}  ·  Caracas Ahorra`,
      PAGE_WIDTH / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' },
    );
  }

  const filename = buildFilename(reportId, report, 'pdf');
  doc.save(filename);
}

function buildFilename(
  reportId: ReportType['id'],
  report: AnalystComparisonReport,
  ext: 'csv' | 'pdf',
): string {
  const date = new Date(report.generatedAt).toISOString().slice(0, 10);
  return `reporte-${reportId}-${report.supermarketSlug}-${date}.${ext}`;
}

// ============================================
// PÁGINA DE REPORTES
// ============================================
export default function ReportsPage() {
  const [report, setReport] = useState<AnalystComparisonReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReport, setSelectedReport] = useState<ReportType['id']>('products');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await analystApi.comparisonReport(selectedDays);
        if (!cancelled) setReport(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar reporte');
          setReport(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDays]);

  const selectedReportData = REPORT_TYPES.find((r) => r.id === selectedReport)!;

  // Para Tendencias: top movers (mayor caída + mayor subida)
  const topMovers = useMemo(() => {
    if (!report) return { topRises: [], topDrops: [] };
    const withChange = report.items.filter(
      (it): it is AnalystComparisonReportItem & { priceChangePct: number } =>
        typeof it.priceChangePct === 'number',
    );
    const sorted = [...withChange].sort((a, b) => b.priceChangePct - a.priceChangePct);
    return {
      topRises: sorted.slice(0, 5),
      topDrops: sorted.slice(-5).reverse(),
    };
  }, [report]);

  const handleExport = async () => {
    if (!report) return;
    setIsExporting(true);
    setExportSuccess(false);
    try {
      if (exportFormat === 'excel') {
        const rows = buildCsvRows(selectedReport, report);
        downloadCsv(buildFilename(selectedReport, report, 'csv'), rows);
      } else {
        downloadPdf(selectedReport, selectedReportData.name, report);
      }
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Reportes y Exportar</h1>
            <p className="text-gray-500 mt-0.5">
              Genera reportes de tu cadena en CSV o PDF con datos reales del último período
            </p>
          </div>

          {/* Pills de ventana */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setSelectedDays(r.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  selectedDays === r.value
                    ? 'bg-white text-accent-green-dark shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Loader2 className="animate-spin mx-auto text-gray-400" size={32} />
          <p className="mt-3 text-sm text-gray-500">Generando reporte…</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-200 flex items-center gap-3 text-red-700">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tipos de reportes + formato + acción */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Tipo de Reporte</h3>
              <div className="space-y-2">
                {REPORT_TYPES.map((report) => {
                  const Icon = report.icon;
                  const isActive = selectedReport === report.id;
                  return (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary/30 ring-2 ring-accent-green'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${report.bgColor}`}>
                          <Icon size={18} className={report.color} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 text-sm">{report.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Formato</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    exportFormat === 'pdf'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <File
                    size={24}
                    className={`mx-auto ${exportFormat === 'pdf' ? 'text-red-500' : 'text-gray-400'}`}
                  />
                  <p
                    className={`text-sm font-medium mt-2 ${exportFormat === 'pdf' ? 'text-red-600' : 'text-gray-600'}`}
                  >
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
                  <FileSpreadsheet
                    size={24}
                    className={`mx-auto ${exportFormat === 'excel' ? 'text-green-500' : 'text-gray-400'}`}
                  />
                  <p
                    className={`text-sm font-medium mt-2 ${exportFormat === 'excel' ? 'text-green-600' : 'text-gray-600'}`}
                  >
                    CSV / Excel
                  </p>
                </button>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting || !report}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                exportSuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-accent-green-dark text-white hover:opacity-90'
              } ${isExporting || !report ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isExporting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generando…
                </>
              ) : exportSuccess ? (
                <>
                  <Check size={20} />
                  Descargado
                </>
              ) : (
                <>
                  <Download size={20} />
                  Exportar {exportFormat === 'pdf' ? 'PDF' : 'CSV'}
                </>
              )}
            </button>
          </div>

          {/* Vista previa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${selectedReportData.bgColor}`}>
                      <selectedReportData.icon size={20} className={selectedReportData.color} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-gray-800">{selectedReportData.name}</h2>
                      <p className="text-sm text-gray-500">{selectedReportData.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>
                        {new Date(report.generatedAt).toLocaleDateString('es-VE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4 pb-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: OWN_COLOR }}
                    >
                      {report.supermarketName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{report.supermarketName}</p>
                      <p className="text-xs text-gray-500">
                        Ventana de {report.daysWindow} días · {report.items.length} productos
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vista previa de cada reporte */}
                {selectedReport === 'products' && (
                  <ProductsPreview items={report.items} />
                )}
                {selectedReport === 'comparison' && (
                  <ComparisonPreview items={report.items} />
                )}
                {selectedReport === 'trends' && (
                  <TrendsPreview
                    report={report}
                    topRises={topMovers.topRises}
                    topDrops={topMovers.topDrops}
                  />
                )}

                <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
                  Vista previa · El archivo completo se generará al exportar
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PREVIEWS
// ============================================
function ProductsPreview({ items }: { items: AnalystComparisonReportItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 font-semibold text-gray-600">Producto</th>
            <th className="text-left py-2 px-3 font-semibold text-gray-600">Categoría</th>
            <th className="text-left py-2 px-3 font-semibold text-gray-600">Unidad</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-600">Precio actual</th>
          </tr>
        </thead>
        <tbody>
          {items.slice(0, 8).map((it) => (
            <tr key={it.productId} className="border-b border-gray-100">
              <td className="py-2 px-3 text-gray-800">{it.productName}</td>
              <td className="py-2 px-3 text-gray-600">{it.categoryName ?? '—'}</td>
              <td className="py-2 px-3 text-gray-500">
                {it.baseAmount} {it.unitType}
              </td>
              <td
                className="py-2 px-3 text-right font-medium"
                style={{ color: OWN_COLOR }}
              >
                {fmt(it.ownPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length > 8 && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Mostrando 8 de {items.length} productos. El archivo exportado los incluye todos.
        </p>
      )}
    </div>
  );
}

function ComparisonPreview({ items }: { items: AnalystComparisonReportItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 font-semibold text-gray-600">Producto</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-600">Tu precio</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-600">Prom. comp.</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-600">Diferencia</th>
          </tr>
        </thead>
        <tbody>
          {items.slice(0, 8).map((it) => (
            <tr key={it.productId} className="border-b border-gray-100">
              <td className="py-2 px-3 text-gray-800">{it.productName}</td>
              <td
                className="py-2 px-3 text-right font-medium"
                style={{ color: OWN_COLOR }}
              >
                {fmt(it.ownPrice)}
              </td>
              <td className="py-2 px-3 text-right text-gray-600">{fmt(it.avgCompetition)}</td>
              <td
                className={`py-2 px-3 text-right font-medium ${
                  it.diffPct == null
                    ? 'text-gray-400'
                    : it.diffPct <= 0
                      ? 'text-green-600'
                      : 'text-red-500'
                }`}
              >
                {pct(it.diffPct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length > 8 && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Mostrando 8 de {items.length} productos.
        </p>
      )}
    </div>
  );
}

function TrendsPreview({
  report,
  topRises,
  topDrops,
}: {
  report: AnalystComparisonReport;
  topRises: AnalystComparisonReportItem[];
  topDrops: AnalystComparisonReportItem[];
}) {
  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Productos</p>
          <p className="text-lg font-bold text-gray-800">{report.summary.totalProducts}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Tu precio promedio</p>
          <p className="text-lg font-bold" style={{ color: OWN_COLOR }}>
            {fmt(report.summary.avgOwnPrice)}
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Prom. competencia</p>
          <p className="text-lg font-bold text-gray-700">
            {fmt(report.summary.avgCompetitionPrice)}
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Diferencia media</p>
          <p
            className={`text-lg font-bold ${
              report.summary.avgDiffPct == null
                ? 'text-gray-400'
                : report.summary.avgDiffPct <= 0
                  ? 'text-green-600'
                  : 'text-red-500'
            }`}
          >
            {pct(report.summary.avgDiffPct)}
          </p>
        </div>
      </div>

      {/* Top movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-red-500" />
            Mayores subidas
          </h4>
          {topRises.length > 0 ? (
            <ul className="space-y-1.5">
              {topRises.map((it) => (
                <li key={it.productId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate mr-2">{it.productName}</span>
                  <span className="text-red-500 font-medium flex-shrink-0">
                    {pct(it.priceChangePct)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">Sin datos suficientes.</p>
          )}
        </div>

        <div className="p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500 rotate-180" />
            Mayores bajadas
          </h4>
          {topDrops.length > 0 ? (
            <ul className="space-y-1.5">
              {topDrops.map((it) => (
                <li key={it.productId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate mr-2">{it.productName}</span>
                  <span className="text-green-600 font-medium flex-shrink-0">
                    {pct(it.priceChangePct)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">Sin datos suficientes.</p>
          )}
        </div>
      </div>
    </div>
  );
}
