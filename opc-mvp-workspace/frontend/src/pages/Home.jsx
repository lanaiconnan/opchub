import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';
import api from '../utils/api';
import { space, fontSize, fontWeight, shadow, containerStyle, useColors } from '../styles/tokens';
import { useIsMobile } from '../hooks/useMediaQuery';

// -------- 分类 Tab 配置 --------
const TABS = [
  { key: '', label: '全部', icon: '🔥' },
  { key: 'web', label: 'Web', icon: '🌐' },
  { key: 'mobile', label: '移动端', icon: '📱' },
  { key: 'ai', label: 'AI/ML', icon: '🤖' },
  { key: 'data', label: '数据', icon: '📊' },
  { key: 'design', label: '设计', icon: '🎨' },
  { key: 'other', label: '其他', icon: '📁' },
];

const CATEGORY_COLORS = {
  web:    { bg: '#ddf4ff', text: '#0969da', darkBg: '#0c2d4d', darkText: '#79c0ff' },
  mobile: { bg: '#fbe0ff', text: '#8250df', darkBg: '#2a1b3d', darkText: '#d2a8ff' },
  ai:     { bg: '#dafbe4', text: '#116329', darkBg: '#0d2917', darkText: '#56d364' },
  data:   { bg: '#fff8f0', text: '#bc4c00', darkBg: '#2a1c0a', darkText: '#d29922' },
  design: { bg: '#ffeff7', text: '#bf3989', darkBg: '#2d1224', darkText: '#f778ba' },
  other:  { bg: '#f6f8fa', text: '#656d76', darkBg: '#21262d', darkText: '#8b949e' },
};

// -------- 时间格式化 --------
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return '';
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}个月前`;
  return `${Math.floor(months / 12)}年前`;
}

// -------- 申请弹窗 --------
function ApplyModal({ opc, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ applicantName: '', applicantContact: '', message: '' });
  const c = useColors();

  const handleSubmit = () => {
    if (!form.applicantName.trim() || !form.applicantContact.trim()) return;
    onSubmit(form);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: c.surface, borderRadius: '12px', padding: space.xl,
        width: '90%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: shadow.modal,
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: c.textPrimary, margin: `0 0 ${space.lg} 0` }}>
          申请加入「{opc.name}」
        </h3>
        {[['applicantName', '你的姓名', true], ['applicantContact', '联系方式', true], ['message', '留言（可选）', false]].map(([key, label, required]) => (
          <div key={key} style={{ marginBottom: space.md }}>
            <label style={{ display: 'block', fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: c.textPrimary, marginBottom: space.xs }}>
              {label}{required && ' *'}
            </label>
            <input
              style={{
                width: '100%', padding: `${space.sm}px ${space.md}px`,
                fontSize: fontSize.base, border: `1px solid ${c.border}`,
                borderRadius: '8px', boxSizing: 'border-box', outline: 'none',
                backgroundColor: c.gray0, color: c.textPrimary, fontFamily: 'inherit',
              }}
              value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={required ? '必填' : ''}
            />
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: space.sm, marginTop: space.lg }}>
          <button onClick={onClose} style={{
            backgroundColor: c.gray1, color: c.textPrimary,
            padding: `${space.sm}px ${space.lg}px`, borderRadius: '8px',
            fontSize: fontSize.base, fontWeight: fontWeight.medium,
            border: `1px solid ${c.border}`, cursor: 'pointer',
          }}>取消</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            backgroundColor: c.primary, color: '#fff',
            padding: `${space.sm}px ${space.lg}px`, borderRadius: '8px',
            fontSize: fontSize.base, fontWeight: fontWeight.semibold,
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          }}>{loading ? '提交中...' : '提交申请'}</button>
        </div>
      </div>
    </div>
  );
}

// -------- 仓库列表式卡片 --------
function RepoCard({ opc, starData, onStar, onApply, onChat, isDark }) {
  const c = useColors();
  const catColors = CATEGORY_COLORS[opc.category] || CATEGORY_COLORS.other;
  const catBg = isDark ? catColors.darkBg : catColors.bg;
  const catText = isDark ? catColors.darkText : catColors.text;

  const collabMap = { once: '一次性', longterm: '长期', research: '研究', '长期': '长期' };
  const expMap = { beginner: '🌱 初学者', intermediate: '💡 有经验', expert: '🏆 专家', any: '不限', '中级': '💡 有经验' };

  return (
    <div style={{
      padding: `${space.lg} ${space.xl}`,
      borderBottom: `1px solid ${c.border}`,
      borderLeft: '3px solid transparent',
      transition: 'border-left-color 0.15s, background-color 0.15s',
      cursor: 'pointer',
    }}
    onClick={onChat}
    onMouseEnter={e => {
      e.currentTarget.style.borderLeftColor = c.primary;
      e.currentTarget.style.backgroundColor = isDark ? '#161b22' : '#f6f8fa';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderLeftColor = 'transparent';
      e.currentTarget.style.backgroundColor = 'transparent';
    }}
    >
      {/* 标题行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, marginBottom: space.xs, flexWrap: 'wrap' }}>
        <h3 style={{
          fontSize: fontSize.lg, fontWeight: fontWeight.semibold,
          color: c.primary, margin: 0, cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}>{opc.name}</h3>
        <span style={{
          padding: `1px ${space.sm}px`, borderRadius: '9999px',
          fontSize: fontSize.xs, fontWeight: fontWeight.medium,
          backgroundColor: catBg, color: catText,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        }}>{opc.category || 'other'}</span>
        {opc.collaborationType && opc.collaborationType !== 'once' && (
          <span style={{
            padding: `1px ${space.sm}px`, borderRadius: '9999px',
            fontSize: fontSize.xs, fontWeight: fontWeight.medium,
            backgroundColor: isDark ? '#2a2013' : '#fff8f0', color: isDark ? '#d29922' : '#bc4c00',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}>{collabMap[opc.collaborationType] || opc.collaborationType}</span>
        )}
      </div>

      {/* 描述行 */}
      {opc.description && (
        <p style={{
          color: c.textSecondary, fontSize: fontSize.base, margin: `0 0 ${space.sm} 0`,
          lineHeight: 1.5, maxWidth: '720px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{opc.description}</p>
      )}

      {/* 标签 + meta 行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: space.md, flexWrap: 'wrap', marginTop: space.xs }}>
        {opc.requiredSkills?.slice(0, 4).map((sk, i) => (
          <span key={i} style={{
            padding: `1px ${space.sm}px`, borderRadius: '9999px',
            fontSize: fontSize.xs, fontWeight: fontWeight.medium,
            backgroundColor: isDark ? '#0c1e2e' : '#ddf4ff', color: isDark ? '#58a6ff' : '#0969da',
          }}>{sk}</span>
        ))}
        {(opc.requiredSkills?.length || 0) > 4 && (
          <span style={{ fontSize: fontSize.xs, color: c.textMuted }}>+{(opc.requiredSkills?.length || 0) - 4}</span>
        )}
        {opc.experienceLevel && opc.experienceLevel !== 'any' && (
          <span style={{ fontSize: fontSize.sm, color: c.textMuted }}>{expMap[opc.experienceLevel] || opc.experienceLevel}</span>
        )}
        {opc.timeCommitment && (
          <span style={{ fontSize: fontSize.sm, color: c.textMuted }}>⏱ {opc.timeCommitment}</span>
        )}
        <span style={{ fontSize: fontSize.sm, color: c.textMuted }}>
          {starData[opc.id]?.starred ? '⭐' : '☆'} {starData[opc.id]?.count || 0}
        </span>
        {opc.createdAt && (
          <span style={{ fontSize: fontSize.sm, color: c.textMuted }}>更新于 {timeAgo(opc.createdAt)}</span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: space.sm }}>
          <button onClick={e => { e.stopPropagation(); onStar(opc.id, e); }} style={{
            background: 'none', border: `1px solid ${c.border}`, borderRadius: '6px',
            padding: `${space.xs}px ${space.sm}px`, fontSize: fontSize.sm,
            cursor: 'pointer', color: c.textSecondary, transition: 'border-color 0.15s',
          }}>
            {starData[opc.id]?.starred ? '★ Starred' : '☆ Star'}
          </button>
          <button onClick={e => { e.stopPropagation(); onApply(); }} style={{
            background: c.primary, color: '#fff', border: 'none', borderRadius: '6px',
            padding: `${space.xs}px ${space.md}px`, fontSize: fontSize.sm,
            fontWeight: fontWeight.semibold, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>申请加入</button>
        </div>
      </div>
    </div>
  );
}

// -------- Sidebar --------
function Sidebar({ stats, opcList, navigate, isDark }) {
  const c = useColors();

  // 热门标签
  const topSkills = useMemo(() => {
    const map = {};
    (opcList || []).forEach(opc => (opc.requiredSkills || []).forEach(s => { map[s] = (map[s] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [opcList]);

  // 分类统计
  const categories = stats?.byCategory || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.lg }}>
      {/* 统计摘要 */}
      <div style={{
        backgroundColor: c.surface, border: `1px solid ${c.border}`,
        borderRadius: '8px', padding: space.lg,
      }}>
        <h4 style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: c.textPrimary, margin: `0 0 ${space.md} 0` }}>
          📊 平台概览
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.sm }}>
          {[
            ['📦 项目', stats?.total || 0],
            ['🏷️ 分类', Object.keys(categories).length],
            ['🔧 技能', Object.keys(stats?.bySkill || {}).length],
            ['🤝 协作', Object.keys(stats?.byCollaborationType || {}).length],
          ].map(([label, value]) => (
            <div key={label} style={{
              textAlign: 'center', padding: space.sm,
              backgroundColor: isDark ? '#21262d' : '#f6f8fa', borderRadius: '6px',
            }}>
              <div style={{ fontSize: fontSize.hero, fontWeight: fontWeight.bold, color: c.textPrimary, lineHeight: 1.2 }}>{value}</div>
              <div style={{ fontSize: fontSize.xs, color: c.textMuted, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
        <a href="/stats" style={{
          display: 'block', textAlign: 'center', marginTop: space.md,
          fontSize: fontSize.sm, color: c.primary, textDecoration: 'none',
        }}>查看详细统计 →</a>
      </div>

      {/* 热门标签 */}
      {topSkills.length > 0 && (
        <div style={{
          backgroundColor: c.surface, border: `1px solid ${c.border}`,
          borderRadius: '8px', padding: space.lg,
        }}>
          <h4 style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: c.textPrimary, margin: `0 0 ${space.md} 0` }}>
            🔥 热门技能
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.xs }}>
            {topSkills.map(([skill, count]) => (
              <span key={skill} style={{
                padding: `${space.xs}px ${space.sm}px`, borderRadius: '9999px',
                fontSize: fontSize.sm, fontWeight: fontWeight.medium,
                backgroundColor: isDark ? '#0c1e2e' : '#ddf4ff', color: isDark ? '#58a6ff' : '#0969da',
              }}>{skill} <span style={{ opacity: 0.6 }}>×{count}</span></span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Home 主页面
// ============================================================
export default function Home() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const color = useColors();
  const isDark = color.bg === '#0d1117';

  const [opcList, setOpcList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('');
  const [starData, setStarData] = useState({});
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedOpc, setSelectedOpc] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // 加载数据
  useEffect(() => {
    api.get('/opc/list').then(res => {
      setOpcList(res.data);
      setLoading(false);
      if (res.data.length > 0) fetchStarData(res.data.map(o => o.id));
    }).catch(() => setLoading(false));

    // 加载统计（无需 token 也有全局统计）
    fetch('/opc/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const fetchStarData = async (ids) => {
    try {
      const res = await api.get(`/opc/star/batch?ids=${ids.join(',')}`);
      setStarData(res.data);
    } catch { /* ignore */ }
  };

  const toggleStar = async (opcId, e) => {
    e?.stopPropagation();
    try {
      const res = await api.post(`/opc/star/${opcId}`);
      setStarData(prev => ({
        ...prev,
        [opcId]: { starred: res.data.starred, count: res.data.count },
      }));
    } catch { /* ignore */ }
  };

  const submitApplication = async (form) => {
    if (!selectedOpc) return;
    setApplyLoading(true);
    try {
      await api.post(`/opc/apply/${selectedOpc.id}`, form);
      setShowApplyModal(false);
    } catch { /* ignore */ }
    setApplyLoading(false);
  };

  // 筛选
  const filteredList = useMemo(() => {
    return opcList.filter(opc => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (![opc.name, opc.description, opc.tags, ...(opc.requiredSkills || [])].join(' ').toLowerCase().includes(q)) return false;
      }
      if (activeTab && opc.category !== activeTab) return false;
      return true;
    });
  }, [opcList, search, activeTab]);

  // ---- 样式 ----
  const searchInput = {
    flex: 1, padding: `${space.sm}px ${space.md}px`,
    fontSize: fontSize.base, border: `1px solid ${color.border}`,
    borderRadius: '8px', outline: 'none', boxSizing: 'border-box',
    backgroundColor: color.surface, color: color.textPrimary, fontFamily: 'inherit',
    minWidth: 0,
  };

  return (
    <div style={{ ...containerStyle, paddingTop: space.xl, paddingBottom: space.huge, minHeight: 'calc(100vh - 60px)' }}>

      {/* 搜索栏 */}
      <div style={{
        display: 'flex', gap: space.sm, marginBottom: space.lg,
        flexDirection: isMobile ? 'column' : 'row',
      }}>
        <input
          style={searchInput}
          type="text"
          placeholder="搜索项目名称、描述、技能..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {isLoggedIn() && (
          <button onClick={() => navigate('/publish')} style={{
            backgroundColor: color.primary, color: '#fff', border: 'none',
            borderRadius: '8px', padding: `${space.sm}px ${space.lg}px`,
            fontSize: fontSize.base, fontWeight: fontWeight.semibold,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>＋ 发布项目</button>
        )}
      </div>

      {/* 分类 Tab */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: `1px solid ${color.border}`,
        marginBottom: 0, overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': { display: 'none' },
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: `${space.sm}px ${space.md}px`,
              fontSize: fontSize.base, fontWeight: activeTab === tab.key ? fontWeight.semibold : fontWeight.normal,
              color: activeTab === tab.key ? color.primary : color.textSecondary,
              backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === tab.key ? `2px solid ${color.primary}` : '2px solid transparent',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 主体：列表 + Sidebar */}
      <div style={{
        display: 'flex', gap: space.xl,
        flexDirection: isMobile ? 'column' : 'row',
      }}>
        {/* 左：列表 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 列表头 */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: `${space.sm}px ${space.md}px`,
            backgroundColor: isDark ? '#161b22' : '#f6f8fa',
            borderBottom: `1px solid ${color.border}`,
            borderTop: `1px solid ${color.border}`,
          }}>
            <span style={{ fontSize: fontSize.sm, color: color.textSecondary }}>
              {loading ? '加载中...' : `${filteredList.length} 个项目`}
            </span>
            {(search || activeTab) && (
              <button onClick={() => { setSearch(''); setActiveTab(''); }} style={{
                background: 'none', border: 'none', color: color.primary,
                fontSize: fontSize.sm, cursor: 'pointer', fontWeight: fontWeight.medium,
              }}>清除筛选</button>
            )}
          </div>

          {loading && <StatusMessage variant="loading" />}

          {!loading && filteredList.length === 0 && (
            <StatusMessage
              variant="empty"
              title={opcList.length === 0 ? '还没有项目' : '没有匹配的项目'}
              description={opcList.length === 0 ? '点击「发布项目」创建第一个协作项目吧！' : '试试调整筛选条件～'}
            />
          )}

          {filteredList.map(opc => (
            <RepoCard
              key={opc.id}
              opc={opc}
              starData={starData}
              isDark={isDark}
              onStar={toggleStar}
              onApply={() => { setSelectedOpc(opc); setShowApplyModal(true); }}
              onChat={() => navigate(`/opc/${opc.id}`)}
            />
          ))}
        </div>

        {/* 右：Sidebar */}
        {!isMobile && (
          <div style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '72px', alignSelf: 'flex-start' }}>
            <Sidebar stats={stats?.global} opcList={opcList} navigate={navigate} isDark={isDark} />
          </div>
        )}
      </div>

      {/* 移动端 sidebar 移到列表下方 */}
      {isMobile && <Sidebar stats={stats?.global} opcList={opcList} navigate={navigate} isDark={isDark} />}

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

function isLoggedIn() {
  return !!localStorage.getItem('accessToken');
}
