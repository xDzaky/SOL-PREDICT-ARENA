/**
 * Toast Hook - Simple toast notifications
 */

import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, message };

    setToasts((prev) => [...prev, toast]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);

    return id;
  }, []);

  const showSuccess = useCallback(
    (message: string) => showToast("success", message),
    [showToast]
  );

  const showError = useCallback(
    (message: string) => showToast("error", message),
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => showToast("info", message),
    [showToast]
  );

  const showWarning = useCallback(
    (message: string) => showToast("warning", message),
    [showToast]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast,
  };
}
