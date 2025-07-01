// frontend/src/modules/calendar/DailySessionsAttendanceModal.js

import React, { useState } from 'react';
import SessionAttendanceModal from '../common/SessionAttendanceModal'; 

const DailySessionsAttendanceModal = ({
    show, onClose, date, sessions, students, onUpdateAttendanceStatus,
    getClassNameById, getClassTeacherById, classes, getStudentNameById,
    getAttendanceSummaryForSession // 確保接收這個從 useTuitionData 傳來的函數
}) => {
    const [showSingleSessionAttendanceModal, setShowSingleSessionAttendanceModal] = useState(false);
    const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState(null);

    // 確保 show 和 date 存在
    if (!show || !date) return null;

    // 將傳入的 date 對象轉換為 'YYYY-MM-DD' 格式字符串，用於過濾
    const dateString = date.toISOString().split('T')[0];
    
    // 過濾出與該日期匹配的會話
    // session.date 是 ISO datetime string，直接使用
    const sessionsForDate = sessions.filter(session => new Date(session.date).toISOString().split('T')[0] === dateString);

    const handleOpenSessionAttendance = (session) => {
        setSelectedSessionForAttendance(session);
        setShowSingleSessionAttendanceModal(true);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    {date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日 課程點名
                </h3>
                <div className="max-h-96 overflow-y-auto">
                    {sessionsForDate.length === 0 ? (
                        <p className="text-center text-gray-600">這一天沒有排定的課程。</p>
                    ) : (
                        <div className="space-y-4">
                            {sessionsForDate.map(session => (
                                <div key={session.id} className="p-4 border border-blue-200 rounded-lg bg-blue-50 shadow-sm">
                                    <h4 className="text-xl font-semibold text-blue-800 mb-2">
                                        {/* session.classId (camelCase) 和 session.actualTeacher (camelCase) */}
                                        {getClassNameById(session.classId)} (老師: {session.actualTeacher || getClassTeacherById(session.classId)})
                                    </h4>
                                    <p className="text-sm text-gray-700 mb-2">
                                        點名統計: {getAttendanceSummaryForSession(session.id)} {/* **修改：直接調用傳入的函數** */}
                                    </p>
                                    <button
                                        onClick={() => handleOpenSessionAttendance(session)}
                                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all"
                                    >
                                        開始點名
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-center mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
                    >
                        關閉
                    </button>
                </div>
                {/* 單堂課程點名模態視窗 */}
                <SessionAttendanceModal
                    show={showSingleSessionAttendanceModal}
                    onClose={() => setShowSingleSessionAttendanceModal(false)}
                    session={selectedSessionForAttendance}
                    students={students}
                    onUpdateAttendanceStatus={onUpdateAttendanceStatus}
                    getStudentNameById={getStudentNameById}
                    getClassNameById={getClassNameById}
                    classes={classes}
                />
            </div>
        </div>
    );
};

export default DailySessionsAttendanceModal;