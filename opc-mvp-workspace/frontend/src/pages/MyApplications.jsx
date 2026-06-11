import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';
import api from '../utils/api';
import { space, radius, fontSize, fontWeight, shadow, containerStyle, useColors } from '../styles/tokens';

const STATUS_MAP = {
  pending:   { label: '待处理',   bg: '#fff3cd', color: '#856404' },
  accepted:  { label: '已接受',   bg: '#d4edda', color: '#155724' },
  rejected:  { label: '已拒绝',   bg: '#f8d7da', color: '#721c24' },
};

function MyApplications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const color = useColors();

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    setApplications([]);
    try {
      const url = activeTab === 'received'
        ? '/opc/my-applications/received'
        : '/opc/my-applications/sent';
      const res = await api.get(url);
      setApplications(res.data.applications || []);
    } catch (err) {
      setError(err.response?.data?.error || '网络错误');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleUpdateStatus = async (appId, status) => {
    try {
      const res = await api.put(`/opc/application/${appId}`, { status });
      if (res.data.success) fetchApplications();
      else alert(res.data.error || '操作失败');
    } catch (err) {
      alert('网络错误：' + (err.response?.data?.error || err.message));
    }
  };

  // ------- 动态样式（依赖 color）-------
  const s = {
    title: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.semibold,
      color: color.textPrimary,
      marginBottom: space.lg,
    },
    tabs: {
      display: 'flex',
      gap: space.sm,
      marginBottom: space.xl,
    },
    tabBtn: {
      padding: `${space.sm}px ${space.lg}px`,
      borderRadius: radius.md,
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      border: `1px solid ${color.border}`,
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
    errorBox: {
      color: color.danger,
      backgroundColor: color.dangerLight,
      border: `1px solid ${color.danger}`,
      borderRadius: radius.md,
      padding: space.md,
      marginBottom: space.lg,
      fontSize: fontSize.base,
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: space.md,
    },
    card: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: space.lg,
      border: `1px solid ${color.border}`,
      borderRadius: radius.lg,
      backgroundColor: color.surface,
      boxShadow: shadow.card,
      transition: 'box-shadow 0.2s',
    },
    cardBody: {
      flex: 1,
      minWidth: 0,
    },
    cardTitle: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: color.textPrimary,
      marginBottom: space.xs,
    },
    cardMeta: {
      fontSize: fontSize.sm,
      color: color.textSecondary,
      marginBottom: space.xs,
    },
    cardMsg: {
      fontSize: fontSize.sm,
      color: color.textPrimary,
      fontStyle: 'italic',
      marginBottom: space.xs,
    },
    cardTime: {
      fontSize: fontSize.xs,
      color: color.textMuted,
    },
    cardRight: {
      minWidth: '120px',
      textAlign: 'right',
      display: 'flex',
      flexDirection: 'column',
      gap: space.sm,
      alignItems: 'flex-end',
      marginLeft: space.lg,
    },
    statusBadge: (status) => ({
      fontWeight: fontWeight.medium,
      color: status === 'accepted' ? color.primary : color.danger,
    }),
    actionBtns: {
      display: 'flex',
      gap: space.xs,
    },
    acceptBtn: {
      backgroundColor: color.primary,
      color: '#fff',
      border: 'none',
      borderRadius: radius.md,
      padding: `${space.xs}px ${space.sm}px`,
      fontSize: fontSize.xs,
      cursor: 'pointer',
    },
    rejectBtn: {
      backgroundColor: color.danger,
      color: '#fff',
      border: 'none',
      borderRadius: radius.md,
      padding: `${space.xs}px ${space.sm}px`,
      fontSize: fontSize.xs,
      cursor: 'pointer',
    },
  };

  return (
    <div style={{ ...containerStyle, paddingTop: space.xl, paddingBottom: space.xl }}>
      <h2 style={s.title}>📋 我的申请</h2>

      {/* Tab 切换 */}
      <div style={s.tabs}>
        {['received', 'sent'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...s.tabBtn,
              backgroundColor: activeTab === tab ? color.primary : color.surface,
              color:         activeTab === tab ? '#fff' : color.textPrimary,
              borderColor:  activeTab === tab ? color.primary : color.border,
            }}
          >
            {tab === 'received' ? '📥 收到的申请' : '📤 我发起的申请'}
          </button>
        ))}
      </div>

      {error && (
        <div style={s.errorBox}>⚠️ {error}</div>
      )}

      {loading && <StatusMessage variant="loading" />}

      {!loading && !error && applications.length === 0 && (
        <StatusMessage
          variant="empty"
          title={activeTab === 'received' ? '还没有人申请你的项目' : '你还没有发起过申请'}
        />
      )}

      {!loading && !error && applications.length > 0 && (
        <div style={s.list}>
          {applications.map(app => {
            const st = STATUS_MAP[app.status] || STATUS_MAP.pending;
            return (
              <div key={app.id} style={s.card}>
                <div style={s.cardBody}>
                  <h4 style={s.cardTitle}>
                    🔥 {app.opcName || `OPC #${app.opcId}`}
                  </h4>
                  <p style={s.cardMeta}>
                    {activeTab === 'received' ? (
                      <>申请人：<b>{app.applicantName}</b>（{app.applicantContact}）</>
                    ) : (
                      <>联系方式：<b>{app.opcContact}</b></>
                    )}
                  </p>
                  {app.message && (
                    <p style={s.cardMsg}>"{app.message}"</p>
                  )}
                  <p style={s.cardTime}>
                    {app.createdAt ? new Date(app.createdAt).toLocaleString() : '时间未知'}
                  </p>
                </div>

                <div style={s.cardRight}>
                  <span style={{ ...s.statusBadge(app.status), backgroundColor: st.bg, color: st.color, padding: `${space.xs}px ${space.sm}px`, borderRadius: radius.full, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
                    {st.label}
                  </span>
                  {activeTab === 'received' && app.status === 'pending' && (
                    <div style={s.actionBtns}>
                      <button onClick={() => handleUpdateStatus(app.id, 'accepted')} style={s.acceptBtn}>✅ 接受</button>
                      <button onClick={() => handleUpdateStatus(app.id, 'rejected')} style={s.rejectBtn}>❌ 拒绝</button>
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
