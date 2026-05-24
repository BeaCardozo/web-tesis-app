'use client';

import { useEffect, useId, type ReactNode } from 'react';
import { Loader2, X } from 'lucide-react';

// ============================================
// MODAL — Diálogo modal accesible compartido
// ============================================
// Centraliza:
//  - Backdrop con click-fuera-para-cerrar
//  - Tecla Escape para cerrar
//  - body { overflow: hidden } mientras está abierto
//  - role="dialog" + aria-modal + aria-labelledby/aria-label
// ============================================

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

export type ModalSize = keyof typeof SIZE_CLASSES;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Título mostrado en el header. Si no se pasa, no se renderiza el header. */
  title?: ReactNode;
  /** Texto secundario opcional bajo el título. */
  subtitle?: ReactNode;
  size?: ModalSize;
  /** Si false, click en el backdrop no cierra (útil mientras hay una acción en curso). */
  closeOnBackdrop?: boolean;
  /** Si false, Escape no cierra. */
  closeOnEscape?: boolean;
  /** aria-label cuando no se pasa `title`. */
  ariaLabel?: string;
  children: ReactNode;
  /** Render directo del footer (botones). Si no se pasa, no se renderiza. */
  footer?: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  ariaLabel,
  children,
  footer,
}: ModalProps) {
  const labelId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, closeOnEscape]);

  if (!open) return null;

  const labelledBy = title ? labelId : undefined;
  const effectiveAriaLabel = title ? undefined : ariaLabel;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-label={effectiveAriaLabel}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full ${SIZE_CLASSES[size]} max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {title && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <div className="min-w-0">
              <h2 id={labelId} className="text-lg font-semibold text-gray-800 tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// CONFIRM DIALOG — Variante para confirmaciones
// ============================================
// Para los flujos "¿Estás seguro de X?" con un botón principal y otro de cancelar.
// Soporta variantes "danger" (rojo) y "primary" (verde).

type ConfirmTone = 'danger' | 'primary';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" para acciones destructivas (rojo); "primary" para acciones afirmativas. */
  tone?: ConfirmTone;
  /** Spinner + bloqueo de botones mientras se ejecuta la acción. */
  isLoading?: boolean;
}

const TONE_CLASSES: Record<ConfirmTone, string> = {
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  primary: 'bg-button-green hover:bg-accent-green-dark text-white',
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60 ${TONE_CLASSES[tone]}`}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-gray-600 text-sm">{message}</p>
    </Modal>
  );
}
