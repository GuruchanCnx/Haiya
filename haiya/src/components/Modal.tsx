import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
export default function Modal({
  title,
  close,
  children,
  closeLabel,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
  closeLabel: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    node?.showModal();
    return () => {
      node?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="modal-head">
        <div>
          <span className="eyebrow">WANCHAI SOY MILK HOUSE</span>
          <h2 id="modal-title">{title}</h2>
        </div>
        <button className="icon-button" aria-label={closeLabel} onClick={close}>
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
