// frontend/src/App.js

import React, { useState } from 'react';
import useTuitionData from './hooks/useTuitionData'; // 導入我們創建的核心 Hook

// 導入佈局組件
import Header from './layout/Header';
import Footer from './layout/Footer';

// 導入通用 UI 組件 (模態視窗和訊息顯示)
import MessageDisplay from './components/MessageDisplay';
import ConfirmationModal from './components/ConfirmationModal';

// 導入各個功能模組頁面 (從 modules/ 目錄)
import StudentManagementPage from './modules/students/StudentManagementPage';
import ClassManagementPage from './modules/classes/ClassManagementPage';
import FinanceManagementPage from './modules/finance/FinanceManagementPage';
import CalendarOverviewPage from './modules/calendar/CalendarOverviewPage';
import HistoryClassesPage from './modules/common/HistoryClassesPage';

// 導入所有模態視窗組件 (它們現在是獨立的組件，會傳入 prop 來控制顯示和數據)
import StudentPaymentModal from './modules/students/StudentPaymentModal';
import EnrolledStudentsModal from './modules/classes/EnrolledStudentsModal';
import ClassCalendarModal from './modules/classes/ClassCalendarModal';
import DailySessionsAttendanceModal from './modules/calendar/DailySessionsAttendanceModal';
import SessionAttendanceModal from './modules/common/SessionAttendanceModal';
import StudentSummaryModal from './modules/common/StudentSummaryModal';
import ReceiptModal from './modules/finance/ReceiptModal';
import PaymentNoticeModal from './modules/finance/PaymentNoticeModal';
import CombinedPaymentPrintModal from './modules/finance/CombinedPaymentPrintModal';
import AdjustPaymentDateModal from './modules/finance/AdjustPaymentDateModal'; // 導入新的繳費日期調整 Modal


function App() {
  const [currentPage, setCurrentPage] = useState('students');

  const {
    messageText, messageType, showMessage, loading, error,
    students, newStudent, setNewStudent, showAddStudentForm, setShowAddStudentForm, editingStudent, setEditingStudent,
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

    currentMonth, setCurrentMonth, currentYear, setCurrentYear, 
    selectedDateOnCalendar, setSelectedDateOnCalendar, 
    showDailySessionsModal, setShowDailySessionsModal,

    showStudentSummaryModal, setShowStudentSummaryModal, studentSummaryData, setStudentSummaryData,

    TUITION_CENTER_NAME,

    getStudentNameById, getClassNameById, getClassTeacherById,
    getCalendarDays, monthNames, dayNames,
    getSessionsForDate, getAttendanceSummaryForSession,

    handleStudentInputChange, handleAddStudent, handleEditStudent, handleUpdateStudent, handleDeleteStudent, handleDeleteStudentConfirm, handleManageStudentPayment, handleViewStudentSummary,
    getStudentEnrolledClassNames,

    handleClassInputChange, handleAddClass, handleEditClass, handleUpdateClass, handleDeleteClass, handleDeleteClassConfirm,
    handleRemoveEnrollment, 
    handleRemoveEnrollmentConfirm, 
    handleEnrollStudentChange, 
    handleEnrollStudentsToClass, handleViewEnrolledStudents,

    handlePrevMonth, handleNextMonth, handleUpdateAttendanceStatus,
    handlePostponeConfirmed, handleCancelPostponement, setPostponeOriginDate, postponeOriginDate, setPostponeDays, postponeDays,
    handleManualToggleSession, 

    handleChangePaymentStatus, handlePrintReceipt, handlePrintPaymentNotice, handlePrintAllPaymentNotices, handlePrintAllReceipts, handlePrintCombined,

    // --- 新增解構繳費日期調整相關狀態和函數 ---
    showAdjustPaymentDateModal,
    setShowAdjustPaymentDateModal,
    selectedClassForPaymentAdjustment,
    handleOpenAdjustPaymentDateModal,
    handleAdjustPaymentDate,
  } = useTuitionData(); 

  console.log("App.js - Checking handleEditClass after useTuitionData hook:");
  console.log("Type of handleEditClass from useTuitionData:", typeof handleEditClass);
  console.log("Value of handleEditClass from useTuitionData:", handleEditClass);

  console.log("App.js - Checking handleEditStudent after useTuitionData hook:");
  console.log("Type of handleEditStudent from useTuitionData:", typeof handleEditStudent);
  console.log("Value of handleEditStudent from useTuitionData:", handleEditStudent);


  const handleNavigationClick = (page) => {
    setCurrentPage(page);
    showMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header currentPage={currentPage} handleNavigationClick={handleNavigationClick} />

      <main className="container mx-auto p-6 flex-grow">
        <MessageDisplay msg={messageText} type={messageType} />
        {loading && <div className="text-center text-blue-600 font-semibold my-4">載入中...</div>}

        {(() => {
          switch (currentPage) {
            case 'students':
              return (
                <StudentManagementPage
                  students={students}
                  newStudent={newStudent} 
                  setNewStudent={setNewStudent} 
                  showAddStudentForm={showAddStudentForm}
                  setShowAddStudentForm={setShowAddStudentForm}
                  editingStudent={editingStudent}
                  setEditingStudent={setEditingStudent}
                  handleAddStudent={handleAddStudent}
                  handleUpdateStudent={handleUpdateStudent}
                  handleDeleteStudent={handleDeleteStudent}
                  handleManageStudentPayment={handleManageStudentPayment}
                  handleViewStudentSummary={handleViewStudentSummary}
                  handleEnrollStudentChange={handleEnrollStudentChange}
                  handleEnrollStudentsToClass={handleEnrollStudentsToClass}
                  selectedClassToEnroll={selectedClassToEnroll}
                  setSelectedClassToEnroll={setSelectedClassToEnroll}
                  studentsToEnroll={studentsToEnroll}
                  setStudentsToEnroll={setStudentsToEnroll}
                  classes={classes}
                  handlePrintAllPaymentNotices={handlePrintAllPaymentNotices}
                  handlePrintAllReceipts={handlePrintAllReceipts}
                  showMessage={showMessage}
                  getStudentNameById={getStudentNameById}
                  messageText={messageText}
                  messageType={messageType}
                  handleStudentInputChange={handleStudentInputChange}
                  handleEditStudent={handleEditStudent} 
                  getStudentEnrolledClassNames={getStudentEnrolledClassNames}
                />
              );
            case 'classes':
              return (
                <ClassManagementPage
                  classes={classes}
                  newClass={newClass}
                  setNewClass={setNewClass}
                  showAddClassForm={showAddClassForm}
                  setShowAddClassForm={setShowAddClassForm}
                  editingClass={editingClass}
                  setEditingClass={setEditingClass}
                  handleAddClass={handleAddClass}
                  handleUpdateClass={handleUpdateClass}
                  handleDeleteClass={handleDeleteClass}
                  handleViewEnrolledStudents={handleViewEnrolledStudents}
                  getStudentNameById={getStudentNameById}
                  getClassNameById={getClassNameById}
                  getClassTeacherById={getClassTeacherById}
                  showMessage={showMessage}
                  setSelectedClassForCalendar={setSelectedClassForCalendar}
                  setShowClassCalendarModal={setShowClassCalendarModal}
                  messageText={messageText}
                  messageType={messageType}
                  showEnrolledStudentsModal={showEnrolledStudentsModal}
                  setShowEnrolledStudentsModal={setShowEnrolledStudentsModal}
                  classEnrolledStudentsData={classEnrolledStudentsData}
                  handleRemoveEnrollment={handleRemoveEnrollment}
                  handleClassInputChange={handleClassInputChange}
                  sessions={sessions}
                  students={students} 
                  postponeOriginDate={postponeOriginDate}
                  setPostponeOriginDate={setPostponeOriginDate}
                  postponeDays={postponeDays}
                  setPostponeDays={setPostponeDays}
                  handlePostponeConfirmed={handlePostponeConfirmed}
                  handleCancelPostponement={handleCancelPostponement}
                  handleManualToggleSession={handleManualToggleSession}
                  handleEditClass={handleEditClass}
                  // --- 新增傳遞繳費日期調整相關 props ---
                  showAdjustPaymentDateModal={showAdjustPaymentDateModal}
                  setShowAdjustPaymentDateModal={setShowAdjustPaymentDateModal}
                  selectedClassForPaymentAdjustment={selectedClassForPaymentAdjustment}
                  handleOpenAdjustPaymentDateModal={handleOpenAdjustPaymentDateModal}
                  handleAdjustPaymentDate={handleAdjustPaymentDate}
                  transactions={transactions} // 確保 transactions 數據被傳遞
                />
              );
            case 'finance':
              return (
                <FinanceManagementPage
                  transactions={transactions}
                  getStudentNameById={getStudentNameById}
                  handleChangePaymentStatus={handleChangePaymentStatus}
                  handlePrintReceipt={handlePrintReceipt}
                  handlePrintPaymentNotice={handlePrintPaymentNotice}
                  showMessage={showMessage}
                  messageText={messageText}
                  messageType={messageType}
                />
              );
            case 'calendar':
              return (
                <CalendarOverviewPage
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                  currentYear={currentYear}
                  setCurrentYear={setCurrentYear}
                  sessions={sessions}
                  getSessionsForDate={getSessionsForDate}
                  getClassNameById={getClassNameById}
                  getAttendanceSummaryForSession={getAttendanceSummaryForSession}
                  selectedDateOnCalendar={selectedDateOnCalendar}
                  setSelectedDateOnCalendar={setSelectedDateOnCalendar} 
                  setShowDailySessionsModal={setShowDailySessionsModal}
                  handlePrevMonth={handlePrevMonth}
                  handleNextMonth={handleNextMonth}
                  getCalendarDays={getCalendarDays}
                  monthNames={monthNames}
                  dayNames={dayNames}
                  messageText={messageText}
                  messageType={messageType}
                />
              );
            case 'history':
              return (
                <HistoryClassesPage
                  sessions={sessions}
                  getStudentNameById={getStudentNameById}
                  getClassNameById={getClassNameById}
                  getClassTeacherById={getClassTeacherById}
                  getAttendanceSummaryForSession={getAttendanceSummaryForSession}
                  showMessage={showMessage}
                  messageText={messageText}
                  messageType={messageType}
                />
              );
            default:
              return null;
          }
        })()}
      </main>

      {/* 頁腳 */}
      <Footer />

      {/* 所有模態視窗在 App 組件的頂層渲染 */}
      <StudentSummaryModal 
        show={showStudentSummaryModal} 
        onClose={() => setShowStudentSummaryModal(false)} 
        data={studentSummaryData} 
        onUpdateAttendanceStatus={handleUpdateAttendanceStatus} 
      />

      <DailySessionsAttendanceModal
        show={showDailySessionsModal}
        onClose={() => setShowDailySessionsModal(false)}
        date={selectedDateOnCalendar}
        sessions={sessions}
        students={students}
        onUpdateAttendanceStatus={handleUpdateAttendanceStatus}
        getClassNameById={getClassNameById}
        getClassTeacherById={getClassTeacherById}
        classes={classes}
        getStudentNameById={getStudentNameById}
        getAttendanceSummaryForSession={getAttendanceSummaryForSession}
      />

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
        sessions={sessions}
        setCombinedPaymentPrintData={setCombinedPaymentPrintData}
        setShowCombinedPaymentPrintModal={setShowCombinedPaymentPrintModal}
        handlePrintCombined={handlePrintCombined}
        showMessage={showMessage}
      />

      <ReceiptModal show={showReceiptModal} onClose={() => setShowReceiptModal(false)} data={receiptData} />
      <PaymentNoticeModal show={showPaymentNoticeModal} onClose={() => setShowPaymentNoticeModal(false)} data={paymentNoticeData} />
      <CombinedPaymentPrintModal show={showCombinedPaymentPrintModal} onClose={() => setShowCombinedPaymentPrintModal(false)} data={combinedPaymentPrintData} TUITION_CENTER_NAME={TUITION_CENTER_NAME} />

      <ConfirmationModal
        show={showConfirmDeleteStudent}
        onClose={() => setShowConfirmDeleteStudent(false)}
        onConfirm={handleDeleteStudentConfirm}
        title="確認刪除學生"
        message="確定要刪除這位學生嗎？此操作將清除其所有相關資料 (課程報名、點名記錄、繳費記錄)，此操作不可逆。"
      />

      <ConfirmationModal
        show={showConfirmRemoveEnrollment}
        onClose={() => setShowConfirmRemoveEnrollment(false)}
        onConfirm={handleRemoveEnrollmentConfirm} 
        title="確認移除課程報名"
        message="確定要將此學生從本課程中移除嗎？此操作將清除其相關的未繳費記錄。"
      />

      <ConfirmationModal
        show={showConfirmDeleteClass}
        onClose={() => setShowConfirmDeleteClass(false)}
        onConfirm={handleDeleteClassConfirm}
        title="確認刪除課程"
        message="確定要刪除此課程嗎？此操作將清除該課程的所有相關資料 (包括學生報名、會話和繳費記錄)，此操作不可逆。"
      />

      <ClassCalendarModal
        show={showClassCalendarModal}
        onClose={() => setShowClassCalendarModal(false)}
        cls={selectedClassForCalendar}
        sessions={sessions}
        showMessage={showMessage}
        postponeOriginDate={postponeOriginDate}
        setPostponeOriginDate={setPostponeOriginDate}
        postponeDays={postponeDays}
        setPostponeDays={setPostponeDays}
        handlePostponeConfirmed={handlePostponeConfirmed}
        handleCancelPostponement={handleCancelPostponement}
        getCalendarDays={getCalendarDays}
        monthNames={monthNames}
        dayNames={dayNames}
        handleManualToggleSession={handleManualToggleSession}
      />

      {/* --- 新增：繳費日期調整 Modal --- */}
      <AdjustPaymentDateModal
          show={showAdjustPaymentDateModal}
          onClose={() => setShowAdjustPaymentDateModal(false)}
          cls={selectedClassForPaymentAdjustment}
          transactions={transactions}
          students={students}
          showMessage={showMessage}
          handleAdjustPaymentDate={handleAdjustPaymentDate}
          getStudentNameById={getStudentNameById}
      />
      {/* --- 結束新增 --- */}
    </div>
  );
}

export default App;