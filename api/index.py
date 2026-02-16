"""
Vercel 後端入口：讓整個 backend 套件被納入部署，並正確處理 /api 與 /health。
- 將專案根目錄加入 PYTHONPATH，確保可 import backend
- 把 /api/* 轉成後端實際路徑（例如 /api/students/ -> /students/）再交給 FastAPI
"""
import os
import sys

# 專案根目錄 = api 的上一層，讓「backend」套件可被 import
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from backend.api.index import app as backend_app


async def app(scope, receive, send):
    """ASGI 應用：路徑改寫後轉發給 FastAPI。"""
    if scope.get("type") == "http" and scope.get("path", "").startswith("/api"):
        scope = dict(scope)
        path = scope["path"][4:] or "/"   # /api/students/ -> /students/，/api -> /
        scope["path"] = path
    await backend_app(scope, receive, send)
