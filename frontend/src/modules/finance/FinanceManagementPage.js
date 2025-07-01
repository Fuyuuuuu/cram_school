// frontend/src/modules/finance/FinanceManagementPage.js

import React from 'react';
import FinancialDashboard from './FinancialDashboard'; // 導入財務儀表板組件
import MessageDisplay from '../../components/MessageDisplay'; // 導入訊息顯示組件

const FinanceManagementPage = ({
    transactions, getStudentNameById, handleChangePaymentStatus,
    handlePrintReceipt, handlePrintPaymentNotice, showMessage,
    messageText, messageType // 從 Hook 傳入訊息相關 props
}) => {
    // 過濾已繳費記錄 (排除 studentId 為空或非活躍的交易)
    const paidTransactions = (transactions || []).filter(t => t.status === '已繳費' && t.studentId !== null && t.isActive === true) 
                                                .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate)); // 按記錄日期降序排列

    // 獲取當前日期，並清除時間部分，用於日期比較
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    // 將所有未繳費的活躍交易篩選出來
    const allUnpaidActiveTransactions = (transactions || []).filter(t => 
        t.status === '未繳費' && t.studentId !== null && t.isActive === true
    );

    // 進一步篩選出逾期記錄
    const overdueTransactions = allUnpaidActiveTransactions.filter(t => {
        const dueDateObj = new Date(t.dueDate);
        dueDateObj.setHours(0, 0, 0, 0);
        return dueDateObj < today; // 到期日早於今天，即為逾期
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // 按到期日升序排列

    // 篩選出未逾期但未繳費的記錄 (即「未繳費記錄」)
    const currentUnpaidTransactions = allUnpaidActiveTransactions.filter(t => {
        const dueDateObj = new Date(t.dueDate);
        dueDateObj.setHours(0, 0, 0, 0);
        return dueDateObj >= today; // 到期日晚於或等於今天，即為未逾期未繳費
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // 按到期日升序排列


    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl transition-all duration-500 ease-in-out transform hover:scale-105">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">財務管理</h2>
            <MessageDisplay msg={messageText} type={messageType} />

            {/* 財務儀表板 (整合在此頁面，但作為獨立組件) */}
            {/* 傳遞給 FinancialDashboard 的 transactions 應該是只包含活躍的交易 */}
            <FinancialDashboard transactions={transactions.filter(t => t.isActive === true)} getStudentNameById={getStudentNameById} />

            {/* 已繳費記錄列表 */}
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center mt-8">已繳費記錄</h3>
            {paidTransactions.length === 0 ? (
                <p className="text-center text-gray-600">目前沒有已繳費記錄。</p>
            ) : (
                <div className="overflow-x-auto mb-8">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">學生</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費項目</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費期限</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">記錄日期</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paidTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getStudentNameById(t.studentId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">NT$ {t.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.dueDate).toLocaleDateString('zh-TW')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.recordDate).toLocaleDateString('zh-TW')}</td>
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

            {/* --- 逾期記錄列表 (新增區塊) --- */}
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center mt-8">逾期記錄</h3>
            {overdueTransactions.length === 0 ? (
                <p className="text-center text-gray-600">目前沒有逾期記錄。</p>
            ) : (
                <div className="overflow-x-auto mb-8">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">學生</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費項目</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費期限</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {overdueTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getStudentNameById(t.studentId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">NT$ {t.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.dueDate).toLocaleDateString('zh-TW')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            逾期
                                        </span>
                                    </td>
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

            {/* --- 未繳費記錄列表 (新增區塊) --- */}
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center mt-8">未繳費記錄</h3>
            {currentUnpaidTransactions.length === 0 ? (
                <p className="text-center text-gray-600">目前沒有未繳費記錄。</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">學生</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費項目</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費期限</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentUnpaidTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getStudentNameById(t.studentId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">NT$ {t.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.dueDate).toLocaleDateString('zh-TW')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            未繳費
                                        </span>
                                    </td>
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
        </div>
    );
};

export default FinanceManagementPage;