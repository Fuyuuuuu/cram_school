// frontend/src/modules/finance/ReceiptModal.js

import React from 'react';

const ReceiptModal = ({ show, onClose, data }) => {
    // 確保 data 存在
    if (!show || !data) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">繳費收據</h3>
                <div className="border-t border-b border-gray-300 py-4 mb-4">
                    <p className="mb-2"><span className="font-semibold">補習班名稱:</span> {data.centerName}</p>
                    <p className="mb-2"><span className="font-semibold">收據編號:</span> {data.id}</p>
                    <p className="mb-2"><span className="font-semibold">學生姓名:</span> {data.studentName}</p>
                    {/* 使用 data.payment_term (snake_case) */}
                    <p className="mb-2"><span className="font-semibold">繳費項目:</span> {data.payment_term}</p>
                    <p className="mb-2"><span className="font-semibold">描述:</span> {data.description}</p>
                    <p className="mb-2"><span className="font-semibold">繳費金額:</span> NT$ {data.amount}</p>
                    {/* 格式化 record_date */}
                    <p className="mb-2"><span className="font-semibold">收款日期:</span> {new Date(data.record_date).toLocaleDateString('zh-TW')}</p>
                </div>
                <p className="text-center text-gray-600 text-sm">感謝您的繳費！</p>
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                    >
                        列印收據
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;