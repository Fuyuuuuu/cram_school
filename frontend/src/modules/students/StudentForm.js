// frontend/src/modules/students/StudentForm.js

import React, { useMemo } from 'react'; // 移除 useEffect

const StudentForm = ({
    newStudent, setNewStudent,
    editingStudent, setEditingStudent,
    handleAddStudent, handleUpdateStudent, setShowAddStudentForm, showMessage,
}) => {
    const isEditing = !!editingStudent;
    const formData = useMemo(() => {
        // 移除 currentClass 字段
        return isEditing ? editingStudent : newStudent || {};
    }, [isEditing, editingStudent, newStudent]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isEditing) {
            setEditingStudent(prev => ({ ...prev, [name]: value }));
        } else {
            setNewStudent(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = isEditing ? handleUpdateStudent : handleAddStudent;

    const handleCancel = () => {
        setEditingStudent(null); // 清除編輯狀態
        // 重置 newStudent 狀態為預設值，確保所有屬性都存在，移除 currentClass
        setNewStudent({ name: '', age: '', grade: '', school: '', phone: '', dob: '' });
        setShowAddStudentForm(false); // 隱藏表單
        showMessage(''); // 清除任何訊息
    };

    return (
        <>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{isEditing ? '編輯學生資料' : '新增學生'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
                <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                    <input
                        type="text"
                        id="studentName"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入學生姓名"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentAge" className="block text-sm font-medium text-gray-700 mb-1">年齡</label>
                    <input
                        type="number"
                        id="studentAge"
                        name="age"
                        value={formData.age || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入學生年齡"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentGrade" className="block text-sm font-medium text-gray-700 mb-1">年級</label>
                    <input
                        type="text"
                        id="studentGrade"
                        name="grade"
                        value={formData.grade || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入學生年級"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentSchool" className="block text-sm font-medium text-gray-700 mb-1">就讀學校</label>
                    <input
                        type="text"
                        id="studentSchool"
                        name="school"
                        value={formData.school || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入就讀學校"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentPhone" className="block text-sm font-medium text-gray-700 mb-1">聯絡電話</label>
                    <input
                        type="text"
                        id="studentPhone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入聯絡電話"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentDob" className="block text-sm font-medium text-gray-700 mb-1">生日</label>
                    <input
                        type="date"
                        id="studentDob"
                        name="dob"
                        value={formData.dob || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入生日"
                        required
                    />
                </div>
                {/* 移除目前班級的輸入框 */}
                {/* <div>
                    <label htmlFor="studentCurrentClass" className="block text-sm font-medium text-gray-700 mb-1">目前班級</label>
                    <input
                        type="text"
                        id="studentCurrentClass"
                        name="currentClass"
                        value={formData.currentClass || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入目前班級"
                        required
                    />
                </div> */}
                <div className="md:col-span-3 flex justify-center space-x-4">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {isEditing ? '儲存修改' : '添加學生'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        取消
                    </button>
                </div>
            </form>
        </>
    );
};

export default StudentForm;