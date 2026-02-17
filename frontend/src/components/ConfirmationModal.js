// frontend/src/components/ConfirmationModal.js
import React from 'react';

const ConfirmationModal = ({ show, onClose, onConfirm, title, message }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center py-8 px-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">{title}</h3>
        <p className="text-gray-700 text-center mb-6 text-base leading-relaxed">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-8 py-3 text-base bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all"
          >
            確認
          </button>
          <button
            onClick={onClose}
            className="px-8 py-3 text-base bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all"
          >
            取消
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;