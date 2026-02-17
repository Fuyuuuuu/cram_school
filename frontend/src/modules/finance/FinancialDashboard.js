// frontend/src/modules/finance/FinancialDashboard.js

import React, { useEffect, useMemo, useState } from 'react';

const FinancialDashboard = ({
    transactions,
    getStudentNameById,
    handleChangePaymentStatus,
    handlePrintReceipt,
    handlePrintPaymentNotice
}) => {
    const [currentUnpaidPage, setCurrentUnpaidPage] = useState(1);
    const rowsPerPage = 15;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // 計算本月已收金額 (只考慮活躍的交易)
    const monthlyCollectedAmount = (transactions || [])
        .filter(t => {
            const recordDate = new Date(t.recordDate); // t.recordDate 是 camelCase
            return t.status === '已繳費' && t.isActive === true && // t.isActive 是 camelCase
                           recordDate.getMonth() === currentMonth &&
                           recordDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // 計算本月應收款項 (只考慮活躍的交易)
    const monthlyOutstandingTransactions = (transactions || []).filter(t => {
        const dueDate = new Date(t.dueDate); // t.dueDate 是 camelCase
        return t.status === '未繳費' && t.isActive === true && // t.isActive 是 camelCase
                       dueDate.getMonth() === currentMonth &&
                       dueDate.getFullYear() === currentYear;
    });

    const monthlyOutstandingAmount = monthlyOutstandingTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const shouldScrollMonthlyUnpaid = monthlyOutstandingTransactions.length > 15;
    const shouldPaginateMonthlyUnpaid = monthlyOutstandingTransactions.length > 30;
    const totalMonthlyUnpaidPages = Math.max(1, Math.ceil(monthlyOutstandingTransactions.length / rowsPerPage));

    useEffect(() => {
        if (currentUnpaidPage > totalMonthlyUnpaidPages) {
            setCurrentUnpaidPage(totalMonthlyUnpaidPages);
        }
    }, [currentUnpaidPage, totalMonthlyUnpaidPages]);

    const visibleMonthlyOutstandingTransactions = useMemo(() => {
        if (!shouldPaginateMonthlyUnpaid) return monthlyOutstandingTransactions;
        const start = (currentUnpaidPage - 1) * rowsPerPage;
        return monthlyOutstandingTransactions.slice(start, start + rowsPerPage);
    }, [monthlyOutstandingTransactions, shouldPaginateMonthlyUnpaid, currentUnpaidPage]);

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl transition-all duration-500 ease-in-out transform hover:scale-105 mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">財務儀表板</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="bg-green-50 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-green-800 mb-2">本月已收到多少</h3>
                    <p className="text-4xl font-bold text-green-600">NT$ {monthlyCollectedAmount.toLocaleString()}</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">本月應收款項</h3>
                    <p className="text-4xl font-bold text-yellow-600">NT$ {monthlyOutstandingAmount.toLocaleString()}</p>
                </div>
            </div>

            {monthlyOutstandingTransactions.length > 0 && (
                <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4 text-center">本月未繳費學生</h3>
                    <div className={`${shouldScrollMonthlyUnpaid ? 'max-h-[65vh] overflow-y-auto pr-1' : ''} overflow-x-auto`}>
                        <table className="min-w-full bg-white border border-blue-200 rounded-lg shadow-sm">
                            <thead className="bg-blue-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">學生</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">繳費項目</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">金額</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">期限</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">狀態</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {visibleMonthlyOutstandingTransactions.map((t, index) => (
                                    <tr key={t.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{getStudentNameById(t.studentId)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{t.description}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">NT$ {Number(t.amount || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{new Date(t.dueDate).toLocaleDateString('zh-TW')}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                未繳費
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleChangePaymentStatus(t.id, '已繳費')}
                                                className="text-blue-600 hover:text-blue-900 mr-2"
                                            >
                                                標記為已繳費
                                            </button>
                                            <button
                                                onClick={() => handlePrintReceipt(t)}
                                                className="text-green-600 hover:text-green-900 ml-2"
                                            >
                                                列印收據
                                            </button>
                                            <button
                                                onClick={() => handlePrintPaymentNotice(t)}
                                                className="text-purple-600 hover:text-purple-900 ml-2"
                                            >
                                                列印通知
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {shouldPaginateMonthlyUnpaid && (
                        <div className="mt-4 flex justify-center items-center gap-3">
                            <button
                                onClick={() => setCurrentUnpaidPage(prev => Math.max(1, prev - 1))}
                                disabled={currentUnpaidPage === 1}
                                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                    currentUnpaidPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                上一頁
                            </button>
                            <span className="text-sm font-semibold text-gray-700">
                                第 {currentUnpaidPage} 頁 / 共 {totalMonthlyUnpaidPages} 頁
                            </span>
                            <button
                                onClick={() => setCurrentUnpaidPage(prev => Math.min(totalMonthlyUnpaidPages, prev + 1))}
                                disabled={currentUnpaidPage === totalMonthlyUnpaidPages}
                                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                    currentUnpaidPage === totalMonthlyUnpaidPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                下一頁
                            </button>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
};

export default FinancialDashboard;