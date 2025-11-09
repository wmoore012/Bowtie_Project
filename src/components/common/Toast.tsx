import { useEffect } from "react";
import styles from "./Toast.module.css";

export interface ToastProps {
  message: string;
  type?: "error" | "success" | "info" | "warning";
  duration?: number;
  onClose: () => void;
  ariaLive?: "polite" | "assertive";
}

export function Toast({
  message,
  type = "error",
  duration = 5000,
  onClose,
  ariaLive = "assertive",
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`${styles.toast} ${styles[type]}`}
      role="alert"
      aria-live={ariaLive}
      aria-atomic="true"
    >
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          {type === "error" && "⚠️"}
          {type === "success" && "✓"}
          {type === "info" && "ℹ"}
          {type === "warning" && "⚠"}
        </span>
        <span className={styles.message}>{message}</span>
      </div>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

