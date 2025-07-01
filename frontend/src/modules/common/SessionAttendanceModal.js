// frontend/src/modules/common/SessionAttendanceModal.js

import React, { useState, useEffect, useMemo } from 'react';

const SessionAttendanceModal = ({
    show, onClose, session, students, onUpdateAttendanceStatus,
    getStudentNameById, getClassNameById, classes,
    showMessage // <-- 新增：正確接收 showMessage prop
}) => {
    const currentClass = classes?.find(cls => String(cls.id) === String(session?.classId)); 
    
    const availableTeachers = useMemo(() => {
        return [...new Set([currentClass?.mainTeacher, currentClass?.substituteTeacher].filter(Boolean))];
    }, [currentClass?.mainTeacher, currentClass?.substituteTeacher]);

    const [selectedTeacher, setSelectedTeacher] = useState(session?.actualTeacher || currentClass?.mainTeacher || '');
    const [customTeacher, setCustomTeacher] = useState('');

    useEffect(() => {
        if (show && session && currentClass) {
            // 當 session 變化時，更新 selectedTeacher 和 customTeacher
            setSelectedTeacher(session.actualTeacher || currentClass.mainTeacher || '');
            if (session.actualTeacher && !availableTeachers.includes(session.actualTeacher)) {
                setCustomTeacher(session.actualTeacher);
                setSelectedTeacher('自訂'); 
            } else {
                setCustomTeacher('');
            }
        }
    }, [show, session, currentClass, availableTeachers]); // 添加 show 到依賴，確保 Modal 每次打開都重置

    if (!show || !session) return null;

    // 判斷該會話是否已順延，直接從 session 對象獲取 isPostponed (camelCase)
    const isSessionPostponed = session.isPostponed === true; 

    const handleStudentStatusChange = (studentId, newStatus) => {
        console.log(`SessionAttendanceModal: Changing student ${studentId} status to ${newStatus}`);
        if (isSessionPostponed) { 
            console.log("Session is postponed, cannot change individual student status.");
            showMessage('此堂課已標記為順延，學生點名狀態無法修改。', 'info'); // <-- 這裡可以使用 showMessage
            return;
        }
        // 防止意外地將學生狀態設為「順延」，雖然選項已移除，但這是防禦性檢查
        if (newStatus === '順延') {
            showMessage('無法將單個學生的狀態設為「順延」。課程順延請透過課程排程功能調整。', 'error');
            return;
        }
        onUpdateAttendanceStatus(session.id, studentId, newStatus);
    };

    const handleTeacherChange = async (e) => {
        const value = e.target.value;
        setSelectedTeacher(value);
        
        let teacherToSend = value;
        if (value === '自訂') {
            teacherToSend = customTeacher; 
        }
        
        try {
            console.log(`SessionAttendanceModal: Changing teacher to ${teacherToSend}`);
            await onUpdateAttendanceStatus(session.id, null, null, teacherToSend); 
        } catch (error) {
            console.error("Failed to update teacher:", error);
            showMessage(`更新老師失敗: ${error.message}`, 'error'); // <-- 這裡可以使用 showMessage
        }
    };

    const handleCustomTeacherChange = async (e) => {
        const value = e.target.value;
        setCustomTeacher(value);
        try {
            console.log(`SessionAttendanceModal: Changing custom teacher to ${value}`);
            await onUpdateAttendanceStatus(session.id, null, null, value);
        } catch (error) {
            console.error("Failed to update custom teacher:", error);
            showMessage(`更新自訂老師失敗: ${error.message}`, 'error'); // <-- 這裡可以使用 showMessage
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    {getClassNameById(session.classId)} - {new Date(session.date).toLocaleDateString('zh-TW')} 點名 
                </h3>

                {/* 老師選擇區塊 */}
                <div className="mb-4">
                    <label htmlFor="sessionTeacher" className="block text-sm font-medium text-gray-700 mb-1">上課老師</label>
                    <select
                        id="sessionTeacher"
                        value={selectedTeacher}
                        onChange={handleTeacherChange}
                        className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        disabled={isSessionPostponed} // 如果順延，禁用老師選擇
                    >
                        <option value="">-- 請選擇老師 --</option>
                        {availableTeachers.map(teacher => (
                            <option key={teacher} value={teacher}>{teacher}</option>
                        ))}
                        <option value="自訂">自訂</option>
                    </select>
                    {selectedTeacher === '自訂' && (
                        <input
                            type="text"
                            value={customTeacher}
                            onChange={handleCustomTeacherChange}
                            placeholder="輸入老師姓名"
                            className="mt-2 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            disabled={isSessionPostponed} // 如果順延，禁用自訂老師輸入
                        />
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {(session.attendance || []).length === 0 ? (
                        <p className="text-center text-gray-600">此課程會話沒有報名學生。</p>
                    ) : (
                        <table className="min-w-full text-sm bg-white border border-gray-200 rounded-lg shadow-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">學生姓名</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {(session.attendance || []).map(att => {
                                    console.log(`SessionAttendanceModal: Student ${att.student_id} current status: ${att.status}`); // 調試：打印學生當前狀態
                                    return (
                                        <tr key={att.student_id} className="hover:bg-gray-50"> 
                                            <td className="px-4 py-2 whitespace-nowrap">{getStudentNameById(att.student_id)}</td> 
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <select
                                                    value={att.status} // 確保這裡綁定的是當前 att.status
                                                    onChange={(e) => handleStudentStatusChange(att.student_id, e.target.value)} 
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
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    {isSessionPostponed && ( // 顯示提示
                        <p className="text-center text-orange-600 mt-4 font-semibold">此堂課已標記為順延，學生點名狀態無法修改。</p>
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
            </div>
        </div>
    );
};

export default SessionAttendanceModal;