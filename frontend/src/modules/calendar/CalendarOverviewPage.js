// frontend/src/modules/calendar/CalendarOverviewPage.js

import React from 'react';
import MessageDisplay from '../../components/MessageDisplay'; // 導入訊息顯示組件

const CalendarOverviewPage = ({
    currentMonth, currentYear,
    sessions, getSessionsForDate, getClassNameById, getAttendanceSummaryForSession,
    selectedDateOnCalendar, setSelectedDateOnCalendar, setShowDailySessionsModal,
    handlePrevMonth, handleNextMonth, getCalendarDays, monthNames, dayNames,
    messageText, messageType 
}) => {
    const days = getCalendarDays(currentMonth, currentYear);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl transition-all duration-500 ease-in-out max-w-full overflow-hidden">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">日曆總覽</h2>
            <MessageDisplay msg={messageText} type={messageType} />

            {/* 日曆導航 */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={handlePrevMonth}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
                >
                    上個月
                </button>
                <h3 className="text-2xl font-bold text-gray-800">
                    {currentYear} 年 {monthNames[currentMonth]}
                </h3>
                <button
                    onClick={handleNextMonth}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
                >
                    下個月
                </button>
            </div>

            {/* 日曆星期標題 */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
                {dayNames.map(day => (
                    <div key={day} className="font-semibold text-gray-700 p-2 bg-gray-100 rounded-lg">
                        {day}
                    </div>
                ))}
            </div>
            {/* 日曆網格 */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                    const fullDate = day ? new Date(currentYear, currentMonth, day) : null;
                    const dateString = fullDate ? fullDate.toISOString().split('T')[0] : null;
                    // getSessionsForDate 已經處理了從 session.date 提取日期部分進行比較
                    const sessionsOnThisDay = fullDate ? getSessionsForDate(fullDate) : [];
                    const isSelected = selectedDateOnCalendar && dateString === selectedDateOnCalendar.toISOString().split('T')[0];
                    const hasPostponedSession = sessionsOnThisDay.some(session => session.isPostponed === true);
                    const isToday = fullDate && fullDate.getFullYear() === today.getFullYear() && fullDate.getMonth() === today.getMonth() && fullDate.getDate() === today.getDate();

                    return (
                        <div
                            key={index}
                            className={`p-2 border rounded-lg flex flex-col items-center justify-start min-h-[100px]
                                ${day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'}
                                ${isToday && day ? 'ring-2 ring-amber-400 border-amber-400 shadow-md' : 'border-gray-200'}
                                ${isSelected && !isToday ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                                ${isToday ? 'bg-amber-50' : ''}
                                ${hasPostponedSession ? 'bg-orange-100 border-orange-500' : ''}
                            `}
                            onClick={() => {
                                if (day) {
                                    setSelectedDateOnCalendar(fullDate);
                                    setShowDailySessionsModal(true); // 打開每日課程彈窗
                                }
                            }}
                        >
                            <span className={`font-bold ${isToday ? 'text-amber-700' : isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                                {day}
                            </span>
                            {isToday && day && <span className="text-xs font-medium text-amber-600">今日</span>}
                            {sessionsOnThisDay.length > 0 && (
                                <div className="mt-1 text-xs text-blue-600 font-medium">
                                    {sessionsOnThisDay.map(session => (
                                        <div key={session.id} className="truncate">
                                            {/* session.classId (camelCase) */}
                                            {getClassNameById(session.classId)}
                                            {/* 確保只有當 session.isPostponed 為 true 時才顯示 "(順延)" */}
                                            {session.isPostponed === true && ' (順延)'}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarOverviewPage;