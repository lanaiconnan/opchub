import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MyApplications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received'); // received | sent
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API = '/opc';

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('请先登录');
      setLoading(false);
      return;
    }

    try {
      if (activeTab === 'received') {
        // 获取我创建的 OPC 收到的申请
        const res = await fetch(`${API}/my-applications/received`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setApplications(data.applications);
        } else {
          setError(data.error || '获取申请失败');
        }
      } else {
        // 获取我发起的申请
        const res = await fetch(`${API}/my-applications/sent`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setApplications(data.applications);
        } else {
          setError(data.error || '获取申请失败');
        }
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      const res = await fetch(`${API}/application/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchApplications(); // 刷新列表
      } else {
        alert(data.error || '操作失败');
      }
    } catch (err) {
      alert('网络错误');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h2>我的申请</h2>

      {/* Tab 切换 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('received')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'received' ? '#007bff' : '#fff',
            color: activeTab === 'received' ? '#fff' : '#000',
            border: '1px solid #007bff',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          收到的申请
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'sent' ? '#007bff' : '#fff',
            color: activeTab === 'sent' ? '#fff' : '#000',
            border: '1px solid #007bff',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          我发起的申请
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

      {loading ? (
        <div>加载中...</div>
      ) : (
        <div>
          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
              暂无申请
            </div>
          ) : (
            applications.map(app => (
              <div key={app.id} style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
                backgroundColor: '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>{app.opcName || `OPC #${app.opcId}`}</h4>
                    <p style={{ margin: '0 0 4px 0', color: '#666' }}>
                      申请人：{app.applicantName} ({app.applicantContact})
                    </p>
                    {app.message && (
                      <p style={{ margin: '0 0 4px 0', color: '#999' }}>留言：{app.message}</p>
                    )}
                    <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                      申请时间：{new Date(app.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      backgroundColor:
                        app.status === 'accepted' ? '#d4edda' :
                        app.status === 'rejected' ? '#f8d7da' :
                        '#fff3cd',
                      color:
                        app.status === 'accepted' ? '#155724' :
                        app.status === 'rejected' ? '#721c24' :
                        '#856404'
                    }}>
                      {app.status === 'pending' ? '待处理' :
                       app.status === 'accepted' ? '已接受' :
                       '已拒绝'}
                    </span>

                    {/* 只有收到的申请才能操作 */}
                    {activeTab === 'received' && app.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'accepted')}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#28a745',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          接受
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          拒绝
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MyApplications;
