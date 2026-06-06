import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastContext from '../context/ToastContext';
import api from '../utils/api';

export default function NotificationPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (!token) {
      showToast('请先登录', 'error');
      navigate('/login');
      return;
    }
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    try {
      const res = await api.get('/opc/my-applications/received');
      setApplications(res.data.applications || []);
    } catch (err) {
      showToast('加载失败: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id, status) {
    try {
      const res = await api.put(`/opc/application/${id}`, { status });
      const data = res.data;
      if (data.success) {
        showToast('已' + (status === 'accepted' ? '接受' : '拒绝'), 'success');
        fetchApplications();
      } else {
        showToast(data.error || '操作失败', 'error');
      }
    } catch (err) {
      showToast('操作失败: ' + (err.response?.data?.error || err.message), 'error');
    }
  }

  const pending = applications.filter(a => a.status === 'pending');
  const handled = applications.filter(a => a.status !== 'pending');

  if (loading) return <div style={{ padding: 24, color: '#888' }}>加载中...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>申请通知</h2>

      {/* 待处理 */}
      <section style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#f59e0b' }}>
          待处理 ({pending.length})
        </h3>
        {pending.length === 0 && <div style={{ color: '#888', padding: 16 }}>暂无待处理的申请</div>}
        {pending.map(app => (
          <div key={app.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{app.opcName || 'OPC #' + app.opcId}</div>
            <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
              申请人: {app.applicantName} | 留言: {app.message || '无'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleUpdateStatus(app.id, 'accepted')}
                style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}
              >接受</button>
              <button
                onClick={() => handleUpdateStatus(app.id, 'rejected')}
                style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}
              >拒绝</button>
            </div>
          </div>
        ))}
      </section>

      {/* 已处理 */}
      <section>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#888' }}>
          已处理 ({handled.length})
        </h3>
        {handled.length === 0 && <div style={{ color: '#888', padding: 16 }}>暂无已处理的申请</div>}
        {handled.map(app => (
          <div key={app.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12, opacity: 0.7 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{app.opcName || 'OPC #' + app.opcId}</div>
            <div style={{ color: '#666', fontSize: 14 }}>
              申请人: {app.applicantName} | 状态:
              <span style={{ color: app.status === 'accepted' ? '#10b981' : '#ef4444', fontWeight: 600, marginLeft: 4 }}>
                {app.status === 'accepted' ? '已接受' : '已拒绝'}
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
