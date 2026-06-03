import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatInput from '../components/ChatInput';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [opcList, setOpcList] = useState([]);
  const [starData, setStarData] = useState({}); // { [opcId]: { count, starred } }
  const [loading, setLoading] = useState(true);
  const [selectedOpc, setSelectedOpc] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ applicantName: '', applicantContact: '', message: '' });
  const [applyLoading, setApplyLoading] = useState(false);
  const opcListRef = useRef(null);

  const handleSend = (message) => {
    alert(`你输入了: ${message}\n（AI Agent 对话功能开发中...）`);
  };

  // 获取所有 OPC 的 star 信息
  const fetchStarData = async (opcIds) => {
    const data = {};
    for (const id of opcIds) {
      try {
        const res = await axios.get(`/opc/star/${id}`);
        data[id] = res.data;
      } catch (err) {
        data[id] = { count: 0, starred: false };
      }
    }
    setStarData(data);
  };

  // 切换 star
  const toggleStar = async (opcId, e) => {
    e.stopPropagation();
    try {
      const res = await axios.post(`/opc/star/${opcId}`);
      setStarData(prev => ({
        ...prev,
        [opcId]: { count: res.data.count, starred: res.data.starred }
      }));
    } catch (err) {
      console.error('Star 失败:', err);
    }
  };

  // 提交申请
  const submitApplication = async () => {
    if (!applyForm.applicantName || !applyForm.applicantContact) {
      alert('请填写姓名和联系方式');
      return;
    }
    setApplyLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/opc/apply', {
        opcId: selectedOpc.id,
        ...applyForm
      }, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      alert('申请已提交！');
      setShowApplyModal(false);
      setApplyForm({ applicantName: '', applicantContact: '', message: '' });
    } catch (err) {
      alert('申请失败: ' + (err.response?.data?.error || err.message));
    }
    setApplyLoading(false);
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
        // 批量获取 star 数据
        fetchStarData(res.data.map(opc => opc.id));
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
                {starData[opc.id] && (
                  <span 
                    style={styles.starBadge}
                    onClick={(e) => toggleStar(opc.id, e)}
                  >
                    {starData[opc.id].starred ? '⭐' : '☆'} {starData[opc.id].count}
                  </span>
                )}
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
              <div style={styles.metaRow}>
                <span style={styles.contact}>📧 {opc.contact}</span>
              </div>
            </div>
            <div style={styles.cardRight}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOpc(opc);
                  setShowApplyModal(true);
                }}
                style={styles.btnApply}
              >
                申请加入
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
      
      {/* 相似推荐区块 */}
      {selectedOpc && !showApplyModal && (
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

      {/* 申请弹窗 */}
      {showApplyModal && selectedOpc && (
        <div style={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>申请加入「{selectedOpc.name}」</h2>
            <div style={styles.modalField}>
              <label>你的姓名 *</label>
              <input 
                style={styles.input}
                value={applyForm.applicantName}
                onChange={e => setApplyForm({ ...applyForm, applicantName: e.target.value })}
                placeholder="请输入姓名"
              />
            </div>
            <div style={styles.modalField}>
              <label>联系方式 *</label>
              <input 
                style={styles.input}
                value={applyForm.applicantContact}
                onChange={e => setApplyForm({ ...applyForm, applicantContact: e.target.value })}
                placeholder="邮箱或手机号"
              />
            </div>
            <div style={styles.modalField}>
              <label>留言（可选）</label>
              <textarea 
                style={{ ...styles.input, minHeight: '80px' }}
                value={applyForm.message}
                onChange={e => setApplyForm({ ...applyForm, message: e.target.value })}
                placeholder="简单介绍一下你自己..."
              />
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowApplyModal(false)} style={styles.btnCancel}>取消</button>
              <button onClick={submitApplication} style={styles.btnSubmit} disabled={applyLoading}>
                {applyLoading ? '提交中...' : '提交申请'}
              </button>
            </div>
          </div>
        </div>
      )}
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
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  starBadge: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#656d76',
    cursor: 'pointer',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: '#f6f8fa',
    border: '1px solid #d0d7de',
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
  contact: {
    fontSize: '12px',
    color: '#656d76',
  },
  cardRight: {
    minWidth: '100px',
    textAlign: 'right',
  },
  btnApply: {
    backgroundColor: '#2ea44f',
    color: '#ffffff',
    padding: '6px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    marginRight: '8px',
    marginBottom: '6px',
    display: 'block',
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
    display: 'block',
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
  btnSmall: {
    backgroundColor: '#2ea44f',
    color: '#ffffff',
    padding: '6px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
  // 弹窗样式
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    width: '90%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#1F2328',
  },
  modalField: {
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    marginTop: '6px',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  btnCancel: {
    backgroundColor: '#f6f8fa',
    color: '#1F2328',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid #d0d7de',
    cursor: 'pointer',
  },
  btnSubmit: {
    backgroundColor: '#2ea44f',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
};
