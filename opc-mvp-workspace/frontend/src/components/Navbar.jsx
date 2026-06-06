import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { color, space, fontSize, fontWeight } from '../styles/tokens';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const isLoggedIn = !!localStorage.getItem('accessToken');

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) { try { setUser(JSON.parse(raw)); } catch {} }
    else      { setUser(null); }
  }, [navigate, isLoggedIn]);

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
    navigate('/');
  };

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        {/* 左侧 Logo */}
        <div style={s.left}>
          <Link to="/" style={s.logo}>🤝 OPC 协作网络</Link>
        </div>

        {/* 右侧导航 */}
        <div style={s.right}>
          {isLoggedIn && (
            <>
              <Link to="/my-applications" style={s.link}>📋 我的申请</Link>
              <Link to="/publish"          style={s.btnPrimary}>＋ 发布 OPC</Link>
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
      </div>
    </nav>
  );
}

// -------- 样式 --------
const s = {
  nav: {
    backgroundColor: '#24292f',   // 保持 GitHub 暗色风格
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${space.md}px`,
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textDecoration: 'none',
    letterSpacing: '-0.3px',
    whiteSpace: 'nowrap',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: space.md,
  },
  link: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textDecoration: 'none',
    padding: `${space.xs}px ${space.sm}px`,
    borderRadius: '6px',
    transition: 'background-color 0.15s, color 0.15s',
  },
  btnPrimary: {
    backgroundColor: color.primary,
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textDecoration: 'none',
    padding: `${space.xs}px ${space.md}px`,
    borderRadius: '6px',
    transition: 'background-color 0.15s',
    whiteSpace: 'nowrap',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm,
  },
  username: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    padding: `${space.xs}px ${space.sm}px`,
    fontSize: fontSize.xs,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  loginBtn: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textDecoration: 'none',
    padding: `${space.xs}px ${space.sm}px`,
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.25)',
    transition: 'background-color 0.15s',
  },
};
