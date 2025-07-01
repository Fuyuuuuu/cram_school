// frontend/src/modules/finance/CombinedPaymentPrintModal.js

import React from 'react';

const CombinedPaymentPrintModal = ({ show, onClose, data, TUITION_CENTER_NAME }) => {
    // 確保 data, student, course, transactions, sessions 都存在且有效
    if (!show || !data || !data.student || !data.course || !Array.isArray(data.transactions) || !Array.isArray(data.sessions)) return null;

    const { student, course, transactions: allTransactions, sessions: allSessions } = data;

    // 過濾出與該學生和課程相關的活躍交易記錄，並按期數排序
    const courseTransactions = allTransactions
        .filter(t => String(t.studentId) === String(student.id) && String(t.classId) === String(course.id) && t.isActive === true) // 新增 is_active 過濾
        .sort((a, b) => a.installment - b.installment);

    // 獲取該課程的所有會話，並按日期排序
    const courseSessions = allSessions
        .filter(s => String(s.classId) === String(course.id))
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // 直接用 new Date(a.date) 解析 ISO 日期字符串

    // 動態計算每期對應的會話數，確保分配均勻
    const sessionsPerDisplayRow = Math.ceil(course.totalSessions / course.paymentInstallments);

    // 準備表格數據
    const tableData = courseTransactions.map(tx => {
        const startIndex = (tx.installment - 1) * sessionsPerDisplayRow;
        const endIndex = startIndex + sessionsPerDisplayRow;

        const relatedSessions = courseSessions.slice(startIndex, endIndex);

        // 格式化會話日期，標記已順延的
        const classPeriodDates = relatedSessions.map(s => {
            const date = new Date(s.date); // 直接用 new Date(s.date) 解析 ISO 日期字符串
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const datePart = `${month}/${day}`;
            const isPostponed = s.isPostponed === true; // 直接使用 isPostponed 屬性
            return `${datePart}${isPostponed ? ' (順延)' : ''}`;
        }).join(',<br>');

        const classPeriod = relatedSessions.length > 0
            ? `${new Date(relatedSessions[0].date).getFullYear()}/${classPeriodDates}` // 直接用 new Date()
            : '無上課期間';

        // 格式化 record_date
        const paymentRemarks = tx.status === '已繳費' 
            ? `已繳費<br>${new Date(tx.recordDate).toLocaleDateString('zh-TW')}` // 格式化為本地日期字符串
            : '未繳費';

        return {
            date: new Date(tx.dueDate).toLocaleDateString('zh-TW'), // 格式化到期日為本地日期字符串
            subject: course.name.split(' ')[0], // 例如 "數學", "英文"
            fee: `NT$ ${tx.amount.toLocaleString()}元`,
            classPeriod: classPeriod,
            paymentRemarks: paymentRemarks,
        };
    });

    // 列印樣式
    const printStyles = `
        @media print {
            body { margin: 0; padding: 20px; font-family: 'Inter', sans-serif; }
            .print-container { width: 100%; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; box-shadow: none; }
            h3, h4, p { margin-bottom: 0.5em; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
            th { background-color: #f2f2f2; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
        }
    `;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full relative print-container">
                <style>{printStyles}</style> {/* 應用列印樣式 */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold no-print"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">繳費通知書與明細</h3>
                <div className="border-t border-b border-gray-300 py-4 mb-4">
                    <p className="mb-2 text-lg font-semibold text-center">{TUITION_CENTER_NAME}</p>
                    <p className="mb-2 text-md font-semibold text-center">{course.name}</p>
                    <p className="mb-4 text-md font-semibold text-center">親愛的 {student.name} 家長/同學您好：</p>

                    <table className="min-w-full text-sm bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">科目</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">費用</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上課期間</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">收費備註</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tableData.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{row.date}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{row.subject}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{row.fee}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: row.classPeriod }}></td>
                                    <td className="px-4 py-2 text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: row.paymentRemarks }}></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-center text-gray-600 text-sm mb-2">
                    國中數學費用：月繳共8堂課程，共計新台幣貳仟伍佰元整或一期優惠3個月24堂課程，共計新台幣柒仟元整。
                </p>
                <p className="text-center text-gray-600 text-sm mb-2">
                    請將學費裝入本信封袋帶至本班，本班將收款憑證由學生帶回。
                </p>
                <p className="text-center text-gray-600 text-sm">
                    有任何問題請撥服務專線 6332468 或 6333669 非常謝謝您！祝福您！ 顏舍文理補習班 敬上
                </p>
                <div className="flex justify-center mt-6 no-print">
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

export default CombinedPaymentPrintModal;