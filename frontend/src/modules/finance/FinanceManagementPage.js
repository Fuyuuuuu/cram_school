// frontend/src/modules/finance/FinanceManagementPage.js

import React, { useEffect, useMemo, useState } from 'react';
import MessageDisplay from '../../components/MessageDisplay'; // 導入訊息顯示組件

const FinanceManagementPage = ({
    transactions, getStudentNameById, handleChangePaymentStatus,
    handlePrintReceipt, handlePrintPaymentNotice, handlePrintAllPaymentNotices, handlePrintAllReceipts, showMessage,
    messageText, messageType // 從 Hook 傳入訊息相關 props
}) => {
    const rowsPerPage = 15;
    const [currentHistoricalUnpaidPage, setCurrentHistoricalUnpaidPage] = useState(1);
    const [currentHistoricalPaidPage, setCurrentHistoricalPaidPage] = useState(1);
    const [currentHistoricalOverduePage, setCurrentHistoricalOverduePage] = useState(1);

    // 獲取當前日期，並清除時間部分，用於日期比較
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    // 財務儀表板：年月篩選
    const [selectedHistoryYear, setSelectedHistoryYear] = useState(today.getFullYear());
    const [selectedHistoryMonth, setSelectedHistoryMonth] = useState(today.getMonth() + 1); // 1-12

    const availableYears = useMemo(() => {
        const years = new Set();
        (transactions || []).forEach(t => {
            if (t?.isActive !== true) return;
            if (t?.dueDate) years.add(new Date(t.dueDate).getFullYear());
            if (t?.recordDate) years.add(new Date(t.recordDate).getFullYear());
        });
        years.add(new Date().getFullYear());
        return Array.from(years).sort((a, b) => b - a);
    }, [transactions]);

    const isInYearMonth = (dateValue, year, month) => {
        if (!dateValue) return false;
        const date = new Date(dateValue);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
    };

    const historicalPaidTransactions = (transactions || [])
        .filter(t =>
            t.isActive === true &&
            t.status === '已繳費' &&
            t.studentId !== null &&
            isInYearMonth(t.recordDate, selectedHistoryYear, selectedHistoryMonth)
        )
        .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));

    const historicalUnpaidTransactions = (transactions || [])
        .filter(t =>
            t.isActive === true &&
            t.status === '未繳費' &&
            t.studentId !== null &&
            isInYearMonth(t.dueDate, selectedHistoryYear, selectedHistoryMonth)
        )
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const historicalCollectedAmount = historicalPaidTransactions
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const historicalOutstandingAmount = historicalUnpaidTransactions
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const historicalOverdueTransactions = historicalUnpaidTransactions.filter(t => {
        const dueDateObj = new Date(t.dueDate);
        dueDateObj.setHours(0, 0, 0, 0);
        const todayObj = new Date();
        todayObj.setHours(0, 0, 0, 0);
        return dueDateObj < todayObj;
    });

    const shouldScrollHistoricalUnpaid = historicalUnpaidTransactions.length > 15;
    const shouldPaginateHistoricalUnpaid = historicalUnpaidTransactions.length > 30;
    const totalHistoricalUnpaidPages = Math.max(1, Math.ceil(historicalUnpaidTransactions.length / rowsPerPage));

    const shouldScrollHistoricalPaid = historicalPaidTransactions.length > 15;
    const shouldPaginateHistoricalPaid = historicalPaidTransactions.length > 30;
    const totalHistoricalPaidPages = Math.max(1, Math.ceil(historicalPaidTransactions.length / rowsPerPage));

    const shouldScrollHistoricalOverdue = historicalOverdueTransactions.length > 15;
    const shouldPaginateHistoricalOverdue = historicalOverdueTransactions.length > 30;
    const totalHistoricalOverduePages = Math.max(1, Math.ceil(historicalOverdueTransactions.length / rowsPerPage));

    useEffect(() => {
        if (currentHistoricalUnpaidPage > totalHistoricalUnpaidPages) {
            setCurrentHistoricalUnpaidPage(totalHistoricalUnpaidPages);
        }
    }, [currentHistoricalUnpaidPage, totalHistoricalUnpaidPages]);

    useEffect(() => {
        if (currentHistoricalPaidPage > totalHistoricalPaidPages) {
            setCurrentHistoricalPaidPage(totalHistoricalPaidPages);
        }
    }, [currentHistoricalPaidPage, totalHistoricalPaidPages]);

    useEffect(() => {
        if (currentHistoricalOverduePage > totalHistoricalOverduePages) {
            setCurrentHistoricalOverduePage(totalHistoricalOverduePages);
        }
    }, [currentHistoricalOverduePage, totalHistoricalOverduePages]);

    const visibleHistoricalPaidTransactions = useMemo(() => {
        if (!shouldPaginateHistoricalPaid) return historicalPaidTransactions;
        const start = (currentHistoricalPaidPage - 1) * rowsPerPage;
        return historicalPaidTransactions.slice(start, start + rowsPerPage);
    }, [historicalPaidTransactions, shouldPaginateHistoricalPaid, currentHistoricalPaidPage]);

    const visibleHistoricalUnpaidTransactions = useMemo(() => {
        if (!shouldPaginateHistoricalUnpaid) return historicalUnpaidTransactions;
        const start = (currentHistoricalUnpaidPage - 1) * rowsPerPage;
        return historicalUnpaidTransactions.slice(start, start + rowsPerPage);
    }, [historicalUnpaidTransactions, shouldPaginateHistoricalUnpaid, currentHistoricalUnpaidPage]);

    const visibleHistoricalOverdueTransactions = useMemo(() => {
        if (!shouldPaginateHistoricalOverdue) return historicalOverdueTransactions;
        const start = (currentHistoricalOverduePage - 1) * rowsPerPage;
        return historicalOverdueTransactions.slice(start, start + rowsPerPage);
    }, [historicalOverdueTransactions, shouldPaginateHistoricalOverdue, currentHistoricalOverduePage]);

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
            <MessageDisplay msg={messageText} type={messageType} />
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">財務儀表板</h2>

                <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 mb-8">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">年份</label>
                            <select
                                value={selectedHistoryYear}
                                onChange={(e) => setSelectedHistoryYear(Number(e.target.value))}
                                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year} 年</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">月份</label>
                            <select
                                value={selectedHistoryMonth}
                                onChange={(e) => setSelectedHistoryMonth(Number(e.target.value))}
                                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month}>{month} 月</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:ml-6">
                        <button
                            onClick={handlePrintAllPaymentNotices}
                            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-all"
                        >
                            列印所有繳費通知
                        </button>
                        <button
                            onClick={handlePrintAllReceipts}
                            className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-all"
                        >
                            列印所有收據
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center mb-8">
                    <div className="bg-green-50 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-green-800 mb-2">本月已收到金額</h3>
                        <p className="text-4xl font-bold text-green-600">NT$ {historicalCollectedAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-yellow-800 mb-2">本月應收款項</h3>
                        <p className="text-4xl font-bold text-yellow-600">NT$ {historicalOutstandingAmount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">本月未繳費學生</h3>
                    {historicalUnpaidTransactions.length === 0 ? (
                        <p className="text-center text-gray-600">該月份沒有未繳費記錄。</p>
                    ) : (
                        <div className={`${shouldScrollHistoricalUnpaid ? 'max-h-[65vh] overflow-y-auto pr-1' : ''} overflow-x-auto`}>
                            <table className="min-w-full bg-white border border-blue-200 rounded-lg shadow-sm">
                                <thead className="bg-blue-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">學生</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">繳費項目</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">金額</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">期限</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {visibleHistoricalUnpaidTransactions.map((t, index) => (
                                        <tr key={t.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getStudentNameById(t.studentId)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">NT$ {t.amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(t.dueDate).toLocaleDateString('zh-TW')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                    )}
                    {shouldPaginateHistoricalUnpaid && (
                        <div className="mt-4 flex justify-center items-center gap-3">
                            <button
                                onClick={() => setCurrentHistoricalUnpaidPage(prev => Math.max(1, prev - 1))}
                                disabled={currentHistoricalUnpaidPage === 1}
                                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                    currentHistoricalUnpaidPage === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                上一頁
                            </button>
                            <span className="text-sm font-semibold text-gray-700">
                                第 {currentHistoricalUnpaidPage} 頁 / 共 {totalHistoricalUnpaidPages} 頁
                            </span>
                            <button
                                onClick={() => setCurrentHistoricalUnpaidPage(prev => Math.min(totalHistoricalUnpaidPages, prev + 1))}
                                disabled={currentHistoricalUnpaidPage === totalHistoricalUnpaidPages}
                                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                    currentHistoricalUnpaidPage === totalHistoricalUnpaidPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                下一頁
                            </button>
                        </div>
                    )}
                </div>

                <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">本月已繳費記錄</h3>
                {historicalPaidTransactions.length === 0 ? (
                    <p className="text-center text-gray-600">該月份沒有已繳費記錄。</p>
                ) : (
                    <div className={`${shouldScrollHistoricalPaid ? 'max-h-[65vh] overflow-y-auto pr-1' : ''} overflow-x-auto`}>
                        <table className="min-w-full bg-white border border-blue-200 rounded-lg shadow-sm">
                            <thead className="bg-blue-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">學生</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">繳費項目</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">金額</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">繳費期限</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">記錄日期</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {visibleHistoricalPaidTransactions.map((t, index) => (
                                    <tr key={t.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getStudentNameById(t.studentId)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">NT$ {t.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(t.dueDate).toLocaleDateString('zh-TW')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(t.recordDate).toLocaleDateString('zh-TW')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleChangePaymentStatus(t.id, '未繳費')}
                                                className="text-red-600 hover:text-red-900 mr-2"
                                            >
                                                標記為未繳費
                                            </button>
                                            <button
                                                onClick={() => handlePrintReceipt(t)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                列印收據
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {shouldPaginateHistoricalPaid && (
                    <div className="mt-4 flex justify-center items-center gap-3">
                        <button
                            onClick={() => setCurrentHistoricalPaidPage(prev => Math.max(1, prev - 1))}
                            disabled={currentHistoricalPaidPage === 1}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                currentHistoricalPaidPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            上一頁
                        </button>
                        <span className="text-sm font-semibold text-gray-700">
                            第 {currentHistoricalPaidPage} 頁 / 共 {totalHistoricalPaidPages} 頁
                        </span>
                        <button
                            onClick={() => setCurrentHistoricalPaidPage(prev => Math.min(totalHistoricalPaidPages, prev + 1))}
                            disabled={currentHistoricalPaidPage === totalHistoricalPaidPages}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                currentHistoricalPaidPage === totalHistoricalPaidPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            下一頁
                        </button>
                    </div>
                )}
                </div>

                <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">本月逾期記錄</h3>
                {historicalOverdueTransactions.length === 0 ? (
                    <p className="text-center text-gray-600">該月份沒有逾期記錄。</p>
                ) : (
                    <div className={`${shouldScrollHistoricalOverdue ? 'max-h-[65vh] overflow-y-auto pr-1' : ''} overflow-x-auto`}>
                        <table className="min-w-full bg-white border border-blue-200 rounded-lg shadow-sm">
                            <thead className="bg-blue-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">學生</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">繳費項目</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">金額</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">繳費期限</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider border-b border-blue-200">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {visibleHistoricalOverdueTransactions.map((t, index) => (
                                    <tr key={t.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getStudentNameById(t.studentId)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">NT$ {t.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(t.dueDate).toLocaleDateString('zh-TW')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                )}
                {shouldPaginateHistoricalOverdue && (
                    <div className="mt-4 flex justify-center items-center gap-3">
                        <button
                            onClick={() => setCurrentHistoricalOverduePage(prev => Math.max(1, prev - 1))}
                            disabled={currentHistoricalOverduePage === 1}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                currentHistoricalOverduePage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            上一頁
                        </button>
                        <span className="text-sm font-semibold text-gray-700">
                            第 {currentHistoricalOverduePage} 頁 / 共 {totalHistoricalOverduePages} 頁
                        </span>
                        <button
                            onClick={() => setCurrentHistoricalOverduePage(prev => Math.min(totalHistoricalOverduePages, prev + 1))}
                            disabled={currentHistoricalOverduePage === totalHistoricalOverduePages}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                                currentHistoricalOverduePage === totalHistoricalOverduePages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            下一頁
                        </button>
                    </div>
                )}
                </div>
        </div>
    );
};

export default FinanceManagementPage;