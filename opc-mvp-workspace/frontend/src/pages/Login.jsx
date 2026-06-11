import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { space, radius, fontSize, fontWeight, shadow, useColors } from '../styles/tokens';

function Login() {
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const color = useColors();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('请填写用户名和密码'); return; }

    setLoading(true);
    try {
      const res = await fetch('/opc/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.removeItem('token');
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = from;
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: 'calc(100vh - 56px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: color.bg,
      padding: `${space.md}px`,
    },
    card: {
      backgroundColor: color.surface,
      padding: `${space.xl}px`,
      borderRadius: radius.lg,
      boxShadow: shadow.card,
      width: '100%',
      maxWidth: '400px',
    },
    title: {
      margin: `0 0 ${space.xl}px 0`,
      textAlign: 'center',
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.semibold,
      color: color.textPrimary,
    },
    field: { marginBottom: space.lg },
    label: {
      display: 'block',
      marginBottom: space.xs,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      color: color.textPrimary,
    },
    input: {
      width: '100%',
      padding: `${space.xs}px ${space.sm}px`,
      fontSize: fontSize.base,
      border: `1px solid ${color.border}`,
      borderRadius: radius.md,
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.15s',
      backgroundColor: color.surface,
      color: color.textPrimary,
    },
    btn: {
      width: '100%',
      padding: `${space.sm}px ${space.lg}px`,
      fontSize: fontSize.base,
      fontWeight: fontWeight.semibold,
      color: '#fff',
      backgroundColor: color.primary,
      border: 'none',
      borderRadius: radius.md,
      cursor: 'pointer',
      marginTop: space.xs,
      transition: 'background-color 0.15s',
    },
    error: {
      padding: space.sm,
      marginBottom: space.lg,
      backgroundColor: color.dangerLight,
      border: `1px solid ${color.danger}`,
      borderRadius: radius.md,
      color: color.danger,
      fontSize: fontSize.sm,
    },
    footer: {
      marginTop: space.xl,
      textAlign: 'center',
      fontSize: fontSize.sm,
      color: color.textSecondary,
    },
    link: {
      color: color.info,
      textDecoration: 'none',
      fontWeight: fontWeight.medium,
    },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>登录</h2>
        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>用户名</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={s.input}
              placeholder="请输入用户名"
              autoFocus
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={s.input}
              placeholder="请输入密码"
            />
          </div>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={s.footer}>
          还没有账号？<Link to="/register" style={s.link}>立即注册</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
