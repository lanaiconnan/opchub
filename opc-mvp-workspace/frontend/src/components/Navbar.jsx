import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { space, fontSize, fontWeight, useColors } from '../styles/tokens';
import { useTheme } from '../context/ThemeContext';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function Navbar() {
  const navigate    = useNavigate();
  const [user, setUser]   = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile     = useIsMobile();
  const isLoggedIn   = !!localStorage.getItem('accessToken');
  const color = useColors();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) { try { setUser(JSON.parse(raw)); } catch {} }
    else       { setUser(null); }
  }, [navigate, isLoggedIn]);

  const location = useLocation();
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    const rt = localStorage.getItem('refreshToken');
    if (rt) {
      fetch('/opc/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      }).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setMenuOpen(false);
    navigate('/');
  };

  // ------- 动态样式（依赖 color）---------
  const s = {
    nav: {
      backgroundColor: '#24292f',   // 导航栏始终深色（GitHub 风格）
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    },
    inner: {
      maxWidth: '1200px', margin: '0 auto',
      padding: '0 24px',
      height: '60px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
    },
    left: { display: 'flex', alignItems: 'center' },
    logo: {
      color: '#fff', fontSize: fontSize.xxxl, fontWeight: fontWeight.bold,
      textDecoration: 'none', letterSpacing: '-0.5px', whiteSpace: 'nowrap',
    },
    right: { display: 'flex', alignItems: 'center', gap: space.sm },
    // 桌面端链接
    desktopLinks: { display: 'flex', alignItems: 'center', gap: space.md },
    link: {
      color: 'rgba(255,255,255,0.85)', fontSize: fontSize.lg,
      fontWeight: fontWeight.medium, textDecoration: 'none',
      padding: `${space.xs}px ${space.sm}px`, borderRadius: '6px',
      transition: 'background-color 0.15s, color 0.15s',
    },
    btnPrimary: {
      backgroundColor: color.primary, color: '#fff',
      fontSize: fontSize.lg, fontWeight: fontWeight.semibold,
      textDecoration: 'none',
      padding: `${space.xs}px ${space.md}px`, borderRadius: '6px',
      transition: 'background-color 0.15s', whiteSpace: 'nowrap',
    },
    themeBtn: {
      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '6px', padding: `${space.xs}px ${space.sm}px`,
      cursor: 'pointer', fontSize: '16px', lineHeight: 1, color: '#fff',
      transition: 'background-color 0.15s',
    },
    userSection: { display: 'flex', alignItems: 'center', gap: space.sm },
    username: { color: 'rgba(255,255,255,0.9)', fontSize: fontSize.md, fontWeight: fontWeight.medium },
    logoutBtn: {
      backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '6px', padding: `${space.xs}px ${space.md}px`,
      fontSize: fontSize.md, cursor: 'pointer', transition: 'background-color 0.15s',
    },
    loginBtn: {
      color: 'rgba(255,255,255,0.9)', fontSize: fontSize.lg, fontWeight: fontWeight.medium,
      textDecoration: 'none', padding: `${space.xs}px ${space.sm}px`,
      borderRadius: '6px', border: '1px solid rgba(255,255,255,0.25)',
      transition: 'background-color 0.15s',
    },
    // 汉堡
    hamburger: {
      background: 'none', border: 'none', color: '#fff', fontSize: '24px',
      cursor: 'pointer', padding: space.sm, lineHeight: 1,
    },
    // 移动端菜单
    mobileMenu: {
      backgroundColor: '#2d333b', padding: `${space.sm}px ${space.md}px ${space.md}px`,
      display: 'flex', flexDirection: 'column', gap: space.sm,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    },
    mobileLink: {
      color: 'rgba(255,255,255,0.9)', fontSize: fontSize.md, fontWeight: fontWeight.medium,
      textDecoration: 'none', padding: `${space.sm}px ${space.sm}px`,
      borderRadius: '6px', transition: 'background-color 0.15s',
    },
    mobileUser: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.md, padding: `${space.xs}px ${space.sm}px` },
    mobileLogout: {
      backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '6px', padding: `${space.sm}px ${space.md}px`,
      fontSize: fontSize.md, cursor: 'pointer', textAlign: 'left',
    },
    mobileThemeBtn: {
      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '6px', padding: `${space.sm}px ${space.md}px`,
      cursor: 'pointer', fontSize: '16px', color: '#fff', textAlign: 'left',
    },
  };

  return (
    <nav style={s.nav}>
      <div style={s.inner}>

        {/* 左侧 Logo */}
        <div style={s.left}>
          <Link to="/" style={s.logo} onClick={() => setMenuOpen(false)}>
            🤝 Nexus
          </Link>
        </div>

        {/* 右侧 */}
        <div style={s.right}>
          {isMobile ? (
            <button onClick={() => setMenuOpen(o => !o)} style={s.hamburger}>
              {menuOpen ? '✕' : '☰'}
            </button>
          ) : (
            <div style={s.desktopLinks}>
              {/* 主题切换 */}
              <button onClick={toggle} style={s.themeBtn} title={isDark ? '切换到亮色' : '切换到暗色'}>
                {isDark ? '☀️' : '🌙'}
              </button>

              {isLoggedIn && (
                <>
                  <Link to="/my-applications" style={s.link} onClick={() => setMenuOpen(false)}>
                    📋 我的申请
                  </Link>
                  <Link to="/publish" style={s.btnPrimary}>
                    ＋ 发布项目
                  </Link>
                </>
              )}
              {isLoggedIn ? (
                <div style={s.userSection}>
                  <span style={s.username}>{user?.username || '用户'}</span>
                  <button onClick={handleLogout} style={s.logoutBtn}>登出</button>
                </div>
              ) : (
                <Link to="/login" style={s.loginBtn}>登录</Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {isMobile && menuOpen && (
        <div style={s.mobileMenu}>
          {/* 主题切换（移动端） */}
          <button onClick={toggle} style={s.mobileThemeBtn}>
            {isDark ? '☀️ 亮色模式' : '🌙 暗色模式'}
          </button>

          {isLoggedIn && (
            <>
              <Link to="/my-applications" style={s.mobileLink} onClick={() => setMenuOpen(false)}>
                📋 我的申请
              </Link>
              <Link to="/publish" style={s.mobileLink} onClick={() => setMenuOpen(false)}>
                ＋ 发布项目
              </Link>
            </>
          )}
          {isLoggedIn ? (
            <>
              <div style={s.mobileUser}>{user?.username || '用户'}</div>
              <button onClick={handleLogout} style={s.mobileLogout}>登出</button>
            </>
          ) : (
            <Link to="/login" style={s.mobileLink} onClick={() => setMenuOpen(false)}>
              登录
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
