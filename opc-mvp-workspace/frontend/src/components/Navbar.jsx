import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { space, fontSize, fontWeight, useColors } from '../styles/tokens';
import { useTheme } from '../context/ThemeContext';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const color = useColors();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) { try { setUser(JSON.parse(raw)); } catch {} }
    else { setUser(null); }
  }, [navigate, isLoggedIn]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // 从 URL 参数同步搜索词
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('q')) setSearchQuery(params.get('q'));
  }, [location.search]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
    setMenuOpen(false);
  };

  const navBg = '#24292f';
  const navLink = 'rgba(255,255,255,0.85)';

  return (
    <nav style={{
      backgroundColor: navBg,
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
        height: '60px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: space.md,
      }}>

        {/* 左侧 Logo */}
        <Link to="/" style={{
          color: '#fff', fontSize: fontSize.xxxl, fontWeight: fontWeight.bold,
          textDecoration: 'none', letterSpacing: '-0.5px', whiteSpace: 'nowrap',
        }} onClick={() => setMenuOpen(false)}>
          🤝 Nexus
        </Link>

        {/* 中间搜索框（仅桌面端） */}
        {!isMobile && (
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索项目..."
              style={{
                width: '100%', padding: `${space.sm}px ${space.md}px ${space.sm}px 36px`,
                fontSize: fontSize.lg, border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px', outline: 'none', boxSizing: 'border-box',
                backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff',
                fontFamily: 'inherit', transition: 'background-color 0.15s, border-color 0.15s',
              }}
              onFocus={e => { e.target.style.backgroundColor = 'rgba(255,255,255,0.15)'; e.target.style.borderColor = 'rgba(255,255,255,0.4)'; }}
              onBlur={e => { e.target.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            />
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.5)', fontSize: fontSize.md, pointerEvents: 'none',
            }}>🔍</span>
          </form>
        )}

        {/* 右侧 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          {isMobile ? (
            <button onClick={() => setMenuOpen(o => !o)} style={{
              background: 'none', border: 'none', color: '#fff', fontSize: '24px',
              cursor: 'pointer', padding: space.sm, lineHeight: 1,
            }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          ) : (
            <>
              <Link to="/stats" style={{
                color: navLink, fontSize: fontSize.lg, fontWeight: fontWeight.medium,
                textDecoration: 'none', padding: `${space.xs}px ${space.sm}px`,
                borderRadius: '6px', transition: 'background-color 0.15s',
              }}>📊 统计</Link>

              <button onClick={toggle} style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px', padding: `${space.xs}px ${space.sm}px`,
                cursor: 'pointer', fontSize: '16px', lineHeight: 1, color: '#fff',
              }} title={isDark ? '切换到亮色' : '切换到暗色'}>
                {isDark ? '☀️' : '🌙'}
              </button>

              {isLoggedIn && (
                <>
                  <Link to="/my-applications" style={{
                    color: navLink, fontSize: fontSize.lg, fontWeight: fontWeight.medium,
                    textDecoration: 'none', padding: `${space.xs}px ${space.sm}px`,
                    borderRadius: '6px',
                  }}>📋 申请</Link>
                  <Link to="/publish" style={{
                    backgroundColor: color.primary, color: '#fff',
                    fontSize: fontSize.base, fontWeight: fontWeight.semibold,
                    textDecoration: 'none',
                    padding: `${space.xs}px ${space.md}px`, borderRadius: '6px',
                    whiteSpace: 'nowrap',
                  }}>＋ 发布</Link>
                </>
              )}

              {isLoggedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: fontSize.md, fontWeight: fontWeight.medium }}>
                    {user?.username || '用户'}
                  </span>
                  <button onClick={handleLogout} style={{
                    backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px', padding: `${space.xs}px ${space.md}px`,
                    fontSize: fontSize.md, cursor: 'pointer',
                  }}>登出</button>
                </div>
              ) : (
                <Link to="/login" style={{
                  color: 'rgba(255,255,255,0.9)', fontSize: fontSize.lg, fontWeight: fontWeight.medium,
                  textDecoration: 'none', padding: `${space.xs}px ${space.sm}px`,
                  borderRadius: '6px', border: '1px solid rgba(255,255,255,0.25)',
                }}>登录</Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {isMobile && menuOpen && (
        <div style={{
          backgroundColor: '#2d333b', padding: `${space.sm}px ${space.md}px ${space.md}px`,
          display: 'flex', flexDirection: 'column', gap: space.sm,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {/* 移动端搜索 */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: space.sm }}>
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索项目..."
              style={{
                flex: 1, padding: `${space.sm}px ${space.md}px`,
                fontSize: fontSize.base, border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px', outline: 'none', boxSizing: 'border-box',
                backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', fontFamily: 'inherit',
              }}
            />
          </form>

          <button onClick={toggle} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px', padding: `${space.sm}px ${space.md}px`,
            cursor: 'pointer', fontSize: '16px', color: '#fff', textAlign: 'left',
          }}>{isDark ? '☀️ 亮色模式' : '🌙 暗色模式'}</button>

          <Link to="/stats" style={{
            color: 'rgba(255,255,255,0.9)', fontSize: fontSize.md, fontWeight: fontWeight.medium,
            textDecoration: 'none', padding: `${space.sm}px`,
            borderRadius: '6px',
          }} onClick={() => setMenuOpen(false)}>📊 统计</Link>

          {isLoggedIn && (
            <>
              <Link to="/my-applications" style={{
                color: 'rgba(255,255,255,0.9)', fontSize: fontSize.md, fontWeight: fontWeight.medium,
                textDecoration: 'none', padding: `${space.sm}px`, borderRadius: '6px',
              }} onClick={() => setMenuOpen(false)}>📋 我的申请</Link>
              <Link to="/publish" style={{
                color: 'rgba(255,255,255,0.9)', fontSize: fontSize.md, fontWeight: fontWeight.medium,
                textDecoration: 'none', padding: `${space.sm}px`, borderRadius: '6px',
              }} onClick={() => setMenuOpen(false)}>＋ 发布项目</Link>
            </>
          )}

          {isLoggedIn ? (
            <>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: fontSize.md, padding: `${space.xs}px ${space.sm}px` }}>
                {user?.username || '用户'}
              </div>
              <button onClick={handleLogout} style={{
                backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px', padding: `${space.sm}px ${space.md}px`,
                fontSize: fontSize.md, cursor: 'pointer', textAlign: 'left',
              }}>登出</button>
            </>
          ) : (
            <Link to="/login" style={{
              color: 'rgba(255,255,255,0.9)', fontSize: fontSize.md, fontWeight: fontWeight.medium,
              textDecoration: 'none', padding: `${space.sm}px`, borderRadius: '6px',
            }} onClick={() => setMenuOpen(false)}>登录</Link>
          )}
        </div>
      )}
    </nav>
  );
}
