import React, { useState, useEffect } from 'react';

// 主應用程式組件
function App() {
  // 顯示訊息內容和類型
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('info');

  // 輔助函數：顯示訊息
  const showMessage = (text, type = 'info') => {
    setMessageText(text);
    setMessageType(type);
    // 自動清除訊息
    setTimeout(() => {
      setMessageText('');
    }, 3000);
  };

  const [currentPage, setCurrentPage] = useState('students'); // 控制當前顯示的頁面

  // 補習班名稱，用於收據
  const TUITION_CENTER_NAME = '顏含文理補習班';

  

  // --- 學生管理狀態 ---
  const [students, setStudents] = useState([
    { id: 'student-001', name: '王小明', age: 12, grade: '國一', school: '光明國中', phone: '0912345678', dob: '2012-05-15', currentClass: '國一數學班' },
    { id: 'student-002', name: '陳美玲', age: 15, grade: '高一', school: '建國高中', phone: '0923456789', dob: '2009-03-20', currentClass: '高一英文班' },
    { id: 'student-003', name: '張志豪', age: 13, grade: '國二', school: '育才國中', phone: '0934567890', dob: '2011-11-01', currentClass: '國二物理班' },
    { id: 'student-004', name: '林雅婷', age: 12, grade: '國一', school: '光明國中', phone: '0945678901', dob: '2012-08-25', currentClass: '國一數學班' },
    // 新增學生資料
    { id: 'student-005', name: '李大華', age: 14, grade: '國三', school: '成功國中', phone: '0956789012', dob: '2010-01-10', currentClass: '國三化學班' },
    { id: 'student-006', name: '吳佩珊', age: 16, grade: '高二', school: '師大附中', phone: '0967890123', dob: '2008-07-07', currentClass: '高二數學班' },
    { id: 'student-007', name: '黃子軒', age: 11, grade: '小六', school: '快樂國小', phone: '0978901234', dob: '2013-09-01', currentClass: '小六作文班' },
  ]); // 儲存學生資料的狀態
  const [newStudent, setNewStudent] = useState({
    name: '', age: '', grade: '', school: '', phone: '', dob: '', currentClass: ''
  });
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // 儲存正在編輯的學生資料
  const [showStudentPaymentModal, setShowStudentPaymentModal] = useState(false); // 控制學生繳費模態視窗
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null); // 儲存選定的學生資料
  const [showConfirmDeleteStudent, setShowConfirmDeleteStudent] = useState(false); // 控制刪除學生確認彈窗
  const [studentToDeleteId, setStudentToDeleteId] = useState(null); // 儲存待刪除的學生ID





  // --- 課堂管理狀態 ---
  const [classes, setClasses] = useState([
    {
      id: 'class-math-001', name: '國一數學基礎班', mainTeacher: '李老師', description: '國一數學基礎概念與題型練習',
      startDate: '2025-07-01', endDate: '2025-09-30', daysOfWeek: [1, 3], totalSessions: 12, price: 6000, paymentFrequency: 'monthly', paymentInstallments: 3,
      enrolledStudents: ['student-001', 'student-004'],
    },
    {
      id: 'class-eng-001', name: '高一英文寫作班', mainTeacher: '王老師', description: '提升高中英文寫作能力',
      startDate: '2025-07-15', endDate: '2025-10-15', daysOfWeek: [2, 5], totalSessions: 10, price: 8000, paymentFrequency: 'monthly', paymentInstallments: 2,
      enrolledStudents: ['student-002'],
    },
    {
      id: 'class-phy-001', name: '國二物理入門', mainTeacher: '張老師', description: '國二物理基本概念與實驗',
      startDate: '2025-08-01', endDate: '2025-11-30', daysOfWeek: [4], totalSessions: 8, price: 5000, paymentFrequency: 'monthly', paymentInstallments: 2,
      enrolledStudents: ['student-003'],
    },
    // 新增課程資料
    {
      id: 'class-chem-001', name: '國三化學衝刺班', mainTeacher: '林老師', description: '國三化學重點複習與模擬考',
      startDate: '2025-09-01', endDate: '2025-12-31', daysOfWeek: [0, 6], totalSessions: 15, price: 7500, paymentFrequency: 'monthly', paymentInstallments: 3,
      enrolledStudents: ['student-005'],
    },
    {
      id: 'class-math-002', name: '高二數學進階班', mainTeacher: '陳老師', description: '高二數學微積分與向量',
      startDate: '2025-09-10', endDate: '2026-01-20', daysOfWeek: [1, 4], totalSessions: 18, price: 9000, paymentFrequency: 'monthly', paymentInstallments: 3,
      enrolledStudents: ['student-006'],
    },
    {
      id: 'class-comp-001', name: '小六作文特訓班', mainTeacher: '趙老師', description: '提升小學高年級寫作技巧',
      startDate: '2025-08-15', endDate: '2025-11-15', daysOfWeek: [3], totalSessions: 10, price: 4000, paymentFrequency: 'monthly', paymentInstallments: 2,
      enrolledStudents: ['student-007'],
    },
  ]); // 儲存課程資料的狀態
  const [newClass, setNewClass] = useState({
    name: '', mainTeacher: '', description: '', startDate: '',
    daysOfWeek: [], totalSessions: 0, paymentInstallments: 1, price: 0, paymentFrequency: 'monthly', enrolledStudents: [],
  });
  const [showAddClassForm, setShowAddClassForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null); // 儲存正在編輯的課程資料
  const [selectedClassToEnroll, setSelectedClassToEnroll] = useState('');
  const [studentsToEnroll, setStudentsToEnroll] = useState([]);
  const [showEnrolledStudentsModal, setShowEnrolledStudentsModal] = useState(false);
  const [classEnrolledStudentsData, setClassEnrolledStudentsData] = useState(null);
  const [showClassCalendarModal, setShowClassCalendarModal] = useState(false);
  const [selectedClassForCalendar, setSelectedClassForCalendar] = useState(null);
  const [showConfirmRemoveEnrollment, setShowConfirmRemoveEnrollment] = useState(false); // 控制移除報名確認彈窗
  const [enrollmentToRemove, setEnrollmentToRemove] = useState({ classId: null, studentId: null }); // 儲存待移除的報名資訊
  const [showConfirmDeleteClass, setShowConfirmDeleteClass] = useState(false); // 控制刪除課程確認彈窗
  const [classToDeleteId, setClassToDeleteId] = useState(null); // 儲存待刪除的課程ID


  // --- 課程會話 (Session) 狀態 ---
  const [sessions, setSessions] = useState([]); // Initialize as empty to let useEffect populate

  // 國定假日資料：已移除自動載入，預設為空，不影響排課邏輯
  const [holidays, setHolidays] = useState([]);

  // --- 財務管理狀態 ---
  const [transactions, setTransactions] = useState([
    { id: 'trans-001-math-m1', studentId: 'student-001', classId: 'class-math-001', amount: 2000, description: '國一數學基礎班 課程學費 (第 1 期)', dueDate: '2025-07-10', paymentTerm: '按月繳費', status: '已繳費', recordDate: '2025-07-05', installment: 1 },
    { id: 'trans-001-math-m2', studentId: 'student-001', classId: 'class-math-001', amount: 2000, description: '國一數學基礎班 課程學費 (第 2 期)', dueDate: '2025-08-10', paymentTerm: '按月繳費', status: '未繳費', recordDate: '2025-07-01', installment: 2 },
    { id: 'trans-001-math-m3', studentId: 'student-001', classId: 'class-math-001', amount: 2000, description: '國一數學基礎班 課程學費 (第 3 期)', dueDate: '2025-09-10', paymentTerm: '按月繳費', status: '未繳費', recordDate: '2025-07-01', installment: 3 },
    { id: 'trans-004-math-m1', studentId: 'student-004', classId: 'class-math-001', amount: 2000, description: '國一數學基礎班 課程學費 (第 1 期)', dueDate: '2025-07-10', paymentTerm: '按月繳費', status: '已繳費', recordDate: '2025-07-08', installment: 1 },
    { id: 'trans-004-math-m2', studentId: 'student-004', classId: 'class-math-001', amount: 2000, description: '國一數學基礎班 課程學費 (第 2 期)', dueDate: '2025-08-10', paymentTerm: '按月繳費', status: '未繳費', recordDate: '2025-07-01', installment: 2 },
    { id: 'trans-004-math-m3', studentId: 'student-004', classId: 'class-math-001', amount: 2000, description: '國一數學基礎班 課程學費 (第 3 期)', dueDate: '2025-09-10', paymentTerm: '按月繳費', status: '未繳費', recordDate: '2025-07-01', installment: 3 },
    { id: 'trans-002-eng-full', studentId: 'student-002', classId: 'class-eng-001', amount: 8000, description: '高一英文寫作班 課程學費 (一次性繳費)', dueDate: '2025-08-15', paymentTerm: '課程總價', status: '已繳費', recordDate: '2025-07-20', installment: 1 },
    { id: 'trans-003-phy-full', studentId: 'student-003', classId: 'class-phy-001', amount: 5000, description: '國二物理入門 課程學費 (一次性繳費)', dueDate: '2025-09-01', paymentTerm: '課程總價', status: '未繳費', recordDate: '2025-08-01', installment: 1 },
    { id: 'trans-005-chem-m1', studentId: 'student-005', classId: 'class-chem-001', amount: 2500, description: '國三化學衝刺班 課程學費 (第 1 期)', dueDate: '2025-09-10', paymentTerm: '按月繳費', status: '未繳費', recordDate: '2025-09-01', installment: 1 },
    { id: 'trans-005-chem-m2', studentId: 'student-005', classId: 'class-chem-001', amount: 2500, description: '國三化學衝刺班 課程學費 (第 2 期)', dueDate: '2025-10-10', paymentTerm: '按月繳費', status: '未繳費', recordDate: '2025-09-01', installment: 2 },
    { id: 'trans-005-chem-m3', studentId: 'student-005', classId: 'class-chem-001', amount: 2500, description: '國三化學衝刺班 課程學費 (第 3 期)', dueDate: '2025-11-10', paymentTerm: '按月繳費', status: '未繳費', recordDate: '2025-09-01', installment: 3 },
    { id: 'trans-006-math-full', studentId: 'student-006', classId: 'class-math-002', amount: 9000, description: '高二數學進階班 課程學費 (一次性繳費)', dueDate: '2025-10-10', paymentTerm: '課程總價', status: '未繳費', recordDate: '2025-09-10', installment: 1 },
    { id: 'trans-007-comp-full', studentId: 'student-007', classId: 'class-comp-001', amount: 4000, description: '小六作文特訓班 課程學費 (一次性繳費)', dueDate: '2025-09-15', paymentTerm: '課程總價', status: '已繳費', recordDate: '2025-08-20', installment: 1 },
  ]); // 儲存交易資料的狀態
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [showPaymentNoticeModal, setShowPaymentNoticeModal] = useState(false);
  const [paymentNoticeData, setPaymentNoticeData] = useState(null);
  const [showCombinedPaymentPrintModal, setShowCombinedPaymentPrintModal] = useState(false);
  const [combinedPaymentPrintData, setCombinedPaymentPrintData] = useState(null);


  // --- 日曆總覽狀態 ---
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDateOnCalendar, setSelectedDateOnCalendar] = useState(null);
  const [showDailySessionsModal, setShowDailySessionsModal] = useState(false);

  // --- 學生課程總覽狀態 ---
  const [showStudentSummaryModal, setShowStudentSummaryModal] = useState(false);
  const [studentSummaryData, setStudentSummaryData] = useState(null);

  // 國定假日資料載入已移除
  useEffect(() => {
    // 這裡的邏輯負責確保在沒有外部假日資料載入的情況下，
    // sessions 仍然可以根據 classes 的預設值生成。
    // 如果 sessions 初始為空，並且 classes 有資料，則進行生成。
    // 如果您希望初始 sessions 不受 classes 預設值影響，請刪除此 useEffect。
    if (sessions.length === 0 && classes.length > 0) {
        const allGeneratedSessions = classes.flatMap(cls => {
            // generateSessionsForClass now returns an object, so we need to extract sessions
            const { sessions: generated } = generateSessionsForClass(cls, cls.id, cls.totalSessions, cls.daysOfWeek);
            return generated;
        });
        setSessions(allGeneratedSessions);
        // Note: Updating classes based on generated sessions here might cause an infinite loop
        // if classes state is also a dependency of generateSessionsForClass or this effect.
        // For now, assuming classes are static or updated elsewhere.
        // If classes' endDate needs to dynamically update based on generated sessions,
        // this part needs careful consideration to avoid infinite re-renders.
        setClasses(prevClasses => prevClasses.map(cls => {
            const classSessions = allGeneratedSessions.filter(s => s.classId === cls.id);
            const latestDate = classSessions.length > 0
                ? classSessions.reduce((maxDate, session) => (new Date(session.date) > new Date(maxDate) ? session.date : maxDate), cls.startDate)
                : cls.startDate;
            return { ...cls, endDate: latestDate };
        }));
    }
  }, [classes, sessions.length]); // 僅依賴 classes 變化來生成 sessions, 增加 sessions.length 避免無限循環

  // 處理導航點擊事件
  const handleNavigationClick = (page) => {
    setCurrentPage(page);
    showMessage(''); // 使用 showMessage 清除訊息
    setSelectedDateOnCalendar(null);
    setShowReceiptModal(false);
    setShowPaymentNoticeModal(false);
    setShowAddClassForm(false);
    setShowEnrolledStudentsModal(false);
    setShowStudentSummaryModal(false);
    setShowAddStudentForm(false);
    setShowClassCalendarModal(false);
    setShowDailySessionsModal(false);
    setEditingStudent(null); // 清除編輯狀態
    setEditingClass(null); // 清除編輯課程狀態
    setShowStudentPaymentModal(false); // 關閉學生繳費模態視窗
    setSelectedStudentForPayment(null); // 清除選定的學生資料
    setShowConfirmDeleteStudent(false); // 關閉刪除學生確認彈窗
    setShowConfirmRemoveEnrollment(false); // 關閉移除報名確認彈窗
    setShowConfirmDeleteClass(false); // 關閉刪除課程確認彈窗
    setShowCombinedPaymentPrintModal(false); // 關閉綜合繳費列印模態視窗
  };

  // 顯示訊息的組件
  const MessageDisplay = ({ msg, type = 'info' }) => {
    if (!msg) return null;
    const bgColor = type === 'success' ? 'bg-green-100' : type === 'error' ? 'bg-red-100' : 'bg-blue-100';
    const textColor = type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800';
    return (
      <div className={`mt-4 p-3 rounded-lg text-center ${bgColor} ${textColor}`}>
        {msg}
      </div>
    );
  };

  // 輔助函數：根據ID獲取學生姓名
  const getStudentNameById = (id) => {
    const student = students.find(s => s.id === id);
    return student ? student.name : '未知學生';
  };

  // 輔助函數：根據ID獲取課程名稱
  const getClassNameById = (id) => {
    const cls = classes.find(c => c.id === id);
    return cls ? cls.name : '未知課程';
  };

  // 輔助函數：根據ID獲取課程老師
  const getClassTeacherById = (id) => {
    const cls = classes.find(c => c.id === id);
    return cls ? cls.mainTeacher : '未知老師';
  };

  // --- 學生管理邏輯 ---
  const handleStudentInputChange = (e) => {
    const { name, value } = e.target;
    if (editingStudent) {
      setEditingStudent({ ...editingStudent, [name]: value });
    } else {
      setNewStudent({ ...newStudent, [name]: value });
    }
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.age || !newStudent.grade || !newStudent.school || !newStudent.phone || !newStudent.dob || !newStudent.currentClass) {
      showMessage('請填寫所有學生資訊。', 'error');
      return;
    }
    setStudents([...students, { id: `student-${Date.now()}`, ...newStudent }]);
    setNewStudent({ name: '', age: '', grade: '', school: '', phone: '', dob: '', currentClass: '' });
    setShowAddStudentForm(false);
    showMessage('學生已成功添加！', 'success');
  };

  const handleEditStudent = (student) => {
    setEditingStudent({ ...student }); // 複製學生資料進行編輯
    setShowAddStudentForm(true); // 顯示表單
  };

  const handleUpdateStudent = (e) => {
    e.preventDefault();
    if (!editingStudent.name || !editingStudent.age || !editingStudent.grade || !editingStudent.school || !editingStudent.phone || !editingStudent.dob || !editingStudent.currentClass) {
      showMessage('請填寫所有學生資訊。', 'error');
      return;
    }
    setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
    setEditingStudent(null); // 清除編輯狀態
    setShowAddStudentForm(false);
    showMessage('學生資料已成功更新！', 'success');
  };

  const handleDeleteStudent = (studentId) => {
    setStudentToDeleteId(studentId);
    setShowConfirmDeleteStudent(true);
  };

  const handleDeleteStudentConfirm = () => {
    if (studentToDeleteId) {
      setStudents(students.filter(s => s.id !== studentToDeleteId));
      // 同步移除學生在所有課程中的報名
      setClasses(prevClasses => prevClasses.map(cls => ({
        ...cls,
        enrolledStudents: cls.enrolledStudents.filter(id => id !== studentToDeleteId)
      })));
      // 同步移除學生在所有會話中的點名記錄
      setSessions(prevSessions => prevSessions.map(session => ({
        ...session,
        attendance: session.attendance.filter(att => att.studentId !== studentToDeleteId)
      })));
      // 同步移除學生的所有繳費記錄
      setTransactions(prevTransactions => prevTransactions.filter(t => t.studentId !== studentToDeleteId));

      showMessage('學生及相關資料已成功刪除！', 'success');
      setStudentToDeleteId(null);
      setShowConfirmDeleteStudent(false);
    }
  };

  // 打開學生繳費管理模態視窗
  const handleManageStudentPayment = (student) => {
    setSelectedStudentForPayment(student);
    setShowStudentPaymentModal(true);
  };


  // --- 課堂管理邏輯 ---
  const handleClassInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const targetClass = editingClass || newClass;
      const newDaysOfWeek = checked
        ? [...targetClass.daysOfWeek, parseInt(value)]
        : targetClass.daysOfWeek.filter((day) => day !== parseInt(value));
      if (editingClass) {
        setEditingClass({ ...editingClass, daysOfWeek: newDaysOfWeek });
      } else {
        setNewClass({ ...newClass, daysOfWeek: newDaysOfWeek });
      }
    } else {
      if (editingClass) {
        setEditingClass({ ...editingClass, [name]: value });
      } else {
        setNewClass({ ...newClass, [name]: value });
      }
    }
  };

  // 輔助函數：根據開始日期、上課星期和總堂數計算課程結束日期
  const calculateClassEndDate = (startDate, daysOfWeek, totalSessions) => {
    if (!startDate || daysOfWeek.length === 0 || totalSessions <= 0) {
      return startDate; // Return start date if invalid inputs
    }

    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    let sessionsCounted = 0;
    let lastSessionDate = startDate;

    // Loop until totalSessions are scheduled
    // Add a safeguard to prevent infinite loops (e.g., max 2 years of search)
    const maxSearchDate = new Date(currentDate);
    maxSearchDate.setFullYear(currentDate.getFullYear() + 2);

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


  // 根據課程設定生成所有會話 (sessions)
  const generateSessionsForClass = (classData, classId, targetSessions, daysOfWeek) => {
    const sessionsToGenerate = [];
    if (!classData.startDate || daysOfWeek.length === 0 || targetSessions <= 0) {
      return { sessions: sessionsToGenerate, actualEndDate: classData.startDate };
    }

    let currentDate = new Date(classData.startDate);
    currentDate.setHours(0, 0, 0, 0);

    let sessionCount = 0;
    let actualEndDate = classData.startDate; // Track the actual end date of sessions

    // Add a safeguard to prevent infinite loops (e.g., max 2 years of search)
    const maxSearchDate = new Date(currentDate);
    maxSearchDate.setFullYear(currentDate.getFullYear() + 2);

    while (sessionCount < targetSessions && currentDate <= maxSearchDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay(); // 0 = 星期日, 6 = 星期六

      if (daysOfWeek.includes(dayOfWeek)) {
        sessionsToGenerate.push({
          id: `session-${classId}-${dateString}-${sessionCount}`, // Ensure unique ID for each session
          classId: classId,
          date: dateString,
          actualTeacher: classData.mainTeacher, // Default to main teacher
          attendance: classData.enrolledStudents.map(studentId => ({ studentId, status: '未到' })),
        });
        sessionCount++;
        actualEndDate = dateString; // Update actual end date
      }
      currentDate.setDate(currentDate.getDate() + 1); // 移動到下一天
    }
    return { sessions: sessionsToGenerate, actualEndDate: actualEndDate };
  };


  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClass.name || !newClass.mainTeacher || !newClass.startDate || newClass.daysOfWeek.length === 0 || newClass.price <= 0 || newClass.totalSessions <= 0 || newClass.paymentInstallments <= 0) {
      showMessage('請填寫所有必填課程資訊 (課程名稱、主課老師、開始日期、上課星期、總堂數、學費金額、繳費期數)。', 'error');
      return;
    }

    const calculatedEndDate = calculateClassEndDate(newClass.startDate, newClass.daysOfWeek, newClass.totalSessions);
    if (!calculatedEndDate) {
        showMessage('無法根據設定計算課程結束日期，請檢查輸入。', 'error');
        return;
    }

    const classId = `class-${Date.now()}`;
    const classData = { ...newClass, id: classId, endDate: calculatedEndDate };

    const { sessions: generatedSessions, actualEndDate } = generateSessionsForClass(classData, classId, newClass.totalSessions, newClass.daysOfWeek);

    if (generatedSessions.length === 0) {
        showMessage('根據您設定的日期和星期，沒有可排定的課程堂數。請檢查日期或上課星期設定。', 'error');
        return;
    }
    classData.totalSessions = generatedSessions.length; // Update totalSessions to actual generated count
    classData.endDate = actualEndDate; // Update class endDate to the actual last session date

    setClasses(prevClasses => [...prevClasses, classData]);
    setSessions(prevSessions => [...prevSessions, ...generatedSessions]);

    // Generate transactions for monthly payment
    const newTransactions = [];
    const monthlyAmount = Math.ceil(classData.price / classData.paymentInstallments);

    for (let i = 0; i < classData.paymentInstallments; i++) {
        const dueDate = new Date(classData.startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        dueDate.setDate(10); // 設定每月10號為繳費期限

        newTransactions.push({
            id: `transaction-${Date.now()}-${classId}-${i + 1}`,
            studentId: '', // Will be updated when students enroll
            classId: classId, // Link to the class
            amount: monthlyAmount,
            description: `${classData.name} 課程學費 (第 ${i + 1} 期)`,
            dueDate: dueDate.toISOString().split('T')[0],
            paymentTerm: '按月繳費',
            status: '未繳費',
            recordDate: null,
            installment: i + 1,
        });
    }
    setTransactions(prevTransactions => [...prevTransactions, ...newTransactions]);


    setNewClass({
      name: '', mainTeacher: '', description: '', startDate: '',
      daysOfWeek: [], totalSessions: 0, paymentInstallments: 1, price: 0, paymentFrequency: 'monthly', enrolledStudents: [],
    });
    setShowAddClassForm(false);
    showMessage('課程已成功添加並生成會話和繳費記錄！', 'success');
  };

  const handleEditClass = (cls) => {
    setEditingClass({ ...cls });
    setNewClass({ // Set newClass for form display
      name: cls.name, mainTeacher: cls.mainTeacher, description: cls.description,
      startDate: cls.startDate, daysOfWeek: cls.daysOfWeek,
      totalSessions: cls.totalSessions, price: cls.price,
      paymentInstallments: cls.paymentInstallments, paymentFrequency: cls.paymentFrequency,
      enrolledStudents: cls.enrolledStudents, // Keep enrolled students
    });
    setShowAddClassForm(true);
  };

  const handleUpdateClass = (e) => {
    e.preventDefault();
    if (!editingClass.name || !editingClass.mainTeacher || !editingClass.startDate || editingClass.daysOfWeek.length === 0 || editingClass.price <= 0 || editingClass.totalSessions <= 0 || editingClass.paymentInstallments <= 0) {
      showMessage('請填寫所有必填課程資訊 (課程名稱、主課老師、開始日期、上課星期、總堂數、學費金額、繳費期數)。', 'error');
      return;
    }

    const calculatedEndDate = calculateClassEndDate(editingClass.startDate, editingClass.daysOfWeek, editingClass.totalSessions);
    if (!calculatedEndDate) {
        showMessage('無法根據設定計算課程結束日期，請檢查輸入。', 'error');
        return;
    }

    // Filter out old sessions for this class and generate new ones
    const sessionsExcludingThisClass = sessions.filter(s => s.classId !== editingClass.id);
    const { sessions: newGeneratedSessions, actualEndDate } = generateSessionsForClass(editingClass, editingClass.id, editingClass.totalSessions, editingClass.daysOfWeek);

    // Update class data with new totalSessions and endDate
    const updatedClassData = {
      ...editingClass,
      totalSessions: newGeneratedSessions.length,
      endDate: actualEndDate,
    };

    setClasses(prevClasses => prevClasses.map(cls =>
      cls.id === editingClass.id
        ? updatedClassData
        : cls
    ));
    setSessions([...sessionsExcludingThisClass, ...newGeneratedSessions]);

    // Re-generate transactions for this class based on new settings
    const newTransactionsForClass = [];
    const monthlyAmount = Math.ceil(updatedClassData.price / updatedClassData.paymentInstallments);

    for (let i = 0; i < updatedClassData.paymentInstallments; i++) {
        const dueDate = new Date(updatedClassData.startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        dueDate.setDate(10); // 設定每月10號為繳費期限

        newTransactionsForClass.push({
            id: `transaction-${Date.now()}-${updatedClassData.id}-${i + 1}`,
            studentId: '', // Will be updated when students enroll
            classId: updatedClassData.id, // Link to the class
            amount: monthlyAmount,
            description: `${updatedClassData.name} 課程學費 (第 ${i + 1} 期)`,
            dueDate: dueDate.toISOString().split('T')[0],
            paymentTerm: '按月繳費',
            status: '未繳費',
            recordDate: null,
            installment: i + 1,
        });
    }

    // Filter out old transactions for this class, then add new ones
    setTransactions(prevTransactions => [
      ...prevTransactions.filter(t => t.classId !== updatedClassData.id),
      ...newTransactionsForClass
    ]);


    setEditingClass(null);
    setNewClass({ // Reset newClass form
      name: '', mainTeacher: '', description: '', startDate: '',
      daysOfWeek: [], totalSessions: 0, paymentInstallments: 1, price: 0, paymentFrequency: 'monthly', enrolledStudents: [],
    });
    setShowAddClassForm(false);
    showMessage('課程資料已成功更新並重新生成會話和繳費記錄！', 'success');
  };


  const handleDeleteClass = (classId) => {
    setClassToDeleteId(classId);
    setShowConfirmDeleteClass(true);
  };

  const handleDeleteClassConfirm = () => {
    if (classToDeleteId) {
      setClasses(prevClasses => prevClasses.filter(cls => cls.id !== classToDeleteId));
      // 移除該課程的所有會話
      setSessions(prevSessions => prevSessions.filter(session => session.classId !== classToDeleteId));
      // 移除該課程的所有繳費記錄
      setTransactions(prevTransactions => prevTransactions.filter(t => t.classId !== classToDeleteId));

      showMessage('課程及相關資料已成功刪除！', 'success');
      setClassToDeleteId(null);
      setShowConfirmDeleteClass(false);
    }
  };


  const handleRemoveEnrollment = (classId, studentId) => {
    setEnrollmentToRemove({ classId, studentId });
    setShowConfirmRemoveEnrollment(true);
  };

  const handleRemoveEnrollmentConfirm = () => {
    const { classId, studentId } = enrollmentToRemove;
    if (classId && studentId) {
      setClasses(prevClasses => prevClasses.map(cls =>
        cls.id === classId
          ? { ...cls, enrolledStudents: cls.enrolledStudents.filter(sId => sId !== studentId) }
          : cls
      ));
      // 移除該學生在此課程的所有會話點名記錄
      setSessions(prevSessions => prevSessions.map(session =>
        session.classId === classId
          ? { ...session, attendance: session.attendance.filter(att => att.studentId !== studentId) }
          : session
      ));
      // 移除該學生在此課程的所有未繳費記錄
      setTransactions(prevTransactions => prevTransactions.filter(t =>
        !(t.studentId === studentId && t.classId === classId && t.status === '未繳費')
      ));
      showMessage('學生已成功從課程中移除報名！', 'success');
      setClassEnrolledStudentsData(prevData => ({ // 更新彈窗內的顯示
        ...prevData,
        enrolledStudents: prevData.enrolledStudents.filter(sId => sId !== studentId)
      }));
    }
    setEnrollmentToRemove({ classId: null, studentId: null });
    setShowConfirmRemoveEnrollment(false);
  };

  // 處理課程報名學生選擇 (此功能已存在，但放置於學生管理頁面)
  const handleEnrollStudentChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setStudentsToEnroll([...studentsToEnroll, value]);
    } else {
      setStudentsToEnroll(studentsToEnroll.filter(id => id !== value));
    }
  };

  // 輔助函數：計算兩個日期之間有多少個月 (向上取整)
  const getMonthsBetweenDates = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    let months;
    months = (date2.getFullYear() - date1.getFullYear()) * 12;
    months -= date1.getMonth();
    months += date2.getMonth();
    // 考慮天數，如果 d2 的天數小於 d1，則不滿一個月
    if (date2.getDate() < date1.getDate()) {
        months--;
    }
    return Math.max(1, months + 1); // 至少一個月，確保不會除以零
  };

  // 處理課程報名 (此功能已存在，但放置於學生管理頁面)
  const handleEnrollStudentsToClass = (e) => {
    e.preventDefault();
    if (!selectedClassToEnroll) {
      showMessage('請選擇一個課程來報名學生。', 'error');
      return;
    }
    if (studentsToEnroll.length === 0) {
      showMessage('請選擇至少一位學生來報名。', 'error');
      return;
    }

    const classToUpdate = classes.find(cls => cls.id === selectedClassToEnroll);
    if (!classToUpdate) {
      showMessage('找不到選定的課程。', 'error');
      return;
    }

    const currentlyEnrolledStudentsSet = new Set(classToUpdate.enrolledStudents);
    const newStudentsBeingEnrolled = studentsToEnroll.filter(studentId => !currentlyEnrolledStudentsSet.has(studentId));

    if (newStudentsBeingEnrolled.length === 0) {
        showMessage('所選學生均已報名此課程，無需重複操作。', 'info');
        setSelectedClassToEnroll('');
        setStudentsToEnroll([]);
        return;
    }

    const newEnrolledStudents = [...new Set([...classToUpdate.enrolledStudents, ...studentsToEnroll])];
    setClasses(prevClasses => prevClasses.map(cls =>
      cls.id === selectedClassToEnroll
        ? { ...cls, enrolledStudents: newEnrolledStudents }
        : cls
    ));

    setSessions(prevSessions => prevSessions.map(session => {
      if (session.classId === selectedClassToEnroll) {
        const updatedAttendance = [...session.attendance];
        newStudentsBeingEnrolled.forEach(studentId => {
          // 僅在學生尚未存在於點名記錄中時添加
          if (!updatedAttendance.some(att => att.studentId === studentId)) {
            updatedAttendance.push({ studentId, status: '未到' });
          }
        });
        return { ...session, attendance: updatedAttendance };
      }
      return session;
    }));

    const newTransactions = [];
    newStudentsBeingEnrolled.forEach(studentId => {
      // Find the template transactions for this class
      const classTemplateTransactions = transactions.filter(t => t.classId === classToUpdate.id && t.studentId === '');

      classTemplateTransactions.forEach(templateTx => {
        newTransactions.push({
          ...templateTx,
          id: `transaction-${Date.now()}-${studentId}-${classToUpdate.id}-month-${templateTx.installment}`,
          studentId: studentId,
          recordDate: null, // Ensure recordDate is null for new unpaid transactions
          status: '未繳費', // Ensure status is unpaid for new transactions
        });
      });
    });

    setTransactions(prevTransactions => [...prevTransactions, ...newTransactions]);

    setSelectedClassToEnroll('');
    setStudentsToEnroll([]);
    showMessage('學生已成功報名到課程，並已生成繳費記錄！', 'success');
  };

  // 查看課程報名學生彈窗
  const handleViewEnrolledStudents = (cls) => {
    setClassEnrolledStudentsData(cls);
    setShowEnrolledStudentsModal(true);
  };

  const EnrolledStudentsModal = ({ show, onClose, cls, students, onRemoveEnrollment, getStudentNameById }) => {
    if (!show || !cls) return null;
    const enrolledStudentNames = cls.enrolledStudents.map(id => ({ id, name: getStudentNameById(id) }));

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">課程報名學生 - {cls.name}</h3>
          {enrolledStudentNames.length === 0 ? (
            <p className="text-center text-gray-600">目前沒有學生報名此課程。</p>
          ) : (
            <ul className="list-disc list-inside text-gray-700 max-h-60 overflow-y-auto">
              {enrolledStudentNames.map((student, index) => (
                <li key={student.id} className="mb-1 flex justify-between items-center">
                  <span>{student.name}</span>
                  <button
                    onClick={() => onRemoveEnrollment(cls.id, student.id)}
                    className="ml-4 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-md hover:bg-red-600 transition-colors"
                  >
                    移除報名
                  </button>
                </li>
              ))}
            </ul>
          )}
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

  // --- 財務管理邏輯 ---
  const handleChangePaymentStatus = (transactionId, newStatus) => {
    setTransactions(prevTransactions => prevTransactions.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          status: newStatus,
          recordDate: newStatus === '已繳費' ? new Date().toISOString().split('T')[0] : null // Clear recordDate if changing to unpaid
        };
      }
      return t;
    }));
    showMessage(`交易已標記為${newStatus}！`, 'success');
  };

  const handlePrintReceipt = (transaction) => {
    setReceiptData({
      centerName: TUITION_CENTER_NAME,
      studentName: getStudentNameById(transaction.studentId),
      amount: transaction.amount,
      description: transaction.description,
      paymentTerm: transaction.paymentTerm,
      recordDate: transaction.recordDate,
      id: transaction.id,
    });
    setShowReceiptModal(true);
  };

  const ReceiptModal = ({ show, onClose, data }) => {
    if (!show || !data) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">繳費收據</h3>
          <div className="border-t border-b border-gray-300 py-4 mb-4">
            <p className="mb-2"><span className="font-semibold">補習班名稱:</span> {data.centerName}</p>
            <p className="mb-2"><span className="font-semibold">收據編號:</span> {data.id}</p>
            <p className="mb-2"><span className="font-semibold">學生姓名:</span> {data.studentName}</p>
            <p className="mb-2"><span className="font-semibold">繳費項目:</span> {data.paymentTerm}</p>
            <p className="mb-2"><span className="font-semibold">描述:</span> {data.description}</p>
            <p className="mb-2"><span className="font-semibold">繳費金額:</span> NT$ {data.amount}</p>
            <p className="mb-2"><span className="font-semibold">收款日期:</span> {data.recordDate}</p>
          </div>
          <p className="text-center text-gray-600 text-sm">感謝您的繳費！</p>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              列印收據
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handlePrintPaymentNotice = (transaction) => {
    if (transaction.paymentTerm === '按月繳費') {
      const student = students.find(s => s.id === transaction.studentId);
      const courseName = transaction.description.split(' 課程學費')[0];
      const course = classes.find(c => c.name === courseName);

      if (!student || !course) {
          showMessage('無法找到學生或課程資訊以列印通知。', 'error');
          return;
      }

      const allMonthlyTransactionsForStudentCourse = transactions.filter(t =>
          t.studentId === student.id &&
          t.paymentTerm === '按月繳費' &&
          t.description.includes(course.name)
      ).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));

      const currentTransactionIndex = allMonthlyTransactionsForStudentCourse.findIndex(t => t.id === transaction.id);
      
      const transactionsToPrint = [];
      for (let i = currentTransactionIndex; i < allMonthlyTransactionsForStudentCourse.length && i < currentTransactionIndex + 4; i++) {
          transactionsToPrint.push(allMonthlyTransactionsForStudentCourse[i]);
      }

      if (transactionsToPrint.length === 0) {
          showMessage('沒有找到可列印的後續繳費通知。', 'info');
          return;
      }

      setPaymentNoticeData({
        centerName: TUITION_CENTER_NAME,
        studentName: student.name,
        notices: transactionsToPrint.map(t => ({
            amount: t.amount,
            description: t.description,
            dueDate: t.dueDate,
            paymentTerm: t.paymentTerm
        }))
      });
      setShowPaymentNoticeModal(true);

    } else {
      setPaymentNoticeData({
        centerName: TUITION_CENTER_NAME,
        studentName: getStudentNameById(transaction.studentId),
        notices: [{
            amount: transaction.amount,
            description: transaction.description,
            dueDate: transaction.dueDate,
            paymentTerm: transaction.paymentTerm
        }]
      });
      setShowPaymentNoticeModal(true);
    }
  };

  const PaymentNoticeModal = ({ show, onClose, data }) => {
    if (!show || !data || !data.notices) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">繳費通知單</h3>
          <div className="border-t border-b border-gray-300 py-4 mb-4">
            <p className="mb-2"><span className="font-semibold">補習班名稱:</span> {data.centerName}</p>
            <p className="mb-2">親愛的 **{data.studentName}** 家長/同學您好：</p>
            <p className="mb-2">這是您的繳費通知，請您留意以下款項：</p>
            {data.notices.map((notice, index) => (
                <div key={index} className="mb-3 p-2 border border-gray-200 rounded-md bg-gray-50">
                  <p className="mb-1"><span className="font-semibold">繳費項目:</span> {notice.paymentTerm === '按月繳費' ? '按月繳費' : '課程總價'}</p>
                  <p className="mb-1"><span className="font-semibold">應繳金額:</span> NT$ {notice.amount}</p>
                  <p className="mb-1"><span className="font-semibold">繳費期限:</span> {notice.dueDate}</p>
                  <p className="mb-1"><span className="font-semibold">描述:</span> {notice.description}</p>
                </div>
            ))}
          </div>
          <p className="text-center text-gray-600 text-sm">請您於繳費期限前完成繳費，如有任何疑問，請聯繫補習班。</p>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              列印通知單
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handlePrintAllPaymentNotices = () => {
    const unpaidOrOverdueTransactions = transactions.filter(t => t.status === '未繳費' && t.studentId !== ''); // Filter out template transactions
    if (unpaidOrOverdueTransactions.length === 0) {
      showMessage('目前沒有未繳費或逾期記錄可以列印通知。', 'info');
      return;
    }

    // Create a printable content string for all notices
    let printContent = `
      <html>
        <head>
          <title>所有繳費通知</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .page-break { page-break-before: always; }
              .notice-container { margin-bottom: 20px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
            }
          </style>
        </head>
        <body>
          <h1 class="text-2xl font-bold text-center my-4">所有繳費通知總覽</h1>
    `;

    unpaidOrOverdueTransactions.forEach((t, index) => {
      const student = students.find(s => s.id === t.studentId);
      const studentName = student ? student.name : '未知學生';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDateObj = new Date(t.dueDate);
      dueDateObj.setHours(0, 0, 0, 0);
      const isOverdue = dueDateObj < today; // Correctly calculates overdue based on current date
      const statusText = isOverdue ? '逾期未繳' : '未繳費';

      printContent += `
        <div class="notice-container ${index > 0 ? 'page-break' : ''}">
          <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">繳費通知單</h3>
          <div class="border-t border-b border-gray-300 py-4 mb-4">
            <p class="mb-2"><span class="font-semibold">補習班名稱:</span> ${TUITION_CENTER_NAME}</p>
            <p class="mb-2">親愛的 **${studentName}** 家長/同學您好：</p>
            <p class="mb-2">這是您的繳費通知，請您留意以下款項：</p>
            <div class="mb-3 p-2 border border-gray-200 rounded-md bg-gray-50">
              <p class="mb-1"><span class="font-semibold">繳費項目:</span> ${t.paymentTerm === '按月繳費' ? '按月繳費' : '課程總價'}</p>
              <p class="mb-1"><span class="font-semibold">應繳金額:</span> NT$ ${t.amount}</p>
              <p class="mb-1"><span class="font-semibold">繳費期限:</span> ${t.dueDate}</p>
              <p class="mb-1"><span class="font-semibold">描述:</span> ${t.description}</p>
              <p class="mb-1"><span class="font-semibold">狀態:</span> ${statusText}</p>
            </div>
          </div>
          <p class="text-center text-gray-600 text-sm">請您於繳費期限前完成繳費，如有任何疑問，請聯繫補習班。</p>
        </div>
      `;
    });

    printContent += `</body></html>`;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handlePrintAllReceipts = () => {
    const paidTransactions = transactions.filter(t => t.status === '已繳費' && t.studentId !== ''); // Filter out template transactions
    if (paidTransactions.length === 0) {
      showMessage('目前沒有已繳費記錄可以列印收據。', 'info');
      return;
    }

    let printContent = `
      <html>
        <head>
          <title>所有繳費收據</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .page-break { page-break-before: always; }
              .receipt-container { margin-bottom: 20px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
            }
          </style>
        </head>
        <body>
          <h1 class="text-2xl font-bold text-center my-4">所有繳費收據總覽</h1>
    `;

    paidTransactions.forEach((t, index) => {
      const student = students.find(s => s.id === t.studentId);
      const studentName = student ? student.name : '未知學生';

      printContent += `
        <div class="receipt-container ${index > 0 ? 'page-break' : ''}">
          <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">繳費收據</h3>
          <div className="border-t border-b border-gray-300 py-4 mb-4">
            <p className="mb-2"><span className="font-semibold">補習班名稱:</span> ${TUITION_CENTER_NAME}</p>
            <p className="mb-2"><span className="font-semibold">收據編號:</span> ${t.id}</p>
            <p className="mb-2"><span className="font-semibold">學生姓名:</span> ${studentName}</p>
            <p className="mb-2"><span className="font-semibold">繳費項目:</span> ${t.paymentTerm}</p>
            <p className="mb-2"><span className="font-semibold">描述:</span> ${t.description}</p>
            <p className="mb-2"><span className="font-semibold">繳費金額:</span> NT$ ${t.amount}</p>
            <p className="mb-2"><span className="font-semibold">收款日期:</span> ${t.recordDate}</p>
          </div>
          <p className="text-center text-gray-600 text-sm">感謝您的繳費！</p>
        </div>
      `;
    });

    printContent += `</body></html>`;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // 財務儀表板組件
  const FinancialDashboard = ({ transactions, getStudentNameById }) => {
    // 計算本月已收到多少
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthlyCollectedAmount = transactions
      .filter(t => {
        const recordDate = new Date(t.recordDate);
        return t.status === '已繳費' &&
               recordDate.getMonth() === currentMonth &&
               recordDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // 計算本月應收款項
    const monthlyOutstandingTransactions = transactions.filter(t => {
      const dueDate = new Date(t.dueDate);
      return t.status === '未繳費' &&
             dueDate.getMonth() === currentMonth &&
             dueDate.getFullYear() === currentYear;
    });

    const monthlyOutstandingAmount = monthlyOutstandingTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    return (
      <div className="bg-white p-8 rounded-xl shadow-2xl transition-all duration-500 ease-in-out transform hover:scale-105 mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">財務儀表板</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center"> {/* Adjusted grid for 2 columns */}
          <div className="bg-green-50 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-green-800 mb-2">本月已收到多少</h3> {/* Changed label */}
            <p className="text-4xl font-bold text-green-600">NT$ {monthlyCollectedAmount.toLocaleString()}</p> {/* Changed calculation */}
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
              {[...new Set(monthlyOutstandingTransactions.map(t => t.studentId))].map(studentId => (
                <li key={studentId} className="mb-1">
                  {getStudentNameById(studentId)}
                  <ul className="list-circle list-inside ml-4 text-sm text-gray-600">
                    {monthlyOutstandingTransactions.filter(t => t.studentId === studentId).map(t => (
                      <li key={t.id}>{t.description} (NT$ {t.amount}, 期限: {t.dueDate})</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-center text-gray-600 mt-8">此處可以擴展更多詳細的財務統計和圖表。</p>
      </div>
    );
  };

  // --- 日曆總覽邏輯 ---
  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay(); // 0 for Sunday, 6 for Saturday

  const getCalendarDays = (month, year) => {
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDateOnCalendar(null);
    setShowDailySessionsModal(false);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDateOnCalendar(null);
    setShowDailySessionsModal(false);
  };

  const getSessionsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return sessions.filter(session => session.date === dateString);
  };

  // 更新後的 getAttendanceSummaryForSession 函數
  const getAttendanceSummaryForSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return '';

    // 檢查該會話的所有學生是否都被標記為「順延」
    const isPostponed = session.attendance.length > 0 && session.attendance.every(att => att.status === '順延');

    if (isPostponed) {
        return '已順延';
    } else {
      const attended = session.attendance.filter(att => att.status === '已到').length;
      const leave = session.attendance.filter(att => att.status === '請假').length;
      const absent = session.attendance.filter(att => att.status === '未到').length;
      return `到: ${attended}, 請: ${leave}, 未: ${absent}`;
    }
  };

  // StudentSummaryModal is for "出缺席" in the student list
  const handleViewStudentSummary = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
      showMessage('找不到學生資料。', 'error');
      return;
    }

    const studentCourses = classes.filter(cls => cls.enrolledStudents.includes(studentId));

    const summaryCourses = studentCourses.map(course => {
      const courseSessions = sessions.filter(session =>
        session.classId === course.id &&
        session.attendance.some(att => att.studentId === studentId)
      ).map(session => ({
        id: session.id, // Pass session ID for attendance update
        date: session.date,
        status: session.attendance.find(att => att.studentId === studentId)?.status || '未到',
        studentId: studentId // Pass student ID for attendance update
      })).sort((a, b) => new Date(a.date + 'T24:00:00') - new Date(b.date + 'T24:00:00')); // Ensure consistent date comparison

      // Calculate total paid and outstanding amounts for this student for this course
      const courseTransactions = transactions.filter(t =>
        t.studentId === studentId &&
        t.classId === course.id
      );

      const paidAmount = courseTransactions
        .filter(t => t.status === '已繳費')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const outstandingAmount = courseTransactions
        .filter(t => t.status === '未繳費')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      return {
        id: course.id, // Add course ID for later use
        name: course.name,
        mainTeacher: course.mainTeacher,
        startDate: course.startDate,
        endDate: course.endDate,
        totalCoursePrice: course.price,
        paidAmount: paidAmount,
        outstandingAmount: outstandingAmount,
        sessions: courseSessions
      };
    });

    setStudentSummaryData({
      studentName: student.name,
      courses: summaryCourses
    });
    setShowStudentSummaryModal(true);
  };

  // StudentSummaryModal is for "出缺席" in the student list
  const StudentSummaryModal = ({ show, onClose, data, onUpdateAttendanceStatus }) => {
    if (!show || !data) return null;

    // Inline style for print media query
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
        }
        thead {
          background-color: #f2f2f2;
        }
      }
    `;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full relative print-area">
          <style>{printStyles}</style> {/* Apply print styles */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
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
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出缺席狀態</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {course.sessions.map((session, sessionIndex) => (
                            <tr key={sessionIndex} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap">{session.date}</td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <select
                                  value={session.status}
                                  onChange={(e) => onUpdateAttendanceStatus(session.id, session.studentId, e.target.value)}
                                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  disabled={session.status === '順延'} // Disable if status is '順延'
                                >
                                  <option value="未到">未到</option>
                                  <option value="已到">已到</option>
                                  <option value="請假">請假</option>
                                  <option value="順延">順延</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="flex justify-center mt-6 no-print"> {/* Added no-print class */}
            <button
              onClick={() => window.print()} // Use window.print() directly for simpler printing
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              列印總覽
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ClassCalendarModal (用於課程系統頁面中調整課程日期)
  const ClassCalendarModal = ({ show, onClose, cls, sessions, setSessions, setClasses, showMessage }) => {
    if (!show || !cls) return null;

    const [modalCurrentMonth, setModalCurrentMonth] = useState(new Date(cls.startDate).getMonth());
    const [modalCurrentYear, setModalCurrentYear] = useState(new Date(cls.startDate).getFullYear());
    const [postponeOriginDate, setPostponeOriginDate] = useState(''); // State for selected origin date for postponement
    const [postponeDays, setPostponeDays] = useState(1); // State for days to postpone (no longer directly used for calculation, but for UI)

    // Helper functions for calendar logic within the modal
    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay(); // 0 for Sunday, 6 for Saturday

    const getCalendarDays = (month, year) => {
      const totalDays = daysInMonth(month, year);
      const startDay = firstDayOfMonth(month, year);
      const days = [];

      for (let i = 0; i < startDay; i++) {
        days.push(null);
      }
      for (let i = 1; i <= totalDays; i++) {
        days.push(i);
      }
      return days;
    };


    const handleModalPrevMonth = () => {
      if (modalCurrentMonth === 0) {
        setModalCurrentMonth(11);
        setModalCurrentYear(modalCurrentYear - 1);
      } else {
        setModalCurrentMonth(modalCurrentMonth - 1);
      }
    };

    const handleModalNextMonth = () => {
      if (modalCurrentMonth === 11) {
        setModalCurrentMonth(0);
        setModalCurrentYear(modalCurrentYear + 1);
      } else {
        setModalCurrentMonth(modalCurrentMonth + 1);
      }
    };

    const getSessionForDate = (dateString) => {
      return sessions.find(s => s.classId === cls.id && s.date === dateString);
    };

    const handleToggleSession = (day) => {
      if (!day) return;
      const clickedDate = new Date(modalCurrentYear, modalCurrentMonth, day);
      const dateString = clickedDate.toISOString().split('T')[0];
      const today = new Date();
      today.setHours(0,0,0,0);

      if (clickedDate < today) {
        showMessage('不能修改過去的課程日期。', 'error');
        return;
      }

      setSessions(prevSessions => {
        const existingSession = prevSessions.find(s => s.classId === cls.id && s.date === dateString);
        let newSessions;
        
        // Get current active sessions count (excluding postponed ones)
        const currentActiveSessions = prevSessions.filter(s => s.classId === cls.id && !s.attendance.every(att => att.status === '順延'));
        const currentActiveCount = currentActiveSessions.length;

        if (existingSession) {
          // If session exists and is NOT postponed, remove it.
          // If it IS postponed, prevent removal via toggle, user should use postpone function.
          if (existingSession.attendance.every(att => att.status === '順延')) {
            showMessage('此課程已順延，無法直接取消。請使用順延功能調整。', 'info');
            return prevSessions; // Do not change sessions
          }
          newSessions = prevSessions.filter(s => s.id !== existingSession.id);
          showMessage('課程已移除！', 'success');
        } else {
          // If session does not exist, try to add it.
          // Check if adding this session would exceed the class's totalSessions limit.
          if (currentActiveCount >= cls.totalSessions) {
            showMessage(`已達到課程總堂數上限 (${cls.totalSessions} 堂)，無法再新增課程。`, 'error');
            return prevSessions; // Do not change sessions
          }
          newSessions = [...prevSessions, {
            id: `session-${cls.id}-${dateString}-${Date.now()}`, // Ensure unique ID
            classId: cls.id,
            date: dateString,
            actualTeacher: cls.mainTeacher, // Default to main teacher
            attendance: cls.enrolledStudents.map(studentId => ({ studentId, status: '未到' })),
          }];
          showMessage('課程已新增！', 'success');
        }

        // Update totalSessions and endDate in the classes state based on the *actual* number of non-postponed sessions
        setClasses(prevClasses => prevClasses.map(c => {
          if (c.id === cls.id) {
            // Recalculate totalSessions based on the new set of sessions (excluding postponed ones)
            const updatedTotalSessionsCount = newSessions.filter(s => s.classId === cls.id && !s.attendance.every(att => att.status === '順延')).length;
            
            // Find the latest date among the active sessions to update endDate
            const latestActiveSession = newSessions.filter(s => s.classId === cls.id && !s.attendance.every(att => att.status === '順延'))
                                                 .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            const newEndDate = latestActiveSession ? latestActiveSession.date : c.startDate; // If no active sessions, revert to start date

            return { ...c, totalSessions: updatedTotalSessionsCount, endDate: newEndDate };
          }
          return c;
        }));

        return newSessions;
      });
    };

    const handlePostponeConfirmed = () => {
        if (!postponeOriginDate) {
            showMessage('請選擇原始日期。', 'error');
            return;
        }

        const originalSession = sessions.find(s => s.classId === cls.id && s.date === postponeOriginDate);

        if (!originalSession) {
            showMessage('選定的原始日期沒有該課程的排課，無法順延。', 'error');
            return;
        }

        const allAttended = originalSession.attendance.every(att => att.status === '已到');
        if (allAttended) {
            showMessage('該堂課已完成點名且所有學生已到，無法順延。', 'error');
            return;
        }

        // 1. Mark the original session's attendance status as '順延'
        setSessions(prevSessions => prevSessions.map(s => {
            if (s.id === originalSession.id) {
                return { ...s,
                    attendance: s.attendance.map(att => ({ ...att, status: '順延' }))
                };
            }
            return s;
        }));

        // 2. Find the next available class day for the makeup session
        // Get all sessions for this class, excluding the one just postponed and any already marked as '順延'
        const activeSessionsExcludingPostponed = sessions.filter(s =>
            s.classId === cls.id &&
            s.id !== originalSession.id && // Exclude the session being postponed from the "active" pool
            !s.attendance.every(att => att.status === '順延') // Exclude already postponed sessions from the "active" pool
        ).sort((a, b) => new Date(a.date + 'T24:00:00') - new Date(b.date + 'T24:00:00')); // Sort by date ascending, ensuring consistent parsing

        // The date from which to start searching for the new session
        let searchStartPoint = cls.startDate; // Default to class start date if no other active sessions
        if (activeSessionsExcludingPostponed.length > 0) {
            searchStartPoint = activeSessionsExcludingPostponed[activeSessionsExcludingPostponed.length - 1].date; // Latest date among remaining active sessions
        }

        let newDateObj = new Date(searchStartPoint + 'T24:00:00'); // Start search from the beginning of the day of the latest active session
        newDateObj.setDate(newDateObj.getDate() + 1); // Move to the next calendar day from the start point

        let foundNewDate = null;
        const maxSearchDate = new Date(newDateObj);
        maxSearchDate.setFullYear(newDateObj.getFullYear() + 1); // Limit search to max one year

        while (!foundNewDate && newDateObj <= maxSearchDate) {
            const dateString = newDateObj.toISOString().split('T')[0];
            const dayOfWeek = newDateObj.getDay();

            // Check if it's a scheduled day for the class
            // And ensure this date does not already have ANY session for this class (active or postponed)
            const isDateOccupied = sessions.some(s => s.classId === cls.id && s.date === dateString);

            if (cls.daysOfWeek.includes(dayOfWeek) && !isDateOccupied) {
                foundNewDate = dateString;
            }
            newDateObj.setDate(newDateObj.getDate() + 1); // Move to next day
        }

        if (!foundNewDate) {
            showMessage('無法找到新的上課日期以補足順延的課程。', 'error');
            return;
        }

        // 3. Add a new session for the found date
        const newSession = {
            id: `session-${cls.id}-${foundNewDate}-${Date.now()}`, // Ensure unique ID
            classId: cls.id,
            date: foundNewDate,
            actualTeacher: cls.mainTeacher, // Default to main teacher
            attendance: cls.enrolledStudents.map(studentId => ({ studentId, status: '未到' })),
        };
        setSessions(prevSessions => [...prevSessions, newSession]);

        // 4. Update the class's endDate if the new session extends it
        setClasses(prevClasses => prevClasses.map(c => {
            if (c.id === cls.id) {
                const updatedEndDate = new Date(foundNewDate + 'T24:00:00') > new Date(c.endDate + 'T24:00:00') ? foundNewDate : c.endDate;
                return { ...c, endDate: updatedEndDate };
            }
            return c;
        }));

        showMessage(`課程已從 ${postponeOriginDate} 順延至 ${foundNewDate}！`, 'success');
        setPostponeOriginDate('');
    };

    const handleCancelPostponement = () => {
        if (!postponeOriginDate) {
            showMessage('請選擇要取消順延的原始日期。', 'error');
            return;
        }

        const originalSession = sessions.find(s => s.classId === cls.id && s.date === postponeOriginDate);

        if (!originalSession || !originalSession.attendance.every(att => att.status === '順延')) {
            showMessage('選定的日期不是已順延的課程，無法取消順延。', 'error');
            return;
        }

        // Revert the original session's attendance status to '未到'
        setSessions(prevSessions => prevSessions.map(s => {
            if (s.id === originalSession.id) {
                return { ...s,
                    attendance: s.attendance.map(att => ({ ...att, status: '未到' }))
                };
            }
            return s;
        }));

        // OPTIONAL: If you want to automatically remove the *last added* makeup session,
        // this part would be complex without a direct link (e.g., makeupOfSessionId).
        // For now, we only revert the original session's status.
        // The user might need to manually remove the extra session if it's no longer needed.
        showMessage(`課程已從 ${postponeOriginDate} 取消順延！`, 'success');
        setPostponeOriginDate('');
    };


    const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    const calendarDays = getCalendarDays(modalCurrentMonth, modalCurrentYear);

    // Get existing session dates for dropdown (only future sessions that are not yet postponed)
    const existingClassSessions = sessions
        .filter(s => s.classId === cls.id && new Date(s.date + 'T24:00:00') >= new Date().setHours(0,0,0,0)) // Use T24:00:00 for consistent comparison
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const today = new Date();
    today.setHours(0,0,0,0);


    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">調整課程日期 - {cls.name}</h3>

          <div className="flex justify-between items-center mb-6">
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
              const dateString = fullDate ? fullDate.toISOString().split('T')[0] : null;
              const sessionExists = dateString ? getSessionForDate(dateString) : null;
              
              const isPastDate = fullDate && fullDate < today;
              // 檢查該日期是否存在已順延的課程會話
              const isPostponedSession = sessionExists && sessionExists.attendance.length > 0 && sessionExists.attendance.every(att => att.status === '順延');


              return (
                <div
                  key={index}
                  className={`p-2 border border-gray-200 rounded-lg flex flex-col items-center justify-start min-h-[100px]
                    ${day ? 'bg-white' : 'bg-gray-50'}
                    ${sessionExists && !isPostponedSession ? 'bg-green-100 border-green-500 cursor-pointer hover:bg-green-200' : ''}
                    ${isPostponedSession ? 'bg-orange-100 border-orange-500 cursor-not-allowed' : ''} {/* Style for postponed sessions */}
                    ${!sessionExists && day && !isPastDate ? 'bg-gray-50 text-gray-400 cursor-pointer hover:bg-gray-100' : ''}
                    ${isPastDate && day && !isPostponedSession ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => {
                    if (day && !isPastDate && !isPostponedSession) { // Allow toggling future dates, but not postponed ones
                      handleToggleSession(day);
                    } else if (isPastDate) {
                      showMessage('不能修改過去的課程日期。', 'error');
                    } else if (isPostponedSession) {
                      showMessage('此課程已順延，無法直接修改。', 'info');
                    }
                  }}
                >
                  <span className="font-bold text-gray-800">{day}</span>
                  {sessionExists && !isPostponedSession && <span className="text-xs text-green-600">已排課</span>}
                  {isPostponedSession && <span className="text-xs text-orange-600">已順延</span>} {/* Text for postponed sessions */}
                  {!sessionExists && day && !isPastDate && <span className="text-xs text-gray-500">可排課</span>}
                </div>
              );
            })}
          </div>

          {/* 順延課程區塊 */}
          <div className="mt-8 p-4 border border-purple-200 rounded-lg bg-purple-50">
            <h4 className="text-xl font-bold text-purple-800 mb-4 text-center">順延課程 (不增加總堂數)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="postponeOriginDate" className="block text-sm font-medium text-gray-700 mb-1">
                  選擇原始課程日期
                </label>
                <select
                  id="postponeOriginDate"
                  value={postponeOriginDate}
                  onChange={(e) => setPostponeOriginDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                >
                  <option value="">-- 請選擇已排定的日期 --</option>
                  {existingClassSessions.map(session => (
                    <option key={session.id} value={session.date}>
                      {new Date(session.date + 'T24:00:00').toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })} ({session.attendance.every(att => att.status === '順延') ? '已順延' : '未順延'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={handlePostponeConfirmed}
                className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-all"
              >
                確認順延
              </button>
              <button
                onClick={handleCancelPostponement}
                className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-all"
                disabled={!postponeOriginDate || !sessions.find(s => s.classId === cls.id && s.date === postponeOriginDate)?.attendance.every(att => att.status === '順延')}
              >
                取消順延
              </button>
            </div>
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

  // DailySessionsAttendanceModal (用於日曆總覽中顯示每日課程並點名)
  const DailySessionsAttendanceModal = ({ show, onClose, date, sessions, students, onUpdateAttendanceStatus, getClassNameById, getClassTeacherById, classes }) => {
    if (!show || !date) return null;

    const sessionsForDate = sessions.filter(session => session.date === date.toISOString().split('T')[0]);
    const [showSingleSessionAttendanceModal, setShowSingleSessionAttendanceModal] = useState(false);
    const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState(null);

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
                      {getClassNameById(session.classId)} (老師: {session.actualTeacher || getClassTeacherById(session.classId)})
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">
                      點名統計: {getAttendanceSummaryForSession(session.id)}
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
        </div>
        <SessionAttendanceModal // Moved SessionAttendanceModal definition here
          show={showSingleSessionAttendanceModal}
          onClose={() => setShowSingleSessionAttendanceModal(false)}
          session={selectedSessionForAttendance}
          students={students}
          onUpdateAttendanceStatus={handleUpdateAttendanceStatus}
          getStudentNameById={getStudentNameById}
          getClassNameById={getClassNameById}
          classes={classes} // Pass classes to get teacher info
          setSessions={setSessions} // Pass setSessions to update actualTeacher
        />
      </div>
    );
  };

  // SessionAttendanceModal (用於點名) - Moved here to be defined before usage
  const SessionAttendanceModal = ({ show, onClose, session, students, onUpdateAttendanceStatus, getStudentNameById, getClassNameById, classes, setSessions }) => {
    if (!show || !session) return null;

    const currentClass = classes.find(cls => cls.id === session.classId);
    // Combine main and substitute teachers, filter out empty strings, and ensure uniqueness
    const availableTeachers = [currentClass?.mainTeacher, currentClass?.substituteTeacher].filter(Boolean);
    const [selectedTeacher, setSelectedTeacher] = useState(session.actualTeacher || currentClass?.mainTeacher || '');
    const [customTeacher, setCustomTeacher] = useState('');


    const handleStudentStatusChange = (studentId, newStatus) => {
      onUpdateAttendanceStatus(session.id, studentId, newStatus);
    };

    const handleTeacherChange = (e) => {
      const value = e.target.value;
      setSelectedTeacher(value);
      if (value !== '自訂') {
        setCustomTeacher('');
        // Update the session's actualTeacher immediately when selected from dropdown
        setSessions(prevSessions => prevSessions.map(s =>
          s.id === session.id ? { ...s, actualTeacher: value } : s
        ));
      }
    };

    const handleCustomTeacherChange = (e) => {
      setCustomTeacher(e.target.value);
      // Update the session's actualTeacher immediately when custom teacher is typed
      setSessions(prevSessions => prevSessions.map(s =>
        s.id === session.id ? { ...s, actualTeacher: e.target.value } : s
      ));
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
            {getClassNameById(session.classId)} - {session.date} 點名
          </h3>

          {/* 老師選擇區塊 */}
          <div className="mb-4">
            <label htmlFor="sessionTeacher" className="block text-sm font-medium text-gray-700 mb-1">上課老師</label>
            <select
              id="sessionTeacher"
              value={selectedTeacher}
              onChange={handleTeacherChange}
              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
              />
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {session.attendance.length === 0 ? (
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
                  {session.attendance.map(att => (
                    <tr key={att.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">{getStudentNameById(att.studentId)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <select
                          value={att.status}
                          onChange={(e) => handleStudentStatusChange(att.studentId, e.target.value)}
                          className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          disabled={session.attendance.every(att => att.status === '順延')} // Disable if status is '順延'
                        >
                          <option value="未到">未到</option>
                          <option value="已到">已到</option>
                          <option value="請假">請假</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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


  // StudentPaymentModal: 顯示學生繳費記錄並提供操作
  const StudentPaymentModal = ({ show, onClose, student, transactions, classes, handleChangePaymentStatus, handlePrintReceipt, handlePrintPaymentNotice, getClassNameById, getStudentNameById }) => {
    if (!show || !student) return null;

    const studentTransactions = transactions.filter(t => t.studentId === student.id)
                                           .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // 按到期日排序

    // Group transactions by class
    const transactionsByClass = studentTransactions.reduce((acc, transaction) => {
      const className = getClassNameById(transaction.classId);
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(transaction);
      return acc;
    }, {});

    const handlePrintCombined = (student, courseId) => {
      const course = classes.find(c => c.id === courseId);
      if (!course) {
        showMessage('找不到課程資訊。', 'error');
        return;
      }

      setCombinedPaymentPrintData({
        student: student,
        course: course,
        transactions: transactions.filter(t => t.studentId === student.id && t.classId === courseId),
        sessions: sessions.filter(s => s.classId === courseId).sort((a, b) => new Date(a.date) - new Date(b.date)),
      });
      setShowCombinedPaymentPrintModal(true);
    };


    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">學生繳費管理 - {student.name}</h3>
          <div className="max-h-96 overflow-y-auto">
            {Object.keys(transactionsByClass).length === 0 ? (
              <p className="text-center text-gray-600">該學生目前沒有繳費記錄。</p>
            ) : (
              Object.entries(transactionsByClass).map(([className, classTransactions]) => (
                <div key={className} className="mb-8 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <h4 className="text-xl font-semibold text-blue-800 mb-4">{className}</h4>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => handlePrintCombined(student, classTransactions[0].classId)}
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
                      {classTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">NT$ {t.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.dueDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${t.status === '已繳費' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
                            }>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.recordDate}</td>
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
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

  // CombinedPaymentPrintModal: 綜合繳費通知書與繳費明細
  const CombinedPaymentPrintModal = ({ show, onClose, data, TUITION_CENTER_NAME }) => {
    if (!show || !data || !data.student || !data.course || !data.transactions || !data.sessions) return null;

    const { student, course, transactions: allTransactions, sessions: allSessions } = data;

    // Filter transactions relevant to this student and course, and sort by installment
    const courseTransactions = allTransactions
        .filter(t => t.studentId === student.id && t.classId === course.id)
        .sort((a, b) => a.installment - b.installment);

    // Get all sessions for this specific course, sorted by date
    const courseSessions = allSessions
        .filter(s => s.classId === course.id)
        .sort((a, b) => new Date(a.date + 'T24:00:00') - new Date(b.date + 'T24:00:00')); // Ensure consistent date comparison

    // Calculate sessions per display row dynamically
    const sessionsPerDisplayRow = Math.ceil(course.totalSessions / course.paymentInstallments); 

    // Prepare data for the table
    const tableData = courseTransactions.map(tx => {
        // Determine the sessions that logically belong to this installment for display.
        const startIndex = (tx.installment - 1) * sessionsPerDisplayRow;
        const endIndex = startIndex + sessionsPerDisplayRow;
        
        const relatedSessions = courseSessions.slice(startIndex, endIndex);

        // Format session dates, marking postponed ones
        const classPeriodDates = relatedSessions.map(s => {
            // Ensure local date interpretation for consistent MM/DD format
            const date = new Date(s.date + 'T24:00:00'); // Use T24:00:00 for consistent local date
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const datePart = `${month}/${day}`;
            const isPostponed = s.attendance.every(att => att.status === '順延');
            return `${datePart}${isPostponed ? ' (順延)' : ''}`;
        }).join(',<br>'); // Use <br> for new lines as requested

        const classPeriod = relatedSessions.length > 0
            ? `${new Date(relatedSessions[0].date + 'T24:00:00').getFullYear()}/${classPeriodDates}` // Add year to first date
            : '無上課期間';
        
        const paymentRemarks = tx.status === '已繳費' ? `已繳費<br>${tx.recordDate}` : '未繳費';

        return {
            date: tx.dueDate, // Use due date for the main date column
            subject: course.name.split(' ')[0], // e.g., "數學", "英文"
            fee: `NT$ ${tx.amount.toLocaleString()}元`,
            classPeriod: classPeriod,
            paymentRemarks: paymentRemarks,
        };
    });

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
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full relative print-container">
          <style>{printStyles}</style>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
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
                    <td className="px-4 py-2 text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: row.classPeriod.replace(/,/g, ',<br>') }}></td>
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
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
            >
              列印通知單
            </button>
          </div>
        </div>
      </div>
    );
  };


  // ConfirmationModal Component (取代 window.confirm)
  const ConfirmationModal = ({ show, onClose, onConfirm, title, message }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full relative">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{title}</h3>
          <p className="text-gray-700 text-center mb-6">{message}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all"
            >
              確認
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 處理點名狀態更新的函數
  const handleUpdateAttendanceStatus = (sessionId, studentId, newStatus) => {
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              attendance: session.attendance.map(att => 
                att.studentId === studentId ? { ...att, status: newStatus } : att
              ),
            } 
          : session
      )
    );
    showMessage('點名狀態已更新！', 'success');
  };


  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      {/* 導航欄 */}
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 shadow-lg">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <h1 className="text-white text-3xl font-bold rounded-lg px-2 py-1">補習班管理系統</h1>
          <div className="flex flex-wrap space-x-2 md:space-x-4 mt-2 md:mt-0">
            <button
              onClick={() => handleNavigationClick('students')}
              className={`px-3 py-2 md:px-5 md:py-2 rounded-lg transition-all duration-300 ease-in-out text-sm md:text-base
                ${currentPage === 'students' ? 'bg-white text-blue-700 shadow-md' : 'text-white hover:bg-blue-500 hover:shadow-md'}
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75`}
            >
              學生管理
            </button>
            <button
              onClick={() => handleNavigationClick('classes')}
              className={`px-3 py-2 md:px-5 md:py-2 rounded-lg transition-all duration-300 ease-in-out text-sm md:text-base
                ${currentPage === 'classes' ? 'bg-white text-blue-700 shadow-md' : 'text-white hover:bg-blue-500 hover:shadow-md'}
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75`}
            >
              課堂系統
            </button>
            <button
              onClick={() => handleNavigationClick('finance')}
              className={`px-3 py-2 md:px-5 md:py-2 rounded-lg transition-all duration-300 ease-in-out text-sm md:text-base
                ${currentPage === 'finance' ? 'bg-white text-blue-700 shadow-md' : 'text-white hover:bg-blue-500 hover:shadow-md'}
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75`}
            >
              財務管理
            </button>
            <button
              onClick={() => handleNavigationClick('calendar')}
              className={`px-3 py-2 md:px-5 md:py-2 rounded-lg transition-all duration-300 ease-in-out text-sm md:text-base
                ${currentPage === 'calendar' ? 'bg-white text-blue-700 shadow-md' : 'text-white hover:bg-blue-500 hover:shadow-md'}
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75`}
            >
              日曆總覽
            </button>
            {/* 新增歷史課程按鈕 */}
            <button
              onClick={() => handleNavigationClick('history')}
              className={`px-3 py-2 md:px-5 md:py-2 rounded-lg transition-all duration-300 ease-in-out text-sm md:text-base
                ${currentPage === 'history' ? 'bg-white text-blue-700 shadow-md' : 'text-white hover:bg-blue-500 hover:shadow-md'}
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75`}
            >
              歷史課程
            </button>
          </div>
        </div>
      </nav>

      {/* 主要內容區域 */}
      <main className="container mx-auto p-6 flex-grow">
        {(() => {
          switch (currentPage) {
            case 'students':
              return (
                <div className="bg-white p-8 rounded-xl shadow-2xl transition-all duration-500 ease-in-out transform hover:scale-105">
                  <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">學生管理</h2>
                  <MessageDisplay msg={messageText} type={messageType} /> {/* 使用 messageText 和 messageType */}

                  {/* 添加學生按鈕 */}
                  <div className="flex justify-center mb-8">
                    <button
                      onClick={() => {
                        setShowAddStudentForm(!showAddStudentForm);
                        setEditingStudent(null); // 確保是新增模式
                        setNewStudent({ name: '', age: '', grade: '', school: '', phone: '', dob: '', currentClass: '' });
                      }}
                      className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {showAddStudentForm ? '隱藏學生表單' : '添加學生'}
                    </button>
                  </div>

                  {/* 新增的列印按鈕 */}
                  <div className="flex justify-center space-x-4 mb-8">
                    <button
                      onClick={handlePrintAllPaymentNotices}
                      className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-all"
                    >
                      列印所有繳費通知
                    </button>
                    <button
                      onClick={handlePrintAllReceipts}
                      className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-all"
                    >
                      列印所有收據
                    </button>
                  </div>

                  {/* 添加/編輯學生表單 (條件渲染) */}
                  {showAddStudentForm && (
                    <>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">{editingStudent ? '編輯學生資料' : '新增學生'}</h3>
                      <form onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
                        <div>
                          <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                          <input
                            type="text"
                            id="studentName"
                            name="name"
                            value={editingStudent ? editingStudent.name : newStudent.name}
                            onChange={handleStudentInputChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="輸入學生姓名"
                          />
                        </div>
                        <div>
                          <label htmlFor="studentAge" className="block text-sm font-medium text-gray-700 mb-1">年齡</label>
                          <input
                            type="number"
                            id="studentAge"
                            name="age"
                            value={editingStudent ? editingStudent.age : newStudent.age}
                            onChange={handleStudentInputChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="輸入學生年齡"
                          />
                        </div>
                        <div>
                          <label htmlFor="studentGrade" className="block text-sm font-medium text-gray-700 mb-1">年級</label>
                          <input
                            type="text"
                            id="studentGrade"
                            name="grade"
                            value={editingStudent ? editingStudent.grade : newStudent.grade}
                            onChange={handleStudentInputChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="輸入學生年級"
                          />
                        </div>
                        <div>
                          <label htmlFor="studentSchool" className="block text-sm font-medium text-gray-700 mb-1">就讀學校</label>
                          <input
                            type="text"
                            id="studentSchool"
                            name="school"
                            value={editingStudent ? editingStudent.school : newStudent.school}
                            onChange={handleStudentInputChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="輸入就讀學校"
                          />
                        </div>
                        <div>
                          <label htmlFor="studentPhone" className="block text-sm font-medium text-gray-700 mb-1">聯絡電話</label>
                          <input
                            type="text"
                            id="studentPhone"
                            name="phone"
                            value={editingStudent ? editingStudent.phone : newStudent.phone}
                            onChange={handleStudentInputChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="輸入聯絡電話"
                          />
                        </div>
                        <div>
                          <label htmlFor="studentDob" className="block text-sm font-medium text-gray-700 mb-1">生日</label>
                          <input
                            type="date"
                            id="studentDob"
                            name="dob"
                            value={editingStudent ? editingStudent.dob : newStudent.dob}
                            onChange={handleStudentInputChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="studentCurrentClass" className="block text-sm font-medium text-gray-700 mb-1">目前班級</label>
                          <input
                            type="text"
                            id="studentCurrentClass"
                            name="currentClass"
                            value={editingStudent ? editingStudent.currentClass : newStudent.currentClass}
                            onChange={handleStudentInputChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="輸入目前班級"
                          />
                        </div>
                        <div className="md:col-span-3 flex justify-center space-x-4">
                          <button
                            type="submit"
                            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            {editingStudent ? '儲存修改' : '添加學生'}
                          </button>
                          {editingStudent && (
                            <button
                              type="button"
                              onClick={() => { setEditingStudent(null); setShowAddStudentForm(false); showMessage(''); }}
                              className="px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            >
                              取消
                            </button>
                          )}
                        </div>
                      </form>
                    </>
                  )}

                  {/* 學生列表 */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center mt-8">學生列表</h3>
                  {students.length === 0 ? (
                    <p className="text-center text-gray-600">目前沒有學生。</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年齡</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年級</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">就讀學校</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">聯絡電話</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">生日</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">目前班級</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.age}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.school}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.phone}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.dob}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.currentClass}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                  onClick={() => handleViewStudentSummary(student.id)}
                                  className="text-blue-600 hover:text-blue-900 mr-2"
                                >
                                  出缺席
                                </button>
                                <button
                                  onClick={() => handleEditStudent(student)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                                >
                                  編輯
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="text-red-600 hover:text-red-900 mr-2"
                                >
                                  刪除
                                </button>
                                <button
                                  onClick={() => handleManageStudentPayment(student)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  管理繳費
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 課程報名學生 (已移至學生管理頁面) */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 mt-8">為課程報名學生</h3>
                  <form onSubmit={handleEnrollStudentsToClass} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                    <div className="mb-4">
                      <label htmlFor="selectClassToEnroll" className="block text-sm font-medium text-gray-700 mb-1">選擇課程</label>
                      <select
                        id="selectClassToEnroll"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={selectedClassToEnroll}
                        onChange={(e) => {
                          setSelectedClassToEnroll(e.target.value);
                          const currentClass = classes.find(c => c.id === e.target.value);
                          setStudentsToEnroll(currentClass ? [...currentClass.enrolledStudents] : []);
                        }}
                      >
                        <option value="">請選擇一個課程</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({cls.mainTeacher}) - 學費: NT$ {cls.price} (共 {cls.totalSessions} 堂, 分 {cls.paymentInstallments} 期)
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedClassToEnroll && students.length > 0 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">選擇學生</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {students.map((student) => (
                            <label key={student.id} className="inline-flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <input
                                type="checkbox"
                                value={student.id}
                                checked={studentsToEnroll.includes(student.id)}
                                onChange={handleEnrollStudentChange}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                              />
                              <span className="ml-2 text-gray-700">{student.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        disabled={!selectedClassToEnroll || studentsToEnroll.length === 0}
                      >
                        報名學生到課程
                      </button>
                    </div>
                  </form>
                </div>
              );
            case 'classes':
              return (
                <div className="bg-white p-8 rounded-xl shadow-2xl transition-all duration-500 ease-in-out transform hover:scale-105">
                  <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">課堂系統</h2>
                  <MessageDisplay msg={messageText} type={messageType} /> {/* 使用 messageText 和 messageType */}

                  {/* 新增課程按鈕 */}
                  <div className="flex justify-center mb-8">
                    <button
                      onClick={() => {
                        setShowAddClassForm(!showAddClassForm);
                        setEditingClass(null); // Ensure it's add mode
                        setNewClass({ // Reset form for new class
                          name: '', mainTeacher: '', description: '', startDate: '',
                          daysOfWeek: [], totalSessions: 0, paymentInstallments: 1, price: 0, paymentFrequency: 'monthly', enrolledStudents: [],
                        });
                      }}
                      className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {showAddClassForm ? '隱藏新增課程表單' : '新增課程'}
                    </button>
                  </div>

                  {/* 添加/編輯課程表單 (條件渲染) */}
                  {showAddClassForm && (
                    <>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">{editingClass ? '編輯課程' : '新增課程'}</h3>
                      <form onSubmit={editingClass ? handleUpdateClass : handleAddClass} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
                        <div>
                          <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">課程名稱 <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            id="className"
                            name="name"
                            value={editingClass ? editingClass.name : newClass.name}
                            onChange={handleClassInputChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="輸入課程名稱"
                          />
                        </div>
                        <div>
                          <label htmlFor="mainTeacher" className="block text-sm font-medium text-gray-700 mb-1">主課老師 <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            id="mainTeacher"
                            name="mainTeacher"
                            value={editingClass ? editingClass.mainTeacher : newClass.mainTeacher}
                            onChange={handleClassInputChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="輸入主課老師姓名"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">課程內容說明</label>
                          <textarea
                            id="description"
                            name="description"
                            value={editingClass ? editingClass.description : newClass.description}
                            onChange={handleClassInputChange}
                            rows="3"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="輸入課程內容說明 (選填)"
                          ></textarea>
                        </div>
                        <div>
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">開始日期 <span className="text-red-500">*</span></label>
                          <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={editingClass ? editingClass.startDate : newClass.startDate}
                            onChange={handleClassInputChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="totalSessions" className="block text-sm font-medium text-gray-700 mb-1">總堂數 <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            id="totalSessions"
                            name="totalSessions"
                            value={editingClass ? editingClass.totalSessions : newClass.totalSessions}
                            onChange={handleClassInputChange}
                            min="1"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="輸入總堂數"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">上課星期 <span className="text-red-500">*</span></label>
                          <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                            {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                              <label key={index} className="inline-flex items-center">
                                <input
                                  type="checkbox"
                                  name="daysOfWeek"
                                  value={index}
                                  checked={editingClass ? editingClass.daysOfWeek.includes(index) : newClass.daysOfWeek.includes(index)}
                                  onChange={handleClassInputChange}
                                  className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                />
                                <span className="ml-2 text-gray-700">{day}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="classPrice" className="block text-sm font-medium text-gray-700 mb-1">學費金額 <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            id="classPrice"
                            name="price"
                            value={editingClass ? editingClass.price : newClass.price}
                            onChange={handleClassInputChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="輸入課程學費"
                          />
                        </div>
                        <div>
                          <label htmlFor="paymentInstallments" className="block text-sm font-medium text-gray-700 mb-1">分為多少期 <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            id="paymentInstallments"
                            name="paymentInstallments"
                            value={editingClass ? editingClass.paymentInstallments : newClass.paymentInstallments}
                            onChange={handleClassInputChange}
                            min="1"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="輸入繳費期數"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">繳費方式 <span className="text-red-500">*</span></label>
                          <p className="mt-1 block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg shadow-sm">按月繳費</p>
                          <input type="hidden" name="paymentFrequency" value="monthly" />
                        </div>
                        <div className="md:col-span-2 flex justify-center space-x-4">
                          <button
                            type="submit"
                            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            {editingClass ? '儲存修改' : '添加課程'}
                          </button>
                          {editingClass && (
                            <button
                              type="button"
                              onClick={() => { setEditingClass(null); setShowAddClassForm(false); showMessage(''); }}
                              className="px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            >
                              取消
                            </button>
                          )}
                        </div>
                      </form>
                    </>
                  )}

                  {/* 課程列表 */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">課程列表</h3>
                  {classes.length === 0 ? (
                    <p className="text-center text-gray-600">目前沒有課程。</p>
                  ) : (
                    <div className="overflow-x-auto mb-8">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">課程名稱</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">主課老師</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上課星期</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">總堂數</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">學費</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費期數</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {classes.map((cls) => (
                            <tr key={cls.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.mainTeacher}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {cls.daysOfWeek.map(day => ['日', '一', '二', '三', '四', '五', '六'][day]).join(', ')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.totalSessions}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">NT$ {cls.price}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.paymentInstallments}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleViewEnrolledStudents(cls)}
                                  className="text-blue-600 hover:text-blue-900 mr-2"
                                >
                                  查看報名學生
                                </button>
                                <button
                                  onClick={() => { setSelectedClassForCalendar(cls); setShowClassCalendarModal(true); }}
                                  className="text-purple-600 hover:text-purple-900 mr-2"
                                >
                                  調整課程日期
                                </button>
                                <button
                                  onClick={() => handleEditClass(cls)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                                >
                                  編輯
                                </button>
                                <button
                                  onClick={() => handleDeleteClass(cls.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  刪除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <EnrolledStudentsModal
                    show={showEnrolledStudentsModal}
                    onClose={() => setShowEnrolledStudentsModal(false)}
                    cls={classEnrolledStudentsData}
                    students={students}
                    onRemoveEnrollment={handleRemoveEnrollment} // 使用新的確認函數
                    getStudentNameById={getStudentNameById}
                  />
                  <ClassCalendarModal
                    show={showClassCalendarModal}
                    onClose={() => setShowClassCalendarModal(false)}
                    cls={selectedClassForCalendar}
                    sessions={sessions}
                    setSessions={setSessions}
                    setClasses={setClasses} // Pass setClasses for totalSessions update
                    showMessage={showMessage} // 傳遞 showMessage
                  />
                </div>
              );
            case 'finance':
              // Filter for paid transactions
              const paidTransactions = transactions.filter(t => t.status === '已繳費' && t.studentId !== '')
                                                   .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate)); // Sort by record date descending

              // Filter for unpaid and overdue transactions
              const unpaidTransactions = transactions.filter(t => t.status === '未繳費' && t.studentId !== '')
                                                     .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // Sort by due date ascending

              const today = new Date();
              today.setHours(0, 0, 0, 0); // Normalize today's date to compare only dates

              return (
                <div className="bg-white p-8 rounded-xl shadow-2xl transition-all duration-500 ease-in-out transform hover:scale-105">
                  <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">財務管理</h2>
                  <MessageDisplay msg={messageText} type={messageType} /> {/* 使用 messageText 和 messageType */}

                  {/* 財務儀表板 (整合在此頁面) */}
                  <FinancialDashboard transactions={transactions.filter(t => t.studentId !== '')} getStudentNameById={getStudentNameById} />

                  {/* 已繳費記錄列表 */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center mt-8">已繳費記錄</h3>
                  {paidTransactions.length === 0 ? (
                    <p className="text-center text-gray-600">目前沒有已繳費記錄。</p>
                  ) : (
                    <div className="overflow-x-auto mb-8">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">學生</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費項目</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費期限</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">記錄日期</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paidTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getStudentNameById(t.studentId)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.description}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">NT$ {t.amount}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.dueDate}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.recordDate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 未繳費/逾期記錄列表 */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center mt-8">未繳費/逾期記錄</h3>
                  {unpaidTransactions.length === 0 ? (
                    <p className="text-center text-gray-600">目前沒有未繳費或逾期記錄。</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">學生</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費項目</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">繳費期限</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {unpaidTransactions.map((t) => {
                            const dueDateObj = new Date(t.dueDate);
                            dueDateObj.setHours(0, 0, 0, 0); // Normalize due date
                            const isOverdue = dueDateObj < today;
                            const statusText = isOverdue ? '逾期' : '未繳費';
                            const statusColor = isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';

                            return (
                              <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getStudentNameById(t.studentId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">NT$ {t.amount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.dueDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                                    {statusText}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* 模態視窗保留，但會從學生管理頁面觸發 */}
                  <ReceiptModal show={showReceiptModal} onClose={() => setShowReceiptModal(false)} data={receiptData} />
                  <PaymentNoticeModal show={showPaymentNoticeModal} onClose={() => setShowPaymentNoticeModal(false)} data={paymentNoticeData} />
                </div>
              );
            case 'calendar':
              const days = getCalendarDays(currentMonth, currentYear);
              const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
              const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

              return (
                <div className="bg-white p-8 rounded-xl shadow-2xl transition-all duration-500 ease-in-out transform hover:scale-105">
                  <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">日曆總覽</h2>
                  <MessageDisplay msg={messageText} type={messageType} /> {/* 使用 messageText 和 messageType */}

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

                  {/* 日曆網格 */}
                  <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
                    {dayNames.map(day => (
                      <div key={day} className="font-semibold text-gray-700 p-2 bg-gray-100 rounded-lg">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((day, index) => {
                      const fullDate = day ? new Date(currentYear, currentMonth, day) : null;
                      const dateString = fullDate ? fullDate.toISOString().split('T')[0] : null;
                      const sessionsOnThisDay = fullDate ? getSessionsForDate(fullDate) : [];
                      const isSelected = selectedDateOnCalendar && dateString === selectedDateOnCalendar.toISOString().split('T')[0];
                      // 檢查是否有任何會話被標記為「順延」
                      const hasPostponedSession = sessionsOnThisDay.some(session => 
                        session.attendance.length > 0 && session.attendance.every(att => att.status === '順延')
                      );


                      return (
                        <div
                          key={index}
                          className={`p-2 border border-gray-200 rounded-lg flex flex-col items-center justify-start min-h-[100px]
                            ${day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'}
                            ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                            ${hasPostponedSession ? 'bg-orange-100 border-orange-500' : ''} {/* Style for days with postponed sessions */}
                          `}
                          onClick={() => {
                            if (day) {
                              setSelectedDateOnCalendar(fullDate);
                              setShowDailySessionsModal(true); // 打開每日課程彈窗
                            }
                          }}
                        >
                          <span className={`font-bold ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                            {day}
                          </span>
                          {sessionsOnThisDay.length > 0 && (
                            <div className="mt-1 text-xs text-blue-600 font-medium">
                              {sessionsOnThisDay.map(session => (
                                <div key={session.id} className="truncate">
                                  {getClassNameById(session.classId)}
                                  {session.attendance.length > 0 && session.attendance.every(att => att.status === '順延') && ' (順延)'}
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
            case 'history':
              const todayForHistory = new Date();
              todayForHistory.setHours(0, 0, 0, 0); // Normalize today's date for comparison

              const pastSessions = sessions
                .filter(session => new Date(session.date) < todayForHistory) // Only show sessions in the past
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending (most recent first)

              return (
                <div className="bg-white p-8 rounded-xl shadow-2xl transition-all duration-500 ease-in-out transform hover:scale-105">
                  <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">歷史課程</h2>
                  <MessageDisplay msg={messageText} type={messageType} />

                  {pastSessions.length === 0 ? (
                    <p className="text-center text-gray-600">目前沒有歷史課程記錄。</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">課程名稱</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上課老師</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出缺席概況</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">到課學生 / 請假學生 / 未到學生</th> {/* Updated header */}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {pastSessions.map(session => (
                            <tr key={session.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getClassNameById(session.classId)}
                                {session.attendance.length > 0 && session.attendance.every(att => att.status === '順延') && ' (順延)'} {/* Add (順延) to course name */}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.actualTeacher}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getAttendanceSummaryForSession(session.id)}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {session.attendance.length > 0 && session.attendance.every(att => att.status === '順延') ? (
                                  '無' // If postponed, attendance is empty
                                ) : (
                                  <>
                                    {session.attendance.filter(att => att.status === '已到').map(att => getStudentNameById(att.studentId)).join(', ')} (到)
                                    {session.attendance.filter(att => att.status === '請假').length > 0 && 
                                      `, ${session.attendance.filter(att => att.status === '請假').map(att => getStudentNameById(att.studentId)).join(', ')} (請假)`}
                                    {session.attendance.filter(att => att.status === '未到').length > 0 && 
                                      `, ${session.attendance.filter(att => att.status === '未到').map(att => getStudentNameById(att.studentId)).join(', ')} (未到)`}
                                    {session.attendance.length === 0 && '無'}
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            default:
              return null;
          }
        })()}
      </main>

      {/* 頁腳 */}
      <footer className="bg-gray-800 text-white p-4 text-center mt-8">
        <p>&copy; 補習班管理系統. All rights reserved.</p>
      </footer>

      {/* 學生課程總覽模態視窗 */}
      <StudentSummaryModal show={showStudentSummaryModal} onClose={() => setShowStudentSummaryModal(false)} data={studentSummaryData} onUpdateAttendanceStatus={handleUpdateAttendanceStatus} />

      {/* 每日課程點名模態視窗 */}
      <DailySessionsAttendanceModal
        show={showDailySessionsModal}
        onClose={() => setShowDailySessionsModal(false)}
        date={selectedDateOnCalendar}
        sessions={sessions}
        students={students}
        onUpdateAttendanceStatus={handleUpdateAttendanceStatus}
        getClassNameById={getClassNameById}
        getClassTeacherById={getClassTeacherById}
        classes={classes} // Pass classes to DailySessionsAttendanceModal
      />

      {/* 學生繳費管理模態視窗 */}
      <StudentPaymentModal
        show={showStudentPaymentModal}
        onClose={() => setShowStudentPaymentModal(false)}
        student={selectedStudentForPayment}
        transactions={transactions}
        classes={classes}
        handleChangePaymentStatus={handleChangePaymentStatus}
        handlePrintReceipt={handlePrintReceipt}
        handlePrintPaymentNotice={handlePrintPaymentNotice}
        getClassNameById={getClassNameById}
        getStudentNameById={getStudentNameById}
      />
      {/* 收據和繳費通知模態視窗 (在 App 組件的頂層渲染，以便被 StudentPaymentModal 觸發) */}
      <ReceiptModal show={showReceiptModal} onClose={() => setShowReceiptModal(false)} data={receiptData} />
      <PaymentNoticeModal show={showPaymentNoticeModal} onClose={() => setShowPaymentNoticeModal(false)} data={paymentNoticeData} />
      <CombinedPaymentPrintModal show={showCombinedPaymentPrintModal} onClose={() => setShowCombinedPaymentPrintModal(false)} data={combinedPaymentPrintData} TUITION_CENTER_NAME={TUITION_CENTER_NAME} />

      {/* 刪除學生確認模態視窗 */}
      <ConfirmationModal
        show={showConfirmDeleteStudent}
        onClose={() => setShowConfirmDeleteStudent(false)}
        onConfirm={handleDeleteStudentConfirm}
        title="確認刪除學生"
        message="確定要刪除這位學生嗎？此操作將清除其所有相關資料 (課程報名、點名記錄、繳費記錄)，此操作不可逆。"
      />

      {/* 移除課程報名確認模態視窗 */}
      <ConfirmationModal
        show={showConfirmRemoveEnrollment}
        onClose={() => setShowConfirmRemoveEnrollment(false)}
        onConfirm={handleRemoveEnrollmentConfirm}
        title="確認移除課程報名"
        message="確定要將此學生從本課程中移除嗎？此操作將清除其相關的未繳費記錄。"
      />

      {/* 刪除課程確認模態視窗 */}
      <ConfirmationModal
        show={showConfirmDeleteClass}
        onClose={() => setShowConfirmDeleteClass(false)}
        onConfirm={handleDeleteClassConfirm}
        title="確認刪除課程"
        message="確定要刪除此課程嗎？此操作將清除該課程的所有相關資料 (包括學生報名、會話和繳費記錄)，此操作不可逆。"
      />
    </div>
  );
}

export default App;
