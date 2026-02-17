import React, { useEffect } from 'react';

const EnrolledStudentsModal = ({ show, onClose, cls, students, onRemoveEnrollment, getStudentNameById }) => {
    useEffect(() => {
        if (!show) return;
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
        };
    }, [show]);

    // 確保 show 和 cls 存在
    if (!show || !cls) return null;
    
    // 確保 cls.enrolled_students 存在且是一個陣列，使用 snake_case 屬性名
    const enrolledStudentIds = cls.enrolled_students || []; 
    // getStudentNameById 應該能處理 ID 字串，所以這裡直接傳遞 ID
    const enrolledStudentNames = enrolledStudentIds.map(id => ({ id, name: getStudentNameById(id) }));

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-[100] overflow-hidden">
          <div className="flex min-h-screen items-center justify-center py-8 px-4">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    type="button"
                    style={{ position: 'absolute', top: '1rem', right: '1rem', left: 'auto' }}
                    className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-5 text-center pr-10">報名學生 - {cls.name}</h3>
                <div className={`mb-2 ${enrolledStudentNames.length > 5 ? 'max-h-60 overflow-y-auto' : ''}`}>
                    {enrolledStudentNames.length === 0 ? (
                        <p className="text-center text-gray-600 py-1">目前沒有學生報名此課程。</p>
                    ) : (
                        <ul className="list-disc list-inside text-gray-700">
                            {enrolledStudentNames.map((student) => (
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
                </div>
                <div className="flex justify-center mt-6">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 text-base bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
                    >
                        關閉
                    </button>
                </div>
            </div>
          </div>
        </div>
    );
};

export default EnrolledStudentsModal;