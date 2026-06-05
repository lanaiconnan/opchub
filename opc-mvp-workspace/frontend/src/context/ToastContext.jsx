import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              color: '#fff',
              fontWeight: 500,
              fontSize: 14,
              background: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#3b82f6',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastContext;
