import React from 'react';
import { X } from 'tabler-icons-react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export default function Modal({
  isOpen,
  title,
  onClose,
  onConfirm,
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          {onConfirm && (
            <button
              className={`btn-confirm ${isDangerous ? 'dangerous' : ''}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
