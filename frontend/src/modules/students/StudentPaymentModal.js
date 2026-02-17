import React from 'react';

const StudentPaymentModal = ({
    show, onClose, student, transactions, classes,
    handleChangePaymentStatus, handlePrintReceipt, handlePrintPaymentNotice, handlePrintCombined,
    getClassNameById, getStudentNameById, sessions, setCombinedPaymentPrintData, setShowCombinedPaymentPrintModal, showMessage
}) => {
    // 確保 show 和 student 存在
    if (!show || !student) return null;

    // 過濾並排序該學生的活躍交易記錄
    const studentTransactions = transactions.filter(t => String(t.student_id) === String(student.id) && t.is_active === true) // 新增 is_active 過濾
                                             .sort((a, b) => new Date(a.due_date) - new Date(b.due_date)); // 按到期日排序

    // 將交易記錄按課程分組
    const transactionsByClass = studentTransactions.reduce((acc, transaction) => {
        // 使用 transaction.class_id (snake_case)
        const className = getClassNameById(transaction.class_id);
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(transaction);
        return acc;
    }, {});

    const today = new Date();
    today.setHours(0, 0, 0, 0); // 正規化今天的日期，僅比較日期部分

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-[100] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center py-8 px-4">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-[min(92vw,64rem)] max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    type="button"
                    style={{ position: 'absolute', top: '1rem', right: '1rem', left: 'auto' }}
                    className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-5 text-center pr-10">學生繳費管理 - {student.name}</h3>
                <div className="max-h-[50vh] sm:max-h-96 overflow-y-auto">
                    {Object.keys(transactionsByClass).length === 0 ? (
                        <p className="text-center text-gray-600">該學生目前沒有繳費記錄。</p>
                    ) : (
                        Object.entries(transactionsByClass).map(([className, classTransactions]) => (
                            <div key={className} className="mb-5 p-3 border border-blue-200 rounded-lg bg-blue-50">
                                <h4 className="text-lg font-semibold text-blue-800 mb-2">{className}</h4>
                                <div className="flex justify-end mb-2">
                                    <button
                                        // 使用 classTransactions[0].class_id (snake_case)
                                        onClick={() => handlePrintCombined(student, classTransactions[0].class_id)}
                                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all"
                                    >
                                        列印通知、收據
                                    </button>
                                </div>
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費項目</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費期限</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">記錄日期</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {classTransactions.map((t) => {
                                            // t.due_date 可能是 ISO datetime string，new Date() 可以解析
                                            const dueDateObj = new Date(t.due_date);
                                            dueDateObj.setHours(0, 0, 0, 0);
                                            const isOverdue = t.status === '未繳費' && dueDateObj < today;
                                            const statusColor = t.status === '已繳費' ? 'bg-green-100 text-green-800' :
                                                                 isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
                                            const statusText = t.status === '已繳費' ? '已繳費' :
                                                                 isOverdue ? '逾期未繳' : '未繳費';

                                            return (
                                                <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-200">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.description}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">NT$ {t.amount}</td>
                                                    {/* 格式化 due_date 為本地日期字符串 */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.due_date).toLocaleDateString('zh-TW')}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                                                            {statusText}
                                                        </span>
                                                    </td>
                                                    {/* 格式化 record_date 為本地日期字符串 */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.record_date ? new Date(t.record_date).toLocaleDateString('zh-TW') : 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                        {t.status === '未繳費' ? (
                                                            <button
                                                                onClick={() => handleChangePaymentStatus(t.id, '已繳費')}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                標記為已繳費
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleChangePaymentStatus(t.id, '未繳費')}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                標記為未繳費
                                                            </button>
                                                        )}
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
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ))
                    )}
                </div>
                <div className="flex justify-center mt-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
                    >
                        關閉
                    </button>
                </div>
            </div>
          </div>
        </div>
    );
};

export default StudentPaymentModal;