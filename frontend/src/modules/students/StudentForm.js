// frontend/src/modules/students/StudentForm.js

import React, { useState, useEffect } from 'react';

const emptyStudent = { name: '', age: '', grade: '', school: '', phone: '', dob: '' };

function normalizeDob(dob) {
    if (!dob) return '';
    if (typeof dob === 'string') return dob.slice(0, 10);
    try {
        const d = new Date(dob);
        return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    } catch {
        return '';
    }
}

const StudentForm = ({
    newStudent, setNewStudent,
    editingStudent, setEditingStudent,
    handleAddStudent, handleUpdateStudent, setShowAddStudentForm, showMessage,
}) => {
    const isEditing = !!editingStudent;
    // 使用「本地 state」控制輸入，確保打字一定會顯示
    const [formValues, setFormValues] = useState(() => {
        if (isEditing && editingStudent) {
            return {
                name: editingStudent.name ?? '',
                age: editingStudent.age ?? '',
                grade: editingStudent.grade ?? '',
                school: editingStudent.school ?? '',
                phone: editingStudent.phone ?? '',
                dob: normalizeDob(editingStudent.dob),
            };
        }
        return { ...(newStudent || emptyStudent) };
    });

    // 僅在「切換新增/編輯」或「切換編輯對象」時從 props 同步到本地，打字時不覆寫
    useEffect(() => {
        if (isEditing && editingStudent) {
            setFormValues({
                name: editingStudent.name ?? '',
                age: editingStudent.age ?? '',
                grade: editingStudent.grade ?? '',
                school: editingStudent.school ?? '',
                phone: editingStudent.phone ?? '',
                dob: normalizeDob(editingStudent.dob),
            });
        } else {
            setFormValues({ ...(newStudent || emptyStudent) });
        }
    }, [isEditing, editingStudent?.id]); // 不依賴 newStudent，避免新增模式下打字觸發同步而清空

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            handleUpdateStudent(e, { ...editingStudent, ...formValues });
        } else {
            handleAddStudent(e, formValues);
        }
    };

    const handleCancel = () => {
        setEditingStudent(null);
        setNewStudent(emptyStudent);
        setShowAddStudentForm(false);
        showMessage('');
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
                        value={formValues.name}
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
                        value={formValues.age}
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
                        value={formValues.grade}
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
                        value={formValues.school}
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
                        value={formValues.phone}
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
                        value={formValues.dob}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入生日"
                        required
                    />
                </div>
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
