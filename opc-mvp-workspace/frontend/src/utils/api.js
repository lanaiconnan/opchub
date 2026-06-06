import axios from 'axios';

const api = axios.create();

// 请求拦截：自动附加 accessToken
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截：401 时自动刷新 token 并重试
api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if (error.response && error.response.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const newToken = await doRefresh();
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        // 刷新失败，清理并跳登录页
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

async function doRefresh() {
  const rt = localStorage.getItem('refreshToken');
  if (!rt) throw new Error('No refresh token');
  const res = await axios.post('/opc/auth/refresh', { refreshToken: rt });
  const data = res.data;
  if (!data.success) throw new Error('Refresh failed');
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.accessToken;
}

export default api;
