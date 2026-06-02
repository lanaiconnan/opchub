import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function Publish() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('');
  const [contact, setContact] = useState('');
  // --- 新增字段 ---
  const [category, setCategory] = useState('other');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [collaborationType, setCollaborationType] = useState('once');
  const [experienceLevel, setExperienceLevel] = useState('any');
  const [timeCommitment, setTimeCommitment] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  useEffect(() => {
    if (editId) {
      axios.get(`http://localhost:3000/opc/detail/${editId}`)
        .then(res => {
          const d = res.data;
          setName(d.name || '');
          setDescription(d.description || '');
          setTags(d.tags || '');
          setPrice(d.price || '');
          setContact(d.contact || '');
          setCategory(d.category || 'other');
          setRequiredSkills(Array.isArray(d.requiredSkills) ? d.requiredSkills.join(', ') : (d.requiredSkills || ''));
          setCollaborationType(d.collaborationType || 'once');
          setExperienceLevel(d.experienceLevel || 'any');
          setTimeCommitment(d.timeCommitment || '');
        })
        .catch(err => alert('加载失败：' + err.message));
    }
  }, [editId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !contact) {
      alert('请填写名称与联系方式');
      return;
    }
    const data = {
      name, description, tags, price, contact,
      category,
      requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      collaborationType,
      experienceLevel,
      timeCommitment,
    };
    const after = () => { alert(editId ? '编辑成功！' : '发布成功！'); navigate('/'); };
    const fail = err => alert((editId ? '编辑' : '发布') + '失败：' + err.message);
    (editId
      ? axios.put(`http://localhost:3000/opc/edit/${editId}`, data)
      : axios.post('http://localhost:3000/opc/publish', data)
    ).then(after).catch(fail);
  };

  const selectStyle = { ...styles.input, cursor: 'pointer' };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>{editId ? '编辑OPC服务' : '发布OPC服务'}</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* 名称 */}
        <div style={styles.field}><label>名称 *</label><input type="text" value={name} onChange={e => setName(e.target.value)} style={styles.input} /></div>

        {/* 描述 */}
        <div style={styles.field}><label>描述</label><textarea value={description} onChange={e => setDescription(e.target.value)} style={{...styles.input, ...styles.textarea}} /></div>

        {/* 分类 */}
        <div style={styles.field}>
          <label>分类</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
            <option value="development">💻 开发</option>
            <option value="design">🎨 设计</option>
            <option value="product">📋 产品</option>
            <option value="marketing">📈 运营/市场</option>
            <option value="other">🔧 其他</option>
          </select>
        </div>

        {/* 标签 */}
        <div style={styles.field}><label>标签（逗号分隔）</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} style={styles.input} placeholder="如：React, 后端, DevOps" /></div>

        {/* 所需技能 */}
        <div style={styles.field}><label>所需技能（逗号分隔）</label><input type="text" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} style={styles.input} placeholder="如：TypeScript, Node.js, MongoDB" /></div>

        {/* 协作类型 */}
        <div style={styles.field}>
          <label>协作类型</label>
          <select value={collaborationType} onChange={e => setCollaborationType(e.target.value)} style={selectStyle}>
            <option value="once">一次性</option>
            <option value="short-term">短期（&lt;1月）</option>
            <option value="long-term">长期（&gt;1月）</option>
            <option value="consulting">咨询</option>
          </select>
        </div>

        {/* 经验要求 */}
        <div style={styles.field}>
          <label>经验要求</label>
          <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} style={selectStyle}>
            <option value="any">不限</option>
            <option value="beginner">新手友好</option>
            <option value="intermediate">进阶</option>
            <option value="expert">专家</option>
          </select>
        </div>

        {/* 时间投入 */}
        <div style={styles.field}><label>时间投入</label><input type="text" value={timeCommitment} onChange={e => setTimeCommitment(e.target.value)} style={styles.input} placeholder="如：每周5小时、总计20小时" /></div>

        {/* 价格 */}
        <div style={styles.field}><label>价格</label><input type="text" value={price} onChange={e => setPrice(e.target.value)} style={styles.input} placeholder="如：¥5000、面议" /></div>

        {/* 联系方式 */}
        <div style={styles.field}><label>联系方式 *</label><input type="text" value={contact} onChange={e => setContact(e.target.value)} style={styles.input} placeholder="微信 / 邮箱 / 电话" /></div>

        <button type="submit" style={styles.button}>{editId ? '保存' : '发布'}</button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px' },
  heading: { fontSize: '24px', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  input: { padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
  textarea: { minHeight: '100px', resize: 'vertical' },
  button: { padding: '10px 20px', fontSize: '16px', backgroundColor: '#2ea44f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
};

export default Publish;
