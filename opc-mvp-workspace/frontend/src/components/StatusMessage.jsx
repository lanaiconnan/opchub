import { fontSize, color, space, radius } from '../styles/tokens';

const fontWeight = {
  semibold: 600,
};

/**
 * 统一状态组件：loading / empty / error
 * variant: 'loading' | 'empty' | 'error'
 */
export default function StatusMessage({ variant = 'loading', title, description }) {
  const config = {
    loading: {
      icon: '⏳',
      defaultTitle: '加载中...',
      bg: color.gray1,
      color: color.textSecondary,
    },
    empty: {
      icon: '📭',
      defaultTitle: '暂无数据',
      bg: color.gray1,
      color: color.textSecondary,
    },
    error: {
      icon: '⚠️',
      defaultTitle: '出错了',
      bg: color.dangerLight,
      color: color.danger,
    },
  };

  const c = config[variant] || config.loading;

  return (
    <div style={s.wrapper(c.bg)}>
      <div style={s.icon}>{c.icon}</div>
      <div style={s.title(c.color)}>{title || c.defaultTitle}</div>
      {description && <div style={s.desc}>{description}</div>}
    </div>
  );
}

const s = {
  wrapper: (bg) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${space.xxl}px`,
    backgroundColor: bg,
    borderRadius: radius.lg,
    border: `1px dashed ${color.border}`,
    textAlign: 'center',
    margin: `${space.md}px 0`,
  }),
  icon: {
    fontSize: '36px',
    marginBottom: space.sm,
  },
  title: (c) => ({
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: c,
    marginBottom: space.xs,
  }),
  desc: {
    fontSize: fontSize.base,
    color: color.textSecondary,
    maxWidth: '360px',
    lineHeight: 1.6,
  },
};
