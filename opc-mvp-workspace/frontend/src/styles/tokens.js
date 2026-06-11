/**
 * 全局设计 Token
 * space / fontSize / fontWeight / radius / shadow / containerStyle 为常量
 * useColors = useTheme，从 ThemeContext.jsx 导出
 */
export { useTheme as useColors } from '../context/ThemeContext';

export const space = {
  xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '20px',
  xxl: '24px', xxxl: '32px', huge: '48px',
};

export const fontSize = {
  xs: '12px', sm: '13px', base: '15px', md: '16px',
  lg: '18px', xl: '20px', xxl: '22px', xxxl: '28px',
  hero: '36px',
};

export const fontWeight = {
  normal: 400, medium: 500, semibold: 600, bold: 700,
};

export const radius = {
  sm: '8px', md: '10px', lg: '12px', xl: '16px', full: '9999px',
};

export const shadow = {
  sm: '0 1px 2px rgba(0,0,0,.06)',
  md: '0 3px 6px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.06)',
  card: '0 2px 8px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.06)',
  cardHover: '0 6px 16px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.08)',
  modal: '0 12px 32px rgba(0,0,0,.15)',
  lg: '0 8px 16px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.06)',
  xl: '0 12px 32px rgba(0,0,0,.12)',
};

export const containerStyle = {
  maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
};
