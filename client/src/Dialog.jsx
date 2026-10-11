import { useEffect, useRef, useId } from "react";
export function ConfirmDialog({
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
}) {
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    const node = ref.current;
    node?.showModal();
    return () => node?.close();
  }, []);
  return (
    <dialog ref={ref} onCancel={onClose} aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <div className="dialog-content">{children}</div>
      <div className="dialog-actions">
        <button className="secondary" autoFocus onClick={onClose}>
          Cancel
        </button>
        <button className="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
