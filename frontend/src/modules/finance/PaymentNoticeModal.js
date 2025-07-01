// frontend/src/modules/finance/PaymentNoticeModal.js

import React from 'react';

const PaymentNoticeModal = ({ show, onClose, data }) => {
    // 確保 data 存在且 notices 是陣列
    if (!show || !data || !Array.isArray(data.notices)) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">繳費通知單</h3>
                <div className="border-t border-b border-gray-300 py-4 mb-4">
                    <p className="mb-2"><span className="font-semibold">補習班名稱:</span> {data.centerName}</p>
                    <p className="mb-2">親愛的 **{data.studentName}** 家長/同學您好：</p>
                    <p className="mb-2">這是您的繳費通知，請您留意以下款項：</p>
                    {data.notices.map((notice, index) => (
                        <div key={index} className="mb-3 p-2 border border-gray-200 rounded-md bg-gray-50">
                            {/* 使用 notice.payment_term (snake_case) */}
                            <p className="mb-1"><span className="font-semibold">繳費項目:</span> {notice.payment_term === '按月繳費' ? '按月繳費' : '課程總價'}</p>
                            <p className="mb-1"><span className="font-semibold">應繳金額:</span> NT$ {notice.amount}</p>
                            {/* 格式化 due_date */}
                            <p className="mb-1"><span className="font-semibold">繳費期限:</span> {new Date(notice.due_date).toLocaleDateString('zh-TW')}</p>
                            <p className="mb-1"><span className="font-semibold">描述:</span> {notice.description}</p>
                        </div>
                    ))}
                </div>
                <p className="text-center text-gray-600 text-sm">請您於繳費期限前完成繳費，如有任何疑問，請聯繫補習班。</p>
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                    >
                        列印通知單
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentNoticeModal;