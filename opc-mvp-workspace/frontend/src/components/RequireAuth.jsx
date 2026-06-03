import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

/**
 * 路由守卫组件
 * 检查用户是否已登录，未登录则跳转到登录页
 */
function RequireAuth({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 验证 token 是否有效
      fetch('/opc/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) {
            setIsAuthenticated(true);
          } else {
            // token 无效，清除
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          setIsAuthenticated(false);
        });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    // 正在验证中，显示加载
    return <div style={styles.loading}>验证中...</div>;
  }

  if (!isAuthenticated) {
    // 未登录，跳转到登录页
    return <Navigate to="/login" replace />;
  }

  return children;
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#586069',
  },
};

export default RequireAuth;
