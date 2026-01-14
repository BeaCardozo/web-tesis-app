'use client';

import { useState, useRef } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { mockSupermarkets, uploadHistory, UploadHistory } from '../../data/mockData';

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
export default function CargasPage() {
  const { user } = useAuth();
  const supermarket = mockSupermarkets.find(s => s.id === user?.supermarketId);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);

  // Estado local del historial (simula actualizaciones)
  const [history, setHistory] = useState<UploadHistory[]>(
    uploadHistory.filter(h => h.supermarketId === user?.supermarketId)
  );

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

    // Simular progreso de carga
    // TODO: Reemplazar con llamada real a API
    // const formData = new FormData();
    // formData.append('file', selectedFile);
    // const response = await fetch('/api/upload', { method: 'POST', body: formData });

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    // Simular resultado exitoso
    const newUpload: UploadHistory = {
      id: `u${Date.now()}`,
      supermarketId: user?.supermarketId || '1',
      fileName: selectedFile.name,
      uploadDate: new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', ''),
      productsCount: Math.floor(Math.random() * 200) + 50,
      status: 'completado'
    };

    setHistory([newUpload, ...history]);
    setIsUploading(false);
    setSelectedFile(null);
    setUploadResult({
      success: true,
      message: `Se procesaron ${newUpload.productsCount} productos correctamente`
    });
  };

  const getStatusIcon = (status: UploadHistory['status']) => {
    switch (status) {
      case 'completado':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'procesando':
        return <Clock size={18} className="text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle size={18} className="text-red-500" />;
    }
  };

  const getStatusText = (status: UploadHistory['status']) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Carga de Datos</h1>
        <p className="text-gray-500">
          Sube archivos CSV con productos y precios para {supermarket?.name}
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
            <button className="mt-3 text-sm text-blue-700 font-medium hover:text-blue-800 flex items-center gap-1">
              <Download size={16} />
              Descargar plantilla de ejemplo
            </button>
          </div>
        </div>
      </div>

      {/* Historial de cargas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Historial de Cargas</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Archivo</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Productos</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((upload) => (
                  <tr key={upload.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-gray-400" />
                        <span className="font-medium text-gray-800">{upload.fileName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{upload.uploadDate}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-800">{upload.productsCount}</span>
                      {upload.errors && (
                        <span className="ml-2 text-xs text-red-500">({upload.errors} errores)</span>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No hay cargas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
