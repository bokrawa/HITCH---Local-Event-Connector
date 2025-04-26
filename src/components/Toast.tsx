import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const TOAST_STYLES = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: Info,
  },
};

export function Toast({ message, type, onClose }: ToastProps) {
  const styles = TOAST_STYLES[type];
  const Icon = styles.icon;

  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 flex items-start justify-between animate-slide-up`}
      role="alert"
    >
      <div className="flex items-center">
        <Icon className={`h-5 w-5 ${styles.text} mr-3`} />
        <p className={`${styles.text} font-medium`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`${styles.text} hover:opacity-75 transition-opacity`}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {children}
    </div>
  );
}