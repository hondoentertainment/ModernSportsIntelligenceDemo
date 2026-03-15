import React from 'react';
import { AlertTriangle, Trash2, Tag } from 'lucide-react';
import { useFocusTrap } from '../lib/useFocusTrap';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger: {
    icon: <Trash2 size={24} />,
    iconBg: 'bg-brand-red/10 text-brand-red',
    confirmBg: 'bg-brand-red hover:bg-red-600 text-white',
  },
  warning: {
    icon: <AlertTriangle size={24} />,
    iconBg: 'bg-brand-orange/10 text-brand-orange',
    confirmBg: 'bg-brand-orange hover:bg-orange-600 text-brand-charcoal',
  },
  info: {
    icon: <Tag size={24} />,
    iconBg: 'bg-brand-lime/10 text-brand-lime',
    confirmBg: 'bg-brand-lime hover:bg-lime-300 text-brand-charcoal',
  },
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);
  const styles = VARIANT_STYLES[variant];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div
        ref={trapRef}
        className="w-full max-w-md bg-brand-slate border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl flex-shrink-0 ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div>
              <h3 id="confirm-title" className="text-lg font-bold text-white">{title}</h3>
              <p id="confirm-message" className="text-sm text-brand-muted mt-1 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-brand-charcoal/50 hover:bg-brand-charcoal border border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-brand-muted hover:text-white transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${styles.confirmBg}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
