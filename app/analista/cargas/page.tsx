'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Trash2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { BackendUpload, IngestionStatusBackend, uploadsApi } from '../../lib/api';
import { Pagination } from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

// ============================================
// COMPONENTE DE ZONA DE CARGA
// ============================================
function UploadZone({
  onFileSelect,
  isUploading
}: {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.csv')) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200
        ${isDragging
          ? 'border-button-green bg-primary/10'
          : 'border-gray-200 hover:border-gray-300 bg-gray-50'
        }
        ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileInput}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center gap-4">
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center
          ${isDragging ? 'bg-primary' : 'bg-gray-200'}
        `}>
          <Upload size={32} className={isDragging ? 'text-accent-green-dark' : 'text-gray-500'} />
        </div>

        <div>
          <p className="text-lg font-medium text-gray-800">
            {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo CSV aquí'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            o haz clic para seleccionar un archivo
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FileSpreadsheet size={16} />
          <span>Solo archivos .csv</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE DE PREVIEW DE ARCHIVO
// ============================================
function FilePreview({
  file,
  onRemove,
  onUpload,
  isUploading,
  uploadProgress
}: {
  file: File;
  onRemove: () => void;
  onUpload: () => void;
  isUploading: boolean;
  uploadProgress: number;
}) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <FileText size={24} className="text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        </div>

        {!isUploading && (
          <button
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Subiendo...</span>
            <span className="text-gray-800 font-medium">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-button-green rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {!isUploading && (
        <button
          onClick={onUpload}
          className="mt-4 w-full py-3 bg-button-green text-white rounded-xl font-medium hover:bg-accent-green-dark transition-colors flex items-center justify-center gap-2"
        >
          <Upload size={20} />
          Subir Archivo
        </button>
      )}
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL DE CARGAS
// ============================================
function formatUploadDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(',', '');
}

function pluralize(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

/**
 * Combina el resultado de validación (status) + el resultado de ingesta
 * al DWH (ingestionStatus) en un mensaje legible. Es informativo: la barra
 * verde sigue siendo "éxito" mientras el archivo se haya aceptado, aunque
 * la ingesta haya devuelto sin_match/pendiente (esos se explican en el msg).
 */
function buildUploadResultMessage(up: BackendUpload): { success: boolean; message: string } {
  if (up.status === 'error') {
    return { success: false, message: 'No se reconoció ninguna fila válida en el archivo.' };
  }
  const errorsSuffix = up.errorsCount > 0
    ? ` (${up.errorsCount} ${pluralize(up.errorsCount, 'fila con error', 'filas con errores')} — ver historial)`
    : '';
  const head = `${up.productsCount} ${pluralize(up.productsCount, 'producto válido', 'productos válidos')}${errorsSuffix}.`;

  switch (up.ingestionStatus) {
    case 'ingestado':
      return {
        success: true,
        message:
          `${head} ${up.matchedRows} ${pluralize(up.matchedRows, 'match', 'matches')} con el catálogo canónico` +
          (up.unmatchedRows > 0 ? `, ${up.unmatchedRows} sin match` : '') +
          ` → ${up.factRowsInserted} ${pluralize(up.factRowsInserted, 'fila insertada', 'filas insertadas')} en fact_prices.`,
      };
    case 'sin_match':
      return {
        success: true,
        message:
          `${head} Ningún producto matcheó el catálogo canónico (${up.unmatchedRows} sin match). ` +
          `Los datos NO se cargaron al DWH; revisa que los nombres/marcas estén en el maestro.`,
      };
    case 'pendiente':
      return {
        success: true,
        message:
          `${head} Archivo guardado, pero el servicio de ingesta no está disponible. ` +
          `Se reintentará automáticamente.`,
      };
    case 'fallido':
      return {
        success: false,
        message: `${head} Falló la ingesta al DWH: ${up.ingestionError ?? 'error desconocido'}.`,
      };
    case 'no_aplica':
    default:
      return { success: true, message: head };
  }
}

const INGESTION_BADGE: Record<IngestionStatusBackend, { text: string; cls: string }> = {
  ingestado: { text: 'Ingestado', cls: 'bg-emerald-100 text-emerald-700' },
  sin_match: { text: 'Sin match', cls: 'bg-amber-100 text-amber-700' },
  pendiente: { text: 'Pendiente', cls: 'bg-blue-100 text-blue-700' },
  fallido: { text: 'Fallido', cls: 'bg-red-100 text-red-700' },
  no_aplica: { text: 'N/A', cls: 'bg-gray-100 text-gray-500' },
};

export default function CargasPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);

  const [history, setHistory] = useState<BackendUpload[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHistoryLoading(true);
    uploadsApi
      .list()
      .then((rows) => {
        if (!cancelled) {
          setHistory(rows);
          setHistoryError(null);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setHistoryError(e.message);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Paginacion
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedData: paginatedHistory,
    totalItems
  } = usePagination({ data: history, initialItemsPerPage: 10 });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const created = await uploadsApi.upload(selectedFile, (pct) => setUploadProgress(pct));
      setHistory((prev) => [created, ...prev]);
      setSelectedFile(null);
      setUploadResult(buildUploadResultMessage(created));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido al subir el archivo';
      setUploadResult({ success: false, message: msg });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadErrors = async (uploadId: number) => {
    try {
      await uploadsApi.downloadErrors(uploadId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al descargar el reporte';
      setUploadResult({ success: false, message: msg });
    }
  };

  const getStatusIcon = (status: BackendUpload['status']) => {
    switch (status) {
      case 'completado':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'procesando':
        return <Clock size={18} className="text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle size={18} className="text-red-500" />;
    }
  };

  const getStatusText = (status: BackendUpload['status']) => {
    switch (status) {
      case 'completado':
        return 'Completado';
      case 'procesando':
        return 'Procesando';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Carga de Datos</h1>
        <p className="text-gray-500">
          Sube archivos CSV con productos y precios para tu supermercado.
        </p>
      </div>

      {/* Mensaje de resultado */}
      {uploadResult && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          uploadResult.success
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {uploadResult.success
            ? <CheckCircle size={20} className="text-green-600" />
            : <XCircle size={20} className="text-red-600" />
          }
          <span className={uploadResult.success ? 'text-green-700' : 'text-red-700'}>
            {uploadResult.message}
          </span>
        </div>
      )}

      {/* Zona de carga o preview */}
      {selectedFile ? (
        <FilePreview
          file={selectedFile}
          onRemove={handleRemoveFile}
          onUpload={handleUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      ) : (
        <UploadZone onFileSelect={handleFileSelect} isUploading={isUploading} />
      )}

      {/* Formato esperado */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Formato esperado del CSV</p>
            <p className="text-sm text-blue-600 mt-1">
              El archivo debe contener las columnas: <code className="bg-blue-100 px-1 rounded">nombre</code>,{' '}
              <code className="bg-blue-100 px-1 rounded">categoria</code>,{' '}
              <code className="bg-blue-100 px-1 rounded">precio</code>,{' '}
              <code className="bg-blue-100 px-1 rounded">codigo</code> (opcional)
            </p>
            <a
              href="/templates/cargas-template.csv"
              download
              className="mt-3 inline-flex items-center gap-1 text-sm text-blue-700 font-medium hover:text-blue-800"
            >
              <Download size={16} />
              Descargar plantilla de ejemplo
            </a>
          </div>
        </div>
      </div>

      {/* Historial de cargas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Historial de Cargas</h2>
        </div>

        {historyError && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700">
            {historyError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Archivo</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Productos</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Validación</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Ingesta DWH</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Cargando historial...
                  </td>
                </tr>
              ) : paginatedHistory.length > 0 ? (
                paginatedHistory.map((upload) => {
                  const badge = INGESTION_BADGE[upload.ingestionStatus] ?? INGESTION_BADGE.no_aplica;
                  return (
                    <tr key={upload.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-gray-400" />
                          <span className="font-medium text-gray-800">{upload.fileName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatUploadDate(upload.uploadDate)}</td>
                      <td className="px-6 py-4">
                        <span className="text-gray-800">{upload.productsCount}</span>
                        {upload.errorsCount > 0 && (
                          <span className="ml-2 text-xs text-red-500">({upload.errorsCount} con error)</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          upload.status === 'completado'
                            ? 'bg-green-100 text-green-700'
                            : upload.status === 'procesando'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {getStatusIcon(upload.status)}
                          {getStatusText(upload.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${badge.cls}`}
                            title={upload.ingestionError ?? ''}
                          >
                            {badge.text}
                          </span>
                          {upload.ingestionStatus === 'ingestado' && (
                            <span className="text-xs text-gray-500">
                              {upload.matchedRows}/{upload.matchedRows + upload.unmatchedRows} matches · {upload.factRowsInserted} a fact_prices
                            </span>
                          )}
                          {upload.ingestionStatus === 'sin_match' && (
                            <span className="text-xs text-amber-600">
                              0/{upload.unmatchedRows} matches
                            </span>
                          )}
                          {upload.ingestionStatus === 'fallido' && upload.ingestionError && (
                            <span className="text-xs text-red-500 truncate max-w-[200px]" title={upload.ingestionError}>
                              {upload.ingestionError}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {upload.errorsCount > 0 && (
                          <button
                            onClick={() => handleDownloadErrors(upload.id)}
                            className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            <Download size={14} />
                            Errores
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No hay cargas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginacion */}
        {history.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            itemName="cargas"
          />
        )}
      </div>
    </div>
  );
}
