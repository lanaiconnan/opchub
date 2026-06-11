import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInput from '../components/ChatInput';
import StatusMessage from '../components/StatusMessage';
import api from '../utils/api';
import { space, radius, fontSize, fontWeight, shadow, containerStyle, useColors } from '../styles/tokens';
import { useIsSmall, useIsMobile } from '../hooks/useMediaQuery';

// -------- 常量 --------
const CATEGORY_OPTIONS = [
  { value: '', label: '全部分类' },
  { value: 'web', label: '🌐 Web 开发' },
  { value: 'mobile', label: '📱 移动开发' },
  { value: 'ai', label: '🤖 AI / 机器学习' },
  { value: 'data', label: '📊 数据科学' },
  { value: 'design', label: '🎨 设计' },
  { value: 'other', label: '📁 其他' },
];
const COLLAB_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: 'once', label: '一次性协作' },
  { value: 'longterm', label: '长期合作' },
  { value: 'research', label: '研究项目' },
];
const EXP_OPTIONS = [
  { value: '', label: '全部经验' },
  { value: 'beginner', label: '初学者友好' },
  { value: 'intermediate', label: '需要一定经验' },
  { value: 'expert', label: '需要专家级' },
  { value: 'any', label: '不限' },
];

const CATEGORY_COLORS = {
  web:    { bg: '#ddf4ff', text: '#0969da' },
  mobile: { bg: '#fbe0ff', text: '#8250df' },
  ai:     { bg: '#dafbe4', text: '#116329' },
  data:   { bg: '#fff8f0', text: '#bc4c00' },
  design: { bg: '#ffeff7', text: '#bf3989' },
  other:  { bg: '#f6f8fa', text: '#656d76' },
};

// -------- 申请弹窗 --------
function ApplyModal({ opc, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ applicantName: '', applicantContact: '', message: '' });
  const color = useColors();

  const handleSubmit = () => {
    if (!form.applicantName.trim() || !form.applicantContact.trim()) return;
    onSubmit(form);
  };

  const s = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: color.surface,
      borderRadius: radius.xl,
      padding: space.xl,
      width: '90%', maxWidth: '480px',
      maxHeight: '90vh', overflowY: 'auto',
      boxShadow: shadow.modal,
    },
    title: {
      fontSize: fontSize.xxl, fontWeight: fontWeight.semibold,
      color: color.textPrimary, marginBottom: space.lg,
    },
    field: { marginBottom: space.lg },
    label: {
      display: 'block', fontSize: fontSize.sm, fontWeight: fontWeight.medium,
      color: color.textPrimary, marginBottom: space.xs,
    },
    input: {
      width: '100%', padding: `${space.xs}px ${space.sm}px`,
      fontSize: fontSize.base, border: `1px solid ${color.border}`,
      borderRadius: radius.md, boxSizing: 'border-box',
      outline: 'none', fontFamily: 'inherit',
    },
    actions: {
      display: 'flex', justifyContent: 'flex-end', gap: space.sm, marginTop: space.xl,
    },
    btnCancel: {
      backgroundColor: color.gray1, color: color.textPrimary,
      padding: `${space.sm}px ${space.lg}px`, borderRadius: radius.md,
      fontSize: fontSize.base, fontWeight: fontWeight.medium,
      border: `1px solid ${color.border}`, cursor: 'pointer',
    },
    btnSubmit: {
      backgroundColor: color.primary, color: '#fff',
      padding: `${space.sm}px ${space.lg}px`, borderRadius: radius.md,
      fontSize: fontSize.base, fontWeight: fontWeight.semibold,
      border: 'none', cursor: 'pointer',
    },
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <h2 style={s.title}>申请加入「{opc.name}」</h2>
        <div style={s.field}>
          <label style={s.label}>姓名 <span style={{ color: color.danger }}>*</span></label>
          <input
            style={s.input}
            value={form.applicantName}
            onChange={e => setForm(f => ({ ...f, applicantName: e.target.value }))}
            placeholder="请输入姓名"
            autoFocus
          />
        </div>
        <div style={s.field}>
          <label style={s.label}>联系方式 <span style={{ color: color.danger }}>*</span></label>
          <input
            style={s.input}
            value={form.applicantContact}
            onChange={e => setForm(f => ({ ...f, applicantContact: e.target.value }))}
            placeholder="邮箱或手机号"
          />
        </div>
        <div style={s.field}>
          <label style={s.label}>留言（可选）</label>
          <textarea
            style={{ ...s.input, minHeight: '80px', resize: 'vertical' }}
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="简单介绍一下你自己..."
          />
        </div>
        <div style={s.actions}>
          <button onClick={onClose} style={s.btnCancel} disabled={loading}>取消</button>
          <button onClick={handleSubmit} style={s.btnSubmit} disabled={loading}>
            {loading ? '提交中...' : '提交申请'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------- 主页面 --------
function Home() {
  const navigate = useNavigate();
  const [opcList, setOpcList]                   = useState([]);
  const [starData, setStarData]                   = useState({});
  const [loading, setLoading]                     = useState(true);
  const [selectedOpc, setSelectedOpc]           = useState(null);
  const [recommendations, setRecommendations]     = useState([]);
  const [loadingRec, setLoadingRec]               = useState(false);
  const [showApplyModal, setShowApplyModal]       = useState(false);
  const [applyLoading, setApplyLoading]           = useState(false);

  const [search, setSearch]             = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCollab, setFilterCollab]     = useState('');
  const [filterExp, setFilterExp]           = useState('');

  const color     = useColors();
  const isSmall  = useIsSmall();
  const isMobile = useIsMobile();
  const opcListRef = useRef(null);

  // 获取 Star 数据
  const fetchStarData = async (opcIds) => {
    const data = {};
    await Promise.all(opcIds.map(async (id) => {
      try {
        const res = await api.get(`/opc/star/${id}`);
        data[id] = { count: res.data.count || 0, starred: res.data.starred || false };
      } catch {
        data[id] = { count: 0, starred: false };
      }
    }));
    setStarData(data);
  };

  const toggleStar = async (opcId, e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/opc/star/${opcId}`, {});
      setStarData(prev => ({
        ...prev,
        [opcId]: { count: res.data.count, starred: res.data.starred },
      }));
    } catch (err) {
      console.error('Star 失败:', err);
    }
  };

  const submitApplication = async (form) => {
    setApplyLoading(true);
    try {
      await api.post('/opc/apply', { opcId: selectedOpc.id, ...form });
      alert('✅ 申请已提交！');
      setShowApplyModal(false);
    } catch (err) {
      alert('申请失败：' + (err.response?.data?.error || err.message));
    }
    setApplyLoading(false);
  };

  const fetchRecommendations = async (opcId) => {
    setLoadingRec(true);
    try {
      const res = await api.get(`/opc/match/${opcId}`);
      setRecommendations(res.data);
    } catch {
      setRecommendations([]);
    }
    setLoadingRec(false);
  };

  useEffect(() => {
    api.get('/opc/list')
      .then(res => {
        setOpcList(res.data);
        setLoading(false);
        if (res.data.length > 0) fetchStarData(res.data.map(opc => opc.id));
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredList = useMemo(() => {
    return opcList.filter(opc => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = [
          opc.name, opc.description, opc.tags,
          ...(opc.requiredSkills || []),
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filterCategory && opc.category !== filterCategory) return false;
      if (filterCollab && opc.collaborationType !== filterCollab) return false;
      if (filterExp && opc.experienceLevel !== filterExp) return false;
      return true;
    });
  }, [opcList, search, filterCategory, filterCollab, filterExp]);

  // -------- 动态样式（依赖 color / isSmall / isMobile）--------
  const s = {
    hero: {
      textAlign: 'center',
      padding: isSmall ? `${space.xl}px ${space.sm}px` : `${space.page}px ${space.xl}px`,
    },
    heroIcon: { fontSize: '56px', marginBottom: space.md },
    heroTitle: {
      fontSize: fontSize.hero, fontWeight: fontWeight.bold,
      color: color.textPrimary, marginBottom: space.md, lineHeight: 1.3,
    },
    heroSub: { fontSize: fontSize.xl, color: color.textSecondary, marginBottom: space.xl },
    heroActions: {
      display: 'flex', justifyContent: 'center', gap: space.md,
      flexWrap: 'wrap', flexDirection: isSmall ? 'column' : 'row',
      alignItems: isSmall ? 'stretch' : 'center',
    },
    btnPrimary: {
      backgroundColor: color.primary, color: '#fff',
      padding: `${space.md}px ${space.xxl}px`, borderRadius: radius.md,
      fontSize: fontSize.md, fontWeight: fontWeight.semibold,
      border: 'none', cursor: 'pointer', transition: 'background-color 0.15s',
    },
    btnOutline: {
      backgroundColor: 'transparent', color: color.textPrimary,
      padding: `${space.md}px ${space.xxl}px`, borderRadius: radius.md,
      fontSize: fontSize.md, fontWeight: fontWeight.medium,
      border: `1px solid ${color.border}`, cursor: 'pointer', transition: 'all 0.15s',
    },
    filterSection: {
      marginTop: space.page, paddingTop: space.xl,
      borderTop: `1px solid ${color.border}`,
    },
    sectionTitle: {
      fontSize: fontSize.xxxl, fontWeight: fontWeight.semibold,
      color: color.textPrimary, marginBottom: space.lg,
    },
    filterBar: {
      display: 'flex', gap: space.sm, marginBottom: space.lg,
      flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
    },
    searchInput: {
      flex: '1 1 240px', padding: `${space.sm}px ${space.lg}px`,
      fontSize: fontSize.md, border: `1px solid ${color.border}`,
      borderRadius: radius.md, outline: 'none', boxSizing: 'border-box',
      transition: 'border-color 0.15s', backgroundColor: color.surface, color: color.textPrimary,
    },
    filterSelect: {
      padding: `${space.sm}px ${space.lg}px`, fontSize: fontSize.md,
      border: `1px solid ${color.border}`, borderRadius: radius.md,
      backgroundColor: color.surface, color: color.textPrimary,
      cursor: 'pointer', minWidth: '140px', flex: '1 1 140px', outline: 'none',
    },
    clearBtn: {
      padding: `${space.xs}px ${space.sm}px`, fontSize: fontSize.sm,
      border: `1px solid ${color.border}`, borderRadius: radius.md,
      backgroundColor: 'transparent', cursor: 'pointer',
      color: color.textSecondary, flex: '0 0 auto',
    },
    // 卡片
    card: {
      display: 'flex', flexDirection: isSmall ? 'column' : 'row',
      alignItems: isSmall ? 'stretch' : 'flex-start',
      padding: space.xxl, border: `1px solid ${color.border}`,
      borderRadius: radius.lg, marginBottom: space.lg,
      backgroundColor: color.surface, cursor: 'pointer',
      boxShadow: shadow.card, transition: 'box-shadow 0.2s, transform 0.15s',
    },
    cardBody: { flex: 1, minWidth: 0, marginBottom: isSmall ? space.md : 0 },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.sm },
    categoryBadge: (bg, text) => ({ padding: `${space.xs}px ${space.sm}px`, borderRadius: radius.full, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textTransform: 'uppercase', letterSpacing: '0.3px', backgroundColor: bg, color: text }),
    starBadge: (opcId) => ({
      fontSize: fontSize.sm, color: color.textMuted, cursor: 'pointer',
      padding: `${space.xs}px`, borderRadius: radius.sm, transition: 'background-color 0.15s',
    }),
    cardTitle: {
      fontSize: fontSize.xxl, fontWeight: fontWeight.semibold,
      color: color.textPrimary, marginBottom: space.sm, lineHeight: 1.4,
    },
    cardDesc: {
      color: color.textSecondary, fontSize: fontSize.md,
      marginBottom: space.sm, lineHeight: 1.6,
      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    metaRow: { display: 'flex', alignItems: 'center', gap: space.xs, flexWrap: 'wrap', marginTop: space.xs },
    skillTag: {
      backgroundColor: color.infoLight, color: color.info,
      padding: `${space.xs}px ${space.xs}px`, borderRadius: radius.full,
      fontSize: fontSize.xs, fontWeight: fontWeight.medium,
    },
    tag: {
      backgroundColor: color.primaryLight, color: color.primaryDark,
      padding: `${space.xs}px ${space.xs}px`, borderRadius: radius.full,
      fontSize: fontSize.xs, fontWeight: fontWeight.semibold,
    },
    metaBadge: {
      backgroundColor: color.gray1, color: color.textSecondary,
      padding: `${space.xs}px ${space.xs}px`, borderRadius: radius.full, fontSize: fontSize.xs,
    },
    cardActions: {
      display: 'flex', flexDirection: isSmall ? 'row' : 'column',
      gap: space.sm, marginTop: isSmall ? space.md : 0,
      marginLeft: isSmall ? 0 : space.lg,
      minWidth: isSmall ? '100%' : '100px',
    },
    btnApply: {
      backgroundColor: color.primary, color: '#fff',
      padding: `${space.sm}px ${space.lg}px`, borderRadius: radius.md,
      fontSize: fontSize.md, fontWeight: fontWeight.semibold,
      border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flex: 1,
    },
    btnAI: {
      backgroundColor: 'transparent', color: color.primary,
      padding: `${space.sm}px ${space.lg}px`, borderRadius: radius.md,
      fontSize: fontSize.md, fontWeight: fontWeight.semibold,
      border: `1px solid ${color.primary}`, cursor: 'pointer',
      whiteSpace: 'nowrap', flex: 1,
    },
    // 推荐区
    recommendSection: {
      marginTop: space.page, paddingTop: space.xl,
      borderTop: `2px solid ${color.primary}`,
    },
    recCard: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: space.md, border: `1px solid ${color.border}`,
      borderRadius: radius.md, marginBottom: space.sm,
      backgroundColor: color.gray1, cursor: 'pointer', transition: 'background-color 0.15s',
    },
    recLeft: { flex: 1 },
    recTitle: {
      fontSize: fontSize.lg, fontWeight: fontWeight.semibold,
      color: color.textPrimary, marginBottom: space.xs,
    },
    recSim: {
      backgroundColor: color.primaryLight, color: color.primaryDark,
      padding: `${space.xs}px ${space.xs}px`, borderRadius: radius.full,
      fontSize: fontSize.xs, fontWeight: fontWeight.semibold,
    },
    btnSmall: {
      backgroundColor: color.primary, color: '#fff',
      padding: `${space.xs}px ${space.sm}px`, borderRadius: radius.md,
      fontSize: fontSize.sm, fontWeight: fontWeight.medium, border: 'none', cursor: 'pointer',
    },
  };

  return (
    <div style={{ ...containerStyle, paddingTop: space.xl }}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroIcon}>🤝</div>
        <h1 style={s.heroTitle}>找到你的协作伙伴</h1>
        <p style={s.heroSub}>描述你的项目需求，或浏览已有协作机会</p>
        <div style={s.heroActions}>
          <button onClick={() => navigate('/publish')} style={s.btnPrimary}>
            ＋ 发布项目
          </button>
          <button
            onClick={() => opcListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            style={s.btnOutline}
          >
            浏览项目
          </button>
          <button onClick={() => navigate('/my-collaborations')} style={s.btnOutline}>
            我的协作
          </button>
        </div>
      </div>

      {/* 搜索 + 筛选 */}
      <div ref={opcListRef} style={s.filterSection}>
        <h2 style={s.sectionTitle}>最近的项目</h2>
        <div style={s.filterBar}>
          <input
            style={s.searchInput}
            type="text"
            placeholder="搜索项目名称、描述、标签..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            style={s.filterSelect}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            {CATEGORY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            style={s.filterSelect}
            value={filterCollab}
            onChange={e => setFilterCollab(e.target.value)}
          >
            {COLLAB_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            style={s.filterSelect}
            value={filterExp}
            onChange={e => setFilterExp(e.target.value)}
          >
            {EXP_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {(search || filterCategory || filterCollab || filterExp) && (
            <button onClick={() => { setSearch(''); setFilterCategory(''); setFilterCollab(''); setFilterExp(''); }} style={s.clearBtn}>
              清除筛选
            </button>
          )}
        </div>
      </div>

      {loading && <StatusMessage variant="loading" />}

      {!loading && filteredList.length === 0 && (
        <StatusMessage
          variant={opcList.length === 0 ? 'empty' : 'empty'}
          title={opcList.length === 0 ? '还没有项目' : '没有匹配的项目'}
          description={opcList.length === 0 ? '点击「发布项目」创建第一个协作项目吧！' : '试试调整筛选条件～'}
        />
      )}

      {/* OPC 卡片列表 */}
      {filteredList.map(opc => {
        const catColors = CATEGORY_COLORS[opc.category] || CATEGORY_COLORS.other;
        return (
          <div
            key={opc.id}
            style={s.card}
            onClick={() => { setSelectedOpc(opc); fetchRecommendations(opc.id); }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = shadow.cardHover}
            onMouseLeave={e => e.currentTarget.style.boxShadow = shadow.card}
          >
            <div style={s.cardBody}>
              <div style={s.cardHeader}>
                <div style={s.categoryBadge(catColors.bg, catColors.text)}>
                  {opc.category || 'other'}
                </div>
                <div
                  style={s.starBadge(opc.id)}
                  onClick={(e) => toggleStar(opc.id, e)}
                  title="收藏"
                >
                  {starData[opc.id]?.starred ? '⭐' : '☆'} {starData[opc.id]?.count || 0}
                </div>
              </div>

              <h3 style={s.cardTitle}>{opc.name}</h3>

              {opc.description && (
                <p style={s.cardDesc}>{opc.description}</p>
              )}

              <div style={s.metaRow}>
                {opc.requiredSkills?.slice(0, 3).map((sk, i) => (
                  <span key={i} style={s.skillTag}>{sk}</span>
                ))}
                {(opc.requiredSkills?.length || 0) > 3 && (
                  <span style={s.skillTag}>+{(opc.requiredSkills?.length || 0) - 3}</span>
                )}
                {opc.tags && !opc.requiredSkills?.length && (
                  <span style={s.tag}>{opc.tags}</span>
                )}
              </div>

              <div style={s.metaRow}>
                {opc.collaborationType && opc.collaborationType !== 'once' && (
                  <span style={s.metaBadge}>{opc.collaborationType === 'longterm' ? '🔄 长期' : opc.collaborationType === 'research' ? '🔬 研究' : ''}</span>
                )}
                {opc.experienceLevel && opc.experienceLevel !== 'any' && (
                  <span style={s.metaBadge}>{
                    opc.experienceLevel === 'beginner' ? '🌱 初学者友好' :
                    opc.experienceLevel === 'intermediate' ? '💡 需要经验' :
                    opc.experienceLevel === 'expert' ? '🏆 专家级' : ''
                  }</span>
                )}
                {opc.timeCommitment && (
                  <span style={s.metaBadge}>⏱️ {opc.timeCommitment}</span>
                )}
              </div>
            </div>

            <div style={s.cardActions}>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedOpc(opc); setShowApplyModal(true); }}
                style={s.btnApply}
              >
                申请加入
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/chat/${opc.id}`); }}
                style={s.btnAI}
              >
                🤖 AI 协助
              </button>
            </div>
          </div>
        );
      })}

      {/* 相似推荐 */}
      {selectedOpc && !showApplyModal && (
        <div style={s.recommendSection}>
          <h2 style={s.sectionTitle}>🤖 与「{selectedOpc.name}」相似的项目</h2>
          {loadingRec && <StatusMessage variant="loading" title="AI 正在匹配中..." />}
          {!loadingRec && recommendations.length === 0 && (
            <StatusMessage variant="empty" title="暂无相似项目" />
          )}
          {recommendations.map(opc => (
            <div
              key={opc.id}
              style={s.recCard}
              onClick={() => { setSelectedOpc(opc); fetchRecommendations(opc.id); }}
            >
              <div style={s.recLeft}>
                <h4 style={s.recTitle}>{opc.name}</h4>
                <span style={s.recSim}>相似度: {(opc.similarity * 100).toFixed(1)}%</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedOpc(opc); fetchRecommendations(opc.id); }}
                style={s.btnSmall}
              >
                查看
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 申请弹窗 */}
      {showApplyModal && selectedOpc && (
        <ApplyModal
          opc={selectedOpc}
          onClose={() => setShowApplyModal(false)}
          onSubmit={submitApplication}
          loading={applyLoading}
        />
      )}
    </div>
  );
}

export default Home;
