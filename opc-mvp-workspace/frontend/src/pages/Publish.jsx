import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { space, radius, fontSize, fontWeight, shadow, containerStyle, useColors } from '../styles/tokens';
import { useIsSmall } from '../hooks/useMediaQuery';

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
  { value: 'any',          label: '不限' },
  { value: 'beginner',    label: '初学者友好' },
  { value: 'intermediate', label: '需要一定经验' },
  { value: 'expert',       label: '需要专家级' },
];

function Publish() {
  const [name, setName]                   = useState('');
  const [description, setDescription]       = useState('');
  const [tags, setTags]                   = useState('');
  const [category, setCategory]           = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [collabType, setCollabType]       = useState('');
  const [expLevel, setExpLevel]           = useState('');
  const [timeCommit, setTimeCommit]         = useState('');
  const [contact, setContact]               = useState(() => localStorage.getItem('lastContact') || '');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]               = useState('');
  const navigate                           = useNavigate();
  const [searchParams]                     = useSearchParams();
  const editId                             = searchParams.get('id');
  const isSmall                            = useIsSmall();
  const color = useColors();

  useEffect(() => {
    if (!editId) return;
    api.get(`/opc/detail/${editId}`)
      .then(res => {
        const o = res.data;
        setName(o.name);
        setDescription(o.description || '');
        setTags(o.tags || '');
        setCategory(o.category || '');
        setRequiredSkills((o.requiredSkills || []).join(', '));
        setCollabType(o.collaborationType || '');
        setExpLevel(o.experienceLevel || '');
        setTimeCommit(o.timeCommitment || '');
        setContact(o.contact || '');
      })
      .catch(() => { setError('加载失败'); });
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!name.trim()) { setError('请填写 OPC 名称'); return; }
    if (!contact.trim()) { setError('请填写联系方式'); return; }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        tags: tags.trim(),
        category,
        requiredSkills: requiredSkills.split(/,\s*/).filter(Boolean),
        collaborationType: collabType,
        experienceLevel: expLevel,
        timeCommitment: timeCommit,
        contact: contact.trim(),
      };
      if (editId) {
        await api.put(`/opc/edit/${editId}`, payload);
        setSuccess('✅ 更新成功！');
      } else {
        await api.post('/opc/publish', payload);
        setSuccess('✅ 发布成功！');
      }
      localStorage.setItem('lastContact', contact.trim());
      setName(''); setDescription(''); setTags(''); setCategory('');
      setRequiredSkills(''); setCollabType(''); setExpLevel(''); setTimeCommit('');
      setTimeout(() => { setSuccess(''); navigate('/my-collaborations'); }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || '发布失败');
    }
    setLoading(false);
  };

  // ------- 动态样式（依赖 color / isSmall）-------
  const s = {
    page: {
      ...containerStyle,
      paddingTop: space.xl, paddingBottom: space.page,
      minHeight: 'calc(100vh - 56px)',
    },
    card: {
      backgroundColor: color.surface,
      border: `1px solid ${color.border}`,
      borderRadius: radius.lg,
      padding: isSmall ? space.lg : space.xl,
      boxShadow: shadow.card,
    },
    title: {
      fontSize: fontSize.xxl, fontWeight: fontWeight.semibold,
      color: color.textPrimary, marginBottom: space.xs,
    },
    sub: { fontSize: fontSize.base, color: color.textSecondary, marginBottom: space.xl },
    field: { marginBottom: space.lg },
    label: {
      display: 'block', fontSize: fontSize.sm, fontWeight: fontWeight.medium,
      color: color.textPrimary, marginBottom: space.xs,
    },
    input: {
      width: '100%', padding: `${space.xs}px ${space.sm}px`,
      fontSize: fontSize.base, border: `1px solid ${color.border}`,
      borderRadius: radius.md, outline: 'none', boxSizing: 'border-box',
      backgroundColor: color.surface, color: color.textPrimary,
      transition: 'border-color 0.15s',
    },
    textarea: {
      width: '100%', padding: `${space.xs}px ${space.sm}px`,
      fontSize: fontSize.base, border: `1px solid ${color.border}`,
      borderRadius: radius.md, outline: 'none', boxSizing: 'border-box',
      backgroundColor: color.surface, color: color.textPrimary,
      minHeight: '80px', resize: 'vertical', fontFamily: 'inherit',
      transition: 'border-color 0.15s',
    },
    select: {
      width: '100%', padding: `${space.xs}px ${space.sm}px`,
      fontSize: fontSize.base, border: `1px solid ${color.border}`,
      borderRadius: radius.md, outline: 'none', backgroundColor: color.surface,
      color: color.textPrimary, cursor: 'pointer', boxSizing: 'border-box',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: isSmall ? '1fr' : '1fr 1fr',
      gap: space.lg, marginBottom: space.lg,
    },
    error: {
      padding: space.sm, marginBottom: space.lg,
      backgroundColor: color.dangerLight, border: `1px solid ${color.danger}`,
      borderRadius: radius.md, color: color.danger, fontSize: fontSize.sm,
    },
    success: {
      padding: space.sm, marginBottom: space.lg,
      backgroundColor: color.primaryLight, border: `1px solid ${color.primary}`,
      borderRadius: radius.md, color: color.primaryDark, fontSize: fontSize.sm,
    },
    actions: {
      display: 'flex', gap: space.md, marginTop: space.xl,
      flexDirection: isSmall ? 'column' : 'row',
    },
    btnPrimary: {
      backgroundColor: color.primary, color: '#fff',
      padding: `${space.sm}px ${space.xl}px`, borderRadius: radius.md,
      fontSize: fontSize.base, fontWeight: fontWeight.semibold,
      border: 'none', cursor: 'pointer', transition: 'background-color 0.15s',
    },
    btnOutline: {
      backgroundColor: 'transparent', color: color.textPrimary,
      padding: `${space.sm}px ${space.xl}px`, borderRadius: radius.md,
      fontSize: fontSize.base, fontWeight: fontWeight.medium,
      border: `1px solid ${color.border}`, cursor: 'pointer',
      transition: 'all 0.15s',
    },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>{editId ? '✏️ 编辑 OPC' : '📝 发布新 OPC'}</h2>
        <p style={s.sub}>
          {editId ? '修改你的协作项目信息' : '描述你的协作需求，吸引合适的伙伴'}
        </p>

        {error   && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>OPC 名称 <span style={{ color: color.danger }}>*</span></label>
            <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="给协作项目起个名字" autoFocus={!editId} />
          </div>

          <div style={s.field}>
            <label style={s.label}>项目描述</label>
            <textarea style={s.textarea} value={description} onChange={e => setDescription(e.target.value)} placeholder="详细描述协作目标、技术栈、预期成果..." rows={4} />
          </div>

          <div style={s.field}>
            <label style={s.label}>标签（逗号分隔）</label>
            <input style={s.input} value={tags} onChange={e => setTags(e.target.value)} placeholder="例如：React, Node.js, LLM" />
          </div>

          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>分类</label>
              <select style={s.select} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">请选择</option>
                {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>协作类型</label>
              <select style={s.select} value={collabType} onChange={e => setCollabType(e.target.value)}>
                <option value="">请选择</option>
                {COLLAB_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>经验要求</label>
              <select style={s.select} value={expLevel} onChange={e => setExpLevel(e.target.value)}>
                <option value="">请选择</option>
                {EXP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>时间投入</label>
              <input style={s.input} value={timeCommit} onChange={e => setTimeCommit(e.target.value)} placeholder="例如：每周 5 小时" />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>所需技能（逗号分隔）</label>
            <input style={s.input} value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} placeholder="例如：Python, PyTorch, 数据处理" />
          </div>

          <div style={s.field}>
            <label style={s.label}>联系方式 <span style={{ color: color.danger }}>*</span></label>
            <input style={s.input} value={contact} onChange={e => setContact(e.target.value)} placeholder="邮箱或手机号" />
          </div>

          <div style={s.actions}>
            <button type="submit" style={s.btnPrimary} disabled={loading}>
              {loading ? '提交中...' : (editId ? '保存修改' : '发布项目')}
            </button>
            <button type="button" onClick={() => navigate(-1)} style={s.btnOutline}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Publish;
