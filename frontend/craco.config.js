// frontend/craco.config.js
module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),    // 在 PostCSS 處理流程中載入 Tailwind CSS
        require('autoprefixer'),   // 在 PostCSS 處理流程中載入 Autoprefixer
      ],
    },
  },
};