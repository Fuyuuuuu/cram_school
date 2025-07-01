import os
from dotenv import load_dotenv

# load_dotenv() # 在生產環境中，Vercel 等會自動注入環境變數，本地開發時才需要這行

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 從環境變數中獲取資料庫 URL
# 在實際部署時，Vercel 會透過環境變數注入這個值
# 對於 Supabase，它通常會提供一個類似於 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres' 的連接字串

DATABASE_URL = os.getenv("DATABASE_URL")

# 如果 DATABASE_URL 未設定（例如在本地開發環境，且未從 .env 檔案加載），
# 則使用一個預設的 Supabase PostgreSQL 連接字串作為預留
if not DATABASE_URL:
    print("Warning: DATABASE_URL environment variable is not set. Using a placeholder for local development.")
    # 將下方這行替換為你的 Supabase Session Pooler 連接字串 (已包含密碼和完整用戶名)
    # 注意：使用 6543 端口通常是 Supabase 的 Session Pooler 端口
    DATABASE_URL = "postgresql://postgres.oenzbqqywgaebnykazxb:1D2ws3e5gdfsca@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"

# 創建 SQLAlchemy 引擎
# pool_pre_ping=True 是一個很好的實踐，可以防止閒置連線斷開
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# 創建 SessionLocal 類別
# autocommit=False: 不會自動提交，需要手動 commit
# autoflush=False: 不會自動把操作刷寫到資料庫，需要手動 flush
# bind=engine: 將 SessionLocal 與我們的 engine 綁定
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 聲明一個基礎類別，所有 SQLAlchemy ORM 模型都會繼承它
Base = declarative_base()

# 依賴注入的工具函數
# 每次請求時都會調用這個函數，並在請求結束後關閉資料庫會話
def get_db():
    db = SessionLocal()
    try:
        yield db # 使用 yield 讓這個函數變成一個生成器，FastAPI 會自動處理上下文
    finally:
        db.close() # 確保資料庫連線被關閉

# 建議：在 main.py 或一個啟動腳本中，調用 Base.metadata.create_all(engine)
# 確保在應用啟動時，如果表不存在則創建表。
# 但對於 Supabase，你通常會手動或通過 Supabase 的工具創建表，所以這行可能不是必需的。
# from . import models
# models.Base.metadata.create_all(bind=engine)