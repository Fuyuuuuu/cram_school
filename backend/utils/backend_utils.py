from datetime import date, datetime, timedelta
from typing import List, Dict, Any

# 輔助函數：根據開始日期、上課星期和總堂數生成課程會話
def generate_sessions_for_class(
    class_data: Any,
    class_id: str,
    target_sessions: int,
    days_of_week: List[int], # 前端傳來的 days_of_week (0=日, 1=一...6=六)
    enrolled_students: List[str]
) -> List[Dict[str, Any]]:
    """生成課程的所有會話"""
    sessions = []
    current_date = class_data.start_date.date() if isinstance(class_data.start_date, datetime) else class_data.start_date
    end_date = class_data.end_date.date() if isinstance(class_data.end_date, datetime) else class_data.end_date
    session_count = 0

    while current_date <= end_date and session_count < target_sessions:
        # 修正：將前端的星期索引 (0=日, 1=一) 轉換為 Python 的 weekday() 索引 (0=一, 6=日)
        python_weekday = current_date.weekday() # Python: 0=Mon, ..., 6=Sun
        
        # 將 Python 的 weekday 轉換為前端的星期索引
        # Python_weekday | Frontend_index
        # 0 (Mon)      | 1
        # 1 (Tue)      | 2
        # 2 (Wed)      | 3
        # 3 (Thu)      | 4
        # 4 (Fri)      | 5
        # 5 (Sat)      | 6
        # 6 (Sun)      | 0
        
        # 轉換邏輯: 如果 python_weekday 是 6 (週日), 則前端是 0. 否則為 python_weekday + 1
        frontend_day_index = (python_weekday + 1) % 7 

        if frontend_day_index in days_of_week: # 使用轉換後的索引進行比較
            attendance = [
                {"student_id": student_id, "status": "未到"}
                for student_id in enrolled_students
            ]
            
            sessions.append({
                "class_id": class_id,
                "date": current_date, # 這裡保持 date 對象
                "actual_teacher": class_data.main_teacher,
                "attendance": attendance ,
                "is_postponed": False 
            })
            session_count += 1
        current_date += timedelta(days=1)
    
    return sessions

# generate_transactions_for_class_template 保持不變，因為它不涉及日期邏輯錯誤
def generate_transactions_for_class_template(
    class_data: Any, # ORM 對象
    class_id: str,
    price: float,
    payment_installments: int,
    start_date: date,
    class_name: str
) -> List[Dict[str, Any]]:
    """
    生成課程的交易模板列表。
    注意：此函數現在僅用於提供交易結構參考，不應在課程創建時生成實際數據。
    實際交易將在學生報名時為每個學生單獨生成。
    """
    transactions_template = []
    if payment_installments > 0:
        installment_amount = price / payment_installments
        
        for i in range(payment_installments):
            due_date = datetime.combine(start_date, datetime.min.time()) + timedelta(days=30 * i)
            transactions_template.append({
                "class_id": class_id,
                "amount": installment_amount,
                "description": f"{class_name} - 第{i+1}期付款",
                "due_date": due_date,
                "payment_term": "按月繳費",
                "status": "未繳費",
                "is_active": True,
                "installment": i + 1
            })
    
    return transactions_template