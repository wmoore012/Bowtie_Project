import { useEffect, useRef } from "react";
import styles from "./BuilderModeConfirmDialog.module.css";

interface BuilderModeConfirmDialogProps {
  open: boolean;
  onConfirm: (clearDiagram: boolean) => void;
}

export function BuilderModeConfirmDialog({ open, onConfirm }: BuilderModeConfirmDialogProps) {
  const yesButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && yesButtonRef.current) {
      yesButtonRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onConfirm(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onConfirm]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={() => onConfirm(false)}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="builder-confirm-title"
      >
        <h2 id="builder-confirm-title" className={styles.title}>
          Start Building Your Bowtie
        </h2>
        <p className={styles.message}>
          Do you want to clear the diagram and start fresh, or keep the current diagram and edit it?
        </p>
        <div className={styles.buttonGroup}>
          <button
            ref={yesButtonRef}
            type="button"
            className={styles.yesButton}
            onClick={() => onConfirm(true)}
          >
            Clear & Start Fresh
          </button>
          <button
            type="button"
            className={styles.noButton}
            onClick={() => onConfirm(false)}
          >
            Keep Current Diagram
          </button>
        </div>
      </div>
    </div>
  );
}

