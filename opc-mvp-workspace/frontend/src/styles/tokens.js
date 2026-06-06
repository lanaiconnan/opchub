/**
 * 全局设计 Token
 * 所有页面必须从这里引用颜色和间距，禁止写死。
 */

export const color = {
  // 品牌色
  primary:      '#2ea44f',
  primaryHover: '#218838',
  primaryLight: '#dafbe4',
  primaryDark:  '#116329',

  // 中性色
  gray0:  '#ffffff',
  gray1:  '#f6f8fa',
  gray2:  '#eaeef2',
  gray3:  '#d0d7de',
  gray4:  '#8b949e',
  gray5:  '#656d76',
  gray6:  '#1f2328',

  // 功能色
  danger:      '#cf222e',
  dangerLight: '#ffebe9',
  warning:     '#bc4c00',
  warningLight:'#fff8f0',
  info:        '#0969da',
  infoLight:   '#ddf4ff',

  // 语义别名
  bg:          '#f6f8fa',
  surface:     '#ffffff',
  border:      '#d0d7de',
  textPrimary: '#1f2328',
  textSecondary:'#656d76',
  textMuted:   '#8b949e',
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl:24,
  xxxl:32,
  section:40,
  page:60,
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs:  '11px',
  sm:  '12px',
  md:  '13px',
  base: '14px',
  lg:  '16px',
  xl:  '18px',
  xxl: '20px',
  hero:'24px',
};

export const fontWeight = {
  regular: 400,
  medium:  500,
  semibold:600,
  bold:    700,
};

export const shadow = {
  card:  '0 1px 3px rgba(31,35,40,0.08), 0 1px 2px rgba(31,35,40,0.04)',
  cardHover: '0 3px 8px rgba(31,35,40,0.12), 0 1px 4px rgba(31,35,40,0.06)',
  modal:  '0 8px 32px rgba(31,35,40,0.24)',
};

export const breakpoint = {
  sm: '480px',
  md: '768px',
  lg: '1024px',
};

/**
 * 通用容器 style（替换所有页面的 maxWidth: 800px）
 * 用法：style={{ ...containerStyle }}
 */
export const containerStyle = {
  width: '100%',
  maxWidth: '960px',
  margin: '0 auto',
  padding: `0 ${space.md}px`,
  boxSizing: 'border-box',
};

/**
 * 响应式：在 < 768px 时调整 padding
 * 用法：在组件中用 useEffect + window.innerWidth 动态切换，
 * 或直接用 CSS media query（见下面 export）。
 */

export const responsive = {
  // 在组件 style 里判断 window.innerWidth < 768 时使用
  mobilePadding: `${space.sm}px`,
  desktopPadding: `${space.md}px`,
};
