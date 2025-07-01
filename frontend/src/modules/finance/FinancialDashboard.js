// frontend/src/modules/finance/FinancialDashboard.js

import React from 'react';

const FinancialDashboard = ({ transactions, getStudentNameById }) => {
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
                <div className="mt-8 p-6 bg-red-50 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-red-800 mb-4 text-center">本月未繳費學生</h3>
                    <ul className="list-disc list-inside text-gray-700">
                        {[...new Set(monthlyOutstandingTransactions.map(t => String(t.studentId)).filter(id => id !== 'null'))].map(studentId => ( // t.studentId 是 camelCase
                            <li key={studentId} className="mb-1">
                                {getStudentNameById(studentId)}
                                <ul className="list-circle list-inside ml-4 text-sm text-gray-600">
                                    {monthlyOutstandingTransactions.filter(t => String(t.studentId) === String(studentId)).map(t => ( // t.studentId 是 camelCase
                                        <li key={t.id}>{t.description} (NT$ {t.amount}, 期限: {new Date(t.dueDate).toLocaleDateString('zh-TW')})</li> // t.dueDate 是 camelCase
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

        </div>
    );
};

export default FinancialDashboard;