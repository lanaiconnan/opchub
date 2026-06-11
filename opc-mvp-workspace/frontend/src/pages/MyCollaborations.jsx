import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ToastContext from '../context/ToastContext';
import { useContext } from 'react';
import { useColors } from '../styles/tokens';

export default function MyCollaborations() {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const color = useColors().colors;
  const [opcs, setOpcs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOpcs();
  }, []);

  async function fetchMyOpcs() {
    setLoading(true);
    try {
      const res = await api.get('/opc/my-opcs');
      setOpcs(res.data.opcs || []);
    } catch (err) {
      showToast('加载失败: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(opc) {
    const newStatus = opc.status === 'offline' ? 'online' : 'offline';
    const label = newStatus === 'offline' ? '下架' : '上架';
    try {
      await api.put(`/opc/edit/${opc.id}`, { status: newStatus });
      showToast(`${label}成功`, 'success');
      fetchMyOpcs();
    } catch (err) {
      showToast(`${label}失败: ` + (err.response?.data?.error || err.message), 'error');
    }
  }

  async function handleDelete(opc) {
    if (!window.confirm(`确定删除「${opc.name}」？删除后无法恢复。`)) return;
    try {
      await api.delete(`/opc/delete/${opc.id}`);
      showToast('删除成功', 'success');
      fetchMyOpcs();
    } catch (err) {
      showToast('删除失败: ' + (err.response?.data?.error || err.message), 'error');
    }
  }

  const onlineCount = opcs.filter(o => o.status !== 'offline').length;
  const offlineCount = opcs.filter(o => o.status === 'offline').length;

  if (loading) {
    return <div style={s.loading}>加载中...</div>;
  }

  // ---- 动态样式（依赖 color）----
  const s = {
    container: { maxWidth: 880, margin: '0 auto', padding: '40px 20px', minHeight: 'calc(100vh - 56px)', backgroundColor: color.bg },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
    title: { fontSize: 26, fontWeight: 700, margin: 0, color: color.textPrimary },
    stats: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, fontSize: 13 },
    statOnline: { color: color.primary, fontWeight: 600 },
    statDivider: { color: color.border },
    statOffline: { color: color.textSecondary },
    btnPrimary: {
      backgroundColor: color.primary, color: '#fff', padding: '10px 20px',
      borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    loading: { textAlign: 'center', padding: 60, color: color.textSecondary, fontSize: 15 },
    empty: { textAlign: 'center', padding: 80, color: color.textSecondary },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: 600, color: color.textPrimary, marginBottom: 8 },
    emptyDesc: { fontSize: 14, marginBottom: 24, color: color.textSecondary },
    list: { display: 'flex', flexDirection: 'column', gap: 12 },
    card: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: 20, border: `1px solid ${color.border}`, borderRadius: 10, backgroundColor: color.surface,
      transition: 'box-shadow 0.15s',
    },
    cardOffline: { backgroundColor: color.gray1, opacity: 0.7 },
    cardLeft: { flex: 1, minWidth: 0 },
    cardTopRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
    cardTitle: { fontSize: 17, fontWeight: 600, margin: 0, color: color.textPrimary },
    badgeOnline: {
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
      backgroundColor: color.primaryLight, color: color.primary,
    },
    badgeOffline: {
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
      backgroundColor: color.gray2, color: color.textSecondary,
    },
    cardDesc: { color: color.textSecondary, fontSize: 13, marginBottom: 10, lineHeight: 1.5 },
    metaRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    tag: { backgroundColor: color.infoLight, color: color.info, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
    skillTag: { backgroundColor: color.gray1, color: color.textSecondary, padding: '3px 10px', borderRadius: 20, fontSize: 11, border: `1px solid ${color.border}` },
    price: { color: color.textPrimary, fontSize: 13, fontWeight: 600 },
    cardRight: { display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 16, minWidth: 110 },
    btnApplications: { backgroundColor: color.gray1, color: color.info, padding: '6px 12px', borderRadius: 6, border: `1px solid ${color.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 500, textAlign: 'left' },
    btnEdit: { backgroundColor: color.gray1, color: color.info, padding: '6px 12px', borderRadius: 6, border: `1px solid ${color.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 500, textAlign: 'left' },
    btnTakeDown: { backgroundColor: color.warningLight, color: color.warning, padding: '6px 12px', borderRadius: 6, border: `1px solid ${color.warning}`, cursor: 'pointer', fontSize: 12, fontWeight: 500, textAlign: 'left' },
    btnPublish: { backgroundColor: color.primaryLight, color: color.primary, padding: '6px 12px', borderRadius: 6, border: `1px solid ${color.primary}`, cursor: 'pointer', fontSize: 12, fontWeight: 500, textAlign: 'left' },
    btnDelete: { backgroundColor: color.dangerLight, color: color.danger, padding: '6px 12px', borderRadius: 6, border: `1px solid ${color.danger}`, cursor: 'pointer', fontSize: 12, fontWeight: 500, textAlign: 'left' },
  };

  return (
    <div style={s.container}>
      {/* 顶部标题 + 统计 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>我的项目</h1>
          <div style={s.stats}>
            <span style={s.statOnline}>上架中 {onlineCount}</span>
            <span style={s.statDivider}>|</span>
            <span style={s.statOffline}>已下架 {offlineCount}</span>
          </div>
        </div>
        <button onClick={() => navigate('/publish')} style={s.btnPrimary}>
          + 发布新项目
        </button>
      </div>

      {/* 空状态 */}
      {opcs.length === 0 && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>📦</div>
          <div style={s.emptyTitle}>还没有发布任何项目</div>
          <div style={s.emptyDesc}>发布你的第一个项目，开始获得协作申请吧</div>
          <button onClick={() => navigate('/publish')} style={s.btnPrimary}>
            去发布
          </button>
        </div>
      )}

      {/* 项目列表 */}
      <div style={s.list}>
        {opcs.map(opc => {
          const isOffline = opc.status === 'offline';
          return (
            <div key={opc.id} style={{...s.card, ...(isOffline ? s.cardOffline : {})}}>
              {/* 左：信息 */}
              <div style={s.cardLeft}>
                <div style={s.cardTopRow}>
                  <h3 style={s.cardTitle}>{opc.name}</h3>
                  <span style={isOffline ? s.badgeOffline : s.badgeOnline}>
                    {isOffline ? '已下架' : '上架中'}
                  </span>
                </div>
                {opc.description && (
                  <p style={s.cardDesc}>{opc.description}</p>
                )}
                <div style={s.metaRow}>
                  <span style={s.tag}>{opc.category || '未分类'}</span>
                  {opc.requiredSkills?.length > 0 && opc.requiredSkills.map(skill => (
                    <span key={skill} style={s.skillTag}>{skill}</span>
                  ))}
                  {opc.price && <span style={s.price}>¥{opc.price}</span>}
                </div>
              </div>

              {/* 右：操作按钮 */}
              <div style={s.cardRight}>
                <button
                  onClick={() => navigate('/notifications')}
                  style={s.btnApplications}
                >
                  📬 查看申请
                </button>
                <button
                  onClick={() => navigate(`/publish?id=${opc.id}`)}
                  style={s.btnEdit}
                >
                  ✏️ 编辑
                </button>
                <button
                  onClick={() => handleToggleStatus(opc)}
                  style={isOffline ? s.btnPublish : s.btnTakeDown}
                >
                  {isOffline ? '🔄 上架' : '📦 下架'}
                </button>
                <button
                  onClick={() => handleDelete(opc)}
                  style={s.btnDelete}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
