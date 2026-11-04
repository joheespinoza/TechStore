import { useEffect, useId, useRef, type ReactNode } from "react";

/* Elementos que forman parte del ciclo de Tab dentro del modal */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* Elementos que pueden recibir el foco al abrir (sin campos de solo lectura) */
const INITIAL_FOCUS =
  'a[href], button:not([disabled]), input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(INITIAL_FOCUS);

    (first ?? dialog)?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeRef.current();
      return;
    }

    if (e.key !== "Tab") return;

    const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!nodes || nodes.length === 0) return;

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="checkout-overlay">
      <div
        ref={dialogRef}
        className="checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="checkout-modal-header">
          <h2 id={titleId}>{title}</h2>
        </div>

        <div className="checkout-modal-content">
          {description && <p id={descId}>{description}</p>}
          {children}
        </div>

        {footer && <div className="checkout-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}