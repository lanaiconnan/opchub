import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function MyCollaborations() {
  const navigate = useNavigate();
  const [opcList, setOpcList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/opc/list')
      .then(res => {
        setOpcList(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = (id, name) => {
    if (!window.confirm(`确定删除「${name}」？`)) return;
    api.delete(`/opc/delete/${id}`)
      .then(() => {
        alert('删除成功！');
        setOpcList(prev => prev.filter(opc => opc.id !== id));
      })
      .catch(err => alert('删除失败：' + err.message));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>我的协作</h1>
        <button onClick={() => navigate('/publish')} style={styles.btnPrimary}>
          + 发布新OPC
        </button>
      </div>

      {loading && <div style={styles.loading}>加载中...</div>}

      {!loading && opcList.length === 0 && (
        <div style={styles.empty}>
          你还没有发布任何OPC服务，
          <span onClick={() => navigate('/publish')} style={styles.link}>去发布</span>
        </div>
      )}

      {opcList.map(opc => (
        <div key={opc.id} style={styles.card}>
          <div style={styles.cardLeft}>
            <h3 style={styles.cardTitle}>{opc.name}</h3>
            {opc.description && (
              <p style={styles.cardDesc}>{opc.description}</p>
            )}
            <div style={styles.meta}>
              <span style={styles.tag}>{opc.tags || '未分类'}</span>
              {opc.price && <span style={styles.price}>¥{opc.price}</span>}
            </div>
          </div>
          <div style={styles.cardRight}>
            <button
              onClick={() => navigate(`/publish?id=${opc.id}`)}
              style={styles.btnEdit}
            >
              编辑
            </button>
            <button
              onClick={() => handleDelete(opc.id, opc.name)}
              style={styles.btnDelete}
            >
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '40px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '28px', fontWeight: '700' },
  btnPrimary: { backgroundColor: '#2ea44f', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  loading: { textAlign: 'center', padding: '40px', color: '#656d76' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#656d76', fontSize: '16px' },
  link: { color: '#2ea44f', cursor: 'pointer', textDecoration: 'underline' },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #d0d7de', borderRadius: '8px', marginBottom: '12px', backgroundColor: '#ffffff' },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '8px' },
  cardDesc: { color: '#656d76', fontSize: '14px', marginBottom: '8px' },
  meta: { display: 'flex', alignItems: 'center', gap: '12px' },
  tag: { backgroundColor: '#dafbe4', color: '#116329', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  price: { color: '#656d76', fontSize: '12px' },
  cardRight: { display: 'flex', gap: '8px' },
  btnEdit: { backgroundColor: '#0969da', color: '#fff', padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  btnDelete: { backgroundColor: '#cf222e', color: '#fff', padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
};

export default MyCollaborations;
