import { useState, useEffect, useCallback } from 'react';

console.log('%c[ThemeContext] NEW VERSION LOADED', 'color: #3fb950; font-weight: bold; font-size: 14px;');

const LIGHT = {
  primary: '#2ea44f', primaryHover: '#218838', primaryLight: '#dafbe4',
  bg: '#f6f8fa', surface: '#ffffff', border: '#d0d7de',
  textPrimary: '#1f2328', textSecondary: '#656d76', textMuted: '#8b949e',
  gray0: '#ffffff', gray1: '#f6f8fa', gray2: '#eaeef2', gray3: '#d0d7de',
  gray4: '#8b949e', gray5: '#656d76', gray6: '#1f2328',
  danger: '#cf222e', dangerLight: '#ffebe9',
  warning: '#bc4c00', warningLight: '#fff8f0',
  info: '#0969da', infoLight: '#ddf4ff',
};

const DARK = {
  primary: '#3fb950', primaryHover: '#2ea44f', primaryLight: '#0d2917',
  bg: '#0d1117', surface: '#161b22', border: '#30363d',
  textPrimary: '#e6edf3', textSecondary: '#8b949e', textMuted: '#6e7681',
  gray0: '#0d1117', gray1: '#161b22', gray2: '#21262d', gray3: '#30363d',
  gray4: '#8b949e', gray5: '#c9d1d9', gray6: '#e6edf3',
  danger: '#f85149', dangerLight: '#2d0a0e',
  warning: '#d29922', warningLight: '#2a2013',
  info: '#58a6ff', infoLight: '#0c1e2e',
};

// 简单状态广播（替代 React Context）
let _theme = localStorage.getItem('opc-theme') || 'light';
let _listeners = [];
const _emit = () => _listeners.forEach(fn => fn());

export function toggleTheme() {
  _theme = _theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('opc-theme', _theme);
  document.documentElement.dataset.theme = _theme;
  // 注入 CSS 变量
  const c = _theme === 'dark' ? DARK : LIGHT;
  Object.entries(c).forEach(([k, v]) => document.documentElement.style.setProperty(`--color-${k}`, v));
  document.body.style.backgroundColor = c.bg;
  document.body.style.color = c.textPrimary;
  _emit();
}

export function getTheme() { return _theme; }
export function getColors() { return _theme === 'dark' ? DARK : LIGHT; }

// 在入口处初始化一次 CSS 变量（避免 FOUT）
if (typeof document !== 'undefined') {
  const c = _theme === 'dark' ? DARK : LIGHT;
  document.documentElement.dataset.theme = _theme;
  Object.entries(c).forEach(([k, v]) => document.documentElement.style.setProperty(`--color-${k}`, v));
}

// ------- React Hook -------
export function useTheme() {
  const [theme, setTheme] = useState(() => getTheme());
  const [colors, setColors] = useState(() => getColors());

  useEffect(() => {
    const fn = () => {
      setTheme(getTheme());
      setColors(getColors());
    };
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(f => f !== fn); };
  }, []);

  const toggle = useCallback(() => toggleTheme(), []);
  return { theme, colors, toggle };
}
