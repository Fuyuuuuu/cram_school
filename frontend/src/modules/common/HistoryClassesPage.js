// frontend/src/modules/common/HistoryClassesPage.js

import React, { useEffect, useMemo, useState } from 'react';
import MessageDisplay from '../../components/MessageDisplay'; // 導入訊息顯示組件

const HistoryClassesPage = ({
    sessions, getStudentNameById, getClassNameById, getClassTeacherById, getAttendanceSummaryForSession,
    messageText, messageType // 從 Hook 傳入訊息相關 props
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // 正規化今天的日期以進行比較

    // 過濾出過去的課程會話 (session.date 是 ISO datetime string)，並按日期降序排列 (最新在前)
    const pastSessions = (sessions || []) // 防禦性檢查 sessions
        .filter(session => new Date(session.date) < today) // 直接用 new Date(session.date) 解析
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // 直接用 new Date() 比較

    const shouldShowScroll = pastSessions.length > 15;
    const shouldPaginate = pastSessions.length > 30;
    const totalPages = Math.max(1, Math.ceil(pastSessions.length / rowsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const visibleSessions = useMemo(() => {
        if (!shouldPaginate) return pastSessions;
        const start = (currentPage - 1) * rowsPerPage;
        return pastSessions.slice(start, start + rowsPerPage);
    }, [pastSessions, shouldPaginate, currentPage]);

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">歷史課程</h2>
            <MessageDisplay msg={messageText} type={messageType} />

            {pastSessions.length === 0 ? (
                <p className="text-center text-gray-600">目前沒有歷史課程記錄。</p>
            ) : (
                <div className={`${shouldShowScroll ? 'max-h-[65vh] overflow-y-auto pr-1' : ''} overflow-x-auto`}>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">課程名稱</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上課老師</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出缺席概況</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">到課學生 / 請假學生 / 未到學生</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {visibleSessions.map(session => (
                                <tr key={session.id}>
                                    {/* 格式化 session.date 為本地日期字符串 */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(session.date).toLocaleDateString('zh-TW')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {/* session.classId (camelCase) */}
                                        {getClassNameById(session.classId)}
                                        {/* 確保只有當 session.isPostponed 為 true 時才顯示 "(順延)" */}
                                        {session.isPostponed === true && ' (順延)'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {/* session.actualTeacher (camelCase) 和 session.classId (camelCase) */}
                                        {session.actualTeacher || getClassTeacherById(session.classId)}
                                    </td>
                                    {/* **修改：根據 isPostponed 決定概況內容** */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {session.isPostponed === true ? '已順延' : getAttendanceSummaryForSession(session.id)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {/* **修改：根據 isPostponed 決定顯示內容** */}
                                        {session.isPostponed === true ? (
                                            '無 (課程已順延)'
                                        ) : (
                                            (session.attendance || []).length === 0 ? (
                                                '無'
                                            ) : (
                                                <>
                                                    {session.attendance.filter(att => att.status === '已到').map(att => getStudentNameById(att.student_id)).join(', ')} (到)
                                                    {session.attendance.filter(att => att.status === '請假').length > 0 &&
                                                        `, ${session.attendance.filter(att => att.status === '請假').map(att => getStudentNameById(att.student_id)).join(', ')} (請假)`}
                                                    {session.attendance.filter(att => att.status === '未到').length > 0 &&
                                                        `, ${session.attendance.filter(att => att.status === '未到').map(att => getStudentNameById(att.student_id)).join(', ')} (未到)`}
                                                </>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {shouldPaginate && (
                <div className="mt-4 flex justify-center items-center gap-3">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                            currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        上一頁
                    </button>
                    <span className="text-sm font-semibold text-gray-700">
                        第 {currentPage} 頁 / 共 {totalPages} 頁
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                            currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        下一頁
                    </button>
                </div>
            )}
        </div>
    );
};

export default HistoryClassesPage;