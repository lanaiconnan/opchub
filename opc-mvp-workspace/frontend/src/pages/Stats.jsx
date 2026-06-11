import { useState, useEffect } from 'react';
import { space, fontSize, fontWeight, radius, shadow, containerStyle, useColors } from '../styles/tokens';
import { useIsMobile } from '../hooks/useMediaQuery';
import StatusMessage from '../components/StatusMessage';

// ---------- 纯 CSS 柱状图组件 ----------
function BarChart({ data, title, colorHex, maxBarWidth = 280 }) {
  const c = useColors();
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxVal = Math.max(1, ...entries.map(e => e[1]));
  const isDark = c.bg === '#0d1117'; // quick dark detect

  return (
    <div style={{ marginBottom: space.xxl }}>
      <h3 style={{
        fontSize: fontSize.lg, fontWeight: fontWeight.semibold,
        color: c.text, margin: `0 0 ${space.md} 0`,
      }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
        {entries.map(([label, count]) => {
          const pct = Math.round((count / maxVal) * 100);
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: space.md }}>
              <div style={{
                width: '100px', textAlign: 'right', flexShrink: 0,
                fontSize: fontSize.sm, color: c.textSecondary,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }} title={label}>{label || '(未设置)'}</div>
              <div style={{
                flex: 1, height: '24px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                borderRadius: radius.sm, overflow: 'hidden',
                maxWidth: maxBarWidth,
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  backgroundColor: colorHex || c.primary,
                  borderRadius: radius.sm,
                  transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  paddingRight: pct > 15 ? space.sm : '0',
                }}>
                  <span style={{
                    fontSize: fontSize.xs, fontWeight: fontWeight.semibold,
                    color: '#fff',
                    opacity: pct > 15 ? 1 : 0,
                  }}>{count}</span>
                </div>
              </div>
              <span style={{
                width: '28px', fontSize: fontSize.sm, fontWeight: fontWeight.semibold,
                color: c.textSecondary,
              }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- 统计卡片 ----------
function StatCard({ label, value, icon }) {
  const c = useColors();
  return (
    <div style={{
      flex: '1 1 160px', minWidth: '140px',
      backgroundColor: c.cardBg, borderRadius: radius.lg,
      padding: `${space.lg} ${space.xl}`,
      boxShadow: shadow.card, textAlign: 'center',
    }}>
      <div style={{ fontSize: '28px', marginBottom: space.xs, opacity: 0.6 }}>{icon}</div>
      <div style={{
        fontSize: fontSize.hero, fontWeight: fontWeight.bold,
        color: c.text, lineHeight: 1.2,
      }}>{value}</div>
      <div style={{
        fontSize: fontSize.sm, color: c.textSecondary,
        marginTop: space.xs,
      }}>{label}</div>
    </div>
  );
}

// ---------- ----------
const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Stats() {
  const c = useColors();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/opc/stats', { headers })
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <StatusMessage variant="loading" text="加载统计数据..." />;
  if (error) return <StatusMessage variant="error" text={`加载失败：${error}`} />;

  const { global, personal } = stats;

  // 准备展示的分类名称映射
  const catNames = { tech: '技术', design: '设计', art: '艺术', Web: 'Web', web: 'Web', other: '其他' };
  const typeNames = { once: '一次性', longterm: '长期', '长期': '长期' };
  const levelNames = { any: '不限', beginner: '初级', intermediate: '中级', '中级': '中级', advanced: '高级' };

  const translate = (map, obj) => {
    const r = {};
    for (const [k, v] of Object.entries(obj)) r[map[k] || k] = v;
    return r;
  };

  // 图表颜色
  const getColor = (i) => COLORS[i % COLORS.length];

  return (
    <div style={{
      ...containerStyle, paddingTop: space.xxxl, paddingBottom: space.huge,
      minHeight: 'calc(100vh - 60px)',
    }}>
      {/* 标题 */}
      <h1 style={{
        fontSize: isMobile ? fontSize.xxl : fontSize.xxxl,
        fontWeight: fontWeight.bold, color: c.text,
        margin: `0 0 ${space.xl} 0`, letterSpacing: '-0.5px',
      }}>📊 平台统计</h1>

      {/* 全局概览卡片 */}
      <div style={{
        display: 'flex', gap: space.md, flexWrap: 'wrap',
        marginBottom: space.xxxl,
      }}>
        <StatCard icon="📦" value={global.total} label="项目总数" />
        <StatCard icon="🏷️" value={Object.keys(global.byCategory).length} label="覆盖分类" />
        <StatCard icon="🔧" value={Object.keys(global.bySkill).length} label="技能标签" />
        <StatCard icon="🤝" value={Object.keys(global.byCollaborationType).length} label="协作类型" />
      </div>

      {/* 全局分类柱状图 */}
      <h2 style={{
        fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: c.text,
        margin: `0 0 ${space.lg} 0`, paddingBottom: space.sm,
        borderBottom: `1px solid ${c.border}`,
      }}>🌍 全站分布</h2>
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: `${space.md} ${space.xxxl}`,
      }}>
        <BarChart data={translate(catNames, global.byCategory)} title="按分类" colorHex={COLORS[0]} />
        <BarChart data={global.bySkill} title="按技能需求" colorHex={COLORS[3]} />
        <BarChart data={translate(typeNames, global.byCollaborationType)} title="按协作类型" colorHex={COLORS[4]} />
        <BarChart data={translate(levelNames, global.byExperienceLevel)} title="按经验要求" colorHex={COLORS[5]} />
      </div>
      {Object.keys(global.byTimeCommitment).length > 0 && (
        <div style={{ maxWidth: isMobile ? '100%' : '50%' }}>
          <BarChart data={global.byTimeCommitment} title="按时间投入" colorHex={COLORS[7]} />
        </div>
      )}

      {/* 个人统计 */}
      {personal && (
        <>
          <h2 style={{
            fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: c.text,
            margin: `${space.xxxl} 0 ${space.lg} 0`, paddingBottom: space.sm,
            borderBottom: `1px solid ${c.border}`,
          }}>👤 我的统计</h2>

          <div style={{
            display: 'flex', gap: space.md, flexWrap: 'wrap',
            marginBottom: space.xxxl,
          }}>
            <StatCard icon="📦" value={personal.total} label="我的项目" />
            <StatCard icon="📤" value={personal.applicationsSent} label="发出申请" />
            <StatCard icon="📥" value={personal.applicationsReceived} label="收到申请" />
          </div>

          {personal.total > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: `${space.md} ${space.xxxl}`,
            }}>
              <BarChart data={translate(catNames, personal.byCategory)} title="我的分类" colorHex={COLORS[0]} />
              <BarChart data={personal.bySkill} title="我的技能标签" colorHex={COLORS[3]} />
              <BarChart data={translate(typeNames, personal.byCollaborationType)} title="我的协作类型" colorHex={COLORS[4]} />
              <BarChart data={translate(levelNames, personal.byExperienceLevel)} title="我的经验要求" colorHex={COLORS[5]} />
            </div>
          )}
          {personal.total === 0 && (
            <p style={{ color: c.textSecondary, fontSize: fontSize.md }}>
              你还没有发布项目，<a href="/publish" style={{ color: c.primary }}>去发布第一个</a>！
            </p>
          )}
        </>
      )}
    </div>
  );
}
