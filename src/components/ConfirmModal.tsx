import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2rem] border-4 border-gray-100 dark:border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">{title}</h2>
          <button 
            onClick={onCancel}
            className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-bold mb-6">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-black rounded-2xl active:scale-95 transition-transform"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-3 font-black rounded-2xl active:scale-95 transition-transform text-white ${
              isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
