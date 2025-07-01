// frontend/src/utils/dateUtils.js

/**
 * 計算指定月份和年份的天數。
 * @param {number} month - 月份 (0-11)
 * @param {number} year - 年份
 * @returns {number} 該月份的天數
 */
export const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

/**
 * 計算指定月份的第一天是星期幾。
 * @param {number} month - 月份 (0-11)
 * @param {number} year - 年份
 * @returns {number} 星期幾 (0 = 星期日, 6 = 星期六)
 */
export const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

/**
 * 根據開始日期、上課星期和總堂數計算課程結束日期。
 * @param {string} startDate - 課程開始日期 (YYYY-MM-DD)
 * @param {number[]} daysOfWeek - 上課星期 (0=星期日, 6=星期六)
 * @param {number} totalSessions - 課程總堂數
 * @returns {string|null} 課程結束日期 (YYYY-MM-DD) 或 null 如果無法計算
 */
export const calculateClassEndDate = (startDate, daysOfWeek, totalSessions) => {
  if (!startDate || daysOfWeek.length === 0 || totalSessions <= 0) {
    return startDate; // Return start date if invalid inputs
  }

  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  let sessionsCounted = 0;
  let lastSessionDate = startDate;

  const maxSearchDate = new Date(currentDate);
  maxSearchDate.setFullYear(currentDate.getFullYear() + 2); // Safeguard: max 2 years of search

  while (sessionsCounted < totalSessions && currentDate <= maxSearchDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

    if (daysOfWeek.includes(dayOfWeek)) {
      sessionsCounted++;
      lastSessionDate = currentDate.toISOString().split('T')[0];
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return lastSessionDate;
};

/**
 * 根據課程設定生成所有會話 (sessions)。
 * @param {object} classData - 課程資料物件 (包含 startDate, mainTeacher, enrolledStudents 等)
 * @param {string} classId - 課程 ID
 * @param {number} targetSessions - 目標總堂數
 * @param {number[]} daysOfWeek - 上課星期 (0=星期日, 6=星期六)
 * @returns {{sessions: object[], actualEndDate: string}} 包含生成的會話列表和實際結束日期的物件
 */
export const generateSessionsForClass = (classData, classId, targetSessions, daysOfWeek) => {
  const sessionsToGenerate = [];
  if (!classData.startDate || daysOfWeek.length === 0 || targetSessions <= 0) {
    return { sessions: sessionsToGenerate, actualEndDate: classData.startDate };
  }

  let currentDate = new Date(classData.startDate);
  currentDate.setHours(0, 0, 0, 0);

  let sessionCount = 0;
  let actualEndDate = classData.startDate;

  const maxSearchDate = new Date(currentDate);
  maxSearchDate.setFullYear(currentDate.getFullYear() + 2); // Safeguard: max 2 years of search

  while (sessionCount < targetSessions && currentDate <= maxSearchDate) {
    const dateString = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay();

    if (daysOfWeek.includes(dayOfWeek)) {
      sessionsToGenerate.push({
        id: `session-${classId}-${dateString}-${sessionCount}-${Date.now()}`, // Ensure more unique ID
        classId: classId,
        date: dateString,
        actualTeacher: classData.mainTeacher,
        attendance: classData.enrolledStudents.map(studentId => ({ studentId, status: '未到' })),
      });
      sessionCount++;
      actualEndDate = dateString;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return { sessions: sessionsToGenerate, actualEndDate: actualEndDate };
};

/**
 * 計算兩個日期之間有多少個月 (向上取整)。
 * @param {string} d1 - 日期字串 (YYYY-MM-DD)
 * @param {string} d2 - 日期字串 (YYYY-MM-DD)
 * @returns {number} 月數
 */
export const getMonthsBetweenDates = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  let months;
  months = (date2.getFullYear() - date1.getFullYear()) * 12;
  months -= date1.getMonth();
  months += date2.getMonth();
  if (date2.getDate() < date1.getDate()) {
    months--;
  }
  return Math.max(1, months + 1); // At least one month
};