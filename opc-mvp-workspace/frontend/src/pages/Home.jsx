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
function RepoCard({ opc, starData, applicantCounts, onStar, onApply, onChat, isDark }) {
  const c = useColors();
  const catColors = CATEGORY_COLORS[opc.category] || CATEGORY_COLORS.other;
  const catBg = isDark ? catColors.darkBg : catColors.bg;
  const catText = isDark ? catColors.darkText : catColors.text;
  const starred = starData[opc.id]?.starred;
  const starCount = starData[opc.id]?.count || 0;
  const appCount = applicantCounts[opc.id] || 0;

  const collabMap = { once: '一次性', longterm: '长期', research: '研究', '长期': '长期' };
  const expMap = { beginner: '🌱 初学者', intermediate: '💡 有经验', expert: '🏆 专家', any: '不限', '中级': '💡 有经验' };

  return (
    <div style={{
      padding: `${space.lg} ${space.xl}`,
      borderBottom: `1px solid ${c.border}`,
      borderLeft: '3px solid transparent',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }}
    onClick={onChat}
    onMouseEnter={e => {
      e.currentTarget.style.borderLeftColor = c.primary;
      e.currentTarget.style.backgroundColor = isDark ? '#161b22' : '#f6f8fa';
      e.currentTarget.style.boxShadow = isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderLeftColor = 'transparent';
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* 标题行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, marginBottom: space.xs, flexWrap: 'wrap' }}>
        <h3 style={{
          fontSize: fontSize.lg, fontWeight: fontWeight.semibold,
          color: c.primary, margin: 0, cursor: 'pointer',
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
        {opc.experienceLevel && opc.experienceLevel !== 'any' && (
          <span style={{ fontSize: fontSize.xs, color: c.textMuted }}>{expMap[opc.experienceLevel] || opc.experienceLevel}</span>
        )}
        {opc.timeCommitment && (
          <span style={{ fontSize: fontSize.xs, color: c.textMuted }}>⏱ {opc.timeCommitment}</span>
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

        {/* 分隔符 */}
        <span style={{ color: c.border, fontSize: fontSize.md }}>·</span>

        {/* Star */}
        <span style={{
          fontSize: fontSize.sm,
          color: starred ? '#d29922' : c.textMuted,
          fontWeight: starred ? fontWeight.medium : fontWeight.normal,
        }}>
          {starred ? '⭐' : '☆'} {starCount}
        </span>

        {/* 申请人数 */}
        {appCount > 0 && (
          <span style={{ fontSize: fontSize.sm, color: c.textMuted }}>
            📩 {appCount} 人申请
          </span>
        )}

        {/* 更新时间 */}
        {opc.createdAt && (
          <span style={{ fontSize: fontSize.sm, color: c.textMuted }}>
            更新于 {timeAgo(opc.createdAt)}
          </span>
        )}

        {/* 右侧按钮 */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: space.sm }}>
          <button onClick={e => { e.stopPropagation(); onStar(opc.id, e); }} style={{
            background: starred ? 'rgba(210,153,34,0.1)' : 'none',
            border: `1px solid ${starred ? '#d29922' : c.border}`,
            borderRadius: '6px',
            padding: `${space.xs}px ${space.sm}px`, fontSize: fontSize.sm,
            cursor: 'pointer',
            color: starred ? '#d29922' : c.textSecondary,
            fontWeight: starred ? fontWeight.medium : fontWeight.normal,
            transition: 'all 0.15s',
          }}>
            {starred ? '★ Starred' : '☆ Star'}
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

// -------- Skeleton 骨架屏 --------
function SkeletonCard() {
  const c = useColors();
  const base = {
    height: '14px', borderRadius: '4px',
    backgroundColor: isDark => isDark ? '#21262d' : '#e5e7eb',
    animation: 'pulse 1.5s ease-in-out infinite',
  };
  const isDark = c.bg === '#0d1117';
  return (
    <div style={{
      padding: `${space.lg}px ${space.xl}px`,
      borderBottom: `1px solid ${c.border}`,
    }}>
      <div style={{ display: 'flex', gap: space.sm, marginBottom: space.sm }}>
        <div style={{ ...base, width: '140px', backgroundColor: isDark ? '#21262d' : '#e5e7eb' }} />
        <div style={{ ...base, width: '48px', backgroundColor: isDark ? '#21262d' : '#e5e7eb' }} />
      </div>
      <div style={{ ...base, width: '80%', marginBottom: space.sm, backgroundColor: isDark ? '#21262d' : '#e5e7eb' }} />
      <div style={{ ...base, width: '60%', backgroundColor: isDark ? '#21262d' : '#e5e7eb' }} />
    </div>
  );
}

// -------- Sidebar --------
function Sidebar({ stats, opcList, navigate, isDark }) {
  const c = useColors();

  const topSkills = useMemo(() => {
    const map = {};
    (opcList || []).forEach(opc => (opc.requiredSkills || []).forEach(s => { map[s] = (map[s] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [opcList]);

  const categories = stats?.byCategory || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.lg }}>
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
  const [applicantCounts, setApplicantCounts] = useState({});
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedOpc, setSelectedOpc] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const searchRef = useRef(null);

  // 加载数据
  useEffect(() => {
    api.get('/opc/list').then(res => {
      setOpcList(res.data);
      setLoading(false);
      const ids = res.data.map(o => o.id);
      if (ids.length > 0) {
        fetchStarData(ids);
        fetchApplicantCounts(ids);
      }
    }).catch(() => setLoading(false));

    fetch('/opc/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  // `/` 快捷键聚焦搜索框
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = e.target.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.target.isContentEditable) {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // 从 URL 参数同步搜索词
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== search) setSearch(q);
  }, [searchParams]);

  const fetchStarData = async (ids) => {
    try {
      const res = await api.get(`/opc/star/batch?ids=${ids.join(',')}`);
      setStarData(res.data);
    } catch { /* ignore */ }
  };

  const fetchApplicantCounts = async (ids) => {
    try {
      const res = await fetch(`/opc/applicant-counts?ids=${ids.join(',')}`).then(r => r.json());
      setApplicantCounts(res);
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
      // 刷新申请人数
      fetchApplicantCounts(opcList.map(o => o.id));
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

  return (
    <div style={{ ...containerStyle, paddingTop: space.xl, paddingBottom: space.huge, minHeight: 'calc(100vh - 60px)' }}>

      {/* 搜索栏 */}
      <div style={{
        display: 'flex', gap: space.sm, marginBottom: space.lg,
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={searchRef}
            style={{
              width: '100%',
              padding: `${space.md}px ${space.lg}px ${space.md}px 40px`,
              fontSize: fontSize.lg,
              border: `1px solid ${color.border}`,
              borderRadius: '10px',
              outline: 'none', boxSizing: 'border-box',
              backgroundColor: color.surface, color: color.textPrimary,
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            type="text"
            placeholder="搜索项目名称、描述、技能..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => {
              e.target.style.borderColor = color.primary;
              e.target.style.boxShadow = `0 0 0 3px ${isDark ? 'rgba(88,166,255,0.2)' : 'rgba(9,105,218,0.15)'}`;
            }}
            onBlur={e => {
              e.target.style.borderColor = color.border;
              e.target.style.boxShadow = 'none';
            }}
          />
          <span style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: color.textMuted, fontSize: fontSize.md, pointerEvents: 'none',
          }}>🔍</span>
          <kbd style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            padding: '2px 6px', borderRadius: '4px',
            fontSize: fontSize.xs, fontWeight: fontWeight.medium,
            backgroundColor: isDark ? '#21262d' : '#f6f8fa',
            color: color.textMuted,
            border: `1px solid ${color.border}`,
            pointerEvents: 'none', fontFamily: 'inherit',
          }}>/</kbd>
        </div>
        {isLoggedIn() && (
          <button onClick={() => navigate('/publish')} style={{
            backgroundColor: color.primary, color: '#fff', border: 'none',
            borderRadius: '10px', padding: `${space.md}px ${space.lg}px`,
            fontSize: fontSize.base, fontWeight: fontWeight.semibold,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>＋ 发布项目</button>
        )}
      </div>

      {/* 分类 Tab */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: `1px solid ${color.border}`,
        marginBottom: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: `${space.sm}px ${space.md}px`,
              fontSize: fontSize.base, fontWeight: activeTab === tab.key ? fontWeight.semibold : fontWeight.normal,
              color: activeTab === tab.key ? color.primary : color.textSecondary,
              backgroundColor: 'transparent', border: 'none',
              borderBottom: activeTab === tab.key ? `2px solid ${color.primary}` : '2px solid transparent',
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

          {/* 骨架屏 / 空状态 / 列表 */}
          {loading && (
            <div>
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

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
              applicantCounts={applicantCounts}
              isDark={isDark}
              onStar={toggleStar}
              onApply={() => { setSelectedOpc(opc); setShowApplyModal(true); }}
              onChat={() => navigate(`/opc/${opc.id}`)}
            />
          ))}
        </div>

        {!isMobile && (
          <div style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '72px', alignSelf: 'flex-start' }}>
            <Sidebar stats={stats?.global} opcList={opcList} navigate={navigate} isDark={isDark} />
          </div>
        )}
      </div>

      {isMobile && <Sidebar stats={stats?.global} opcList={opcList} navigate={navigate} isDark={isDark} />}

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
