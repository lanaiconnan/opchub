import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';
import ToastContext from '../context/ToastContext';
import api from '../utils/api';
import { space, radius, fontSize, fontWeight, shadow, containerStyle, useColors } from '../styles/tokens';

export default function NotificationPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]         = useState(true);
  const { showToast }                  = useContext(ToastContext);
  const navigate                        = useNavigate();
  const color                           = useColors();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { showToast('请先登录', 'error'); navigate('/login'); return; }
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setLoading(true);
    try {
      const res = await api.get('/opc/my-applications/received');
      setApplications(res.data.applications || []);
    } catch (err) {
      showToast('加载失败：' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id, status) {
    try {
      const res = await api.put(`/opc/application/${id}`, { status });
      if (res.data.success) {
        showToast('已' + (status === 'accepted' ? '接受' : '拒绝'), 'success');
        fetchApplications();
      } else {
        showToast(res.data.error || '操作失败', 'error');
      }
    } catch (err) {
      showToast('操作失败：' + (err.response?.data?.error || err.message), 'error');
    }
  }

  const pending = applications.filter(a => a.status === 'pending');
  const handled = applications.filter(a => a.status !== 'pending');

  if (loading) return <StatusMessage variant="loading" title="加载申请通知..." />;

  // ------- 动态样式（依赖 color）--------
  const s = {
    title: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.semibold,
      color: color.textPrimary,
      marginBottom: space.xl,
    },
    section: { marginBottom: space.xl },
    sectionTitle: (c) => ({
      fontSize: fontSize.lg,
      fontWeight: fontWeight.semibold,
      color: c,
      marginBottom: space.lg,
    }),
    card: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: space.lg,
      border: `1px solid ${color.border}`,
      borderRadius: radius.lg,
      marginBottom: space.md,
      backgroundColor: color.surface,
      boxShadow: shadow.card,
      transition: 'box-shadow 0.2s',
    },
    cardBody: { flex: 1, minWidth: 0 },
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
    },
    cardActions: {
      display: 'flex',
      gap: space.sm,
      marginLeft: space.lg,
    },
    acceptBtn: {
      backgroundColor: color.primary,
      color: '#fff',
      border: 'none',
      borderRadius: radius.md,
      padding: `${space.xs}px ${space.sm}px`,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      cursor: 'pointer',
      transition: 'background-color 0.15s',
    },
    rejectBtn: {
      backgroundColor: color.danger,
      color: '#fff',
      border: 'none',
      borderRadius: radius.md,
      padding: `${space.xs}px ${space.sm}px`,
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      cursor: 'pointer',
      transition: 'background-color 0.15s',
    },
    statusBadge: (status) => ({
      fontWeight: fontWeight.medium,
      color: status === 'accepted' ? color.primary : color.danger,
    }),
  };

  return (
    <div style={{ ...containerStyle, paddingTop: space.xl, paddingBottom: space.xl }}>
      <h2 style={s.title}>📬 申请通知</h2>

      {/* 待处理 */}
      <section style={s.section}>
        <h3 style={s.sectionTitle(color.warning)}>⏳ 待处理（{pending.length}）</h3>
        {pending.length === 0 && <StatusMessage variant="empty" title="暂无待处理申请" />}
        {pending.map(app => (
          <div key={app.id} style={s.card}>
            <div style={s.cardBody}>
              <div style={s.cardTitle}>{app.opcName || `OPC #${app.opcId}`}</div>
              <div style={s.cardMeta}>申请人：<b>{app.applicantName}</b>（{app.applicantContact}）</div>
              {app.message && <div style={s.cardMsg}>"{app.message}"</div>}
            </div>
            <div style={s.cardActions}>
              <button onClick={() => handleUpdateStatus(app.id, 'accepted')} style={s.acceptBtn}>✅ 接受</button>
              <button onClick={() => handleUpdateStatus(app.id, 'rejected')} style={s.rejectBtn}>❌ 拒绝</button>
            </div>
          </div>
        ))}
      </section>

      {/* 已处理 */}
      <section style={s.section}>
        <h3 style={s.sectionTitle(color.textMuted)}>✅ 已处理（{handled.length}）</h3>
        {handled.length === 0 && <StatusMessage variant="empty" title="暂无已处理申请" />}
        {handled.map(app => (
          <div key={app.id} style={{ ...s.card, opacity: 0.7 }}>
            <div style={s.cardBody}>
              <div style={s.cardTitle}>{app.opcName || `OPC #${app.opcId}`}</div>
              <div style={s.cardMeta}>
                申请人：<b>{app.applicantName}</b>
                <span style={{ marginLeft: space.sm, ...s.statusBadge(app.status) }}>
                  {app.status === 'accepted' ? '✅ 已接受' : '❌ 已拒绝'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
