import React, { useEffect, useMemo } from 'react';

const ClassForm = ({
    newClass, setNewClass, editingClass, setEditingClass,
    handleAddClass, handleUpdateClass, setShowAddClassForm, showMessage
}) => {
    const isEditing = !!editingClass;
    // 使用 useMemo 優化 formData 的創建，使其只在 newClass 或 editingClass 改變時重新計算
    // editingClass 和 newClass 都是 camelCase 格式的內部狀態
    const formData = useMemo(() => {
        return isEditing ? editingClass : newClass || {};
    }, [isEditing, editingClass, newClass]); // 依賴項為 isEditing, editingClass, newClass

    // 這個 handleChange 函數在 ClassForm 內部定義，直接操作狀態
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            const newDaysOfWeek = checked
                ? [...(formData.daysOfWeek || []), parseInt(value, 10)] 
                : (formData.daysOfWeek || []).filter((day) => day !== parseInt(value, 10)); 
            if (isEditing) {
                setEditingClass(prev => ({ ...prev, daysOfWeek: newDaysOfWeek }));
            } else {
                setNewClass(prev => ({ ...prev, daysOfWeek: newDaysOfWeek }));
            }
        } else {
            if (isEditing) {
                setEditingClass(prev => ({ ...prev, [name]: value }));
            } else {
                setNewClass(prev => ({ ...prev, [name]: value }));
            }
        }
    };

    const handleSubmit = isEditing ? handleUpdateClass : handleAddClass;

    const handleCancel = () => {
        setEditingClass(null); // 清除編輯狀態
        setNewClass({ // 清空新增表單，確保所有屬性都存在
            name: '', mainTeacher: '', description: '', startDate: '',
            daysOfWeek: [], totalSessions: 0, paymentInstallments: 1, price: 0, paymentFrequency: 'monthly', enrolledStudents: [],
            substituteTeacher: ''
        });
        setShowAddClassForm(false); // 隱藏表單
        showMessage(''); // 清除任何訊息
    };

    return (
        <>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{isEditing ? '編輯課程' : '新增課程'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
                <div>
                    <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">課程名稱 <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        id="className"
                        name="name"
                        value={formData.name || ''} // 確保值不為 undefined
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入課程名稱"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="mainTeacher" className="block text-sm font-medium text-gray-700 mb-1">主課老師 <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        id="mainTeacher"
                        name="mainTeacher"
                        value={formData.mainTeacher || ''} // 確保值不為 undefined
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入主課老師姓名"
                        required
                    />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">課程內容說明</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description || ''} // 確保值不為 undefined
                        onChange={handleChange}
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
                        value={formData.startDate || ''} // 確保值不為 undefined
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="totalSessions" className="block text-sm font-medium text-gray-700 mb-1">總堂數 <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        id="totalSessions"
                        name="totalSessions"
                        value={formData.totalSessions || 0} // 確保值不為 undefined
                        onChange={handleChange}
                        min="1"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入總堂數"
                        required
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
                                    checked={(formData.daysOfWeek || []).includes(index)} // 確保是陣列
                                    onChange={handleChange}
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
                        value={formData.price || 0} // 確保值不為 undefined
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入課程學費"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="paymentInstallments" className="block text-sm font-medium text-gray-700 mb-1">分為多少期 <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        id="paymentInstallments"
                        name="paymentInstallments"
                        value={formData.paymentInstallments || 1} // 確保值不為 undefined
                        onChange={handleChange}
                        min="1"
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入繳費期數"
                        required
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">繳費方式 <span className="text-red-500">*</span></label>
                    <p className="mt-1 block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg shadow-sm">按月繳費</p>
                    {/* paymentFrequency 雖然是固定值，但作為表單的一部分，還是確保其存在 */}
                    <input type="hidden" name="paymentFrequency" value="monthly" />
                </div>
                <div>
                    <label htmlFor="substituteTeacher" className="block text-sm font-medium text-gray-700 mb-1">代課老師</label>
                    <input
                        type="text"
                        id="substituteTeacher"
                        name="substituteTeacher"
                        value={formData.substituteTeacher || ''} // 確保值不為 undefined
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="輸入代課老師姓名 (選填)"
                    />
                </div>
                <div className="md:col-span-2 flex justify-center space-x-4">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {isEditing ? '儲存修改' : '添加課程'}
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

export default ClassForm;