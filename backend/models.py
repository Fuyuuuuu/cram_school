# backend/models.py

from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, Boolean

# 用於 Session 的日期型別（欄位名為 date，避免與型別 date 衝突）
DateType = date
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import relationship

from .database import Base

# --- Pydantic 模型 ---

class AttendanceBase(BaseModel):
    student_id: str = Field(..., description="學生的唯一ID")
    status: str = Field(..., description="出缺席狀態 (e.g., '已到', '未到', '請假', '順延')")

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(AttendanceBase):
    pass

class AttendanceInDB(AttendanceBase):
    pass

class SessionBase(BaseModel):
    class_id: str = Field(..., description="所屬課程的ID")
    date: DateType = Field(..., description="會話日期 (YYYY-MM-DD)")  # 與 DB Date 一致，避免序列化 500
    actual_teacher: Optional[str] = Field(None, description="實際授課老師 (如果與主課老師不同)")
    attendance: List['AttendanceInDB'] = Field([], description="點名記錄列表")
    is_postponed: bool = Field(False, description="此會話是否被順延")

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )

class SessionCreate(SessionBase):
    pass

class SessionUpdate(SessionBase):
    pass

class SessionInDB(SessionBase):
    id: str = Field(..., description="會話的唯一ID，由後端生成")


class StudentBase(BaseModel):
    name: str = Field(..., max_length=100, description="學生姓名")
    age: int = Field(..., gt=0, description="學生年齡")
    grade: str = Field(..., max_length=50, description="學生年級")
    school: str = Field(..., max_length=100, description="就讀學校")
    phone: str = Field(..., max_length=20, description="聯絡電話")
    dob: date = Field(..., description="出生日期 (YYYY-MM-DD)")
    # current_class: str = Field(..., max_length=100, description="目前班級") # <-- 移除此行

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_encoders={date: lambda v: v.isoformat()}
    )

class StudentCreate(StudentBase):
    pass
    
class StudentUpdate(StudentBase):
    pass

class StudentInDB(StudentBase):
    id: str = Field(..., description="學生的唯一ID，由後端生成")


class ClassBase(BaseModel):
    name: str = Field(..., max_length=100, description="課程名稱")
    main_teacher: str = Field(..., max_length=50, description="主課老師姓名")
    description: Optional[str] = Field(None, description="課程內容說明")
    
    start_date: date = Field(..., description="課程開始日期 (YYYY-MM-DD)")
    end_date: date = Field(..., description="課程結束日期 (YYYY-MM-DD)")
    
    days_of_week: List[int] = Field(..., description="上課星期 (0=星期日, 6=星期六)")
    total_sessions: int = Field(..., gt=0, description="課程總堂數")
    price: float = Field(..., gt=0, description="課程學費金額")
    
    payment_frequency: str = Field("monthly", description="繳費頻率 (e.g., 'monthly', 'total')")
    payment_installments: int = Field(..., gt=0, description="繳費期數")
    
    enrolled_students: List[str] = Field(default_factory=list, description="已報名學生的ID列表")
    substitute_teacher: Optional[str] = Field(None, description="代課老師姓名")

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_encoders={date: lambda v: v.isoformat()}
    )

class ClassCreate(ClassBase):
    pass

class ClassUpdate(ClassBase):
    pass

class ClassInDB(ClassBase):
    id: str = Field(..., description="課程的唯一ID，由後端生成")


class TransactionBase(BaseModel):
    due_date: datetime = Field(..., description="繳費到期日期 (YYYY-MM-DD)")
    record_date: Optional[datetime] = Field(None, description="實際收款日期 (YYYY-MM-DD)")

    student_id: Optional[str] = Field(None, description="繳費學生的ID")
    class_id: str = Field(..., description="所屬課程的ID")
    amount: float = Field(..., gt=0, description="交易金額")
    description: str = Field(..., max_length=200, description="交易描述")
    payment_term: str = Field(..., description="繳費項目類型 (e.g., '按月繳費', '課程總價')")
    status: str = Field(..., description="繳費狀態 (e.g., '已繳費', '未繳費')")
    installment: int = Field(..., gt=0, description="繳費期數")

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        json_encoders={datetime: lambda v: v.isoformat()}
    )

class TransactionCreate(TransactionBase):
    student_id: str = Field(..., description="繳費學生的ID")
    pass

class TransactionUpdate(TransactionBase):
    pass

class TransactionInDB(TransactionBase):
    id: str = Field(..., description="交易的唯一ID，由後端生成")
    is_active: bool = Field(True, description="交易是否活躍 (用於邏輯刪除)")


# --- SQLAlchemy ORM 模型 ---

class StudentORM(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    grade = Column(String(50), nullable=False)
    school = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    dob = Column(Date, nullable=False)
    # current_class = Column(String(100), nullable=False) # <-- 移除此行

class ClassORM(Base):
    __tablename__ = "classes"
    id = Column(String, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    main_teacher = Column(String(50), nullable=False)
    description = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    days_of_week = Column(ARRAY(Integer), nullable=False)
    total_sessions = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    payment_frequency = Column(String(20), nullable=False)
    payment_installments = Column(Integer, nullable=False)
    enrolled_students = Column(ARRAY(String), nullable=False, default=[])
    substitute_teacher = Column(String(50), nullable=True)

class SessionORM(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, index=True)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    date = Column(Date, nullable=False)
    actual_teacher = Column(String(50), nullable=True)
    attendance = Column(JSONB, nullable=False, default=[])
    is_postponed = Column(Boolean, default=False, nullable=False)

class TransactionORM(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=False)
    due_date = Column(Date, nullable=False)
    payment_term = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False)
    record_date = Column(Date, nullable=True)
    installment = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)