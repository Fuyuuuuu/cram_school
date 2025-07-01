import React from 'react';

const EnrolledStudentsModal = ({ show, onClose, cls, students, onRemoveEnrollment, getStudentNameById }) => {
    // 確保 show 和 cls 存在
    if (!show || !cls) return null;
    
    // 確保 cls.enrolled_students 存在且是一個陣列，使用 snake_case 屬性名
    const enrolledStudentIds = cls.enrolled_students || []; 
    // getStudentNameById 應該能處理 ID 字串，所以這裡直接傳遞 ID
    const enrolledStudentNames = enrolledStudentIds.map(id => ({ id, name: getStudentNameById(id) }));

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">報名學生 - {cls.name}</h3> {/* 顯示課程名稱 */}
                <div className="max-h-60 overflow-y-auto mb-4">
                    {enrolledStudentNames.length === 0 ? (
                        <p className="text-center text-gray-600">目前沒有學生報名此課程。</p>
                    ) : (
                        <ul className="list-disc list-inside text-gray-700">
                            {enrolledStudentNames.map((student) => (
                                <li key={student.id} className="mb-1 flex justify-between items-center">
                                    <span>{student.name}</span>
                                    <button
                                        // 確保 onRemoveEnrollment 接收正確的 classId (字串) 和 studentId (字串)
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
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
                    >
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnrolledStudentsModal;