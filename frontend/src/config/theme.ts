// Element UI 主题色彩配置
export const theme = {
  colors: {
    // 主色调 - Element UI 蓝色系
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
      DEFAULT: '#409eff',
    },
    
    // 成功色 - Element UI 绿色系
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#67c23a', // Element UI 成功色
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      DEFAULT: '#67c23a',
    },
    
    // 警告色 - Element UI 橙色系
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#e6a23c', // Element UI 警告色
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      DEFAULT: '#e6a23c',
    },
    
    // 危险色 - Element UI 红色系
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#f56c6c', // Element UI 危险色
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      DEFAULT: '#f56c6c',
    },
    
    // 信息色 - Element UI 灰色系
    info: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#909399', // Element UI 信息色
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      DEFAULT: '#909399',
    },
    
    // 文本色
    text: {
      primary: '#303133',
      regular: '#606266',
      secondary: '#909399',
      placeholder: '#c0c4cc',
      disabled: '#c0c4cc',
    },
    
    // 边框色
    border: {
      base: '#dcdfe6',
      light: '#e4e7ed',
      lighter: '#ebeef5',
      extraLight: '#f2f6fc',
    },
    
    // 背景色
    background: {
      base: '#f5f7fa',
      page: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
    }
  },
  
  // 阴影
  shadows: {
    base: '0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04)',
    light: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
    heavy: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
  },
  
  // 边框圆角
  borderRadius: {
    base: '4px',
    small: '2px',
    round: '20px',
    circle: '50%',
  },
  
  // 字体大小
  fontSize: {
    extraLarge: '20px',
    large: '18px',
    medium: '16px',
    base: '14px',
    small: '13px',
    mini: '12px',
  },
  
  // 间距
  spacing: {
    mini: '4px',
    small: '8px',
    base: '12px',
    medium: '16px',
    large: '20px',
    extraLarge: '24px',
  },
  
  // 组件尺寸
  size: {
    mini: '24px',
    small: '32px',
    medium: '40px',
    large: '48px',
  },
  
  // 断点
  breakpoints: {
    xs: '480px',
    sm: '768px',
    md: '992px',
    lg: '1200px',
    xl: '1920px',
  },
  
  // Z-index 层级
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
  
  // 动画时长
  transition: {
    base: '0.3s',
    fast: '0.2s',
    slow: '0.5s',
  },
} as const

// 导出类型
export type Theme = typeof theme
export type ThemeColors = typeof theme.colors