import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { color, space, radius, fontSize, fontWeight, shadow } from '../styles/tokens';

const CATEGORY_OPTIONS = [
  { value: 'web',          label: '🌐 Web 开发' },
  { value: 'mobile',       label: '📱 移动开发' },
  { value: 'ai',           label: '🤖 AI / 机器学习' },
  { value: 'data',         label: '📊 数据科学' },
  { value: 'design',       label: '🎨 设计' },
  { value: 'other',        label: '📁 其他' },
];
const COLLAB_OPTIONS = [
  { value: 'once',     label: '一次性协作' },
  { value: 'longterm', label: '长期合作' },
  { value: 'research', label: '研究项目' },
];
const EXP_OPTIONS = [
  { value: 'any',         label: '不限' },
  { value: 'beginner',  label: '初学者友好' },
  { value: 'intermediate', label: '需要一定经验' },
  { value: 'expert',      label: '需要专家级' },
];

function Publish() {
  const [name, setName]                 = useState('');
  const [description, setDescription]     = useState('');
  const [tags, setTags]                 = useState('');
  const [price, setPrice]               = useState('');
  const [contact, setContact]           = useState('');
  const [category, setCategory]         = useState('other');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [collabType, setCollabType]     = useState('once');
  const [expLevel, setExpLevel]         = useState('any');
  const [timeCommit, setTimeCommit]     = useState('');
  const [saving, setSaving]             = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  // 加载编辑数据 / 恢复 contact
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
          setCollabType(d.collaborationType || 'once');
          setExpLevel(d.experienceLevel || 'any');
          setTimeCommit(d.timeCommitment || '');
        })
        .catch(err => alert('加载失败：' + err.message));
    } else {
      const saved = localStorage.getItem('userContact');
      if (saved) setContact(saved);
    }
  }, [editId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) { alert('请填写名称与联系方式'); return; }
    setSaving(true);
    const payload = {
      name: name.trim(),
      description,
      tags,
      price,
      contact: contact.trim(),
      category,
      requiredSkills: requiredSkills.split(/,\s*/).filter(Boolean),
      collaborationType: collabType,
      experienceLevel: expLevel,
      timeCommitment: timeCommit,
    };
    const req = editId
      ? api.put(`/opc/edit/${editId}`, payload)
      : api.post('/opc/publish', payload);
    req.then(() => {
        localStorage.setItem('userContact', contact.trim());
        alert(editId ? '编辑成功！' : '发布成功！');
        navigate('/');
      })
      .catch(err => alert((editId ? '编辑' : '发布') + '失败：' + (err.response?.data?.error || err.message)))
      .finally(() => setSaving(false));
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>{editId ? '✏️ 编辑 OPC' : '🚀 发布新 OPC'}</h1>
        <p style={s.subtitle}>{editId ? '修改你的协作项目信息' : '填写以下信息，开始招募协作者'}</p>

        <form onSubmit={handleSubmit} style={s.form}>
          {/* 名称 */}
          <div style={s.field}>
            <label style={s.label}>名称 <span style={{ color: color.danger }}>*</span></label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              style={s.input} placeholder="给你的 OPC 起个名字"
              autoFocus={!editId}
            />
          </div>

          {/* 描述 */}
          <div style={s.field}>
            <label style={s.label}>描述</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              style={{ ...s.input, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
              placeholder="详细描述你的项目目标、技术栈和协作方式..."
            />
          </div>

          {/* 分类 + 协作类型 */}
          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>分类</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={s.select}>
                {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>协作类型</label>
              <select value={collabType} onChange={e => setCollabType(e.target.value)} style={s.select}>
                {COLLAB_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* 经验要求 + 时间投入 */}
          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>经验要求</label>
              <select value={expLevel} onChange={e => setExpLevel(e.target.value)} style={s.select}>
                {EXP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>时间投入</label>
              <input
                type="text" value={timeCommit} onChange={e => setTimeCommit(e.target.value)}
                style={s.input} placeholder="如：每周 5 小时"
              />
            </div>
          </div>

          {/* 标签 + 技能 */}
          <div style={s.field}>
            <label style={s.label}>标签（逗号分隔）</label>
            <input
              type="text" value={tags} onChange={e => setTags(e.target.value)}
              style={s.input} placeholder="如：React, 后端, DevOps"
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>所需技能（逗号分隔）</label>
            <input
              type="text" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)}
              style={s.input} placeholder="如：TypeScript, Node.js, MongoDB"
            />
          </div>

          {/* 价格 + 联系方式 */}
          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>价格</label>
              <input
                type="text" value={price} onChange={e => setPrice(e.target.value)}
                style={s.input} placeholder="如：¥5000、面议"
              />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>联系方式 <span style={{ color: color.danger }}>*</span></label>
              <input
                type="text" value={contact} onChange={e => setContact(e.target.value)}
                style={s.input} placeholder="微信 / 邮箱 / 电话"
              />
            </div>
          </div>

          <button type="submit" style={s.btn} disabled={saving}>
            {saving ? (editId ? '保存中...' : '发布中...') : (editId ? '💾 保存修改' : '🚀 发布 OPC')}
          </button>
        </form>
      </div>
    </div>
  );
}

// ------- 样式 -------
const s = {
  page: {
    minHeight: 'calc(100vh - 56px)',
    backgroundColor: color.bg,
    padding: `${space.xl}px ${space.md}px`,
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    boxShadow: shadow.card,
    padding: `${space.xl}px ${space.xl}px`,
    width: '100%',
    maxWidth: '680px',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: color.textPrimary,
    marginBottom: space.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: color.textSecondary,
    marginBottom: space.xl,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.lg,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: color.textPrimary,
  },
  input: {
    padding: `${space.xs}px ${space.sm}px`,
    fontSize: fontSize.base,
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    transition: 'border-color 0.15s',
  },
  select: {
    padding: `${space.xs}px ${space.sm}px`,
    fontSize: fontSize.base,
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    cursor: 'pointer',
    width: '100%',
    outline: 'none',
  },
  row: {
    display: 'flex',
    gap: space.lg,
  },
  btn: {
    width: '100%',
    padding: `${space.sm}px ${space.lg}px`,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: '#fff',
    backgroundColor: color.primary,
    border: 'none',
    borderRadius: radius.md,
    cursor: 'pointer',
    marginTop: space.sm,
    transition: 'background-color 0.15s',
  },
};

export default Publish;
