import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';
import api from '../utils/api';
import { space, fontSize, fontWeight, containerStyle, useColors } from '../styles/tokens';
import { useIsMobile } from '../hooks/useMediaQuery';

const CATEGORY_COLORS = {
  web:    { bg: '#ddf4ff', text: '#0969da', darkBg: '#0c2d4d', darkText: '#79c0ff' },
  mobile: { bg: '#fbe0ff', text: '#8250df', darkBg: '#2a1b3d', darkText: '#d2a8ff' },
  ai:     { bg: '#dafbe4', text: '#116329', darkBg: '#0d2917', darkText: '#56d364' },
  data:   { bg: '#fff8f0', text: '#bc4c00', darkBg: '#2a1c0a', darkText: '#d29922' },
  design: { bg: '#ffeff7', text: '#bf3989', darkBg: '#2d1224', darkText: '#f778ba' },
  other:  { bg: '#f6f8fa', text: '#656d76', darkBg: '#21262d', darkText: '#8b949e' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diff)) return '';
  const days = Math.floor(diff / 86400000);
  if (days < 1) return '今天';
  if (days < 30) return `${days}天前`;
  return `${Math.floor(days / 30)}个月前`;
}

function MetaRow({ icon, label, value }) {
  const c = useColors();
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: space.sm, marginBottom: space.sm }}>
      <span style={{ fontSize: fontSize.md, lineHeight: 1.6, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: fontSize.xs, color: c.textMuted, fontWeight: fontWeight.medium }}>{label}</div>
        <div style={{ fontSize: fontSize.base, color: c.textPrimary }}>{value}</div>
      </div>
    </div>
  );
}

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const c = useColors();
  const isDark = c.bg === '#0d1117';

  const [opc, setOpc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starData, setStarData] = useState({ starred: false, count: 0 });
  const [recs, setRecs] = useState([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({ applicantName: '', applicantContact: '', message: '' });
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    api.get(`/opc/detail/${id}`).then(r => {
      setOpc(r.data);
      setLoading(false);
      if (r.data) {
        fetchStar(r.data.id);
        fetchRecs(r.data.id);
      }
    }).catch(() => setLoading(false));
  }, [id]);

  const fetchStar = async (opcId) => {
    try {
      const res = await api.get(`/opc/star/${opcId}`);
      setStarData(res.data);
    } catch {}
  };

  const fetchRecs = async (opcId) => {
    setLoadingRec(true);
    try {
      const res = await api.get(`/opc/match/${opcId}`);
      setRecs(res.data.slice(0, 5));
    } catch {}
    setLoadingRec(false);
  };

  const toggleStar = async () => {
    try {
      const res = await api.post(`/opc/star/${id}`);
      setStarData(res.data);
    } catch {}
  };

  const submitApply = async () => {
    if (!applyForm.applicantName.trim() || !applyForm.applicantContact.trim()) return;
    setApplyLoading(true);
    try {
      await api.post(`/opc/apply/${id}`, applyForm);
      setShowApply(false);
    } catch {}
    setApplyLoading(false);
  };

  if (loading) return <StatusMessage variant="loading" />;
  if (!opc) return <StatusMessage variant="error" title="项目不存在" description="无法找到该项目" />;

  const catColors = CATEGORY_COLORS[opc.category] || CATEGORY_COLORS.other;
  const catBg = isDark ? catColors.darkBg : catColors.bg;
  const catText = isDark ? catColors.darkText : catColors.text;

  const collabMap = { once: '一次性项目', longterm: '长期协作', research: '研究合作', '长期': '长期协作' };
  const expMap = { beginner: '🌱 初学者友好', intermediate: '💡 需要一定经验', expert: '🏆 专家级', any: '无要求', '中级': '💡 需要一定经验' };

  const primaryMeta = [
    opc.collaborationType ? ['🤝', '协作类型', collabMap[opc.collaborationType] || opc.collaborationType] : null,
    opc.experienceLevel ? ['🎯', '经验要求', expMap[opc.experienceLevel] || opc.experienceLevel] : null,
    opc.timeCommitment ? ['⏱', '时间投入', opc.timeCommitment] : null,
    opc.category ? ['🏷', '分类', opc.category] : null,
  ].filter(Boolean);

  return (
    <div style={{ ...containerStyle, paddingTop: space.xl, paddingBottom: space.huge }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: space.lg, display: 'flex', alignItems: 'center', gap: space.sm, fontSize: fontSize.sm, color: c.textSecondary }}>
        <Link to="/" style={{ color: c.primary, textDecoration: 'none' }}>项目列表</Link>
        <span>›</span>
        <span style={{ color: c.textMuted }}>{opc.name}</span>
      </div>

      <div style={{ display: 'flex', gap: space.xl, flexDirection: isMobile ? 'column' : 'row' }}>

        {/* 主内容区 */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <div style={{
            backgroundColor: c.surface, border: `1px solid ${c.border}`,
            borderRadius: '12px', padding: `${space.xl}px`,
            marginBottom: space.lg,
          }}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md, marginBottom: space.md, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, marginBottom: space.sm, flexWrap: 'wrap' }}>
                  <span style={{
                    padding: `2px ${space.sm}px`, borderRadius: '9999px',
                    fontSize: fontSize.xs, fontWeight: fontWeight.medium,
                    backgroundColor: catBg, color: catText,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                  }}>{opc.category || 'other'}</span>
                  <span style={{ fontSize: fontSize.sm, color: c.textMuted }}>
                    更新于 {timeAgo(opc.updatedAt || opc.createdAt)}
                  </span>
                </div>
                <h1 style={{ fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: c.textPrimary, margin: 0, lineHeight: 1.3 }}>
                  {opc.name}
                </h1>
              </div>
            </div>

            {/* Description */}
            {opc.description && (
              <p style={{ fontSize: fontSize.lg, color: c.textSecondary, lineHeight: 1.7, margin: `0 0 ${space.lg} 0` }}>
                {opc.description}
              </p>
            )}

            {/* Skills */}
            {opc.requiredSkills?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.xs, marginBottom: space.lg }}>
                {opc.requiredSkills.map((sk, i) => (
                  <span key={i} style={{
                    padding: `${space.xs}px ${space.sm}px`, borderRadius: '9999px',
                    fontSize: fontSize.sm, fontWeight: fontWeight.medium,
                    backgroundColor: isDark ? '#0c1e2e' : '#ddf4ff',
                    color: isDark ? '#58a6ff' : '#0969da',
                    border: `1px solid ${isDark ? 'rgba(88,166,255,0.2)' : 'rgba(9,105,218,0.2)'}`,
                  }}>{sk}</span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: space.sm, flexWrap: 'wrap' }}>
              <button onClick={() => navigate(`/chat/${id}`)} style={{
                backgroundColor: c.primary, color: '#fff', border: 'none',
                borderRadius: '8px', padding: `${space.sm}px ${space.lg}px`,
                fontSize: fontSize.base, fontWeight: fontWeight.semibold,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: space.xs,
              }}>🤖 与 AI 聊聊</button>

              <button onClick={() => setShowApply(true)} style={{
                backgroundColor: isDark ? '#21262d' : '#f6f8fa',
                color: c.textPrimary, border: `1px solid ${c.border}`,
                borderRadius: '8px', padding: `${space.sm}px ${space.lg}px`,
                fontSize: fontSize.base, fontWeight: fontWeight.medium,
                cursor: 'pointer',
              }}>📩 申请加入</button>

              <button onClick={toggleStar} style={{
                backgroundColor: isDark ? '#21262d' : '#f6f8fa',
                color: c.textPrimary, border: `1px solid ${c.border}`,
                borderRadius: '8px', padding: `${space.sm}px ${space.md}px`,
                fontSize: fontSize.base, fontWeight: fontWeight.medium,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: space.xs,
              }}>
                {starData.starred ? '⭐' : '☆'} {starData.starred ? '已收藏' : '收藏'} ({starData.count})
              </button>
            </div>
          </div>

          {/* 项目信息 */}
          {primaryMeta.length > 0 && (
            <div style={{
              backgroundColor: c.surface, border: `1px solid ${c.border}`,
              borderRadius: '12px', padding: `${space.xl}px`,
              marginBottom: space.lg,
            }}>
              <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: c.textPrimary, margin: `0 0 ${space.lg} 0` }}>
                📋 项目信息
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: `${space.md}px ${space.xl}px` }}>
                {primaryMeta.map(([icon, label, value]) => (
                  <MetaRow key={label} icon={icon} label={label} value={value} />
                ))}
              </div>
            </div>
          )}

          {/* 相似推荐 */}
          <div style={{
            backgroundColor: c.surface, border: `1px solid ${c.border}`,
            borderRadius: '12px', padding: `${space.xl}px`,
          }}>
            <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: c.textPrimary, margin: `0 0 ${space.lg} 0` }}>
              🔗 相似项目
            </h3>
            {loadingRec && <StatusMessage variant="loading" title="AI 匹配中..." />}
            {!loadingRec && recs.length === 0 && (
              <p style={{ color: c.textMuted, fontSize: fontSize.base }}>暂无相似项目</p>
            )}
            {recs.map(rec => (
              <div key={rec.id} onClick={() => navigate(`/opc/${rec.id}`)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: `${space.md}px 0`,
                borderBottom: `1px solid ${c.border}`,
                cursor: 'pointer',
              }}>
                <div>
                  <div style={{ fontSize: fontSize.base, fontWeight: fontWeight.medium, color: c.primary }}>
                    {rec.name}
                  </div>
                  {rec.description && (
                    <div style={{ fontSize: fontSize.sm, color: c.textMuted, marginTop: 2 }}>
                      {rec.description.slice(0, 60)}{rec.description.length > 60 ? '...' : ''}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: fontSize.sm, color: c.textMuted, whiteSpace: 'nowrap', marginLeft: space.sm }}>
                  {(rec.similarity * 100).toFixed(0)}% 匹配
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 侧边栏 */}
        {!isMobile && (
          <div style={{ width: '280px', flexShrink: 0 }}>
            {/* 联系方式 */}
            {opc.contact && (
              <div style={{
                backgroundColor: c.surface, border: `1px solid ${c.border}`,
                borderRadius: '12px', padding: `${space.xl}px`,
                marginBottom: space.lg,
              }}>
                <h3 style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: c.textPrimary, margin: `0 0 ${space.md} 0` }}>
                  📬 联系方式
                </h3>
                <p style={{ fontSize: fontSize.base, color: c.textSecondary, wordBreak: 'break-all', margin: 0 }}>
                  {opc.contact}
                </p>
              </div>
            )}

            {/* 操作 */}
            <div style={{
              backgroundColor: c.surface, border: `1px solid ${c.border}`,
              borderRadius: '12px', padding: `${space.xl}px`,
            }}>
              <h3 style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: c.textPrimary, margin: `0 0 ${space.md} 0` }}>
                ⚡ 快速操作
              </h3>
              <button onClick={() => navigate(`/chat/${id}`)} style={{
                width: '100%', backgroundColor: c.primary, color: '#fff',
                border: 'none', borderRadius: '8px',
                padding: `${space.sm}px ${space.md}px`,
                fontSize: fontSize.base, fontWeight: fontWeight.semibold,
                cursor: 'pointer', marginBottom: space.sm,
              }}>🤖 AI 协助</button>
              <button onClick={() => setShowApply(true)} style={{
                width: '100%', backgroundColor: isDark ? '#21262d' : '#f6f8fa',
                color: c.textPrimary, border: `1px solid ${c.border}`,
                borderRadius: '8px',
                padding: `${space.sm}px ${space.md}px`,
                fontSize: fontSize.base, fontWeight: fontWeight.medium,
                cursor: 'pointer',
              }}>📩 申请加入</button>
            </div>
          </div>
        )}
      </div>

      {/* 申请弹窗 */}
      {showApply && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowApply(false)}>
          <div style={{
            backgroundColor: c.surface, borderRadius: '12px', padding: space.xl,
            width: '90%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: c.textPrimary, margin: `0 0 ${space.lg} 0` }}>
              申请加入「{opc.name}」
            </h3>
            {[['applicantName', '姓名 *', true], ['applicantContact', '联系方式 *', true], ['message', '留言（可选）', false]].map(([key, label, required]) => (
              <div key={key} style={{ marginBottom: space.md }}>
                <label style={{ display: 'block', fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: c.textPrimary, marginBottom: space.xs }}>
                  {label}
                </label>
                <input
                  style={{
                    width: '100%', padding: `${space.sm}px ${space.md}px`,
                    fontSize: fontSize.base, border: `1px solid ${c.border}`,
                    borderRadius: '8px', boxSizing: 'border-box', outline: 'none',
                    backgroundColor: c.gray0, color: c.textPrimary, fontFamily: 'inherit',
                  }}
                  value={applyForm[key]}
                  onChange={e => setApplyForm(f => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: space.sm, marginTop: space.lg }}>
              <button onClick={() => setShowApply(false)} style={{
                backgroundColor: c.gray1, color: c.textPrimary,
                padding: `${space.sm}px ${space.lg}px`, borderRadius: '8px',
                fontSize: fontSize.base, fontWeight: fontWeight.medium,
                border: `1px solid ${c.border}`, cursor: 'pointer',
              }}>取消</button>
              <button onClick={submitApply} disabled={applyLoading} style={{
                backgroundColor: c.primary, color: '#fff',
                padding: `${space.sm}px ${space.lg}px`, borderRadius: '8px',
                fontSize: fontSize.base, fontWeight: fontWeight.semibold,
                border: 'none', cursor: applyLoading ? 'not-allowed' : 'pointer', opacity: applyLoading ? 0.7 : 1,
              }}>{applyLoading ? '提交中...' : '提交申请'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
