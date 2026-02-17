// frontend/src/modules/classes/ClassCalendarModal.js

import React, { useState, useEffect, useCallback } from 'react';
import { daysInMonth, firstDayOfMonth } from '../../utils/dateUtils';

const ClassCalendarModal = ({
    show, onClose, cls, sessions, showMessage,
    postponeOriginDate, setPostponeOriginDate, postponeDays, setPostponeDays, // postponeDays 在您的邏輯中目前未使用
    handlePostponeConfirmed, handleCancelPostponement,
    handleManualToggleSession
}) => {
    // 模態視窗內部日曆的月份和年份狀態
    // cls?.startDate 是 camelCase，因為它是從 useTuitionData 傳遞過來的
    const [modalCurrentMonth, setModalCurrentMonth] = useState(new Date(cls?.startDate || new Date()).getMonth());
    const [modalCurrentYear, setModalCurrentYear] = useState(new Date(cls?.startDate || new Date()).getFullYear());

    const today = new Date();
    today.setHours(0, 0, 0, 0); // 清除時間部分，用於日期比較

    // 輔助函數：將 Date 對象轉換為 'YYYY-MM-DD' 格式的本地日期字串
    const formatDateToLocalISO = useCallback((dateObj) => {
        if (!dateObj) return null;
        const year = dateObj.getFullYear();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObj.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    // 獲取特定日期是否有會話（s.date 可能是 Date 或字串，皆要正確比對）
    const getSessionForDate = useCallback((dateString) => {
        const currentSessions = sessions || [];
        const foundSession = currentSessions.find(s => {
            if (!s || !s.classId) return false;
            const sessionDatePart = s.date instanceof Date
                ? formatDateToLocalISO(s.date)
                : formatDateToLocalISO(new Date(s.date));
            if (!sessionDatePart) return false;
            const isClassIdMatch = String(s.classId) === String(cls?.id);
            const isDateMatch = sessionDatePart === dateString;
            return isClassIdMatch && isDateMatch;
        });
        return foundSession;
    }, [sessions, cls, formatDateToLocalISO]);

    // 當課程 (cls) 數據改變時，重置日曆到課程的開始月份
    useEffect(() => {
        if (cls && cls.startDate) { // cls.startDate 是 camelCase
            const startDate = new Date(cls.startDate);
            setModalCurrentMonth(startDate.getMonth());
            setModalCurrentYear(startDate.getFullYear());
            console.log("ClassCalendarModal: useEffect - Resetting calendar to class start date:", startDate.toLocaleDateString());
        } else {
            console.log("ClassCalendarModal: useEffect - cls or startDate is missing. Not resetting calendar state.");
        }
    }, [cls]); // 依賴 cls

    // 如果模態視窗不應顯示或課程數據缺失，則不渲染
    if (!show || !cls) {
        return null;
    }

    const handleModalPrevMonth = () => {
        setModalCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
        setModalCurrentYear(prevYear => {
            const newMonthIndex = (modalCurrentMonth === 0 ? 11 : modalCurrentMonth - 1);
            if (newMonthIndex === 11) {
                return prevYear - 1;
            }
            return prevYear;
        });
    };

    const handleModalNextMonth = () => {
        setModalCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));
        setModalCurrentYear(prevYear => {
            const newMonthIndex = (modalCurrentMonth === 11 ? 0 : modalCurrentMonth + 1);
            if (newMonthIndex === 0) {
                return prevYear + 1;
            }
            return prevYear;
        });
    };

    const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

    const calendarDays = Array.from({ length: firstDayOfMonth(modalCurrentMonth, modalCurrentYear) }, () => null)
        .concat(Array.from({ length: daysInMonth(modalCurrentMonth, modalCurrentYear) }, (_, i) => i + 1));

    // 篩選出「未順延」的未來會話，用於「確認順延」下拉選單
    const existingClassSessions = (sessions || [])
        .filter(s =>
            String(s.classId) === String(cls.id) && // s.classId 是 camelCase
            new Date(s.date).setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0) &&
            s.isPostponed === false // **關鍵修改：只篩選未順延的會話 (isPostponed 是 camelCase)**
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // 篩選出「已順延」的未來會話，用於「取消順延」下拉選單
    const postponedClassSessions = (sessions || [])
        .filter(s =>
            String(s.classId) === String(cls.id) && // s.classId 是 camelCase
            s.isPostponed === true && // **關鍵修改：只篩選已順延的會話 (isPostponed 是 camelCase)**
            new Date(s.date).setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0)
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-[100] overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center py-8 px-4">
            <div
                className="bg-white p-6 sm:p-8 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto relative"
                style={{ width: '95vw', maxWidth: '76rem' }}
            >
                <button
                    onClick={onClose}
                    type="button"
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', left: 'auto' }}
                    className="text-gray-500 hover:text-gray-800 text-xl font-bold leading-none"
                >
                    &times;
                </button>
                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center pr-8">調整課程日期 - {cls.name}</h3>

                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={handleModalPrevMonth}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
                    >
                        上個月
                    </button>
                    <h4 className="text-xl font-bold text-gray-800">
                        {modalCurrentYear} 年 {monthNames[modalCurrentMonth]}
                    </h4>
                    <button
                        onClick={handleModalNextMonth}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
                    >
                        下個月
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
                    {dayNames.map(day => (
                        <div key={day} className="font-semibold text-gray-700 p-2 bg-gray-100 rounded-lg">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                        const fullDate = day ? new Date(modalCurrentYear, modalCurrentMonth, day) : null;
                        let dateString = null;
                        if (fullDate) {
                            dateString = formatDateToLocalISO(fullDate);
                        }

                        const sessionExists = dateString ? getSessionForDate(dateString) : null;
                        const isPastDate = fullDate && fullDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
                        const isToday = fullDate && fullDate.getFullYear() === today.getFullYear() && fullDate.getMonth() === today.getMonth() && fullDate.getDate() === today.getDate();

                        // **修改：直接使用 sessionExists?.isPostponed**
                        const isPostponedSession = sessionExists?.isPostponed === true; // isPostponed 是 camelCase

                        const dayOfWeek = fullDate ? fullDate.getDay() : null;
                        // cls.daysOfWeek 是 camelCase
                        const isClassDay = fullDate && (cls.daysOfWeek || []).includes(dayOfWeek);

                        return (
                            <div
                                key={index}
                                className={`p-2 border rounded-lg flex flex-col items-center justify-start min-h-[100px]
                                    ${day ? 'bg-white' : 'bg-gray-50'}
                                    ${isToday && day ? 'ring-2 ring-amber-400 border-amber-400 shadow-md' : 'border-gray-200'}
                                    ${isPastDate && day ? 'opacity-50 cursor-not-allowed' : ''}
                                    ${sessionExists && !isPostponedSession ? 'bg-green-100 border-green-500 cursor-pointer hover:bg-green-200' : ''}
                                    ${isPostponedSession ? 'bg-orange-100 border-orange-500 cursor-not-allowed' : ''}
                                    ${!sessionExists && day && !isPastDate && !isPostponedSession && isClassDay ? 'bg-blue-50 border-blue-400 cursor-pointer hover:bg-blue-100' : ''}
                                    ${!sessionExists && day && !isPastDate && !isPostponedSession && !isClassDay ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                                `}
                                onClick={() => {
                                    if (day && !isPastDate && !isPostponedSession) {
                                        // 這裡的 cls 是從 props 傳入的 camelCase 格式課程對象
                                        handleManualToggleSession(cls, fullDate);
                                    } else if (isPastDate) {
                                        showMessage('不能修改過去的課程日期。', 'error');
                                    } else if (isPostponedSession) {
                                        showMessage('此課程已標記為順延，無法直接手動修改。請使用順延功能調整。', 'info');
                                    }
                                }}
                            >
                                <span className={`font-bold ${isToday ? 'text-amber-700' : 'text-gray-800'}`}>{day}</span>
                                {isToday && day && <span className="text-xs font-medium text-amber-600">今日</span>}
                                {sessionExists && !isPostponedSession && <span className="text-xs text-green-600">已排課</span>}
                                {isPostponedSession && <span className="text-xs text-orange-600">已順延</span>}
                                {!sessionExists && day && !isPastDate && !isPostponedSession && isClassDay && <span className="text-xs text-blue-600">可排課</span>}
                                {!sessionExists && day && !isPastDate && !isPostponedSession && !isClassDay && <span className="text-xs text-gray-500">非上課日</span>}

                                {/* 為了調試，顯示 session ID 的前幾位 */}
                                {sessionExists && <span className="text-xs text-gray-400">ID: {sessionExists.id.substring(0, 4)}...</span>}
                            </div>
                        );
                    })}
                </div>

                {/* 順延課程區塊 */}
                <div className="mt-5 p-3 border border-purple-200 rounded-lg bg-purple-50">
                    <h4 className="text-lg font-bold text-purple-800 mb-2 text-center">順延課程 (不增加總堂數)</h4>
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label htmlFor="postponeOriginDate" className="block text-sm font-medium text-gray-700 mb-1">
                                選擇原始課程日期
                            </label>
                            <select
                                id="postponeOriginDate"
                                value={postponeOriginDate}
                                onChange={(e) => setPostponeOriginDate(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm"
                            >
                                <option value="">-- 請選擇已排定的日期 --</option>
                                {/* 顯示未順延的課程 */}
                                {existingClassSessions.map(session => (
                                    <option key={session.id} value={formatDateToLocalISO(new Date(session.date))}>
                                        {new Date(session.date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })} (未順延)
                                    </option>
                                ))}
                                {/* 顯示已順延的課程，用於取消順延 */}
                                {postponedClassSessions.map(session => (
                                    <option key={session.id} value={formatDateToLocalISO(new Date(session.date))}>
                                        {new Date(session.date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })} (已順延)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-3">
                        <button
                            onClick={() => handlePostponeConfirmed(cls)}
                            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-all"
                            // 只有當選中的日期是「未順延」狀態時，才啟用「確認順延」按鈕
                            disabled={!postponeOriginDate ||
                                (getSessionForDate(postponeOriginDate)?.isPostponed === true) // isPostponed 是 camelCase
                            }
                        >
                            確認順延
                        </button>
                        <button
                            onClick={() => handleCancelPostponement(cls)}
                            className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-all"
                            // 只有當選中的日期是「已順延」狀態時，才啟用「取消順延」按鈕
                            disabled={!postponeOriginDate ||
                                (getSessionForDate(postponeOriginDate)?.isPostponed === false) // isPostponed 是 camelCase
                            }
                        >
                            取消順延
                        </button>
                    </div>
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

export default ClassCalendarModal;