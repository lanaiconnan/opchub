import { useState, useEffect } from 'react';

/**
 * 响应式断点 Hook
 * @param {string} query - CSS media query字符串，如 '(max-width: 768px)'
 * @returns {boolean}
 *
 * 预设断点（配合 tokens.breakpoint 使用）：
 *   isMobile:  '(max-width: 768px)'
 *   isSmall:  '(max-width: 480px)'
 *   isDesktop:'(min-width: 1024px)'
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    setMatches(mql.matches); // 初始化（SSR 安全）
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// 预设断点 hooks
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsSmall() {
  return useMediaQuery('(max-width: 480px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}
