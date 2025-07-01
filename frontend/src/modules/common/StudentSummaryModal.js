// frontend/src/modules/common/StudentSummaryModal.js

import React from 'react';

const StudentSummaryModal = ({ show, onClose, data, onUpdateAttendanceStatus }) => {
    // 確保 show 和 data 存在且 data.courses 是陣列
    if (!show || !data || !Array.isArray(data.courses)) return null;

    // 列印樣式
    const printStyles = `
        @media print {
            .no-print {
                display: none !important;
            }
            body {
                margin: 0;
                padding: 0;
            }
            .print-area {
                width: 100%;
                margin: 0;
                padding: 20px;
                box-shadow: none;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
                vertical-align: top; /* 確保內容垂直對齊 */
            }
            thead {
                background-color: #f2f2f2;
            }
        }
    `;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full relative print-area">
                <style>{printStyles}</style> {/* 應用列印樣式 */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold no-print"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">學生課程總覽 - {data.studentName}</h3>
                <div className="max-h-96 overflow-y-auto border border-gray-200 p-4 rounded-lg">
                    {data.courses.length === 0 ? (
                        <p className="text-center text-gray-600">該學生目前沒有報名任何課程。</p>
                    ) : (
                        data.courses.map((course, index) => (
                            <div key={index} className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                                <h4 className="text-xl font-semibold text-blue-800 mb-2">{course.name} (主課老師: {course.mainTeacher})</h4>
                                <p className="text-sm text-gray-600 mb-1">課程期間: {course.startDate} 至 {course.endDate}</p>
                                <p className="text-sm text-gray-600 mb-2">課程學費: NT$ {course.totalCoursePrice.toLocaleString()}</p>
                                <p className="text-sm text-green-700 mb-1">已繳金額: NT$ {course.paidAmount.toLocaleString()}</p>
                                <p className="text-sm text-red-700 mb-2">未繳金額: NT$ {course.outstandingAmount.toLocaleString()}</p>

                                {course.sessions.length === 0 ? (
                                    <p className="text-gray-500 text-sm">該課程目前沒有排定會話。</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">出缺席狀態</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-only">出缺席狀態</th> {/* For print */}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {course.sessions.map((session, sessionIndex) => {
                                                    // 判斷該會話是否已順延 (從 useTuitionData 傳入的 session 數據已包含 isPostponed)
                                                    const isSessionPostponed = session.isPostponed === true;

                                                    return (
                                                        <tr key={sessionIndex} className="hover:bg-gray-50">
                                                            {/* session.date 已經是 ISO datetime string，格式化後顯示 */}
                                                            <td className="px-4 py-2 whitespace-nowrap">{new Date(session.date).toLocaleDateString('zh-TW')}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap no-print"> {/* For screen display */}
                                                                <select
                                                                    value={session.status} // 確保這裡綁定的是當前 session.status
                                                                    // onUpdateAttendanceStatus 期望 session.id 和 studentId (字串)
                                                                    onChange={(e) => onUpdateAttendanceStatus(session.id, String(session.studentId), e.target.value)}
                                                                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                                    disabled={isSessionPostponed} // 如果順延，禁用選擇框
                                                                >
                                                                    <option value="未到">未到</option>
                                                                    <option value="已到">已到</option>
                                                                    <option value="請假">請假</option>
                                                                    {/* **移除「順延」選項** */}
                                                                    {/* <option value="順延">順延</option> */}
                                                                </select>
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap print-only"> {/* For print only */}
                                                                {session.status}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <div className="flex justify-center mt-6 no-print">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
                    >
                        列印總覽
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentSummaryModal;