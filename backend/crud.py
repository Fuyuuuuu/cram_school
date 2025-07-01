from sqlalchemy.orm import Session
from sqlalchemy import text, String, Boolean # 確保導入 Boolean
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
import uuid

from . import models
from .utils.backend_utils import generate_sessions_for_class

# --- 學生 CRUD 操作 (Student CRUD Operations) ---
def get_student(db: Session, student_id: str):
    return db.query(models.StudentORM).filter(models.StudentORM.id == student_id).first()

def get_students(db: Session, skip: int = 0, limit: int = 100):
    # 直接返回 ORM 對象列表，Pydantic 會自動轉換
    return db.query(models.StudentORM).offset(skip).limit(limit).all()

def create_student(db: Session, student: models.StudentCreate):
    # 直接使用 model_dump()，Pydantic ConfigDict 會處理
    db_student = models.StudentORM(id=str(uuid.uuid4()), **student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    # 直接返回 ORM 對象
    return db_student

def update_student(db: Session, student_id: str, student: models.StudentUpdate):
    db_student = db.query(models.StudentORM).filter(models.StudentORM.id == student_id).first()
    if db_student:
        # 使用 model_dump(exclude_unset=True) 確保只更新提供的字段
        # Pydantic ConfigDict 會處理 camelCase 到 snake_case 的轉換
        update_data = student.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_student, key, value)
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        # 直接返回 ORM 對象
        return db_student
    return None

def delete_student(db: Session, student_id: str):
    db_student = db.query(models.StudentORM).filter(models.StudentORM.id == student_id).first()
    if db_student:
        # --- 級聯操作：更新相關會話的點名記錄 (Attendance JSONB) ---
        # 查找所有包含該學生點名記錄的會話
        # 使用 JSONB 包含操作，確保找到包含該學生 ID 的會話
        sessions_with_student_attendance = db.query(models.SessionORM).filter(
            models.SessionORM.attendance.cast(String).contains(f'"{student_id}"')
        ).all()

        for session_orm in sessions_with_student_attendance:
            attendance_list = session_orm.attendance # 獲取當前 JSONB 列表
            updated_attendance = [att for att in attendance_list if att.get("student_id") != student_id]
            session_orm.attendance = updated_attendance # 更新回 ORM 對象
            db.add(session_orm) # 標記為待更新

        # --- 級聯操作：邏輯刪除相關交易記錄 (Transaction) ---
        # 將該學生的所有交易記錄設為不活躍狀態 (邏輯刪除)
        db.query(models.TransactionORM).filter(models.TransactionORM.student_id == student_id).update(
            {models.TransactionORM.is_active: False},
            synchronize_session=False # 避免因會話中存在未刷新對象導致的問題
        )
        
        # --- 級聯操作：更新課程的 enrolled_students 列表 ---
        # 查找所有該學生報名的課程
        classes_enrolled_student = db.query(models.ClassORM).filter(
            models.ClassORM.enrolled_students.contains([student_id])
        ).all()

        for class_orm in classes_enrolled_student:
            enrolled_list = class_orm.enrolled_students
            updated_enrolled_list = [sid for sid in enrolled_list if sid != student_id]
            class_orm.enrolled_students = updated_enrolled_list
            db.add(class_orm)

        # --- 最後：刪除學生本身 ---
        db.delete(db_student)
        db.commit() # 在所有修改完成後才提交一次
        return True
    return False

# --- 課程 CRUD 操作 (Class CRUD Operations) ---
def get_class(db: Session, class_id: str):
    return db.query(models.ClassORM).filter(models.ClassORM.id == class_id).first()

def get_classes(db: Session, skip: int = 0, limit: int = 100):
    # 直接返回 ORM 對象列表
    return db.query(models.ClassORM).offset(skip).limit(limit).all()

def create_class(db: Session, cls: models.ClassCreate):
    # 將 Pydantic 模型轉換為 ORM 對象時，由 ConfigDict 處理
    db_class = models.ClassORM(id=str(uuid.uuid4()), **cls.model_dump())
    db.add(db_class)
    db.commit() # 提交課程以獲取 ID，供後續會話生成使用
    db.refresh(db_class)

    # 1. 自動生成課程會話 (sessions)
    generated_sessions_data = generate_sessions_for_class(
        class_data=db_class,
        class_id=db_class.id,
        target_sessions=db_class.total_sessions,
        days_of_week=db_class.days_of_week,
        # 新建課程時，可能沒有學生報名，enrolled_students 應該是空的
        enrolled_students=[] # 新建課程時，會話點名列表初始化為空，待學生報名後再更新
    )
    for session_data in generated_sessions_data:
        # generate_sessions_for_class 已經在數據中包含了 is_postponed: False
        db_session = models.SessionORM(id=str(uuid.uuid4()), **session_data)
        db.add(db_session)
    
    # 2. 不再在這裡生成交易記錄！交易將在學生報名時生成。

    db.commit() # 再次提交所有會話
    db.refresh(db_class)
    return db_class

def update_class(db: Session, class_id: str, cls: models.ClassUpdate):
    db_class = db.query(models.ClassORM).filter(models.ClassORM.id == class_id).first()
    if db_class:
        update_data = cls.model_dump(exclude_unset=True) # Pydantic ConfigDict 會處理

        old_start_date = db_class.start_date
        old_days_of_week = db_class.days_of_week
        old_total_sessions = db_class.total_sessions
        old_price = db_class.price
        old_payment_installments = db_class.payment_installments
        old_enrolled_students = db_class.enrolled_students # 獲取舊的報名學生列表

        for key, value in update_data.items():
            setattr(db_class, key, value)
        
        re_generate_sessions_needed = (
            db_class.start_date != old_start_date or
            db_class.days_of_week != old_days_of_week or
            db_class.total_sessions != old_total_sessions
        )

        re_generate_transactions_needed = (
            db_class.price != old_price or
            db_class.payment_installments != old_payment_installments
        )
        
        enrolled_students_changed = (set(db_class.enrolled_students) != set(old_enrolled_students))

        # --- 處理會話的重新生成 ---
        if re_generate_sessions_needed:
            # 刪除舊的會話，但只刪除未來的、未完成點名且未被標記為順延的會話
            # 這裡的邏輯是，已點名完成的會話不應該被修改（除非有特殊需求），
            # 且已順延的會話應該保持其順延狀態，等待被取消順延。
            db.query(models.SessionORM).filter(
                models.SessionORM.class_id == class_id,
                models.SessionORM.date >= date.today(), # 只處理今天或未來的會話
                models.SessionORM.is_postponed == False, # 只刪除未順延的會話
                # 判斷未完成點名：假設 attendance 中不包含 '已到' 狀態的學生，可以被視為未完成點名
                models.SessionORM.attendance.cast(String).not_like('%"status": "已到"%') 
            ).delete(synchronize_session=False)

            new_generated_sessions_data = generate_sessions_for_class(
                class_data=db_class,
                class_id=db_class.id,
                target_sessions=db_class.total_sessions,
                days_of_week=db_class.days_of_week,
                enrolled_students=db_class.enrolled_students # 使用更新後的 enrolled_students
            )
            for session_data in new_generated_sessions_data:
                # generate_sessions_for_class 已經在數據中包含了 is_postponed: False
                db_session = models.SessionORM(id=str(uuid.uuid4()), **session_data)
                db.add(db_session)
            
            # 更新課程的 end_date 為最新會話日期
            # 應該是所有會話（包括舊的已完成的、已順延的）中最晚的日期
            all_current_sessions = db.query(models.SessionORM).filter(models.SessionORM.class_id == class_id).all()
            if all_current_sessions:
                latest_date_in_db = max(s.date for s in all_current_sessions)
                db_class.end_date = latest_date_in_db

        # --- 處理交易的更新/重新生成（只針對未繳費或邏輯刪除） ---
        if re_generate_transactions_needed:
            # 邏輯刪除所有與該課程相關的舊的未繳費交易 (不影響已繳費的歷史記錄)
            db.query(models.TransactionORM).filter(
                models.TransactionORM.class_id == class_id,
                models.TransactionORM.status != '已繳費', # 只邏輯刪除未繳費的
                models.TransactionORM.is_active == True # 只處理活躍的交易
            ).update(
                {models.TransactionORM.is_active: False},
                synchronize_session=False
            )
            # 注意：這裡不會自動生成新的交易，新的交易會由學生報名時的邏輯負責。
            # 如果課程價格和期數變化，且需要為所有已報名學生重新計算費用，則需要在此處添加額外邏輯。
            # 但根據業務邏輯，費用通常是報名時確定的，變更課程費用不應影響已報名學生的舊交易。
            # 這個邏輯需要進一步明確。目前假設價格變更只影響新報名的學生或手動調整。

        # --- 處理報名學生變化及其對會話和交易的影響 ---
        if enrolled_students_changed:
            newly_enrolled_students = [sid for sid in db_class.enrolled_students if sid not in old_enrolled_students]
            un_enrolled_students = [sid for sid in old_enrolled_students if sid not in db_class.enrolled_students]

            # 為新報名學生生成交易
            for student_id in newly_enrolled_students:
                # 這裡調用一個新的輔助函數或直接邏輯，生成該學生針對該課程的交易
                # 假設 ClassORM 包含了所有生成交易所需的費率信息
                if db_class.payment_installments > 0:
                    installment_amount = db_class.price / db_class.payment_installments
                    for i in range(db_class.payment_installments):
                        # 交易的到期日期基於課程開始日期計算，並保留為 datetime
                        due_date = datetime.combine(db_class.start_date, datetime.min.time()) + timedelta(days=30 * i)
                        db_transaction = models.TransactionORM(
                            id=str(uuid.uuid4()),
                            student_id=student_id,
                            class_id=db_class.id,
                            amount=installment_amount,
                            description=f"{db_class.name} - 第{i+1}期付款",
                            due_date=due_date,
                            payment_term="按月繳費",
                            status="未繳費",
                            record_date=None, # 新生成的未繳費
                            installment=i + 1,
                            is_active=True
                        )
                        db.add(db_transaction)

            # 更新所有會話的點名記錄：移除退課學生，為新報名學生添加「未到」條目
            all_sessions_for_class = db.query(models.SessionORM).filter(models.SessionORM.class_id == class_id).all()
            for session_orm in all_sessions_for_class:
                current_attendance_list = session_orm.attendance
                updated_attendance_list = []
                
                # 如果該會話已順延，則不調整其 attendance 列表，僅當 is_postponed 為 False 時才處理
                if session_orm.is_postponed:
                    updated_attendance_list = current_attendance_list
                else: 
                    for att in current_attendance_list:
                        # 只有當 student_id 不在退課學生列表中，且狀態不是「已到」或「請假」時，才移除
                        # 如果已到/請假，即使退課了也保留歷史記錄，但更嚴格的業務邏輯可能選擇清除或標記
                        if att.get('student_id') not in un_enrolled_students:
                            updated_attendance_list.append(att)
                    
                    # 為新報名學生添加「未到」狀態的點名條目到所有現有和未來的會話中
                    current_student_ids_in_session = {att.get('student_id') for att in current_attendance_list if att.get('student_id')}
                    for newly_enrolled_sid in newly_enrolled_students:
                        if newly_enrolled_sid not in current_student_ids_in_session:
                            updated_attendance_list.append({"student_id": newly_enrolled_sid, "status": "未到"})
                
                session_orm.attendance = updated_attendance_list
                db.add(session_orm)

            # 邏輯刪除退課學生的相關交易
            if un_enrolled_students:
                db.query(models.TransactionORM).filter(
                    models.TransactionORM.class_id == class_id,
                    models.TransactionORM.student_id.in_(un_enrolled_students),
                    models.TransactionORM.status != '已繳費', # 只邏輯刪除未繳費的
                    models.TransactionORM.is_active == True # 只處理活躍的交易
                ).update(
                    {models.TransactionORM.is_active: False},
                    synchronize_session=False
                )

        db.commit() # 在所有修改完成後才提交一次
        db.refresh(db_class)
        return db_class
    return None

def delete_class(db: Session, class_id: str):
    db_class = db.query(models.ClassORM).filter(models.ClassORM.id == class_id).first()
    if db_class:
        # 刪除課程相關的所有會話
        db.query(models.SessionORM).filter(models.SessionORM.class_id == class_id).delete(synchronize_session=False)
        
        # 邏輯刪除課程相關的所有交易
        db.query(models.TransactionORM).filter(models.TransactionORM.class_id == class_id).update(
            {models.TransactionORM.is_active: False},
            synchronize_session=False
        )
        
        db.delete(db_class)
        db.commit()
        return True
    return False

# --- 會話 CRUD 操作 (Session CRUD Operations) ---
def get_session(db: Session, session_id: str):
    session_orm = db.query(models.SessionORM).filter(models.SessionORM.id == session_id).first()
    if session_orm:
        # 直接返回 ORM 對象，Pydantic 會自動轉換，包括新的 is_postponed 字段
        return session_orm
    return None

def get_sessions_by_class(db: Session, class_id: str):
    # 直接返回 ORM 對象列表，包含 is_postponed
    return db.query(models.SessionORM).filter(models.SessionORM.class_id == class_id).all()

def get_sessions_by_date(db: Session, session_date: date): # 這裡的 session_date 類型仍是 date
    # 直接返回 ORM 對象列表，包含 is_postponed
    return db.query(models.SessionORM).filter(models.SessionORM.date == session_date).all()

def get_all_sessions(db: Session, skip: int = 0, limit: int = 100):
    # 直接返回 ORM 對象列表，包含 is_postponed
    return db.query(models.SessionORM).offset(skip).limit(limit).all()

def create_session(db: Session, session: models.SessionCreate):
    # Pydantic SessionCreate 包含了 is_postponed 字段，model_dump 會自動處理
    db_session = models.SessionORM(id=str(uuid.uuid4()), **session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    # 直接返回 ORM 對象，包含 is_postponed
    return db_session

def update_session(db: Session, session_id: str, session: models.SessionUpdate):
    db_session = db.query(models.SessionORM).filter(models.SessionORM.id == session_id).first()
    if db_session:
        # 使用 model_dump(exclude_unset=True) 確保只更新提供的字段
        # Pydantic ConfigDict 會處理
        update_data = session.model_dump(exclude_unset=True)
        # 對於日期字段，需要額外處理，確保存儲到 ORM 時仍是 date
        if 'date' in update_data and isinstance(update_data['date'], datetime):
            update_data['date'] = update_data['date'].date()

        # 確保 is_postponed 字段也能被更新
        # Pydantic model_dump 應該會包含 is_postponed (如果前端傳遞了)
        # 這裡會直接覆蓋，因為 Pydantic 模型已經包含了這個字段
        
        for key, value in update_data.items():
            setattr(db_session, key, value)
        
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        # 直接返回 ORM 對象，包含更新後的 is_postponed
        return db_session
    return None

def delete_session(db: Session, session_id: str):
    db_session = db.query(models.SessionORM).filter(models.SessionORM.id == session_id).first()
    if db_session:
        db.delete(db_session)
        db.commit()
        return True
    return False

# --- 交易 CRUD 操作 (Transaction CRUD Operations) ---
def get_transaction(db: Session, transaction_id: str):
    transaction_orm = db.query(models.TransactionORM).filter(models.TransactionORM.id == transaction_id).first()
    if transaction_orm:
        # 直接返回 ORM 對象
        return transaction_orm
    return None

def get_transactions_by_student(db: Session, student_id: str):
    # 只返回活躍的交易
    transactions = db.query(models.TransactionORM).filter(
        models.TransactionORM.student_id == student_id,
        models.TransactionORM.is_active == True
    ).all()
    # 直接返回 ORM 對象列表
    return transactions

def get_all_transactions(db: Session, skip: int = 0, limit: int = 100):
    # 只返回活躍的交易
    transactions = db.query(models.TransactionORM).filter(
        models.TransactionORM.is_active == True
    ).offset(skip).limit(limit).all()
    # 直接返回 ORM 對象列表
    return transactions

# 新增一個輔助函數，用於在學生報名時創建交易
def create_transaction_for_enrollment(db: Session, transaction: models.TransactionCreate):
    # 直接使用 model_dump()，Pydantic ConfigDict 會處理
    # transaction.due_date 和 transaction.record_date 在 Pydantic 是 datetime
    # ORM 是 Date，這裡會自動轉換（只保留日期部分）
    db_transaction = models.TransactionORM(id=str(uuid.uuid4()), **transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def update_transaction(db: Session, transaction_id: str, transaction: models.TransactionUpdate):
    db_transaction = db.query(models.TransactionORM).filter(models.TransactionORM.id == transaction_id).first()
    if db_transaction:
        # 使用 model_dump(exclude_unset=True) 確保只更新提供的字段
        # Pydantic ConfigDict 會處理
        update_data = transaction.model_dump(exclude_unset=True)
        # 對於日期字段，需要額外處理，確保存儲到 ORM 時仍是 date
        if 'due_date' in update_data and isinstance(update_data['due_date'], datetime):
            update_data['due_date'] = update_data['due_date'].date()
        if 'record_date' in update_data and isinstance(update_data['record_date'], datetime):
            update_data['record_date'] = update_data['record_date'].date()

        for key, value in update_data.items():
            setattr(db_transaction, key, value)
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        # 直接返回 ORM 對象
        return db_transaction
    return None

def delete_transaction(db: Session, transaction_id: str):
    # 這裡不再物理刪除，改為邏輯刪除
    db_transaction = db.query(models.TransactionORM).filter(models.TransactionORM.id == transaction_id).first()
    if db_transaction:
        db_transaction.is_active = False # 標記為不活躍
        db.add(db_transaction)
        db.commit()
        return True
    return False