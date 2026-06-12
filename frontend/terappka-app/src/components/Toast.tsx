"use client";

import { useEffect } from "react";
import { ToastMessageType } from "../types/toast";

interface ToastProps {
  message: string;
  type: ToastMessageType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeConfig = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      icon: "✅",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "⚠️",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      icon: "⏳",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "ℹ️",
    },
  };

  const { bg, border, text, icon } = typeConfig[type];

  return (
    <>
      <div
        className={`fixed top-6 right-6 z-[9999] px-6 py-4 rounded-xl shadow-lg border flex items-center gap-3 transform transition-all ${bg} ${border} ${text}`}
        style={{ animation: "slideInRight 0.3s ease-out forwards" }}
      >
        <span className="text-xl">{icon}</span>
        <p className="font-medium text-sm">{message}</p>

        <button
          onClick={onClose}
          className="ml-4 opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Zamknij powiadomienie"
        >
          ✕
        </button>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
