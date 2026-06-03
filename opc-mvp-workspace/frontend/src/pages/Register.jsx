import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    
    if (password.length < 6) {
      setError('密码至少需要 6 个字符');
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
        // 注册成功后自动登录
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        setError(data.error || '注册失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>注册</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>用户名 *</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={styles.input}
              placeholder="请输入用户名"
            />
          </div>
          
          <div style={styles.field}>
            <label style={styles.label}>邮箱（选填）</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              placeholder="请输入邮箱"
            />
          </div>
          
          <div style={styles.field}>
            <label style={styles.label}>密码 *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="至少 6 个字符"
            />
          </div>
          
          <div style={styles.field}>
            <label style={styles.label}>确认密码 *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={styles.input}
              placeholder="再次输入密码"
            />
          </div>
          
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        
        <div style={styles.footer}>
          已有账号？ <Link to="/login" style={styles.link}>立即登录</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 56px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f8fa',
  },
  card: {
    backgroundColor: '#fff',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    margin: '0 0 24px 0',
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: '600',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#24292f',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#2ea44f',
    border: '1px solid rgba(27,31,36,0.15)',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    padding: '12px',
    marginBottom: '16px',
    backgroundColor: '#ffeef0',
    border: '1px solid #f97583',
    borderRadius: '6px',
    color: '#cb2431',
    fontSize: '14px',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#586069',
  },
  link: {
    color: '#0366d6',
    textDecoration: 'none',
  },
};

export default Register;
