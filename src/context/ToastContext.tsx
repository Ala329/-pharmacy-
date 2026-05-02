import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, AlertCircle, CheckCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`flex items-center gap-3 p-4 rounded-2xl shadow-lg border ${
                toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
                toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {toast.type === 'error' ? <XCircle className="w-5 h-5 flex-shrink-0" /> :
               toast.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> :
               <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <p className="text-sm font-bold">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
