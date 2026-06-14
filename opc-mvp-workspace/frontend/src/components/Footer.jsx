import { space, fontSize, fontWeight, useColors } from '../styles/tokens';

const LINKS = [
  { label: '首页', href: '/' },
  { label: '统计', href: '/stats' },
  { label: '发布', href: '/publish' },
  { label: 'GitHub', href: 'https://github.com/lanaiconnan/opchub' },
];

export default function Footer() {
  const c = useColors();
  const isDark = c.bg === '#0d1117';

  return (
    <footer style={{
      backgroundColor: isDark ? '#161b22' : '#f6f8fa',
      borderTop: `1px solid ${c.border}`,
      padding: `${space.xl} 0`,
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: `0 24px`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.md,
      }}>
        {/* Links */}
        <div style={{ display: 'flex', gap: space.lg, flexWrap: 'wrap', justifyContent: 'center' }}>
          {LINKS.map(link => (
            <a key={link.label} href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              style={{
                color: c.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium,
                textDecoration: 'none', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = c.primary}
              onMouseLeave={e => e.currentTarget.style.color = c.textSecondary}
            >{link.label}</a>
          ))}
        </div>

        {/* Brand */}
        <div style={{
          fontSize: fontSize.sm, color: c.textMuted,
          display: 'flex', alignItems: 'center', gap: space.sm,
        }}>
          <span>🤝</span>
          <span>© {new Date().getFullYear()} Nexus — 找到你的协作伙伴</span>
        </div>
      </div>
    </footer>
  );
}
