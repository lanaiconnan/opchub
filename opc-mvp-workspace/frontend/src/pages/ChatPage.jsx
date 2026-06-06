import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatInput from '../components/ChatInput';
import MarkdownRenderer from '../components/MarkdownRenderer';
import api from '../utils/api';

// ------- 常量映射 --------
const categoryMap = {
  web: '🌐',
  mobile: '📱',
  ai: '🤖',
  data: '📊',
  design: '🎨',
  other: '📁',
};
const categoryLabelMap = {
  web: 'Web 开发',
  mobile: '移动开发',
  ai: 'AI / 机器学习',
  data: '数据科学',
  design: '设计',
  other: '其他',
};
const collabTypeMap = {
  once: '一次性协作',
  longterm: '长期合作',
  research: '研究项目',
};
const expLevelMap = {
  beginner: '初学者友好',
  intermediate: '需要一定经验',
  expert: '需要专家级',
  any: '不限',
};

// ------- 申请弹窗 --------
function ApplyModal({ onClose, onSubmit, loading }) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSubmit(message);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={styles.modalTitle}>申请协作</h3>
        <p style={styles.modalDesc}>向发布者说明你的技能、经验和合作意向</p>
        <textarea
          style={styles.modalTextarea}
          placeholder="例如：我是前端开发，熟悉 React 和 TypeScript，对您的项目很感兴趣..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
        />
        <div style={styles.modalActions}>
          <button onClick={onClose} style={styles.modalCancelBtn} disabled={loading}>
            取消
          </button>
          <button onClick={handleSubmit} style={styles.modalSubmitBtn} disabled={loading}>
            {loading ? '提交中...' : '提交申请'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------- 主页面 --------
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

  // 获取 OPC 详情 + Star 状态
  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    api.get(`/opc/detail/${id}`)
      .then(res => {
        setOpc(res.data);
        setLoading(false);
        setMessages([
          {
            role: 'assistant',
            content: `你好！我是 **${res.data.name}** 的 AI 协作助手 🤖\n\n## 我可以帮你\n\n- 📝 **生成沟通文案** — 帮你写专业的合作提案\n- 💡 **匹配建议** — 根据你的技能推荐协作方向\n- 📋 **合作提案** — 制定清晰的任务分工和时间表\n\n> 告诉我你的技能、经验或合作意向，我会给出具体建议。\n\n\`\`\`\n示例：我是前端开发，熟悉 React 和 TypeScript\n\`\`\`\n`,
          }
        ]);
      })
      .catch(() => {
        alert('OPC 不存在');
        navigate('/');
      });

    // Star 数量
    api.get(`/opc/star/${id}`)
      .then(res => setStarCount(res.data.count || 0))
      .catch(() => {});

    // 当前用户 Star 状态
    if (token) {
      api.get(`/opc/star/${id}/check`)
        .then(res => setStarred(res.data.starred || false))
        .catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Star 切换
  const handleToggleStar = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    setStarLoading(true);
    try {
      const res = await api.post(`/opc/star/${id}`, {});
      setStarred(res.data.starred);
      setStarCount(res.data.count);
    } catch (err) {
      console.error('Star 操作失败', err);
    }
    setStarLoading(false);
  };

  // 提交申请
  const handleApply = async (message) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    setApplyLoading(true);
    try {
      await api.post('/opc/apply', {
        opcId: parseInt(id),
        message,
      });
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

    const newMessages = [...messages, userMsg, loadingMsg];
    setMessages(newMessages);
    setSending(true);

    try {
      const chatHistory = newMessages
        .slice(0, -1)
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.post('/opc/chat', {
        opcId: parseInt(id),
        messages: chatHistory,
      });

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: res.data.reply };
        return updated;
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '⚠️ AI 服务暂时不可用，请确认 Ollama 正在运行。',
        };
        return updated;
      });
    }
    setSending(false);
  };

  if (loading) {
    return <div style={styles.loading}>加载中...</div>;
  }

  return (
    <div style={styles.container}>
      {/* 顶部导航 */}
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← 返回列表
        </button>
        <div style={styles.headerInfo}>
          <span style={styles.headerTitle}>🤝 {opc.name}</span>
          <span style={styles.headerSub}>AI 协作助手</span>
        </div>
      </div>

      {/* OPC 详情卡片 */}
      <div style={styles.opcCard}>
        <div style={styles.opcCardHeader}>
          <div style={styles.opcCardTitleRow}>
            <span style={styles.opcCategoryIcon}>{categoryMap[opc.category] || '📁'}</span>
            <h3 style={styles.opcTitle}>{opc.name}</h3>
          </div>
          <div style={styles.starRow}>
            <button onClick={handleToggleStar} style={styles.starBtn} disabled={starLoading}>
              {starred ? '⭐' : '☆'} {starCount}
            </button>
          </div>
        </div>

        {opc.description && (
          <p style={styles.opcDesc}>{opc.description}</p>
        )}

        <div style={styles.opcFieldGrid}>
          <div style={styles.field}>
            <span style={styles.fieldLabel}>分类</span>
            <span style={styles.fieldValue}>{categoryLabelMap[opc.category] || '未设置'}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.fieldLabel}>协作类型</span>
            <span style={styles.fieldValue}>{collabTypeMap[opc.collaborationType] || '未设置'}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.fieldLabel}>经验要求</span>
            <span style={styles.fieldValue}>{expLevelMap[opc.experienceLevel] || '不限'}</span>
          </div>
          <div style={styles.field}>
            <span style={styles.fieldLabel}>时间投入</span>
            <span style={styles.fieldValue}>{opc.timeCommitment || '未设置'}</span>
          </div>
        </div>

        {opc.requiredSkills && opc.requiredSkills.length > 0 && (
          <div style={styles.skillsRow}>
            <span style={styles.fieldLabel}>所需技能</span>
            <div style={styles.skillsList}>
              {opc.requiredSkills.map((s, i) => (
                <span key={i} style={styles.skillTag}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {opc.tags && (
          <div style={styles.tagsRow}>
            {opc.tags.split(',').map((t, i) => t.trim() && (
              <span key={i} style={styles.tag}>{t.trim()}</span>
            ))}
          </div>
        )}

        <div style={styles.opcActions}>
          <button onClick={() => setShowApplyModal(true)} style={styles.applyBtn}>
            🤝 申请协作
          </button>
          <span style={styles.contactInfo}>📞 {opc.contact}</span>
        </div>
      </div>

      {/* 对话区域 */}
      <div style={styles.chatArea}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.role === 'assistant' && (
              <span style={styles.avatar}>🤖</span>
            )}
            <div
              style={{
                ...styles.bubble,
                backgroundColor: msg.role === 'user' ? '#2ea44f' : '#f6f8fa',
                color: msg.role === 'user' ? '#fff' : '#1F2328',
              }}
            >
              <MarkdownRenderer
                content={msg.content}
                variant={msg.role === 'user' ? 'dark' : 'light'}
              />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={styles.inputArea}>
        <ChatInput onSend={handleSend} disabled={sending} />
      </div>

      {/* 申请弹窗 */}
      {showApplyModal && (
        <ApplyModal
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApply}
          loading={applyLoading}
        />
      )}
    </div>
  );
}

export default ChatPage;

// ------- 样式 -------
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '95vh',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#656d76',
    fontSize: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #d0d7de',
    marginBottom: '16px',
  },
  backBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#1F2328',
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1F2328',
  },
  headerSub: {
    fontSize: '12px',
    color: '#656d76',
  },
  opcCard: {
    backgroundColor: '#f6f8fa',
    border: '1px solid #d0d7de',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  opcCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  opcCardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  opcCategoryIcon: {
    fontSize: '24px',
  },
  opcTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1F2328',
    margin: 0,
  },
  starRow: {
    flexShrink: 0,
  },
  starBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#1F2328',
  },
  opcDesc: {
    color: '#656d76',
    fontSize: '14px',
    marginBottom: '12px',
    lineHeight: '1.6',
  },
  opcFieldGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '12px',
  },
  field: {
    display: 'flex',
    gap: '8px',
    fontSize: '13px',
  },
  fieldLabel: {
    color: '#656d76',
    fontWeight: '500',
  },
  fieldValue: {
    color: '#1F2328',
  },
  skillsRow: {
    marginBottom: '12px',
  },
  skillsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '6px',
  },
  skillTag: {
    backgroundColor: '#f1f8ff',
    color: '#0969da',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  tagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '12px',
  },
  tag: {
    backgroundColor: '#dafbe4',
    color: '#116329',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  opcActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #d0d7de',
  },
  applyBtn: {
    backgroundColor: '#2ea44f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  contactInfo: {
    color: '#656d76',
    fontSize: '13px',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px 0',
  },
  message: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    maxWidth: '80%',
  },
  avatar: {
    fontSize: '20px',
    flexShrink: 0,
    marginTop: '4px',
  },
  bubble: {
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  inputArea: {
    borderTop: '1px solid #d0d7de',
    paddingTop: '16px',
  },
  // 弹窗
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1F2328',
    marginBottom: '8px',
  },
  modalDesc: {
    color: '#656d76',
    fontSize: '14px',
    marginBottom: '16px',
  },
  modalTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  modalCancelBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#1F2328',
  },
  modalSubmitBtn: {
    backgroundColor: '#2ea44f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};
