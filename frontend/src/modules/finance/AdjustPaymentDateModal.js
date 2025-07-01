// frontend/src/modules/finance/AdjustPaymentDateModal.js

import React, { useState, useEffect } from 'react';

const AdjustPaymentDateModal = ({
    show, onClose, cls, transactions, students, showMessage, handleAdjustPaymentDate, getStudentNameById
}) => {
    // 篩選出該課程下所有活躍且未繳費的交易
    // cls.id 是 camelCase
    const relevantTransactions = (transactions || []).filter(t =>
        String(t.classId) === String(cls?.id) && // t.classId 是 camelCase
        t.isActive === true && // t.isActive 是 camelCase
        t.status !== '已繳費' // 只顯示未繳費的
    ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // 按到期日排序

    const [selectedTransactionId, setSelectedTransactionId] = useState('');
    const [newDueDate, setNewDueDate] = useState('');

    // 當 Modal 打開或 cls 改變時，重置狀態
    useEffect(() => {
        if (show) {
            setSelectedTransactionId('');
            setNewDueDate('');
        }
    }, [show, cls]);

    if (!show || !cls) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedTransactionId) {
            showMessage('請選擇一個要調整的繳費項目。', 'error');
            return;
        }
        if (!newDueDate) {
            showMessage('請選擇新的繳費日期。', 'error');
            return;
        }

        // 調用父組件傳遞的調整函數
        handleAdjustPaymentDate(selectedTransactionId, newDueDate);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">調整繳費日期 - {cls.name}</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="transactionSelect" className="block text-sm font-medium text-gray-700 mb-1">選擇繳費項目</label>
                        <select
                            id="transactionSelect"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={selectedTransactionId}
                            onChange={(e) => setSelectedTransactionId(e.target.value)}
                            required
                        >
                            <option value="">-- 請選擇一個未繳費項目 --</option>
                            {relevantTransactions.map(transaction => (
                                <option key={transaction.id} value={transaction.id}>
                                    {getStudentNameById(transaction.studentId)} - {transaction.description} (第{transaction.installment}期, 原期限: {new Date(transaction.dueDate).toLocaleDateString('zh-TW')})
                                </option>
                            ))}
                        </select>
                        {relevantTransactions.length === 0 && (
                            <p className="text-sm text-gray-500 mt-2">該課程目前沒有未繳費項目可供調整。</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="newDueDate" className="block text-sm font-medium text-gray-700 mb-1">新的繳費日期</label>
                        <input
                            type="date"
                            id="newDueDate"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-center space-x-4 mt-6">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                        >
                            確認調整
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors"
                        >
                            取消
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdjustPaymentDateModal;