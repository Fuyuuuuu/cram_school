// frontend/src/components/ConfirmationModal.js
import React from 'react';

const ConfirmationModal = ({ show, onClose, onConfirm, title, message }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full relative">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{title}</h3>
        <p className="text-gray-700 text-center mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all"
          >
            確認
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;