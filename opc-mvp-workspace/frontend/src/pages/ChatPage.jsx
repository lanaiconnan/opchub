import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatInput from '../components/ChatInput';
import axios from 'axios';

function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opc, setOpc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios.get(`/opc/detail/${id}`)
      .then(res => {
        setOpc(res.data);
        setLoading(false);
        setMessages([
          {
            role: 'assistant',
            content: `你好！我是 **${res.data.name}** 的 AI 协作助手。\n\n你可以告诉我你的技能、经验或合作意向，我会帮你生成沟通文案、匹配建议和合作提案。`,
          }
        ]);
      })
      .catch(() => {
        alert('OPC 不存在');
        navigate('/');
      });
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (userMessage) => {
    if (!userMessage.trim() || sending) return;

    const userMsg = { role: 'user', content: userMessage };
    const loadingMsg = { role: 'assistant', content: '...' };

    const newMessages = [...messages, userMsg, loadingMsg];
    setMessages(newMessages);
    setSending(true);

    try {
      // 只发历史对话（去掉最后的 loading 占位）
      const chatHistory = newMessages
        .slice(0, -1)
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await axios.post('/opc/chat', {
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
          content: '⚠️ AI 服务暂时不可用，请确认 Ollama 正在运行且 qwen2.5:3b 模型已下载。',
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

      {/* OPC 信息卡片 */}
      <div style={styles.opcCard}>
        <h3 style={styles.opcTitle}>{opc.name}</h3>
        {opc.description && <p style={styles.opcDesc}>{opc.description}</p>}
        <div style={styles.opcMeta}>
          <span style={styles.tag}>{opc.tags || '未分类'}</span>
          <span style={styles.contact}>联系方式：{opc.contact}</span>
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
              {msg.content.split('\n').map((line, i) => (
                <p key={i} style={{ margin: '4px 0' }}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={styles.inputArea}>
        <ChatInput onSend={handleSend} disabled={sending} />
      </div>
    </div>
  );
}

export default ChatPage;

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
  opcTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1F2328',
    marginBottom: '8px',
  },
  opcDesc: {
    color: '#656d76',
    fontSize: '14px',
    marginBottom: '8px',
  },
  opcMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '12px',
  },
  tag: {
    backgroundColor: '#dafbe4',
    color: '#116329',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  contact: {
    color: '#656d76',
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
};
