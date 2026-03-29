import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xl"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
