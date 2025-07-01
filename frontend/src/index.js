// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';         // <-- 確保這行被註釋掉或刪除
import './output.css';          // <-- 確保是這行，且沒有錯誤
import App from './App';

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);