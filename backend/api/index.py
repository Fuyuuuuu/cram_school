from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from datetime import date, datetime

from backend.database import SessionLocal, engine, get_db, Base
from backend.models import (
    StudentInDB, StudentCreate, StudentUpdate,
    ClassInDB, ClassCreate, ClassUpdate,
    SessionInDB, SessionCreate, SessionUpdate,
    TransactionInDB, TransactionCreate, TransactionUpdate
)
from backend.crud import (
    create_student as crud_create_student,
    get_student,
    get_students,
    update_student as crud_update_student,
    delete_student as crud_delete_student,
    create_class as crud_create_class,
    get_class,
    get_classes,
    update_class as crud_update_class,
    delete_class as crud_delete_class,
    create_session as crud_create_session,
    get_session,
    get_sessions_by_class,
    get_sessions_by_date,
    get_all_sessions,
    update_session as crud_update_session,
    delete_session as crud_delete_session,
    create_transaction_for_enrollment,
    get_transaction,
    get_transactions_by_student,
    get_all_transactions,
    update_transaction as crud_update_transaction,
    delete_transaction as crud_delete_transaction,
)

app = FastAPI(
    title="補習班管理系統 API",
    description="提供學生、課程、點名、財務等管理功能。",
    version="1.0.0",
)

@app.on_event("startup") # FastAPI 啟動事件
async def startup_event():
    print("Running database table creation on startup...")
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created or already exist.")
        # 若資料庫中 students 表仍有舊欄位 current_class (NOT NULL)，會導致新增學生 500，刪除該欄位與 ORM 一致
        try:
            db.execute(text("ALTER TABLE students DROP COLUMN IF EXISTS current_class"))
            db.commit()
            print("Dropped legacy column students.current_class if present.")
        except Exception as alter_e:
            db.rollback()
            print("Note: could not drop current_class (may already be gone):", alter_e)
    except Exception as e:
        print(f"Error during database table creation on startup: {e}")
    finally:
        db.close()

# 配置 CORS 允許前端應用程式訪問後端
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://localhost",
    "https://your-frontend-vercel-app.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # 允許所有 HTTP 方法
    allow_headers=["*"], # 允許所有請求頭
)

# --- 學生相關 API 端點 ---
@app.post("/students/", response_model=StudentInDB, status_code=status.HTTP_201_CREATED)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    db_student = crud_create_student(db=db, student=student)
    return db_student  # 直接返回 ORM 對象，Pydantic 將自動序列化

@app.get("/students/", response_model=List[StudentInDB])
def read_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    students = get_students(db, skip=skip, limit=limit)
    return students # 直接返回 ORM 對象列表

@app.get("/students/{student_id}", response_model=StudentInDB)
def read_student(student_id: str, db: Session = Depends(get_db)):
    db_student = get_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return db_student # 直接返回 ORM 對象

@app.put("/students/{student_id}", response_model=StudentInDB)
def update_student(student_id: str, student: StudentUpdate, db: Session = Depends(get_db)):
    db_student = crud_update_student(db, student_id=student_id, student=student)
    if db_student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return db_student # 直接返回 ORM 對象

@app.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: str, db: Session = Depends(get_db)):
    success = crud_delete_student(db, student_id=student_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found or could not be deleted")
    return # 204 No Content 響應不包含消息體，所以直接 return

# --- 課程相關 API 端點 ---
@app.post("/classes/", response_model=ClassInDB, status_code=status.HTTP_201_CREATED)
def create_class(cls: ClassCreate, db: Session = Depends(get_db)):
    db_class = crud_create_class(db=db, cls=cls)
    return db_class # 直接返回 ORM 對象

@app.get("/classes/", response_model=List[ClassInDB])
def read_classes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    classes = get_classes(db, skip=skip, limit=limit)
    return classes # 直接返回 ORM 對象列表

@app.get("/classes/{class_id}", response_model=ClassInDB)
def read_class(class_id: str, db: Session = Depends(get_db)):
    db_class = get_class(db, class_id=class_id)
    if db_class is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    return db_class # 直接返回 ORM 對象

@app.put("/classes/{class_id}", response_model=ClassInDB)
def update_class(class_id: str, cls: ClassUpdate, db: Session = Depends(get_db)):
    db_class = crud_update_class(db, class_id=class_id, cls=cls)
    if db_class is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    return db_class # 直接返回 ORM 對象

@app.delete("/classes/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(class_id: str, db: Session = Depends(get_db)):
    success = crud_delete_class(db, class_id=class_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found or could not be deleted")
    return # 204 No Content 響應不包含消息體

# --- 會話相關 API 端點 ---
@app.post("/sessions/", response_model=SessionInDB, status_code=status.HTTP_201_CREATED)
def create_session(session: SessionCreate, db: Session = Depends(get_db)):
    db_session = crud_create_session(db=db, session=session)
    return db_session

@app.get("/sessions/")
def read_sessions(
    class_id: Optional[str] = None,
    session_date: Optional[date] = None,
    skip: int = 0, limit: int = 10000000, db: Session = Depends(get_db)):
    try:
        if class_id:
            sessions = get_sessions_by_class(db, class_id=class_id)
        elif session_date:
            sessions = get_sessions_by_date(db, session_date=session_date)
        else:
            sessions = get_all_sessions(db, skip=skip, limit=limit)
        def to_item(s):
            d = getattr(s, "date", None)
            date_str = d.isoformat() if d and hasattr(d, "isoformat") else (str(d) if d else "")
            return {
                "id": str(s.id),
                "class_id": str(s.class_id),
                "date": date_str,
                "actual_teacher": s.actual_teacher or None,
                "attendance": list(s.attendance) if s.attendance else [],
                "is_postponed": bool(s.is_postponed),
            }
        return [to_item(s) for s in sessions]
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(tb)
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"detail": str(e), "traceback": tb})

@app.get("/sessions/{session_id}", response_model=SessionInDB)
def read_session(session_id: str, db: Session = Depends(get_db)):
    db_session = get_session(db, session_id=session_id)
    if db_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return db_session

@app.put("/sessions/{session_id}", response_model=SessionInDB)
def update_session(session_id: str, session: SessionUpdate, db: Session = Depends(get_db)):
    db_session = crud_update_session(db, session_id=session_id, session=session)
    if db_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return db_session

@app.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: str, db: Session = Depends(get_db)):
    success = crud_delete_session(db, session_id=session_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found or could not be deleted")
    return # 204 No Content 響應不包含消息體

# --- 交易相關 API 端點 ---
@app.post("/transactions/", response_model=TransactionInDB, status_code=status.HTTP_201_CREATED)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    # 這個端點將主要用於處理學生報名時生成交易
    db_transaction = create_transaction_for_enrollment(db=db, transaction=transaction)
    return db_transaction

@app.get("/transactions/", response_model=List[TransactionInDB])
def read_transactions(
    student_id: Optional[str] = None,
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    if student_id:
        transactions = get_transactions_by_student(db, student_id=student_id)
    else:
        transactions = get_all_transactions(db, skip=skip, limit=limit)
    return transactions

@app.get("/transactions/{transaction_id}", response_model=TransactionInDB)
def read_transaction(transaction_id: str, db: Session = Depends(get_db)):
    db_transaction = get_transaction(db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return db_transaction

@app.put("/transactions/{transaction_id}", response_model=TransactionInDB)
def update_transaction(transaction_id: str, transaction: TransactionUpdate, db: Session = Depends(get_db)):
    db_transaction = crud_update_transaction(db, transaction_id=transaction_id, transaction=transaction)
    if db_transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return db_transaction

@app.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: str, db: Session = Depends(get_db)):
    success = crud_delete_transaction(db, transaction_id=transaction_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found or could not be deleted")
    return # 204 No Content 響應不包含消息體

# --- 健康檢查端點 (Health Check Endpoint) ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Tuition Management System API (FastAPI backend)."}

@app.get("/health")
def health_check():
    """Simple health check endpoint."""
    try:
        db = SessionLocal()
        # 嘗試執行一個簡單的查詢來測試資料庫連線
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database_connection": "successful", "message": "FastAPI backend is running and connected to DB!"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database connection failed: {e}")
    finally:
        db.close() # 確保會話關閉
