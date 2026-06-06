import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const CATEGORY_OPTIONS = [
  { value: 'web', label: '🌐 Web 开发' },
  { value: 'mobile', label: '📱 移动开发' },
  { value: 'ai', label: '🤖 AI / 机器学习' },
  { value: 'data', label: '📊 数据科学' },
  { value: 'design', label: '🎨 设计' },
  { value: 'other', label: '📁 其他' },
];

const COLLAB_OPTIONS = [
  { value: 'once', label: '一次性协作' },
  { value: 'longterm', label: '长期合作' },
  { value: 'research', label: '研究项目' },
];

const EXP_OPTIONS = [
  { value: 'any', label: '不限' },
  { value: 'beginner', label: '初学者友好' },
  { value: 'intermediate', label: '需要一定经验' },
  { value: 'expert', label: '需要专家级' },
];

function Publish() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('');
  const [contact, setContact] = useState('');
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
      api.get(`/opc/detail/${editId}`)
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
    } else {
      const savedContact = localStorage.getItem('userContact');
      if (savedContact) setContact(savedContact);
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
    const after = () => {
      localStorage.setItem('userContact', contact);
      alert(editId ? '编辑成功！' : '发布成功！');
      navigate('/');
    };
    const fail = err => alert((editId ? '编辑' : '发布') + '失败：' + (err.response?.data?.error || err.message));
    (editId
      ? api.put(`/opc/edit/${editId}`, data)
      : api.post('/opc/publish', data)
    ).then(after).catch(fail);
  };

  const inputStyle = { padding: '8px 12px', fontSize: '14px', border: '1px solid #d0d7de', borderRadius: '6px', boxSizing: 'border-box', width: '100%' };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 20px 60px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>{editId ? '编辑 OPC 服务' : '发布 OPC 服务'}</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>名称 *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>描述</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>分类</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
            {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>标签（逗号分隔）</label>
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} style={inputStyle} placeholder="如：React, 后端, DevOps" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>所需技能（逗号分隔）</label>
          <input type="text" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} style={inputStyle} placeholder="如：TypeScript, Node.js, MongoDB" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>协作类型</label>
          <select value={collaborationType} onChange={e => setCollaborationType(e.target.value)} style={selectStyle}>
            {COLLAB_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>经验要求</label>
          <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} style={selectStyle}>
            {EXP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>时间投入</label>
          <input type="text" value={timeCommitment} onChange={e => setTimeCommitment(e.target.value)} style={inputStyle} placeholder="如：每周5小时、总计20小时" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>价格</label>
          <input type="text" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} placeholder="如：¥5000、面议" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>联系方式 *</label>
          <input type="text" value={contact} onChange={e => setContact(e.target.value)} style={inputStyle} placeholder="微信 / 邮箱 / 电话" />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px 16px', fontSize: '14px', fontWeight: '600', color: '#fff', backgroundColor: '#2ea44f', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '8px' }}>
          {editId ? '保存' : '发布'}
        </button>
      </form>
    </div>
  );
}

export default Publish;
