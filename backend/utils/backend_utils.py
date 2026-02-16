from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Union

def _to_date(v: Any) -> date:
    """將 date/datetime/字串 轉成 date，避免會話生成時型別錯誤。"""
    if v is None:
        raise ValueError("date is None")
    if isinstance(v, date) and not isinstance(v, datetime):
        return v
    if isinstance(v, datetime):
        return v.date()
    if isinstance(v, str):
        return datetime.strptime(v[:10], "%Y-%m-%d").date()
    raise TypeError(f"cannot convert to date: {type(v)}")


# 輔助函數：根據開始日期、上課星期和總堂數生成課程會話
def generate_sessions_for_class(
    class_data: Any,
    class_id: str,
    target_sessions: int,
    days_of_week: List[int],  # 前端/API: 0=日, 1=一, ..., 6=六
    enrolled_students: List[str],
) -> List[Dict[str, Any]]:
    """依開始日期與上課星期，生成恰好 target_sessions 筆會話（不依賴 end_date 是否正確）。"""
    sessions: List[Dict[str, Any]] = []
    current_date = _to_date(class_data.start_date)
    # 正規化星期為 set of int，避免 DB/JSON 傳回字串或順序問題
    allowed_days = {int(d) for d in days_of_week if d is not None}
    if not allowed_days:
        return sessions
    # 最多往後搜尋 2 年，避免無限迴圈
    max_date = current_date + timedelta(days=730)
    session_count = 0
    main_teacher = getattr(class_data, "main_teacher", None) or ""

    while session_count < target_sessions and current_date <= max_date:
        # Python weekday(): 0=周一, 6=周日 → 對應前端 0=日, 1=一, ..., 6=六
        python_weekday = current_date.weekday()  # 0=Mon .. 6=Sun
        frontend_day_index = (python_weekday + 1) % 7  # Mon->1, ..., Sun->0

        if frontend_day_index in allowed_days:
            attendance = [
                {"student_id": sid, "status": "未到"}
                for sid in (enrolled_students or [])
            ]
            sessions.append({
                "class_id": class_id,
                "date": current_date,
                "actual_teacher": main_teacher,
                "attendance": attendance,
                "is_postponed": False,
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