"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "bg-primary-50 border-primary-200 text-primary-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export function NotificationItem({ notification, onDismiss }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const Icon = icons[notification.type];

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  }, [notification.id, onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto relative w-full max-w-sm transform overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out",
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        styles[notification.type],
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{notification.title}</p>
            {notification.message && (
              <p className="mt-1 text-sm opacity-90">{notification.message}</p>
            )}
            {notification.action && (
              <div className="mt-3">
                <button
                  onClick={notification.action.onClick}
                  className="text-sm font-medium underline hover:no-underline"
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="inline-flex rounded-md bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NotificationContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationContainer({ notifications, onDismiss }: NotificationContainerProps) {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center px-4 py-6 sm:items-start sm:justify-end sm:p-6"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };
    setNotifications((prev) => [...prev, newNotification]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
  };
}
