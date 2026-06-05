import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MyApplications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received'); // received | sent
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API = '/opc';

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    setApplications([]);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('请先登录');
      setLoading(false);
      return;
    }

    try {
      const url =
        activeTab === 'received'
          ? `${API}/my-applications/received`
          : `${API}/my-applications/sent`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setApplications(res.data.applications || res.data.applications);
      } else {
        setError(res.data.error || '获取申请失败');
      }
    } catch (err) {
      setError('网络错误：' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleUpdateStatus = async (appId, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API}/application/${appId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchApplications();
      } else {
        alert(res.data.error || '操作失败');
      }
    } catch (err) {
      alert('网络错误：' + (err.response?.data?.error || err.message));
    }
  };

  const statusMap = {
    pending: { label: '待处理', bg: '#fff3cd', color: '#856404' },
    accepted: { label: '已接受', bg: '#d4edda', color: '#155724' },
    rejected: { label: '已拒绝', bg: '#f8d7da', color: '#721c24' },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📋 我的申请</h2>

      {/* Tab 切换 */}
      <div style={styles.tabs}>
        {['received', 'sent'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tabBtn,
              backgroundColor: activeTab === tab ? '#2ea44f' : '#fff',
              color: activeTab === tab ? '#fff' : '#1F2328',
              borderColor: activeTab === tab ? '#2ea44f' : '#d0d7de',
            }}
          >
            {tab === 'received' ? '📥 收到的申请' : '📤 我发起的申请'}
          </button>
        ))}
      </div>

      {error ? (
        <div style={styles.errorBox}>⚠️ {error}</div>
      ) : null}

      {loading ? (
        <div style={styles.loading}>
          <span style={{ fontSize: 24, marginBottom: 8 }}>⏳</span>
          加载中...
        </div>
      ) : applications.length === 0 ? (
        <div style={styles.empty}>
          {activeTab === 'received' ? '还没有人申请你的 OPC' : '你还没有发起过申请'}
        </div>
      ) : (
        <div>
          {applications.map(app => {
            const s = statusMap[app.status] || statusMap.pending;
            return (
              <div key={app.id} style={styles.card}>
                <div style={styles.cardBody}>
                  <h4 style={styles.cardTitle}>
                    🔥 {app.opcName || `OPC #${app.opcId}`}
                  </h4>
                  <p style={styles.cardMeta}>
                    {activeTab === 'received' ? (
                      <>
                        申请人：<b>{app.applicantName}</b>（{app.applicantContact}）
                      </>
                    ) : (
                      <>
                        联系：<b>{app.opcContact}</b>
                      </>
                    )}
                  </p>
                  {app.message && (
                    <p style={styles.cardMsg}>"{app.message}"</p>
                  )}
                  <p style={styles.cardTime}>
                    {new Date(app.createdAt).toLocaleString()}
                  </p>
                </div>

                <div style={styles.cardRight}>
                  <span style={{ ...styles.statusBadge, backgroundColor: s.bg, color: s.color }}>
                    {s.label}
                  </span>

                  {/* 只有收到的申请才能操作 */}
                  {activeTab === 'received' && app.status === 'pending' && (
                    <div style={styles.actionBtns}>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'accepted')}
                        style={styles.acceptBtn}
                      >
                        ✅ 接受
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'rejected')}
                        style={styles.rejectBtn}
                      >
                        ❌ 拒绝
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyApplications;

// -------- 样式 --------
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1F2328',
    marginBottom: '24px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  },
  tabBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid',
    cursor: 'pointer',
  },
  errorBox: {
    color: '#721c24',
    padding: '12px 16px',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#656d76',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#656d76',
    border: '1px dashed #d0d7de',
    borderRadius: '8px',
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    border: '1px solid #d0d7de',
    borderRadius: '8px',
    marginBottom: '12px',
    backgroundColor: '#fff',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1F2328',
    marginBottom: '6px',
  },
  cardMeta: {
    fontSize: '13px',
    color: '#656d76',
    marginBottom: '4px',
  },
  cardMsg: {
    fontSize: '13px',
    color: '#1F2328',
    fontStyle: 'italic',
    marginBottom: '4px',
  },
  cardTime: {
    fontSize: '12px',
    color: '#8b949e',
  },
  cardRight: {
    minWidth: '120px',
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-end',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  actionBtns: {
    display: 'flex',
    gap: '6px',
  },
  acceptBtn: {
    backgroundColor: '#2ea44f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  rejectBtn: {
    backgroundColor: '#da3633',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    cursor: 'pointer',
  },
};
