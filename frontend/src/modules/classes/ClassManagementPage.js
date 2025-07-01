// frontend/src/modules/classes/ClassManagementPage.js

import React from 'react';
import ClassForm from './ClassForm';
import MessageDisplay from '../../components/MessageDisplay';
import EnrolledStudentsModal from './EnrolledStudentsModal';
import ClassCalendarModal from './ClassCalendarModal';
import AdjustPaymentDateModal from '../finance/AdjustPaymentDateModal'; // 導入新的繳費日期調整 Modal

const ClassManagementPage = ({
    showClassCalendarModal,
    selectedClassForCalendar,
    setShowClassCalendarModal, setSelectedClassForCalendar,
    classes, newClass, setNewClass, showAddClassForm, setShowAddClassForm, editingClass, setEditingClass,
    handleAddClass,
    handleEditClass = () => console.error("Error: handleEditClass prop is missing or not a function in ClassManagementPage!"),
    handleUpdateClass, handleDeleteClass, handleViewEnrolledStudents,
    getStudentNameById, getClassNameById, getClassTeacherById,
    showMessage, messageText, messageType,
    showEnrolledStudentsModal, setShowEnrolledStudentsModal, classEnrolledStudentsData,
    handleRemoveEnrollment,
    handleClassInputChange,
    sessions,
    postponeOriginDate, setPostponeOriginDate, postponeDays, setPostponeDays,
    handlePostponeConfirmed, handleCancelPostponement,
    students,
    handleManualToggleSession,
    // --- 新增繳費日期調整相關 props ---
    showAdjustPaymentDateModal, // 從 useTuitionData 傳入的 state
    setShowAdjustPaymentDateModal, // 從 useTuitionData 傳入的 setter
    selectedClassForPaymentAdjustment, // 從 useTuitionData 傳入的 state
    handleOpenAdjustPaymentDateModal, // 從 useTuitionData 傳入的函數
    handleAdjustPaymentDate, // 從 useTuitionData 傳入的函數
    transactions, // 從 useTuitionData 傳入的 transactions 數據
}) => {
    // 在組件內部，渲染之前，再次檢查 handleEditClass 的值
    console.log("ClassManagementPage component rendering. Checking handleEditClass prop:");
    console.log("Type of handleEditClass:", typeof handleEditClass);
    console.log("Value of handleEditClass:", handleEditClass);

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl transition-all duration-500 ease-in-out transform hover:scale-105">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">課堂系統</h2>
            <MessageDisplay msg={messageText} type={messageType} />

            {/* 新增課程按鈕 */}
            <div className="flex justify-center mb-8">
                <button
                    onClick={() => {
                        setShowAddClassForm(!showAddClassForm);
                        setEditingClass(null); // 確保是新增模式
                        setNewClass({
                            name: '', mainTeacher: '', description: '', startDate: '',
                            daysOfWeek: [], totalSessions: 0, paymentInstallments: 1, price: 0, paymentFrequency: 'monthly', enrolledStudents: [],
                            substituteTeacher: ''
                        });
                    }}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    {showAddClassForm ? '隱藏新增課程表單' : '新增課程'}
                </button>
            </div>

            {/* 添加/編輯課程表單 (條件渲染) */}
            {showAddClassForm && (
                <ClassForm
                    newClass={newClass}
                    setNewClass={setNewClass}
                    editingClass={editingClass}
                    setEditingClass={setEditingClass}
                    handleAddClass={handleAddClass}
                    handleUpdateClass={handleUpdateClass}
                    setShowAddClassForm={setShowAddClassForm}
                    showMessage={showMessage}
                />
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
                            {(classes || []).map((cls) => (
                                <tr key={cls.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.mainTeacher}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {(cls.daysOfWeek || []).map(day => ['日', '一', '二', '三', '四', '五', '六'][day]).join(', ')}
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
                                        {/* --- 新增：調整繳費日期按鈕 --- */}
                                        <button
                                            onClick={() => handleOpenAdjustPaymentDateModal(cls)}
                                            className="text-orange-600 hover:text-orange-900 mr-2"
                                        >
                                            調整繳費日期
                                        </button>
                                        {/* --- 結束新增 --- */}
                                        <button
                                            onClick={() => {
                                                console.log("Edit button clicked for class:", cls.name);
                                                console.log("handleEditClass at click time:", handleEditClass);
                                                handleEditClass(cls);
                                            }}
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
                onRemoveEnrollment={handleRemoveEnrollment}
                getStudentNameById={getStudentNameById}
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
};

export default ClassManagementPage;