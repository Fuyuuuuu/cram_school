// frontend/src/modules/students/StudentManagementPage.js

import React from 'react';
import StudentForm from './StudentForm'; // 導入學生表單組件
import MessageDisplay from '../../components/MessageDisplay'; // 導入訊息顯示組件

const StudentManagementPage = ({
    students,
    newStudent,
    setNewStudent,
    showAddStudentForm,
    setShowAddStudentForm,
    editingStudent,
    setEditingStudent,
    handleAddStudent,
    // 為 handleEditStudent 添加一個預設的空函數，以防止 TypeError
    handleEditStudent = () => console.error("Error: handleEditStudent prop is missing or not a function in StudentManagementPage!"),
    handleUpdateStudent,
    handleDeleteStudent,
    handleManageStudentPayment,
    handleViewStudentSummary,
    handleEnrollStudentChange,
    handleEnrollStudentsToClass,
    selectedClassToEnroll,
    setSelectedClassToEnroll,
    studentsToEnroll,
    setStudentsToEnroll,
    classes, // 確保 classes 傳入，用於學生報名課程功能
    handlePrintAllPaymentNotices,
    handlePrintAllReceipts,
    showMessage,
    getStudentNameById,
    messageText,
    messageType,
    handleStudentInputChange,
    getStudentEnrolledClassNames, // <-- 新增接收此輔助函數
}) => {
    // 在組件內部，渲染之前，再次檢查 handleEditStudent 的值
    console.log("StudentManagementPage component rendering. Checking handleEditStudent prop:");
    console.log("Type of handleEditStudent:", typeof handleEditStudent);
    console.log("Value of handleEditStudent:", handleEditStudent);

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl transition-all duration-500 ease-in-out transform hover:scale-105">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">學生管理</h2>
            <MessageDisplay msg={messageText} type={messageType} />

            {/* 添加學生按鈕 */}
            <div className="flex justify-center mb-8">
                <button
                    onClick={() => {
                        setShowAddStudentForm(!showAddStudentForm);
                        setEditingStudent(null); // 確保是新增模式
                        // 重置 newStudent 狀態為預設值，移除 currentClass
                        setNewStudent({ name: '', age: '', grade: '', school: '', phone: '', dob: '' });
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
                <StudentForm
                    newStudent={newStudent}
                    setNewStudent={setNewStudent}
                    editingStudent={editingStudent}
                    setEditingStudent={setEditingStudent}
                    handleAddStudent={handleAddStudent}
                    handleUpdateStudent={handleUpdateStudent}
                    setShowAddStudentForm={setShowAddStudentForm}
                    showMessage={showMessage}
                />
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">目前班級</th> {/* 標題保持不變 */}
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
                                    {/* 格式化 student.dob 為本地日期字符串 */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(student.dob).toLocaleDateString('zh-TW')}</td>
                                    {/* **修改：顯示學生報名的所有課程名稱** */}
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {getStudentEnrolledClassNames(student.id)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleViewStudentSummary(student.id)}
                                            className="text-blue-600 hover:text-blue-900 mr-2"
                                        >
                                            出缺席
                                        </button>
                                        <button
                                            onClick={() => {
                                                console.log("Edit button clicked for student:", student.name);
                                                console.log("handleEditStudent at click time:", handleEditStudent);
                                                handleEditStudent(student); // 這裡調用 handleEditStudent
                                            }}
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

            {/* 課程報名學生 */}
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
                            const currentClass = classes.find(c => String(c.id) === String(e.target.value));
                            setStudentsToEnroll(currentClass ? [...(currentClass.enrolledStudents || [])].map(String) : []);
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
                                        checked={studentsToEnroll.includes(String(student.id))}
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
};

export default StudentManagementPage;