print("FastAPI application is starting up in Vercel environment...") # <-- Add this line at the very top


from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from datetime import date, datetime

# 修改這裡的導入方式，改為絕對導入
# 假設 Vercel 的 pythonPath 配置會將 'backend' 目錄添加到 PYTHONPATH
# 這樣可以直接導入 'database', 'models', 'crud'
from database import SessionLocal, engine, get_db, Base
from models import (
    StudentInDB, StudentCreate, StudentUpdate,
    ClassInDB, ClassCreate, ClassUpdate,
    SessionInDB, SessionCreate, SessionUpdate,
    TransactionInDB, TransactionCreate, TransactionUpdate
)
from crud import (
    create_student, get_student, get_students, update_student, delete_student,
    create_class, get_class, get_classes, update_class, delete_class,
    create_session, get_session, get_sessions_by_class, get_sessions_by_date, get_all_sessions, update_session, delete_session,
    create_transaction_for_enrollment, get_transaction, get_transactions_by_student, get_all_transactions, update_transaction, delete_transaction
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
        # 嘗試創建所有定義在 Base 中的 ORM 模型對應的資料庫表
        # 如果表已存在，這個操作不會有影響
        Base.metadata.create_all(bind=engine)
        print("Database tables created or already exist.")
    except Exception as e:
        print(f"Error during database table creation on startup: {e}")
    finally:
        db.close() # 確保會話關閉

# 配置 CORS 允許前端應用程式訪問後端
origins = [
    "http://localhost:3000", # 你的 React 開發伺服器地址 (如果使用 Create React App)
    "http://localhost:5173", # 如果你使用 Vite 開發 React
    "http://localhost",
    "http://localhost:*",
    "https://your-frontend-vercel-app.vercel.app", # 替換成你實際的 Vercel 前端域名
    # 更多生產環境的域名，例如 Vercel 自動生成的預覽域名
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
    db_student = create_student(db=db, student=student)
    return db_student # 直接返回 ORM 對象，Pydantic 將自動序列化

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
    db_student = update_student(db, student_id=student_id, student=student)
    if db_student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return db_student # 直接返回 ORM 對象

@app.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: str, db: Session = Depends(get_db)):
    success = delete_student(db, student_id=student_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found or could not be deleted")
    return # 204 No Content 響應不包含消息體，所以直接 return

# --- 課程相關 API 端點 ---
@app.post("/classes/", response_model=ClassInDB, status_code=status.HTTP_201_CREATED)
def create_class(cls: ClassCreate, db: Session = Depends(get_db)):
    db_class = create_class(db=db, cls=cls)
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
    db_class = update_class(db, class_id=class_id, cls=cls)
    if db_class is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
    return db_class # 直接返回 ORM 對象

@app.delete("/classes/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(class_id: str, db: Session = Depends(get_db)):
    success = delete_class(db, class_id=class_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found or could not be deleted")
    return # 204 No Content 響應不包含消息體

# --- 會話相關 API 端點 ---
@app.post("/sessions/", response_model=SessionInDB, status_code=status.HTTP_201_CREATED)
def create_session(session: SessionCreate, db: Session = Depends(get_db)):
    db_session = create_session(db=db, session=session)
    return db_session

@app.get("/sessions/", response_model=List[SessionInDB])
def read_sessions(
    class_id: Optional[str] = None,
    session_date: Optional[date] = None, # 這裡的類型仍是 date
    skip: int = 0, limit: int = 10000000, db: Session = Depends(get_db)):
    if class_id:
        sessions = get_sessions_by_class(db, class_id=class_id)
    elif session_date:
        sessions = get_sessions_by_date(db, session_date=session_date)
    else:
        sessions = get_all_sessions(db, skip=skip, limit=limit)
    return sessions

@app.get("/sessions/{session_id}", response_model=SessionInDB)
def read_session(session_id: str, db: Session = Depends(get_db)):
    db_session = get_session(db, session_id=session_id)
    if db_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return db_session

@app.put("/sessions/{session_id}", response_model=SessionInDB)
def update_session(session_id: str, session: SessionUpdate, db: Session = Depends(get_db)):
    db_session = update_session(db, session_id=session_id, session=session)
    if db_session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return db_session

@app.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: str, db: Session = Depends(get_db)):
    success = delete_session(db, session_id=session_id)
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
    db_transaction = update_transaction(db, transaction_id=transaction_id, transaction=transaction)
    if db_transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return db_transaction

@app.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: str, db: Session = Depends(get_db)):
    success = delete_transaction(db, transaction_id=transaction_id)
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
