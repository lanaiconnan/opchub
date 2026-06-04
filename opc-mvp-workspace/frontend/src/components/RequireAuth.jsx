import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

/**
 * 路由守卫组件
 * 检查用户是否已登录，未登录则跳转到登录页
 */
function RequireAuth({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    
    // 带超时的验证
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    fetch('/opc/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: controller.signal
    })
      .then(res => {
        clearTimeout(timeout);
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        // 网络错误时也允许访问，避免一直卡在验证中
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      });
    
    return () => clearTimeout(timeout);
  }, []);

  if (isAuthenticated === null) {
    // 正在验证中，显示加载
    return <div style={styles.loading}>验证中...</div>;
  }

  if (!isAuthenticated) {
    // 未登录，跳转到登录页，并保存当前路径
    return <Navigate to="/login" state={{ from: location }} replace />;
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
