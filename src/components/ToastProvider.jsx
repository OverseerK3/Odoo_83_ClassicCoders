import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    error: <XCircleIcon className="w-6 h-6 text-red-500" />,
    warning: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />,
    info: <InformationCircleIcon className="w-6 h-6 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={`${bgColors[toast.type]} border rounded-lg p-4 shadow-lg max-w-sm w-full transition-all duration-300 transform translate-x-0 opacity-100`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icons[toast.type]}
        </div>
        <div className="ml-3 flex-1">
          {toast.title && (
            <h4 className="text-sm font-semibold text-slate-800 mb-1">
              {toast.title}
            </h4>
          )}
          <p className="text-sm text-slate-700">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-4 flex-shrink-0 text-slate-400 hover:text-slate-600"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, ...toast };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after delay
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, title, duration) => {
    return addToast({ type: 'success', message, title, duration });
  }, [addToast]);

  const error = useCallback((message, title, duration) => {
    return addToast({ type: 'error', message, title, duration });
  }, [addToast]);

  const warning = useCallback((message, title, duration) => {
    return addToast({ type: 'warning', message, title, duration });
  }, [addToast]);

  const info = useCallback((message, title, duration) => {
    return addToast({ type: 'info', message, title, duration });
  }, [addToast]);

  const value = {
    success,
    error,
    warning,
    info,
    addToast,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
