// frontend/src/hooks/useTuitionData.js

import { useState, useEffect, useCallback } from 'react';
import { calculateClassEndDate, daysInMonth, firstDayOfMonth } from '../utils/dateUtils';
import { studentApi, classApi, sessionApi, transactionApi, healthApi } from '../api/apiService'; 

const TUITION_CENTER_NAME = '顏含文理補習班';

const useTuitionData = () => {
    // --- 全局狀態和訊息 ---
    const [messageText, setMessageText] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const showMessage = useCallback((text, type = 'info') => {
        setMessageText(text);
        setMessageType(type);
        setTimeout(() => {
            setMessageText('');
        }, 3000);
    }, []);

    // --- 學生管理狀態 ---
    const [students, setStudents] = useState([]);
    const [newStudent, setNewStudent] = useState({ name: '', age: '', grade: '', school: '', phone: '', dob: '' });
    const [showAddStudentForm, setShowAddStudentForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [showStudentPaymentModal, setShowStudentPaymentModal] = useState(false);
    const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
    const [showConfirmDeleteStudent, setShowConfirmDeleteStudent] = useState(false);
    const [studentToDeleteId, setStudentToDeleteId] = useState(null);

    // --- 課堂管理狀態 ---
    const [classes, setClasses] = useState([]);
    const [newClass, setNewClass] = useState({
        name: '', mainTeacher: '', description: '', startDate: '',
        daysOfWeek: [], totalSessions: 0, paymentInstallments: 1, price: 0, paymentFrequency: 'monthly', enrolledStudents: [],
        substituteTeacher: ''
    });
    const [showAddClassForm, setShowAddClassForm] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [selectedClassToEnroll, setSelectedClassToEnroll] = useState('');
    const [studentsToEnroll, setStudentsToEnroll] = useState([]);
    const [showEnrolledStudentsModal, setShowEnrolledStudentsModal] = useState(false);
    const [classEnrolledStudentsData, setClassEnrolledStudentsData] = useState(null);
    const [showClassCalendarModal, setShowClassCalendarModal] = useState(false);
    const [selectedClassForCalendar, setSelectedClassForCalendar] = useState(null);
    const [showConfirmRemoveEnrollment, setShowConfirmRemoveEnrollment] = useState(false);
    const [enrollmentToRemove, setEnrollmentToRemove] = useState({ classId: null, studentId: null });
    const [showConfirmDeleteClass, setShowConfirmDeleteClass] = useState(false);
    const [classToDeleteId, setClassToDeleteId] = useState(null);

    // --- 課程會話 (Session) 狀態 ---
    const [sessions, setSessions] = useState([]);
    // const [holidays, setHolidays] = useState([]); // 移除未使用的 holidays 狀態

    // --- 財務管理狀態 ---
    const [transactions, setTransactions] = useState([]);
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

    // --- 新增繳費日期調整 Modal 相關狀態 ---
    const [showAdjustPaymentDateModal, setShowAdjustPaymentDateModal] = useState(false);
    const [selectedClassForPaymentAdjustment, setSelectedClassForPaymentAdjustment] = useState(null);

    // 輔助函數：將 Date 或 'YYYY-MM-DD' 字串轉換為 'YYYY-MM-DD' 格式（表單 type="date" 送出的為字串）
    const formatDateToLocalISO = useCallback((dateObj) => {
        if (dateObj == null) return null;
        if (typeof dateObj === 'string') {
            const trimmed = dateObj.trim();
            if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
            const d = new Date(trimmed);
            if (!isNaN(d.getTime())) {
                const year = d.getFullYear();
                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                const day = d.getDate().toString().padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
            return null;
        }
        if (typeof dateObj.getFullYear !== 'function') return null;
        const year = dateObj.getFullYear();
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = dateObj.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    // 新增輔助函數：將 'YYYY-MM-DD' 字符串解析為本地時區的 Date 對象
    const parseDateFromISOString = useCallback((isoString) => {
        if (!isoString) return null;
        // 確保解析為本地日期，避免時區偏移
        const parts = isoString.split('-');
        // new Date(year, monthIndex, day) 會自動使用本地時區
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [studentsData, classesData, sessionsData, transactionsData] = await Promise.all([
                studentApi.getAll(),
                classApi.getAll(),
                sessionApi.getAll(),
                transactionApi.getAll(),
            ]);

            const transformedStudents = (studentsData || []).map(s => ({
                ...s,
                dob: parseDateFromISOString(s.dob), // 將 dob 字符串解析為 Date 對象
            }));

            const transformedClasses = (classesData || []).map(c => ({
                ...c,
                mainTeacher: c.main_teacher,
                startDate: parseDateFromISOString(c.start_date), // 將 start_date 字符串解析為 Date 對象
                endDate: parseDateFromISOString(c.end_date),     // 將 end_date 字符串解析為 Date 對象
                daysOfWeek: c.days_of_week,
                totalSessions: c.total_sessions,
                paymentFrequency: c.payment_frequency,
                paymentInstallments: c.payment_installments,
                enrolledStudents: c.enrolled_students,
                substituteTeacher: c.substitute_teacher,
            }));

            const transformedSessions = (sessionsData || []).map(s => ({
                ...s,
                classId: s.class_id,
                actualTeacher: s.actual_teacher,
                isPostponed: s.is_postponed,
                date: parseDateFromISOString(s.date), // 將 date 字符串解析為 Date 對象
            }));

            const transformedTransactions = (transactionsData || []).map(t => ({
                ...t,
                dueDate: parseDateFromISOString(t.due_date), // 將 due_date 字符串解析為 Date 對象
                recordDate: t.record_date ? parseDateFromISOString(t.record_date) : null, // 將 record_date 字符串解析為 Date 對象 (處理可能為 null 的情況)
                studentId: t.student_id,
                classId: t.class_id,
                paymentTerm: t.payment_term,
                isActive: t.is_active,
            }));

            setStudents(transformedStudents);
            setClasses(transformedClasses);
            setSessions(transformedSessions);
            setTransactions(transformedTransactions);
            showMessage('數據已成功載入！', 'success');

        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError(err);
            showMessage(`數據載入失敗: ${err.message}`, 'error');
            setStudents([]);
            setClasses([]);
            setSessions([]);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [showMessage, parseDateFromISOString]); // 添加 parseDateFromISOString 到依賴

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStudentNameById = useCallback((id) => {
        const currentStudents = students || [];
        const student = currentStudents.find(s => String(s.id) === String(id));
        return student ? student.name : '未知學生';
    }, [students]);

    const getClassNameById = useCallback((id) => {
        const currentClasses = classes || [];
        const cls = currentClasses.find(c => String(c.id) === String(id));
        return cls ? cls.name : '未知課程';
    }, [classes]);

    const getClassTeacherById = useCallback((id) => {
        const currentClasses = classes || [];
        const cls = currentClasses.find(c => String(c.id) === String(id));
        return cls ? cls.mainTeacher : '未知老師';
    }, [classes]);

    const getStudentEnrolledClassNames = useCallback((studentId) => {
        const enrolledClassNames = [];
        (classes || []).forEach(cls => {
            if ((cls.enrolledStudents || []).includes(String(studentId))) {
                enrolledClassNames.push(cls.name);
            }
        });
        return enrolledClassNames.length > 0 ? enrolledClassNames.join(', ') : '未報名任何課程';
    }, [classes]);

    // --- 學生管理邏輯 ---
    const handleStudentInputChange = useCallback((e) => {
        const { name, value } = e.target;
        if (editingStudent) {
            setEditingStudent(prev => ({ ...prev, [name]: value }));
        } else {
            setNewStudent(prev => ({ ...prev, [name]: value }));
        }
    }, [editingStudent, setNewStudent, setEditingStudent]);

    const handleAddStudent = useCallback(async (e, formDataFromForm) => {
        e.preventDefault();
        const data = formDataFromForm != null ? formDataFromForm : newStudent;
        if (!data.name || !data.age || !data.grade || !data.school || !data.phone || !data.dob) {
            showMessage('請填寫所有學生資訊 (姓名、年齡、年級、學校、電話、生日)。', 'error');
            return;
        }
        setLoading(true);
        try {
            const studentDataToSend = {
                name: data.name,
                age: parseInt(data.age, 10),
                grade: data.grade,
                school: data.school,
                phone: data.phone,
                dob: formatDateToLocalISO(data.dob),
            };
            await studentApi.create(studentDataToSend);
            await fetchData();
            setNewStudent({ name: '', age: '', grade: '', school: '', phone: '', dob: '' });
            setShowAddStudentForm(false);
            showMessage('學生已成功添加！', 'success');
        } catch (err) {
            console.error("Error adding student:", err);
            const msg = err && err.message ? err.message : '未知錯誤';
            showMessage(`添加學生失敗: ${msg}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [newStudent, showMessage, fetchData, formatDateToLocalISO]);

    const handleEditStudent = useCallback((student) => {
        setEditingStudent({
            id: student.id,
            name: student.name || '',
            age: student.age || '',
            grade: student.grade || '',
            school: student.school || '',
            phone: student.phone || '',
            dob: student.dob || '', // dob 現在是 Date 對象
        });
        setShowAddStudentForm(true);
    }, []);

    const handleUpdateStudent = useCallback(async (e, formDataFromForm) => {
        e.preventDefault();
        const data = formDataFromForm != null ? formDataFromForm : editingStudent;
        if (!data || !data.name || !data.age || !data.grade || !data.school || !data.phone || !data.dob) {
            showMessage('請填寫所有學生資訊 (姓名、年齡、年級、學校、電話、生日)。', 'error');
            return;
        }
        setLoading(true);
        try {
            const studentDataToSend = {
                name: data.name,
                age: parseInt(data.age, 10),
                grade: data.grade,
                school: data.school,
                phone: data.phone,
                dob: formatDateToLocalISO(data.dob),
            };
            await studentApi.update(data.id, studentDataToSend);
            await fetchData();
            setEditingStudent(null);
            setShowAddStudentForm(false);
            showMessage('學生資料已成功更新！', 'success');
        } catch (err) {
            console.error("Error updating student:", err);
            showMessage(`更新學生資料失敗: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [editingStudent, showMessage, fetchData, formatDateToLocalISO]);

    const handleDeleteStudent = useCallback((studentId) => {
        setStudentToDeleteId(studentId);
        setShowConfirmDeleteStudent(true);
    }, []);

    const handleDeleteStudentConfirm = useCallback(async () => {
        if (studentToDeleteId) {
            setLoading(true);
            try {
                await studentApi.delete(studentToDeleteId);
                await fetchData();
                showMessage('學生及相關資料已成功刪除！', 'success');
            } catch (err) {
                console.error("Error deleting student:", err);
                showMessage(`刪除學生失敗: ${err.message}`, 'error');
            } finally {
                setStudentToDeleteId(null);
                setShowConfirmDeleteStudent(false);
                setLoading(false);
            }
        }
    }, [studentToDeleteId, showMessage, fetchData]);

    const handleManageStudentPayment = useCallback((student) => {
        setSelectedStudentForPayment(student);
        setShowStudentPaymentModal(true);
    }, []);

    // --- 課堂管理邏輯 ---
    const handleClassInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const targetClassSetter = editingClass ? setEditingClass : setNewClass;

        if (type === 'checkbox') {
            const currentDaysOfWeek = (editingClass || newClass).daysOfWeek || [];
            const newDaysOfWeek = checked
                ? [...currentDaysOfWeek, parseInt(value, 10)]
                : currentDaysOfWeek.filter((day) => day !== parseInt(value, 10));
            targetClassSetter(prev => ({ ...prev, daysOfWeek: newDaysOfWeek }));
        } else {
            targetClassSetter(prev => ({ ...prev, [name]: value }));
        }
    }, [editingClass, newClass, setNewClass, setEditingClass]);

    const handleAddClass = useCallback(async (e) => {
        e.preventDefault();
        if (!newClass.name || !newClass.mainTeacher || !newClass.startDate || (newClass.daysOfWeek || []).length === 0 || newClass.price <= 0 || newClass.totalSessions <= 0 || newClass.paymentInstallments <= 0) {
            showMessage('請填寫所有必填課程資訊 (課程名稱、主課老師、開始日期、上課星期、總堂數、學費金額、繳費期數)。', 'error');
            return;
        }

        const calculatedEndDate = calculateClassEndDate(newClass.startDate, newClass.daysOfWeek, newClass.totalSessions);
        if (!calculatedEndDate) {
            showMessage('無法根據設定計算課程結束日期，請檢查輸入。', 'error');
            return;
        }

        const classDataForCreation = {
            name: newClass.name,
            main_teacher: newClass.mainTeacher,
            description: newClass.description,
            start_date: formatDateToLocalISO(newClass.startDate), // 確保傳遞 YYYY-MM-DD 字符串
            end_date: formatDateToLocalISO(calculatedEndDate),     // 確保傳遞 YYYY-MM-DD 字符串
            days_of_week: newClass.daysOfWeek,
            total_sessions: parseInt(newClass.totalSessions, 10),
            price: parseFloat(newClass.price),
            payment_installments: parseInt(newClass.paymentInstallments, 10),
            payment_frequency: newClass.paymentFrequency,
            enrolled_students: [],
            substitute_teacher: newClass.substituteTeacher
        };

        setLoading(true);
        try {
            await classApi.create(classDataForCreation);
            await fetchData();
            setNewClass({
                name: '', mainTeacher: '', description: '', startDate: '',
                daysOfWeek: [], totalSessions: 0, paymentInstallments: 1, price: 0, paymentFrequency: 'monthly', enrolledStudents: [],
                substituteTeacher: ''
            });
            setShowAddClassForm(false);
            showMessage('課程已成功添加並生成會話！', 'success');
        } catch (err) {
            console.error("Error adding class:", err);
            showMessage(`添加課程失敗: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [newClass, showMessage, fetchData, formatDateToLocalISO]);

    const handleEditClass = useCallback((cls) => {
        setEditingClass({
            id: cls.id,
            name: cls.name || '',
            mainTeacher: cls.main_teacher || '',
            description: cls.description || '',
            startDate: cls.start_date || '', // startDate 現在是 Date 對象
            endDate: cls.end_date || '',     // endDate 現在是 Date 對象
            daysOfWeek: cls.days_of_week || [],
            totalSessions: cls.total_sessions || 0,
            price: cls.price || 0,
            paymentFrequency: cls.payment_frequency || 'monthly',
            paymentInstallments: cls.payment_installments || 1,
            enrolledStudents: cls.enrolled_students || [],
            substituteTeacher: cls.substitute_teacher || ''
        });
        setShowAddClassForm(true);
    }, []);

    const handleUpdateClass = useCallback(async (e) => {
        e.preventDefault();
        if (!editingClass || !editingClass.name || !editingClass.mainTeacher || !editingClass.startDate || (editingClass.daysOfWeek || []).length === 0 || editingClass.price <= 0 || editingClass.totalSessions <= 0 || editingClass.paymentInstallments <= 0) {
            showMessage('請填寫所有必填課程資訊 (課程名稱、主課老師、開始日期、上課星期、總堂數、學費金額、繳費期數)。', 'error');
            return;
        }

        const calculatedEndDate = calculateClassEndDate(editingClass.startDate, editingClass.daysOfWeek, editingClass.totalSessions);
        if (!calculatedEndDate) {
            showMessage('無法根據設定計算課程結束日期，請檢查輸入。', 'error');
            return;
        }

        const classDataForUpdate = {
            name: editingClass.name,
            main_teacher: editingClass.mainTeacher,
            description: editingClass.description,
            start_date: formatDateToLocalISO(editingClass.startDate), // 確保傳遞 YYYY-MM-DD 字符串
            end_date: formatDateToLocalISO(calculatedEndDate),     // 確保傳遞 YYYY-MM-DD 字符串
            days_of_week: editingClass.daysOfWeek,
            total_sessions: parseInt(editingClass.totalSessions, 10),
            price: parseFloat(editingClass.price),
            payment_installments: parseInt(editingClass.paymentInstallments, 10),
            payment_frequency: editingClass.paymentFrequency,
            enrolled_students: editingClass.enrolledStudents,
            substitute_teacher: editingClass.substituteTeacher
        };

        setLoading(true);
        try {
            await classApi.update(editingClass.id, classDataForUpdate);
            await fetchData();
            setEditingClass(null);
            setShowAddClassForm(false);
            showMessage('課程資料已成功更新！', 'success');
        } catch (err) {
            console.error("Error updating class:", err);
            showMessage(`更新課程失敗: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [editingClass, showMessage, fetchData, formatDateToLocalISO]);

    const handleDeleteClass = useCallback((classId) => {
        setClassToDeleteId(classId);
        setShowConfirmDeleteClass(true);
    }, []);

    const handleDeleteClassConfirm = useCallback(async () => {
        if (classToDeleteId) {
            setLoading(true);
            try {
                await classApi.delete(classToDeleteId);
                await fetchData();
                showMessage('課程及相關資料已成功刪除！', 'success');
            } catch (err) {
                console.error("Error deleting class:", err);
                showMessage(`刪除課程失敗: ${err.message}`, 'error');
            } finally {
                setClassToDeleteId(null);
                setShowConfirmDeleteClass(false);
                setLoading(false);
            }
        }
    }, [classToDeleteId, showMessage, fetchData]);

    const handleRemoveEnrollment = useCallback(async (classId, studentId) => {
        setEnrollmentToRemove({ classId, studentId });
        setShowConfirmRemoveEnrollment(true);
    }, []);

    const handleRemoveEnrollmentConfirm = useCallback(async () => {
        const { classId, studentId } = enrollmentToRemove;
        if (classId && studentId) {
            setLoading(true);
            try {
                const currentClasses = classes || [];
                const classToUpdate = currentClasses.find(cls => String(cls.id) === String(classId));
                if (!classToUpdate) throw new Error("Class not found for unenrollment.");

                const newEnrolledStudents = (classToUpdate.enrolledStudents || []).filter(sId => String(sId) !== String(studentId));

                const classPayload = {
                    ...classToUpdate,
                    main_teacher: classToUpdate.mainTeacher,
                    days_of_week: classToUpdate.daysOfWeek,
                    total_sessions: classToUpdate.totalSessions,
                    payment_installments: classToUpdate.paymentInstallments,
                    enrolled_students: newEnrolledStudents,
                    substitute_teacher: classToUpdate.substituteTeacher || null
                };

                await classApi.update(classId, classPayload);

                await fetchData();
                showMessage('學生已成功從課程中移除報名！', 'success');
            } catch (err) {
                console.error("Error removing enrollment:", err);
                showMessage(`移除報名失敗: ${err.message}`, 'error');
            } finally {
                setEnrollmentToRemove({ classId: null, studentId: null });
                setShowConfirmRemoveEnrollment(false);
                setLoading(false);
            }
        }
    }, [enrollmentToRemove, showMessage, classes, fetchData]);

    const handleEnrollStudentChange = useCallback((e) => {
        const { value, checked } = e.target;
        setStudentsToEnroll(prev =>
            checked ? [...(prev || []), value] : (prev || []).filter(id => id !== value)
        );
    }, []);

    const handleEnrollStudentsToClass = useCallback(async (e) => {
        e.preventDefault();
        if (!selectedClassToEnroll) {
            showMessage('請選擇一個課程來報名學生。', 'error');
            return;
        }
        if ((studentsToEnroll || []).length === 0) {
            showMessage('請選擇至少一位學生來報名。', 'error');
            return;
        }

        const currentClasses = classes || [];
        const classToUpdate = currentClasses.find(cls => String(cls.id) === String(selectedClassToEnroll));
        if (!classToUpdate) {
            showMessage('找不到選定的課程。', 'error');
            return;
        }

        const currentlyEnrolledStudentsSet = new Set((classToUpdate.enrolledStudents || []));

        const studentsToAdd = (studentsToEnroll || []).filter(studentIdString => !currentlyEnrolledStudentsSet.has(studentIdString));

        if (studentsToAdd.length === 0 && (studentsToEnroll || []).length === (classToUpdate.enrolledStudents || []).length) {
            showMessage('所選學生均已報名此課程，無需重複操作。', 'info');
            setSelectedClassToEnroll('');
            setStudentsToEnroll([]);
            return;
        }

        setLoading(true);
        try {
            const updatedEnrolledStudents = [
                ...new Set([
                    ...(classToUpdate.enrolledStudents || []),
                    ...(studentsToEnroll || []).map(String)
                ])
            ];

            const classPayload = {
                ...classToUpdate,
                main_teacher: classToUpdate.mainTeacher,
                days_of_week: classToUpdate.daysOfWeek,
                total_sessions: classToUpdate.totalSessions,
                payment_installments: classToUpdate.paymentInstallments,
                enrolled_students: updatedEnrolledStudents,
                substitute_teacher: classToUpdate.substituteTeacher || null
            };
            await classApi.update(classToUpdate.id, classPayload);

            await fetchData();

            setSelectedClassToEnroll('');
            setStudentsToEnroll([]);
            showMessage('學生已成功報名到課程，並已生成繳費記錄！', 'success');
        } catch (err) {
            console.error("Error enrolling students:", err);
            showMessage(`報名學生失敗: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedClassToEnroll, studentsToEnroll, classes, showMessage, fetchData]);

    const handleViewEnrolledStudents = useCallback((cls) => {
        setClassEnrolledStudentsData(cls);
        setShowEnrolledStudentsModal(true);
    }, []);

    // --- 財務管理邏輯 ---
    const handleChangePaymentStatus = useCallback(async (transactionId, newStatus) => {
        setLoading(true);
        try {
            const currentTransactions = transactions || [];
            const transactionToUpdate = currentTransactions.find(t => t.id === transactionId);
            if (!transactionToUpdate) {
                throw new Error("Transaction not found.");
            }

            const transactionPayload = {
                ...transactionToUpdate,
                due_date: formatDateToLocalISO(transactionToUpdate.dueDate), // 確保傳遞 YYYY-MM-DD 字符串
                record_date: newStatus === '已繳費' ? formatDateToLocalISO(new Date()) : null, // 確保傳遞 YYYY-MM-DD 字符串
                student_id: transactionToUpdate.studentId,
                class_id: transactionToUpdate.classId,
                payment_term: transactionToUpdate.paymentTerm,
                is_active: transactionToUpdate.isActive,
                status: newStatus,
            };

            await transactionApi.update(transactionId, transactionPayload);
            await fetchData();
            showMessage(`交易已標記為${newStatus}！`, 'success');
        } catch (err) {
            console.error("Error changing payment status:", err);
            showMessage(`更改繳費狀態失敗: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [showMessage, transactions, fetchData, formatDateToLocalISO]);

    const handlePrintReceipt = useCallback((transaction) => {
        setReceiptData({
            centerName: TUITION_CENTER_NAME,
            studentName: getStudentNameById(transaction.studentId),
            amount: transaction.amount,
            description: transaction.description,
            payment_term: transaction.paymentTerm,
            record_date: transaction.recordDate, // recordDate 現在是 Date 對象
            id: transaction.id,
        });
        setShowReceiptModal(true);
    }, [getStudentNameById]);

    const handlePrintPaymentNotice = useCallback((transaction) => {
        if (transaction.paymentTerm === '按月繳費') {
            const currentStudents = students || [];
            const currentClasses = classes || [];
            const currentTransactions = transactions || [];

            const student = currentStudents.find(s => String(s.id) === String(transaction.studentId));
            const courseNameFromDesc = transaction.description.split(' - 第')[0];
            const course = currentClasses.find(c => c.name === courseNameFromDesc);

            if (!student || !course) {
                showMessage('無法找到學生或課程資訊以列印通知。', 'error');
                return;
            }

            const allMonthlyTransactionsForStudentCourse = (currentTransactions || []).filter(t =>
                String(t.studentId) === String(student.id) &&
                String(t.classId) === String(course.id) &&
                t.paymentTerm === '按月繳費' &&
                t.isActive === true
            ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            const currentTransactionIndex = allMonthlyTransactionsForStudentCourse.findIndex(t => String(t.id) === String(transaction.id));

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
                    due_date: t.dueDate, // dueDate 現在是 Date 對象
                    payment_term: t.paymentTerm
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
                    due_date: transaction.dueDate, // dueDate 現在是 Date 對象
                    payment_term: transaction.paymentTerm
                }]
            });
            setShowPaymentNoticeModal(true);
        }
    }, [students, classes, transactions, showMessage, getStudentNameById]);

    const handlePrintAllPaymentNotices = useCallback(async () => {
        const currentTransactions = transactions || [];
        const currentStudents = students || [];

        const unpaidOrOverdueTransactions = currentTransactions.filter(t => t.status === '未繳費' && t.studentId !== null && t.isActive === true);
        if (unpaidOrOverdueTransactions.length === 0) {
            showMessage('目前沒有未繳費或逾期記錄可以列印通知。', 'info');
            return;
        }
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
            const student = currentStudents.find(s => String(s.id) === String(t.studentId));
            const studentName = student ? student.name : '未知學生';
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dueDateObj = t.dueDate; // dueDate 現在是 Date 對象
            dueDateObj.setHours(0, 0, 0, 0);
            const isOverdue = dueDateObj < today;
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
                            <p class="mb-1"><span class="font-semibold">繳費期限:</span> ${t.dueDate.toLocaleDateString('zh-TW')}</p> {/* dueDate 現在是 Date 對象 */}
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
    }, [transactions, students, showMessage]);

    const handlePrintAllReceipts = useCallback(async () => {
        const currentTransactions = transactions || [];
        const currentStudents = students || [];

        const paidTransactions = currentTransactions.filter(t => t.status === '已繳費' && t.studentId !== null && t.isActive === true);
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
            const student = currentStudents.find(s => String(s.id) === String(t.studentId));
            const studentName = student ? student.name : '未知學生';

            printContent += `
                <div class="receipt-container ${index > 0 ? 'page-break' : ''}">
                    <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">繳費收據</h3>
                    <div class="border-t border-b border-gray-300 py-4 mb-4">
                        <p class="mb-2"><span class="font-semibold">補習班名稱:</span> ${TUITION_CENTER_NAME}</p>
                        <p class="mb-2"><span class="font-semibold">收據編號:</span> ${t.id}</p>
                        <p className="mb-2"><span className="font-semibold">學生姓名:</span> ${studentName}</p>
                        <p className="mb-2"><span className="font-semibold">繳費項目:</span> ${t.paymentTerm}</p>
                        <p className="mb-2"><span className="font-semibold">描述:</span> ${t.description}</p>
                        <p className="mb-2"><span className="font-semibold">繳費金額:</span> NT$ ${t.amount}</p>
                        <p className="mb-2"><span className="font-semibold">收款日期:</span> ${t.recordDate.toLocaleDateString('zh-TW')}</p> {/* recordDate 現在是 Date 對象 */}
                    </div>
                    <p class="text-center text-gray-600 text-sm">感謝您的繳費！</p>
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
    }, [transactions, students, showMessage]);

    const handlePrintCombined = useCallback(async (student, courseId) => {
        const currentClasses = classes || [];
        const currentTransactions = transactions || [];
        const currentSessions = sessions || [];

        const course = currentClasses.find(c => String(c.id) === String(courseId));
        if (!course) {
            showMessage('找不到課程資訊。', 'error');
            return;
        }

        setCombinedPaymentPrintData({
            student: student,
            course: course,
            transactions: currentTransactions.filter(t => String(t.studentId) === String(student.id) && String(t.classId) === String(course.id) && t.isActive === true),
            sessions: currentSessions.filter(s => String(s.classId) === String(course.id)).sort((a, b) => a.date - b.date), // date 現在是 Date 對象
        });
        setShowCombinedPaymentPrintModal(true);
    }, [classes, sessions, transactions, showMessage]);

    // --- 日曆總覽邏輯 ---
    const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

    const getCalendarDays = useCallback((month, year) => {
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
    }, []);

    const handlePrevMonth = useCallback(() => {
        setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
        if (currentMonth === 0) setCurrentYear(prev => prev - 1);
        setSelectedDateOnCalendar(null);
        setShowDailySessionsModal(false);
    }, [currentMonth]);

    const handleNextMonth = useCallback(() => {
        setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));
        if (currentMonth === 11) setCurrentYear(prev => prev + 1);
        setSelectedDateOnCalendar(null);
        setShowDailySessionsModal(false);
    }, [currentMonth]);

    const getSessionsForDate = useCallback((date) => {
        const currentSessions = sessions || [];
        // date 參數現在是一個 Date 對象，直接比較日期部分
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return currentSessions.filter(session => {
            const sessionDateOnly = new Date(session.date.getFullYear(), session.date.getMonth(), session.date.getDate());
            return sessionDateOnly.getTime() === dateOnly.getTime();
        });
    }, [sessions]);

    const getAttendanceSummaryForSession = useCallback((sessionId) => {
        const currentSessions = sessions || [];
        const session = currentSessions.find(s => String(s.id) === String(sessionId));
        if (!session) return '';

        if (session.isPostponed === true) {
            return '已順延';
        } else {
            const attendance = session.attendance || [];
            const attended = attendance.filter(att => att.status === '已到').length;
            const leave = attendance.filter(att => att.status === '請假').length;
            const absent = attendance.filter(att => att.status === '未到').length;
            return `到: ${attended}, 請: ${leave}, 未: ${absent}`;
        }
    }, [sessions]);

    const handleViewStudentSummary = useCallback((studentId) => {
        const currentStudents = students || [];
        const currentClasses = classes || [];
        const currentSessions = sessions || [];
        const currentTransactions = transactions || [];

        const student = currentStudents.find(s => String(s.id) === String(studentId));
        if (!student) {
            showMessage('找不到學生資料。', 'error');
            return;
        }
        const studentCourses = currentClasses.filter(cls => (cls.enrolledStudents || []).includes(String(studentId)));

        const summaryCourses = studentCourses.map(course => {
            const courseSessions = currentSessions.filter(session =>
                String(session.classId) === String(course.id) &&
                (session.attendance || []).some(att => String(att.student_id) === String(studentId))
            ).map(session => ({
                id: session.id,
                date: session.date, // date 現在是 Date 對象
                status: (session.attendance || []).find(att => String(att.student_id) === String(studentId))?.status || '未到',
                studentId: studentId
            })).sort((a, b) => a.date - b.date); // date 現在是 Date 對象

            const courseTransactions = currentTransactions.filter(t =>
                String(t.studentId) === String(studentId) &&
                String(t.classId) === String(course.id) &&
                t.isActive === true
            );

            const paidAmount = (courseTransactions || [])
                .filter(t => t.status === '已繳費')
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

            const outstandingAmount = (courseTransactions || [])
                .filter(t => t.status === '未繳費')
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

            return {
                id: course.id,
                name: course.name,
                mainTeacher: course.mainTeacher,
                startDate: course.startDate.toLocaleDateString('zh-TW'), // startDate 現在是 Date 對象
                endDate: course.endDate.toLocaleDateString('zh-TW'),     // endDate 現在是 Date 對象
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
    }, [students, classes, sessions, transactions, showMessage]);

    const handleUpdateAttendanceStatus = useCallback(async (sessionId, studentId, newStatus, newTeacher = undefined) => {
        setLoading(true);
        try {
            const currentSessions = sessions || [];
            const sessionToUpdate = currentSessions.find(s => String(s.id) === String(sessionId));
            if (!sessionToUpdate) {
                throw new Error("Session not found.");
            }

            if (sessionToUpdate.isPostponed === true && (studentId !== null || newTeacher !== undefined)) {
                showMessage('此堂課已標記為順延，點名或老師狀態無法修改。', 'info');
                setLoading(false);
                return;
            }

            let updatedAttendance = sessionToUpdate.attendance || [];
            // 防禦性檢查，避免將單個學生狀態設為「順延」
            if (studentId && newStatus) {
                if (newStatus === '順延') {
                     showMessage('無法將單個學生的狀態設為「順延」。課程順延請透過課程排程功能調整。', 'error');
                     setLoading(false);
                     return;
                }
                updatedAttendance = updatedAttendance.map(att =>
                    String(att.student_id) === String(studentId) ? { ...att, status: newStatus } : att
                );
            }

            const sessionPayload = {
                class_id: sessionToUpdate.classId,
                date: formatDateToLocalISO(sessionToUpdate.date), // 確保傳遞 YYYY-MM-DD 字符串
                actual_teacher: newTeacher !== undefined ? newTeacher : sessionToUpdate.actualTeacher,
                attendance: updatedAttendance,
                is_postponed: sessionToUpdate.isPostponed
            };
            await sessionApi.update(sessionId, sessionPayload);
            await fetchData();
            showMessage('點名或老師狀態已更新！', 'success');
        } catch (err) {
            console.error("Error updating session:", err);
            showMessage(`更新狀態失敗: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [showMessage, sessions, fetchData, formatDateToLocalISO]);


    const [postponeOriginDate, setPostponeOriginDate] = useState('');
    const [postponeDays, setPostponeDays] = useState(1);

    const handlePostponeConfirmed = useCallback(async (cls) => {
        if (!postponeOriginDate) {
            showMessage('請選擇原始日期。', 'error');
            return;
        }

        const currentSessions = sessions || [];
        const originalSession = currentSessions.find(s =>
            String(s.classId) === String(cls.id) &&
            formatDateToLocalISO(s.date) === postponeOriginDate // date 現在是 Date 對象
        );
        if (!originalSession) {
            showMessage('選定的原始日期沒有該課程的排課，無法順延。', 'error');
            return;
        }

        if (originalSession.isPostponed === true) {
            showMessage('該堂課已標記為順延，無需重複操作。', 'info');
            return;
        }

        const attendanceList = originalSession.attendance || [];
        const hasRollCall = attendanceList.length > 0;
        const allAttended = hasRollCall && attendanceList.every(att => att.status === '已到');
        if (allAttended) {
            showMessage('該堂課已完成點名且所有學生已到，無法順延。', 'error');
            return;
        }

        setLoading(true);
        try {
            const updatedOriginalSessionAttendance = (originalSession.attendance || []).map(att => ({ ...att, status: '順延' }));
            const updatedOriginalSessionPayload = {
                class_id: originalSession.classId,
                date: formatDateToLocalISO(originalSession.date), // date 現在是 Date 對象
                actual_teacher: originalSession.actualTeacher,
                attendance: updatedOriginalSessionAttendance,
                is_postponed: true
            };
            await sessionApi.update(originalSession.id, updatedOriginalSessionPayload);

            const activeSessionsExcludingPostponed = currentSessions.filter(s =>
                String(s.classId) === String(cls.id) &&
                String(s.id) !== String(originalSession.id) &&
                s.isPostponed === false
            ).sort((a, b) => a.date - b.date); // date 現在是 Date 對象

            let searchStartPoint = new Date();
            searchStartPoint.setHours(0, 0, 0, 0);

            if (activeSessionsExcludingPostponed.length > 0) {
                const lastSessionDate = activeSessionsExcludingPostponed[activeSessionsExcludingPostponed.length - 1].date; // date 現在是 Date 對象
                lastSessionDate.setHours(0, 0, 0, 0);
                searchStartPoint = lastSessionDate;
            } else if (cls.startDate) {
                const clsStartDate = cls.startDate; // startDate 現在是 Date 對象
                clsStartDate.setHours(0, 0, 0, 0);
                searchStartPoint = clsStartDate;
            }

            let newDateObj = new Date(searchStartPoint);
            newDateObj.setDate(newDateObj.getDate() + 1);
            newDateObj.setHours(0, 0, 0, 0);

            let foundNewDateLocalString = null;
            const maxSearchDate = new Date(newDateObj);
            maxSearchDate.setFullYear(newDateObj.getFullYear() + 2);

            while (!foundNewDateLocalString && newDateObj <= maxSearchDate) {
                const currentDateLocalString = formatDateToLocalISO(newDateObj);
                const dayOfWeek = newDateObj.getDay();

                const isDateOccupied = currentSessions.some(s =>
                    String(s.classId) === String(cls.id) &&
                    formatDateToLocalISO(s.date) === currentDateLocalString && // date 現在是 Date 對象
                    s.isPostponed === false
                );

                if ((cls.daysOfWeek || []).includes(dayOfWeek) && !isDateOccupied) {
                    foundNewDateLocalString = currentDateLocalString;
                }
                newDateObj.setDate(newDateObj.getDate() + 1);
            }

            if (!foundNewDateLocalString) {
                throw new Error('無法找到新的上課日期以補足順延的課程，請手動安排。');
            }

            const newSessionData = {
                class_id: cls.id,
                date: foundNewDateLocalString,
                actual_teacher: cls.mainTeacher,
                attendance: (cls.enrolledStudents || []).map(studentId => ({ student_id: String(studentId), status: '未到' })),
                is_postponed: false
            };
            await sessionApi.create(newSessionData);

            await fetchData();
            showMessage(`課程已從 ${postponeOriginDate} 順延至 ${foundNewDateLocalString}！`, 'success');
            setPostponeOriginDate('');
        } catch (err) {
            console.error("Error postponing class:", err);
            showMessage(`課程順延失敗: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [sessions, classes, showMessage, postponeOriginDate, fetchData, formatDateToLocalISO]);

    const handleCancelPostponement = useCallback(async (cls) => {
        if (!postponeOriginDate) {
            showMessage('請選擇要取消順延的原始日期。', 'error');
            return;
        }

        const currentSessions = sessions || [];
        const originalSession = currentSessions.find(s =>
            String(s.classId) === String(cls.id) &&
            formatDateToLocalISO(s.date) === postponeOriginDate // date 現在是 Date 對象
        );

        if (!originalSession || originalSession.isPostponed === false) {
            showMessage('選定的日期不是已順延的課程，無法取消順延。', 'error');
            return;
        }

        setLoading(true);
        try {
            const restoredAttendance = (originalSession.attendance || []).map(att => ({ ...att, status: '未到' }));
            const restoredSessionPayload = {
                class_id: originalSession.classId,
                date: formatDateToLocalISO(originalSession.date), // date 現在是 Date 對象
                actual_teacher: originalSession.actualTeacher,
                attendance: restoredAttendance,
                is_postponed: false
            };
            await sessionApi.update(originalSession.id, restoredSessionPayload);

            await fetchData();
            showMessage(`課程已從 ${postponeOriginDate} 取消順延！`, 'success');
            setPostponeOriginDate('');
        } catch (err) {
            console.error("Error canceling postponement:", err);
            showMessage(`取消順延失敗: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [sessions, showMessage, postponeOriginDate, fetchData, formatDateToLocalISO]);


    const handleManualToggleSession = useCallback(async (cls, fullDateObj) => {
        setLoading(true);

        try {
            const dateString = formatDateToLocalISO(fullDateObj);
            const dayOfWeek = fullDateObj.getDay();
            
            const isClassScheduledDay = (cls.daysOfWeek || []).includes(dayOfWeek);

            const currentSessions = sessions || [];
            const existingSession = currentSessions.find(s =>
                String(s.classId) === String(cls.id) &&
                formatDateToLocalISO(s.date) === dateString // date 現在是 Date 對象
            );

            const currentActiveSessionsCount = (sessions || []).filter(s =>
                String(s.classId) === String(cls.id) && s.isPostponed === false
            ).length;

            if (existingSession) {
                if (existingSession.isPostponed === true) {
                    showMessage('此課程已標記為順延，無法直接手動移除。請使用「取消順延」功能。', 'info');
                    setLoading(false);
                    return;
                }
                const hasAttendedStudents = (existingSession.attendance || []).some(att => att.status === '已到');
                if (hasAttendedStudents) {
                    showMessage('此課程已有學生點名為「已到」，無法直接手動移除。請考慮順延。', 'error');
                    setLoading(false);
                    return;
                }

                await sessionApi.delete(existingSession.id);
                await fetchData();
                showMessage('課程已從排程中移除！', 'success');

            } else {
                if (currentActiveSessionsCount >= cls.totalSessions) {
                    showMessage(`已達到課程總堂數上限 (${cls.totalSessions} 堂)，新增此堂課將會超額。`, 'warning');
                }

                const newSessionData = {
                    class_id: cls.id,
                    date: dateString,
                    actual_teacher: cls.mainTeacher,
                    attendance: (cls.enrolledStudents || []).map(studentId => ({ student_id: String(studentId), status: '未到' })),
                    is_postponed: false
                };
                await sessionApi.create(newSessionData);
                await fetchData();
                showMessage('課程已成功新增排程！', 'success');
            }
        } catch (err) {
            console.error("Error toggling session:", err);
            showMessage(`排課操作失敗: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [sessions, classes, showMessage, fetchData, formatDateToLocalISO]); // 這裡已移除 cls.totalSessions，因為 cls 是參數

    // --- 繳費日期調整相關狀態和函數 ---
    const handleOpenAdjustPaymentDateModal = useCallback((cls) => {
        setSelectedClassForPaymentAdjustment(cls);
        setShowAdjustPaymentDateModal(true);
    }, []); // 依賴 cls

    const handleAdjustPaymentDate = useCallback(async (transactionId, newDueDate) => {
        setLoading(true);
        try {
            const currentTransactions = transactions || [];
            const transactionToUpdate = currentTransactions.find(t => t.id === transactionId);
            if (!transactionToUpdate) {
                throw new Error("Transaction not found for adjustment.");
            }

            if (transactionToUpdate.status === '已繳費') {
                showMessage('已繳費的交易無法調整繳費期限。', 'warning');
                setLoading(false);
                return;
            }

            // 後端 TransactionUpdate 要求完整欄位，故傳送完整交易並只覆寫 due_date
            const transactionPayload = {
                due_date: formatDateToLocalISO(newDueDate),
                record_date: transactionToUpdate.recordDate ? formatDateToLocalISO(transactionToUpdate.recordDate) : null,
                student_id: transactionToUpdate.studentId,
                class_id: transactionToUpdate.classId,
                amount: transactionToUpdate.amount,
                description: transactionToUpdate.description,
                payment_term: transactionToUpdate.paymentTerm,
                status: transactionToUpdate.status,
                installment: transactionToUpdate.installment,
            };

            await transactionApi.update(transactionId, transactionPayload);
            await fetchData();
            showMessage('繳費期限已成功調整！', 'success');
        } catch (err) {
            console.error("Error adjusting payment date:", err);
            showMessage(`調整繳費期限失敗: ${err.message}`, 'error');
        } finally {
            setLoading(false);
            setShowAdjustPaymentDateModal(false);
        }
    }, [showMessage, fetchData, transactions, formatDateToLocalISO]); // 依賴 transactions

    return {
        messageText, messageType, showMessage, loading, error,
        students, setNewStudent, showAddStudentForm, setShowAddStudentForm, editingStudent, setEditingStudent,
        showStudentPaymentModal, setShowStudentPaymentModal, selectedStudentForPayment, setSelectedStudentForPayment,
        showConfirmDeleteStudent, setShowConfirmDeleteStudent, studentToDeleteId, setStudentToDeleteId,

        classes, newClass, setNewClass, showAddClassForm, setShowAddClassForm, editingClass, setEditingClass,
        selectedClassToEnroll, setSelectedClassToEnroll, studentsToEnroll, setStudentsToEnroll,
        showEnrolledStudentsModal, setShowEnrolledStudentsModal, classEnrolledStudentsData, setClassEnrolledStudentsData,
        showClassCalendarModal, setShowClassCalendarModal, selectedClassForCalendar, setSelectedClassForCalendar,
        showConfirmRemoveEnrollment, setShowConfirmRemoveEnrollment, enrollmentToRemove, setEnrollmentToRemove,
        showConfirmDeleteClass, setShowConfirmDeleteClass, classToDeleteId, setClassToDeleteId,

        sessions,
        transactions,

        showReceiptModal, setShowReceiptModal, receiptData, setReceiptData,
        showPaymentNoticeModal, setShowPaymentNoticeModal, paymentNoticeData, setPaymentNoticeData,
        showCombinedPaymentPrintModal, setShowCombinedPaymentPrintModal, combinedPaymentPrintData, setCombinedPaymentPrintData,

        currentMonth, setCurrentMonth, currentYear, setCurrentYear, selectedDateOnCalendar, setSelectedDateOnCalendar,
        showDailySessionsModal, setShowDailySessionsModal,

        showStudentSummaryModal, setShowStudentSummaryModal, studentSummaryData, setStudentSummaryData,

        TUITION_CENTER_NAME,

        getStudentNameById, getClassNameById, getClassTeacherById,
        getCalendarDays, monthNames, dayNames,
        getSessionsForDate, getAttendanceSummaryForSession,

        handleStudentInputChange, handleAddStudent, handleEditStudent, handleUpdateStudent, handleDeleteStudent, handleDeleteStudentConfirm, handleManageStudentPayment, handleViewStudentSummary,
        getStudentEnrolledClassNames,

        handleClassInputChange, handleAddClass, handleEditClass, handleUpdateClass, handleDeleteClass, handleDeleteClassConfirm,
        handleRemoveEnrollment, handleRemoveEnrollmentConfirm, handleEnrollStudentChange, handleEnrollStudentsToClass, handleViewEnrolledStudents,

        handlePrevMonth, handleNextMonth, handleUpdateAttendanceStatus,
        handlePostponeConfirmed, handleCancelPostponement, setPostponeOriginDate, postponeOriginDate, setPostponeDays, postponeDays,
        handleManualToggleSession, 

        handleChangePaymentStatus, handlePrintReceipt, handlePrintPaymentNotice, handlePrintAllPaymentNotices, handlePrintAllReceipts, handlePrintCombined,

        // --- 導出繳費日期調整相關狀態和函數 ---
        showAdjustPaymentDateModal,
        setShowAdjustPaymentDateModal,
        selectedClassForPaymentAdjustment,
        handleOpenAdjustPaymentDateModal,
        handleAdjustPaymentDate,
    };
};

export default useTuitionData;