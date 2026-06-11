import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { space, radius, fontSize, fontWeight, shadow, useColors } from '../styles/tokens';

// 密码强度校验（与后端一致）
function validatePassword(pwd) {
  const rules = [
    { test: pwd && pwd.length >= 8, label: '至少 8 位' },
    { test: /[a-z]/.test(pwd), label: '包含小写字母' },
    { test: /[A-Z]/.test(pwd), label: '包含大写字母' },
    { test: /[0-9]/.test(pwd), label: '包含数字' },
  ];
  return { rules, passed: rules.filter(r => r.test).length, total: rules.length };
}

function Register() {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail]               = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const color = useColors();

  const pwdCheck = validatePassword(password);
  const pwdTouched = password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) { setError('请填写用户名和密码'); return; }
    if (password !== confirmPassword) { setError('两次输入的密码不一致'); return; }
    if (pwdCheck.passed < pwdCheck.total) { setError('密码强度不足，请满足所有要求'); return; }

    setLoading(true);
    try {
      const res = await fetch('/opc/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.removeItem('token');
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = from;
      } else {
        setError(data.error || '注册失败');
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
      maxWidth: '420px',
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
    pwdStrength: {
      marginBottom: space.lg,
      fontSize: fontSize.xs,
      lineHeight: 1.8,
    },
    strengthBar: {
      height: '4px',
      backgroundColor: color.gray2,
      borderRadius: radius.full,
      marginTop: space.xs,
      overflow: 'hidden',
    },
    strengthFill: {
      height: '100%',
      borderRadius: radius.full,
      transition: 'width 0.3s, background-color 0.3s',
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
        <h2 style={s.title}>注册</h2>
        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>用户名 <span style={{ color: color.danger }}>*</span></label>
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
            <label style={s.label}>邮箱（选填）</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={s.input}
              placeholder="请输入邮箱"
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>密码 <span style={{ color: color.danger }}>*</span></label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={s.input}
              placeholder="至少8位，含大小写字母+数字"
            />
          </div>

          {/* 密码强度提示 */}
          {pwdTouched && (
            <div style={s.pwdStrength}>
              {pwdCheck.rules.map((r, i) => (
                <div key={i} style={{ color: r.test ? color.primary : color.danger }}>
                  {r.test ? '✓' : '✗'} {r.label}
                </div>
              ))}
              <div style={s.strengthBar}>
                <div style={{
                  ...s.strengthFill,
                  width: `${(pwdCheck.passed / pwdCheck.total) * 100}%`,
                  backgroundColor: pwdCheck.passed < 2 ? color.danger : pwdCheck.passed < 4 ? color.warning : color.primary,
                }} />
              </div>
            </div>
          )}

          <div style={s.field}>
            <label style={s.label}>确认密码 <span style={{ color: color.danger }}>*</span></label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={s.input}
              placeholder="再次输入密码"
            />
          </div>

          <button type="submit" style={s.btn} disabled={loading || (pwdTouched && pwdCheck.passed < pwdCheck.total)}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div style={s.footer}>
          已有账号？<Link to="/login" style={s.link}>立即登录</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
