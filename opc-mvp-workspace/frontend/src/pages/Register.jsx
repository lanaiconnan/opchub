import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// 密码强度校验（与后端一致）
function validatePassword(pwd) {
  const rules = [
    { test: pwd && pwd.length >= 8, label: '至少8位' },
    { test: /[a-z]/.test(pwd), label: '包含小写字母' },
    { test: /[A-Z]/.test(pwd), label: '包含大写字母' },
    { test: /[0-9]/.test(pwd), label: '包含数字' },
  ];
  const passed = rules.filter(r => r.test).length;
  return { rules, passed, total: rules.length };
}

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const pwdCheck = validatePassword(password);
  const pwdTouched = password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请填写用户名和密码');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (pwdCheck.passed < pwdCheck.total) {
      setError('密码强度不足，请满足所有要求');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/opc/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });

      const data = await res.json();

      if (data.success) {
        // 保存 tokens（与后端新格式对齐）
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.removeItem('token'); // 清理旧字段
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = from;
      } else {
        setError(data.error || '注册失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f8fa' }}>
      <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ margin: '0 0 24px 0', textAlign: 'center', fontSize: '24px', fontWeight: '600' }}>注册</h2>

        {error && <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#ffeef0', border: '1px solid #f97583', borderRadius: '6px', color: '#cb2431', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#24292f' }}>用户名 *</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} placeholder="请输入用户名" />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#24292f' }}>邮箱（选填）</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="请输入邮箱" />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#24292f' }}>密码 *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="至少8位，含大小写字母+数字" />
          </div>

          {/* 密码强度提示 */}
          {pwdTouched && (
            <div style={{ marginBottom: '16px', fontSize: '12px', color: '#586069' }}>
              {pwdCheck.rules.map((r, i) => (
                <div key={i} style={{ color: r.test ? '#2ea44f' : '#cb2431', marginBottom: '2px' }}>
                  {r.test ? '✓' : '✗'} {r.label}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#24292f' }}>确认密码 *</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="再次输入密码" />
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px 16px', fontSize: '14px', fontWeight: '600', color: '#fff', backgroundColor: '#2ea44f', border: '1px solid rgba(27,31,36,0.15)', borderRadius: '6px', cursor: 'pointer', marginTop: '8px' }} disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#586069' }}>
          已有账号？ <Link to="/login" style={{ color: '#0366d6', textDecoration: 'none' }}>立即登录</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
