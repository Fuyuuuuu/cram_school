// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // content 陣列是關鍵！它告訴 Tailwind 掃描這些檔案來尋找使用的 CSS 類別。
  // 請確保這些路徑涵蓋了你所有寫 Tailwind class 的 .js/.jsx/.ts/.tsx 檔案。
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // 掃描 src/ 目錄下的所有 js/jsx/ts/tsx 檔案
    "./public/index.html",         // 掃描 public/index.html
  ],
  theme: {
    extend: {}, // 可以在這裡擴展 Tailwind 的預設主題
  },
  plugins: [], // 可以在這裡添加 Tailwind 插件
}