// frontend/src/components/ToastProvider.jsx
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastCtx = createContext(null);

export const useToast = () => useContext(ToastCtx);

const Toast = ({ t, onDone }) => {
  const { id, type, message } = t;
  const color = type === "error" ? "bg-red-600" : type === "success" ? "bg-emerald-600" : "bg-gray-800";
  return (
    <div className={`${color} text-white px-4 py-2 rounded shadow-md`} role="status" onAnimationEnd={() => onDone(id)}>
      {message}
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "info", ms = 2500) => {
    const id = Date.now() + Math.random();
    setToasts((x) => [...x, { id, type, message }]);
    setTimeout(() => setToasts((x) => x.filter((t) => t.id !== id)), ms);
  }, []);

  const onDone = useCallback((id) => setToasts((x) => x.filter((t) => t.id !== id)), []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} t={t} onDone={onDone} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
};
