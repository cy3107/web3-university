/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe', 
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#409eff', // Element UI 主色
          600: '#337ecc',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#f0fdf4',
          500: '#67c23a', // Element UI 成功色
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#e6a23c', // Element UI 警告色
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          500: '#f56c6c', // Element UI 危险色
          600: '#dc2626',
        },
        info: {
          50: '#f8fafc',
          500: '#909399', // Element UI 信息色
          600: '#475569',
        }
      }
    },
  },
  plugins: [],
}