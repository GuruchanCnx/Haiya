/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { Order, chime, triggerHaptic } from "../lib/store";

export type ToastType = "success" | "warning" | "info" | "error";

export interface ToastNotification {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export interface ToastContextType {
  toasts: ToastNotification[];
  addToast: (notification: Omit<ToastNotification, "id">) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastSequence = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((notification: Omit<ToastNotification, "id">) => {
    toastSequence = (toastSequence + 1) % 100000;
    const id = `toast-${Date.now()}-${toastSequence}`;
    const newToast: ToastNotification = { ...notification, id };

    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

    const duration = notification.duration ?? 4500;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <OfflineConnectionWatcher />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

/**
 * ToastContainer renders active toasts with iOS liquid glass styling
 */
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastNotification[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <aside
      className="toast-container"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isWarning = toast.type === "warning";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`toast-card liquid-glass-card ${
              isSuccess
                ? "toast-success"
                : isWarning
                ? "toast-warning"
                : isError
                ? "toast-error"
                : "toast-info"
            }`}
          >
            <div className="toast-icon" aria-hidden="true">
              {isSuccess && "✓"}
              {isWarning && "⚠"}
              {isError && "✕"}
              {toast.type === "info" && "ℹ"}
            </div>
            <div className="toast-body">
              {toast.title && <div className="toast-title">{toast.title}</div>}
              <p className="toast-message">{toast.message}</p>
              {toast.action && (
                <button
                  type="button"
                  className="toast-action"
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id);
                  }}
                >
                  {toast.action.label} →
                </button>
              )}
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </aside>
  );
}

/**
 * OfflineConnectionWatcher detects network state changes and leverages PWA capabilities
 */
function OfflineConnectionWatcher() {
  const { addToast } = useToast();
  const hasInitialized = useRef(false);

  useEffect(() => {
    const handleOnline = () => {
      triggerHaptic("medium");
      addToast({
        type: "success",
        title: "Internet Connection Restored / เชื่อมต่ออินเทอร์เน็ตแล้ว",
        message: "You are back online. Live syncing with kitchen and inventory is active.",
        duration: 4000,
      });
    };

    const handleOffline = () => {
      triggerHaptic("heavy");
      addToast({
        type: "warning",
        title: "Connection Lost / ขาดการเชื่อมต่ออินเทอร์เน็ต",
        message: "You are currently offline. PWA offline cache enabled; local orders are stored safely.",
        duration: 6000,
      });
    };

    // If offline on initial mount
    if (!navigator.onLine && !hasInitialized.current) {
      handleOffline();
    }
    hasInitialized.current = true;

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addToast]);

  return null;
}

/**
 * RealtimeOrderStatusNotifier watches orders and triggers toasts when order status changes
 */
export function RealtimeOrderStatusNotifier({
  orders,
  onViewReceipt,
}: {
  orders: Order[];
  onViewReceipt?: (order: Order) => void;
}) {
  const { addToast } = useToast();
  const prevStatusRef = useRef<Map<string, string>>(new Map());
  const initialLoadRef = useRef(true);

  useEffect(() => {
    // Skip on first initial render so we don't spam toasts for existing orders
    if (initialLoadRef.current) {
      const map = new Map<string, string>();
      orders.forEach((o) => map.set(o.id, o.status));
      prevStatusRef.current = map;
      initialLoadRef.current = false;
      return;
    }

    const currentMap = new Map<string, string>();
    orders.forEach((order) => {
      currentMap.set(order.id, order.status);
      const prevStatus = prevStatusRef.current.get(order.id);

      if (prevStatus && prevStatus !== order.status) {
        // Status changed!
        triggerHaptic(order.status === "ready" ? "success" : "light");
        chime(true, order.status === "ready");

        const statusLabel =
          order.status === "preparing"
            ? "Now Preparing / กำลังจัดเตรียม"
            : order.status === "ready"
            ? "Ready for Pickup! / พร้อมรับสินค้าแล้ว!"
            : order.status === "collected"
            ? "Completed & Collected / รับสินค้าเรียบร้อยแล้ว"
            : "Received / ได้รับออเดอร์แล้ว";

        addToast({
          type: order.status === "ready" ? "success" : "info",
          title: `Order Status Updated • #${order.id.slice(-6).toUpperCase()}`,
          message: `${order.name ? order.name + " · " : ""}${statusLabel} (${
            order.items.length
          } item${order.items.length > 1 ? "s" : ""})`,
          action: onViewReceipt
            ? {
                label: "View Receipt / ดูใบเสร็จ",
                onClick: () => onViewReceipt(order),
              }
            : undefined,
          duration: 5500,
        });
      }
    });

    prevStatusRef.current = currentMap;
  }, [orders, addToast, onViewReceipt]);

  return null;
}

export default ToastContext;
