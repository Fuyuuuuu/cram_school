// API 基礎 URL：本地開網頁時一律連 http://localhost:8000，部署後用 /api
function getApiBaseUrl() {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:8000';
    }
    return process.env.REACT_APP_BACKEND_API_URL || '/api';
}
const API_BASE_URL = getApiBaseUrl();

/**
 * 通用的 API 請求函數
 * @param {string} endpoint - API 路徑 (例如: '/students/')
 * @param {string} method - HTTP 方法 (例如: 'GET', 'POST', 'PUT', 'DELETE')
 * @param {object|null} data - 要發送的數據 (POST/PUT 請求)
 * @returns {Promise<any>} - 響應數據
 * @throws {Error} - 如果請求失敗
 */
const api = async (endpoint, method = 'GET', data = null) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        // 未來如果需要身份驗證，可以在這裡添加 Authorization header
        // 'Authorization': `Bearer ${localStorage.getItem('your_auth_token')}`,
    };

    const config = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        console.log(`Sending ${method} request to: ${url}`, data ? data : ''); // 調試訊息
        const response = await fetch(url, config);
        const contentType = response.headers.get('Content-Type') || '';
        const bodyText = await response.text();

        // #region agent log
        const bodyPreview = bodyText.length > 400 ? bodyText.slice(0, 400) + '...' : bodyText;
        fetch('http://127.0.0.1:7242/ingest/8621c8ca-91a6-47f0-8599-71a9cd265911', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'apiService.js:api', message: 'API response before JSON parse', data: { url, method, status: response.status, contentType, bodyPreview }, timestamp: Date.now(), hypothesisId: 'H1-H5' }) }).catch(() => {});
        // #endregion

        // 對於 204 No Content 響應，不嘗試解析 JSON
        if (response.status === 204) {
            console.log(`Received 204 No Content for ${url}`);
            return null;
        }

        let responseData;
        try {
            responseData = bodyText ? JSON.parse(bodyText) : null;
        } catch (parseErr) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8621c8ca-91a6-47f0-8599-71a9cd265911', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'apiService.js:api', message: 'JSON parse failed', data: { url, status: response.status, contentType, bodyPreview, parseError: String(parseErr.message) }, timestamp: Date.now(), hypothesisId: 'H5' }) }).catch(() => {});
            // #endregion
            throw new Error(`後端回傳非 JSON（${response.status}）: ${bodyPreview.slice(0, 80)}${bodyPreview.length > 80 ? '...' : ''}`);
        }

        if (!response.ok) {
            // 如果響應狀態碼不是 2xx，拋出錯誤
            let errorDetail = '未知錯誤'; // 默認為未知錯誤
            if (responseData.detail) {
                // 如果 detail 是一個陣列 (Pydantic 驗證錯誤常見)
                if (Array.isArray(responseData.detail)) {
                    // 將每個錯誤對象的 msg 字段提取出來並連接
                    errorDetail = responseData.detail.map(err => err.msg || JSON.stringify(err)).join('; ');
                } else if (typeof responseData.detail === 'string') {
                    errorDetail = responseData.detail;
                } else {
                    // 如果 detail 是單個對象，嘗試 JSON.stringify
                    errorDetail = JSON.stringify(responseData.detail);
                }
            } else if (responseData.message) {
                errorDetail = responseData.message;
            }
            
            console.error(`API Error for ${url}:`, response.status, errorDetail, responseData); // 打印完整的 responseData 以便調試
            throw new Error(`Error ${response.status}: ${errorDetail}`);
        }

        console.log(`Received response for ${url}:`, responseData);
        return responseData;

    } catch (error) {
        console.error(`API call to ${url} failed:`, error);
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            const isProd = process.env.NODE_ENV === 'production';
            throw new Error(
                isProd
                    ? '無法連線至後端，請確認網站已正確部署且後端 API 可存取。'
                    : '無法連線至後端，請確認後端已啟動（例如：在專案根目錄執行 uvicorn，port 8000）。'
            );
        }
        throw error;
    }
};

// 針對各個資源的 API 服務函數
export const studentApi = {
    getAll: () => api('/students/'),
    getById: (id) => api(`/students/${id}`),
    create: (studentData) => api('/students/', 'POST', studentData),
    update: (id, studentData) => api(`/students/${id}`, 'PUT', studentData),
    delete: (id) => api(`/students/${id}`, 'DELETE'),
};

export const classApi = {
    getAll: () => api('/classes/'),
    getById: (id) => api(`/classes/${id}`),
    create: (classData) => api('/classes/', 'POST', classData),
    update: (id, classData) => api(`/classes/${id}`, 'PUT', classData),
    delete: (id) => api(`/classes/${id}`, 'DELETE'),
};

export const sessionApi = {
    getAll: (classId = null, sessionDate = null) => {
        let queryString = '';
        if (classId) queryString += `class_id=${classId}`;
        // sessionDate 這裡期望 'YYYY-MM-DD' 格式
        if (sessionDate) queryString += `${queryString ? '&' : ''}session_date=${sessionDate}`;
        return api(`/sessions/${queryString ? '?' + queryString : ''}`);
    },
    getById: (id) => api(`/sessions/${id}`),
    create: (sessionData) => api('/sessions/', 'POST', sessionData),
    update: (id, sessionData) => api(`/sessions/${id}`, 'PUT', sessionData),
    delete: (id) => api(`/sessions/${id}`, 'DELETE'),
};

export const transactionApi = {
    getAll: (studentId = null) => {
        let queryString = '';
        if (studentId) queryString += `student_id=${studentId}`;
        return api(`/transactions/${queryString ? '?' + queryString : ''}`);
    },
    getById: (id) => api(`/transactions/${id}`),
    create: (transactionData) => api('/transactions/', 'POST', transactionData), // 這個方法用於學生報名時創建具體交易
    update: (id, transactionData) => api(`/transactions/${id}`, 'PUT', transactionData),
    delete: (id) => api(`/transactions/${id}`, 'DELETE'), // 這裡其實是邏輯刪除
};

// 健康檢查 API (為了測試後端連線)
export const healthApi = {
    check: () => api('/health'),
};