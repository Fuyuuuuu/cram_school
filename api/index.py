"""
Vercel 後端入口：讓整個 backend 套件被納入部署，並正確處理 /api 與 /health。
- 將專案根目錄加入 PYTHONPATH，確保可 import backend
- 把 /api/* 轉成後端實際路徑（例如 /api/students/ -> /students/）再交給 FastAPI
- 任何未捕獲錯誤都回傳 JSON 500，避免 Vercel 回傳 HTML 錯誤頁導致前端 JSON 解析失敗
"""
import os
import sys
import json

# 專案根目錄 = api 的上一層，讓「backend」套件可被 import
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from backend.api.index import app as backend_app


async def _send_json_error(send, status: int, detail: str):
    """以 ASGI 格式送出 JSON 錯誤回應。"""
    body = json.dumps({"detail": detail}).encode("utf-8")
    await send({
        "type": "http.response.start",
        "status": status,
        "headers": [[b"content-type", b"application/json; charset=utf-8"]],
    })
    await send({"type": "http.response.body", "body": body})


async def app(scope, receive, send):
    """ASGI 應用：路徑改寫後轉發給 FastAPI；例外時回傳 JSON 500。"""
    if scope.get("type") != "http":
        await backend_app(scope, receive, send)
        return

    path = scope.get("path", "")
    # Vercel 可能傳入 /api/classes/xxx，統一把 /api 前綴拿掉再交給 FastAPI
    if path.startswith("/api"):
        scope = dict(scope)
        scope["path"] = path[4:] or "/"

    try:
        await backend_app(scope, receive, send)
    except Exception as e:
        # 避免例外往上拋導致 Vercel 回傳 HTML 錯誤頁（前端會出現 "The deploy... is not valid JSON"）
        await _send_json_error(send, 500, f"後端錯誤: {str(e)}")
