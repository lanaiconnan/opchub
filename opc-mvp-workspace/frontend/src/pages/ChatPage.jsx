import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatInput from '../components/ChatInput';
import MarkdownRenderer from '../components/MarkdownRenderer';
import StatusMessage from '../components/StatusMessage';
import api from '../utils/api';
import { color, space, radius, fontSize, fontWeight, shadow, containerStyle } from '../styles/tokens';

// -------- 常量映射 --------
const CATEGORY_MAP = {
  web:    { icon: '🌐', label: 'Web 开发' },
  mobile: { icon: '📱', label: '移动开发' },
  ai:     { icon: '🤖', label: 'AI / 机器学习' },
  data:   { icon: '📊', label: '数据科学' },
  design: { icon: '🎨', label: '设计' },
  other:  { icon: '📁', label: '其他' },
};
const COLLAB_MAP = { once: '一次性协作', longterm: '长期合作', research: '研究项目' };
const EXP_MAP    = { beginner: '🌱 初学者友好', intermediate: '💡 需要经验', expert: '🏆 专家级', any: '不限' };

// -------- 申请弹窗 --------
function ApplyModal({ opc, onClose, onSubmit, loading }) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSubmit(message);
  };

  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <h3 style={s.modalTitle}>申请「{opc.name}」</h3>
        <p style={s.modalDesc}>向发布者说明你的技能、经验和合作意向</p>
        <textarea
          style={s.modalTextarea}
          placeholder="例如：我是前端开发，熟悉 React 和 TypeScript，对您的项目很感兴趣..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={6}
          autoFocus
        />
        <div style={s.modalActions}>
          <button onClick={onClose} style={s.btnCancel} disabled={loading}>取消</button>
          <button onClick={handleSubmit} style={s.btnSubmit} disabled={loading || !message.trim()}>
            {loading ? '提交中...' : '提交申请'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------- 主页面 --------
function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opc, setOpc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [starred, setStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [starLoading, setStarLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 获取 OPC 详情
  useEffect(() => {
    api.get(`/opc/detail/${id}`)
      .then(res => {
        setOpc(res.data);
        setLoading(false);
        setMessages([{
          role: 'assistant',
          content: `你好！我是 **${res.data.name}** 的 AI 协作助手 🤖\n\n## 我能帮你什么？\n\n- **生成沟通文案** — 帮你写专业的合作提案\n- **匹配建议** — 根据你的技能推荐协作方向\n- **合作方案** — 制定清晰的任务分工\n\n> 告诉我你的技能或合作意向，我会给出具体建议。`,
        }]);
      })
      .catch(() => { alert('OPC 不存在'); navigate('/'); });

    api.get(`/opc/star/${id}`).then(r => setStarCount(r.data.count || 0)).catch(() => {});
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get(`/opc/star/${id}/check`).then(r => setStarred(r.data.starred || false)).catch(() => {});
    }
  }, [id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleToggleStar = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { navigate('/login'); return; }
    setStarLoading(true);
    try {
      const res = await api.post(`/opc/star/${id}`, {});
      setStarred(res.data.starred);
      setStarCount(res.data.count);
    } catch (err) { console.error('Star 失败', err); }
    setStarLoading(false);
  };

  const handleApply = async (message) => {
    const token = localStorage.getItem('accessToken');
    if (!token) { navigate('/login'); return; }
    setApplyLoading(true);
    try {
      await api.post('/opc/apply', { opcId: parseInt(id), message });
      alert('✅ 申请已提交！');
      setShowApplyModal(false);
    } catch (err) {
      alert('申请失败：' + (err.response?.data?.error || '未知错误'));
    }
    setApplyLoading(false);
  };

  const handleSend = async (userMessage) => {
    if (!userMessage.trim() || sending) return;
    const userMsg = { role: 'user', content: userMessage };
    const loadingMsg = { role: 'assistant', content: '...' };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setSending(true);

    try {
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));
      const res = await api.post('/opc/chat', { opcId: parseInt(id), messages: [...history, userMsg] });
      setMessages(prev => { prev[prev.length - 1] = { role: 'assistant', content: res.data.reply }; return [...prev]; });
    } catch {
      setMessages(prev => { prev[prev.length - 1] = { role: 'assistant', content: '⚠️ AI 服务暂时不可用，请确认 Ollama 正在运行。' }; return [...prev]; });
    }
    setSending(false);
  };

  if (loading) return <StatusMessage variant="loading" />;
  if (!opc) return <StatusMessage variant="error" title="OPC 不存在" />;

  const cat = CATEGORY_MAP[opc.category] || CATEGORY_MAP.other;

  return (
    <div style={s.page}>
      {/* 顶部 OPC 信息栏 */}
      <div style={s.topBar}>
        <button onClick={() => navigate('/')} style={s.backBtn}>← 返回</button>
        <div style={s.topInfo}>
          <span style={s.topCatIcon}>{cat.icon}</span>
          <span style={s.topTitle}>{opc.name}</span>
          <span style={s.topSub}>AI 协作助手</span>
        </div>
        <button onClick={handleToggleStar} style={s.starBtn} disabled={starLoading}>
          {starred ? '⭐' : '☆'} {starCount}
        </button>
      </div>

      {/* OPC 详情（可折叠） */}
      <details style={s.opcDetails}>
        <summary style={s.detailsToggle}>查看项目详情</summary>
        <div style={s.opcCard}>
          {opc.description && <p style={s.opcDesc}>{opc.description}</p>}
          <div style={s.opcGrid}>
            <div style={s.opcField}><span style={s.fieldLabel}>分类</span><span style={s.fieldValue}>{cat.label}</span></div>
            <div style={s.opcField}><span style={s.fieldLabel}>协作类型</span><span style={s.fieldValue}>{COLLAB_MAP[opc.collaborationType] || '未设置'}</span></div>
            <div style={s.opcField}><span style={s.fieldLabel}>经验要求</span><span style={s.fieldValue}>{EXP_MAP[opc.experienceLevel] || '不限'}</span></div>
            {opc.timeCommitment && (
              <div style={s.opcField}><span style={s.fieldLabel}>时间投入</span><span style={s.fieldValue}>{opc.timeCommitment}</span></div>
            )}
          </div>
          {opc.requiredSkills?.length > 0 && (
            <div style={s.skillsSection}>
              <span style={s.fieldLabel}>所需技能：</span>
              <span style={s.skillsList}>{opc.requiredSkills.map(s => <span key={s} style={s.skillTag}>{s}</span>)}</span>
            </div>
          )}
          <div style={s.opcFooter}>
            <button onClick={() => setShowApplyModal(true)} style={s.applyBtn}>🤝 申请协作</button>
            <span style={s.contactInfo}>📞 {opc.contact}</span>
          </div>
        </div>
      </details>

      {/* 对话区域 */}
      <div style={s.chatArea}>
        {messages.map((msg, idx) => (
          <div key={idx} style={s.msgRow(msg.role)}>
            {msg.role === 'assistant' && <span style={s.avatar}>🤖</span>}
            <div style={s.bubble(msg.role)}>
              <MarkdownRenderer content={msg.content} variant={msg.role === 'user' ? 'dark' : 'light'} />
            </div>
            {msg.role === 'user' && <span style={s.avatarUser}>🧑</span>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={s.inputArea}>
        <ChatInput onSend={handleSend} disabled={sending} />
      </div>

      {/* 申请弹窗 */}
      {showApplyModal && (
        <ApplyModal opc={opc} onClose={() => setShowApplyModal(false)} onSubmit={handleApply} loading={applyLoading} />
      )}
    </div>
  );
}

export default ChatPage;

// -------- 样式 --------
const s = {
  page: {
    ...containerStyle,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 56px)',
    padding: `${space.md}px`,
  },
  // 顶栏
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: space.md,
    padding: `${space.sm}px ${space.md}px`,
    backgroundColor: color.surface,
    border: `1px solid ${color.border}`,
    borderRadius: radius.lg,
    marginBottom: space.md,
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    padding: `${space.xs}px ${space.sm}px`,
    cursor: 'pointer',
    fontSize: fontSize.sm,
    color: color.textPrimary,
    whiteSpace: 'nowrap',
  },
  topInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: space.sm,
    minWidth: 0,
  },
  topCatIcon: { fontSize: '18px', flexShrink: 0 },
  topTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: color.textPrimary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  topSub: {
    fontSize: fontSize.xs,
    color: color.textMuted,
    flexShrink: 0,
  },
  starBtn: {
    backgroundColor: 'transparent',
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    padding: `${space.xs}px ${space.sm}px`,
    cursor: 'pointer',
    fontSize: fontSize.sm,
    color: color.textPrimary,
    flexShrink: 0,
  },
  // OPC 详情
  opcDetails: {
    marginBottom: space.md,
  },
  detailsToggle: {
    cursor: 'pointer',
    fontSize: fontSize.sm,
    color: color.info,
    padding: `${space.xs}px 0`,
    userSelect: 'none',
  },
  opcCard: {
    backgroundColor: color.gray1,
    border: `1px solid ${color.border}`,
    borderRadius: radius.lg,
    padding: space.lg,
    marginTop: space.xs,
  },
  opcDesc: {
    color: color.textSecondary,
    fontSize: fontSize.base,
    marginBottom: space.md,
    lineHeight: 1.6,
  },
  opcGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: space.sm,
    marginBottom: space.md,
  },
  opcField: {
    display: 'flex',
    gap: space.xs,
    fontSize: fontSize.sm,
  },
  fieldLabel: {
    color: color.textMuted,
    fontWeight: fontWeight.medium,
  },
  fieldValue: {
    color: color.textPrimary,
  },
  skillsSection: {
    marginBottom: space.md,
  },
  skillsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.xs,
    marginTop: space.xs,
  },
  skillTag: {
    backgroundColor: color.infoLight,
    color: color.info,
    padding: `${space.xs}px ${space.xs}px`,
    borderRadius: radius.full,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  opcFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: space.md,
    borderTop: `1px solid ${color.border}`,
  },
  applyBtn: {
    backgroundColor: color.primary,
    color: '#fff',
    border: 'none',
    borderRadius: radius.md,
    padding: `${space.sm}px ${space.lg}px`,
    cursor: 'pointer',
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  contactInfo: {
    fontSize: fontSize.sm,
    color: color.textSecondary,
  },
  // 对话区域
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
    padding: `${space.sm}px 0`,
  },
  msgRow: (role) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: space.sm,
    justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
    maxWidth: '80%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
  }),
  avatar: {
    fontSize: '20px',
    flexShrink: 0,
    marginTop: '4px',
  },
  avatarUser: {
    fontSize: '20px',
    flexShrink: 0,
    marginTop: '4px',
  },
  bubble: (role) => ({
    padding: `${space.sm}px ${space.md}px`,
    borderRadius: role === 'user'
      ? `${radius.xl}px ${radius.xl}px ${space.xs}px ${radius.xl}px`
      : `${space.xs}px ${radius.xl}px ${radius.xl}px ${radius.xl}px`,
    fontSize: fontSize.base,
    lineHeight: 1.6,
    maxWidth: '100%',
    overflowWrap: 'break-word',
    ...(role === 'user'
      ? { backgroundColor: color.primary, color: '#fff' }
      : { backgroundColor: color.gray1, color: color.textPrimary, border: `1px solid ${color.border}` }
    ),
  }),
  inputArea: {
    borderTop: `1px solid ${color.border}`,
    paddingTop: space.md,
    marginTop: space.sm,
  },
  // 弹窗
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    width: '90%',
    maxWidth: '500px',
    boxShadow: shadow.modal,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: color.textPrimary,
    marginBottom: space.xs,
  },
  modalDesc: {
    fontSize: fontSize.base,
    color: color.textSecondary,
    marginBottom: space.lg,
  },
  modalTextarea: {
    width: '100%',
    padding: space.sm,
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    fontSize: fontSize.base,
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
    marginBottom: space.lg,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: space.sm,
  },
  btnCancel: {
    backgroundColor: 'transparent',
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    padding: `${space.sm}px ${space.lg}px`,
    cursor: 'pointer',
    fontSize: fontSize.base,
    color: color.textPrimary,
  },
  btnSubmit: {
    backgroundColor: color.primary,
    color: '#fff',
    border: 'none',
    borderRadius: radius.md,
    padding: `${space.sm}px ${space.lg}px`,
    cursor: 'pointer',
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
};
