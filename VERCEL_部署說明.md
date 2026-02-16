# 補習班管理系統 — Vercel 部署說明

## 一、目前目錄結構（已調整為可正確部署後端）

```
cram_school/
├── vercel.json              # Vercel 設定（前後端同專案）
├── api/                     # ★ Vercel 後端入口（根目錄，確保會被打包）
│   ├── index.py             # 單一 Serverless 入口：設定 PYTHONPATH、轉發 /api → FastAPI
│   └── requirements.txt     # 與 backend 依賴一致，供 Vercel 建置用
├── backend/
│   ├── __init__.py
│   ├── database.py          # 資料庫連線（需 DATABASE_URL）
│   ├── models.py
│   ├── crud.py
│   ├── utils/
│   └── api/
│       ├── __init__.py
│       ├── index.py         # FastAPI 應用（由 api/index.py 載入）
│       └── requirements.txt
├── frontend/
│   ├── package.json
│   ├── public/
│   ├── src/
│   └── build/               # npm run build 輸出
└── ...
```

- **前端**：React（craco），建置後為靜態檔，適合 Vercel。
- **後端**：由 **根目錄 `api/index.py`** 作為 Vercel 的 Python 函數入口，內部 `import backend.api.index`，這樣 **整個 `backend/` 都會在部署包裡**，不會再出現「後端沒被打包」的問題。

---

## 二、可以部署在 Vercel 上嗎？**可以**

- 前端：**static build**（`frontend` 建置成靜態站）。
- 後端：**根目錄 `api/index.py`** 用 **@vercel/python** 建置，會載入 `backend` 套件，路由 `/api/*`、`/health` 都指到這支函數。

---

## 三、部署前需要確認的幾件事

### 1. 後端 Python 的「根目錄」與 import

- 你的程式用 `from backend.database import ...`，代表執行時 **專案根目錄** 必須在 Python path 裡。
- Vercel 預設會以 **專案根目錄** 當工作目錄並加入 path，所以多數情況下這樣可以跑。
- 若部署後出現 `ModuleNotFoundError: No module named 'backend'`，就要在 Vercel 的 **Build Command** 或 **環境變數** 裡設定 `PYTHONPATH=.`（或等價設定），讓 `backend` 能被找到。

### 2. `vercel.json` 路由與靜態檔

你目前的設定概念如下（節錄）：

- `builds`：一個建置 Python（`backend/api/index.py`），一個建置前端（`frontend` → `build`）。
- `routes`：`/api/(.*)`、`/health` → 後端；`/`、`/(.*)` → 前端。

要確認兩點：

- 前端建置完的輸出目錄要對：若 `npm run build --prefix frontend` 會產生 `frontend/build`，則 `outputDirectory` 應為 **`frontend/build`**（你目前是 `"build"`，若 Vercel 是從 repo 根目錄看，可能要改成 `frontend/build`，依實際建置結果調整）。
- 前端的 SPA：通常會有一條規則把「非 API、非靜態檔」都指到 `frontend/build/index.html`，讓 React Router 能正常運作（你已有 `"src":"/","dest":"/frontend/index.html"` 之類的設定，部署時若 404 再微調即可）。

### 3. 環境變數（必要）

在 Vercel 專案 **Settings → Environment Variables** 設定：

| 變數名稱        | 說明 |
|-----------------|------|
| `DATABASE_URL`  | 後端用的資料庫連線字串（例如 Supabase PostgreSQL）。 |
| `REACT_APP_BACKEND_API_URL` | 可選，你前端已用 `/api`，若沒設會用程式裡的預設 `/api`。 |

後端程式裡不要寫死 `DATABASE_URL`，一律用環境變數。

### 4. 資料庫

- 後端用 PostgreSQL（例如 Supabase），**Vercel 只負責跑程式**，不提供資料庫。
- 要確保 Supabase（或你用的 DB）允許 Vercel 的 Serverless 從外網連線（白名單 / 連線字串正確）。

---

## 四、簡短結論

| 項目           | 是否適合 Vercel |
|----------------|------------------|
| 目錄結構       | ✅ 可以，前後端分開、有 vercel.json |
| 前端（React）  | ✅ 很適合，靜態建置 |
| 後端（FastAPI）| ✅ 可以，以 Serverless 跑，需注意 PYTHONPATH 與 DATABASE_URL |
| 資料庫         | ⚠️ 需自備（如 Supabase），並在 Vercel 設好 `DATABASE_URL` |

所以：**你的目錄結構是可以部署在 Vercel 上的**；部署時只要注意上述幾點（尤其是 `DATABASE_URL`、必要時 `PYTHONPATH`、以及前端 `outputDirectory`），就可以順利上線。

若你願意，我可以根據你實際的 `vercel.json` 內容幫你改一版「可直接貼上用」的設定（含正確的 `outputDirectory` 與 SPA 路由）。
