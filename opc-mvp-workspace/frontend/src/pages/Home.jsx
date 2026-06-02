import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInput from '../components/ChatInput';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [opcList, setOpcList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpc, setSelectedOpc] = useState(null); // 当前选中的OPC
  const [recommendations, setRecommendations] = useState([]); // 推荐列表
  const [loadingRec, setLoadingRec] = useState(false); // 推荐加载状态
  const opcListRef = useRef(null);

  const handleSend = (message) => {
    alert(`你输入了: ${message}\n（AI Agent 对话功能开发中...）`);
  };

  // 获取相似推荐
  const fetchRecommendations = async (opcId) => {
    setLoadingRec(true);
    try {
      const res = await axios.get(`/opc/match/${opcId}`);
      setRecommendations(res.data);
    } catch (err) {
      console.error('获取推荐失败:', err);
      setRecommendations([]);
    }
    setLoadingRec(false);
  };

  useEffect(() => {
    axios.get('/opc/list')
      .then(res => {
        setOpcList(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.icon}>🤝</div>
        <h1 style={styles.title}>描述你的项目需求，或寻找协作机会</h1>
        <ChatInput onSend={handleSend} />
        <div style={styles.actions}>
          <button onClick={() => navigate('/publish')} style={styles.btnPrimary}>发布OPC</button>
          <button 
            onClick={() => {
              if (opcListRef.current) {
                opcListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                console.error('opcListRef 未绑定到DOM元素');
                alert('页面加载中，请稍后再试');
              }
            }} 
            style={styles.btnSecondary}
          >
            浏览项目
          </button>
          <button onClick={() => navigate('/my-collaborations')} style={styles.btnSecondary}>我的协作</button>
        </div>
      </div>

      <div ref={opcListRef} style={styles.listSection}>
        <h2 style={styles.sectionTitle}>最近的 OPC 项目</h2>
        
        {loading && <div style={styles.loading}>加载中...</div>}

        {!loading && opcList.length === 0 && (
          <div style={styles.empty}>
            暂无OPC服务，点击「发布OPC」创建第一个！
          </div>
        )}

        {opcList.map(opc => (
          <div key={opc.id} style={styles.card} onClick={() => {
            setSelectedOpc(opc);
            fetchRecommendations(opc.id);
          }}>
            <div style={styles.cardLeft}>
              <h3 style={styles.cardTitle}>
                🔥 {opc.name}
              </h3>
              {(opc.category && opc.category !== 'other') && (
                <span style={styles.metaBadge}>{opc.category}</span>
              )}
              {opc.description && (
                <p style={styles.cardDesc}>{opc.description}</p>
              )}
              <div style={styles.metaRow}>
                {opc.tags && <span style={styles.tag}>{opc.tags}</span>}
                {opc.requiredSkills && opc.requiredSkills.length > 0 && (
                  <span style={styles.skills}>{opc.requiredSkills.slice(0, 3).join(', ')}{opc.requiredSkills.length > 3 ? '...' : ''}</span>
                )}
              </div>
              <div style={styles.metaRow}>
                {opc.collaborationType && opc.collaborationType !== 'once' && (
                  <span style={styles.metaBadge}>{opc.collaborationType}</span>
                )}
                {opc.experienceLevel && opc.experienceLevel !== 'any' && (
                  <span style={styles.metaBadge}>{opc.experienceLevel}</span>
                )}
                {opc.timeCommitment && (
                  <span style={styles.metaBadge}>{opc.timeCommitment}</span>
                )}
              </div>
            </div>
            <div style={styles.cardRight}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/publish?id=${opc.id}`);
                }}
                style={styles.btnSmall}
              >
                查看详情
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/chat/${opc.id}`);
                }}
                style={styles.btnAI}
              >
                🤖 AI 协助
              </button>
            </div>
          </div>
        ))}
      
      {/* 相似推荐区块 - 放在列表区内部 */}
      {selectedOpc && (
        <div style={styles.recommendSection}>
          <h2 style={styles.sectionTitle}>
            🤖 与「{selectedOpc.name}」相似的OPC
          </h2>
          
          {loadingRec && <div style={styles.loading}>AI正在匹配中...</div>}
          
          {!loadingRec && recommendations.length === 0 && (
            <div style={styles.empty}>暂无相似OPC</div>
          )}
          
          {recommendations.map(opc => (
            <div key={opc.id} style={styles.recCard}>
              <div style={styles.recLeft}>
                <h4 style={styles.recTitle}>{opc.name}</h4>
                <span style={styles.recSim}>相似度: {(opc.similarity * 100).toFixed(1)}%</span>
              </div>
              <button 
                onClick={() => {
                  setSelectedOpc(opc);
                  fetchRecommendations(opc.id);
                }}
                style={styles.btnSmall}
              >
                查看匹配
              </button>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export default Home;

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  hero: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  icon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1F2328',
    marginBottom: '32px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '24px',
  },
  btnPrimary: {
    backgroundColor: '#2ea44f',
    color: '#ffffff',
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  btnSecondary: {
    backgroundColor: '#f6f8fa',
    color: '#1F2328',
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid #d0d7de',
    cursor: 'pointer',
  },
  listSection: {
    marginTop: '60px',
    paddingTop: '40px',
    borderTop: '1px solid #d0d7de',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1F2328',
    marginBottom: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#656d76',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#656d76',
    border: '1px dashed #d0d7de',
    borderRadius: '8px',
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    border: '1px solid #d0d7de',
    borderRadius: '8px',
    marginBottom: '12px',
    backgroundColor: '#ffffff',
  },
  cardLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1F2328',
    marginBottom: '8px',
  },
  cardDesc: {
    color: '#656d76',
    fontSize: '14px',
    marginBottom: '8px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '6px',
  },
  metaBadge: {
    backgroundColor: '#f6f8fa',
    color: '#656d76',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    border: '1px solid #d0d7de',
  },
  skills: {
    backgroundColor: '#ddf4ff',
    color: '#0969da',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
  },
  cardRight: {
    minWidth: '100px',
    textAlign: 'right',
  },
  btnSmall: {
    backgroundColor: '#2ea44f',
    color: '#ffffff',
    padding: '6px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    marginRight: '8px',
  },
  btnAI: {
    backgroundColor: 'transparent',
    color: '#2ea44f',
    padding: '6px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #2ea44f',
    cursor: 'pointer',
  },
  // 推荐区块样式
  recommendSection: {
    marginTop: '40px',
    paddingTop: '30px',
    borderTop: '2px solid #2ea44f',
  },
  recCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    border: '1px solid #d0d7de',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: '#f6f8fa',
  },
  recLeft: {
    flex: 1,
  },
  recTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1F2328',
    marginBottom: '4px',
  },
  recSim: {
    backgroundColor: '#dafbe4',
    color: '#116329',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
  },
};
