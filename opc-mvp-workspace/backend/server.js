const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const http = require('http');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const dbPath = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { opcList: [], applications: [], stars: [] });

const OLLAMA_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'qwen2.5:0.5b';

// Helper: call Ollama chat API
function ollamaChat(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false });
    const opts = {
      hostname: 'localhost', port: 11434, path: '/api/chat', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 30000,
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Ollama timeout')); });
    req.write(body);
    req.end();
  });
}

// Helper: get user ID (IP + User-Agent hash)
function getUserId(req) {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const ua = req.get('User-Agent') || '';
    return crypto.createHash('md5').update(ip + ua).digest('hex').slice(0, 16);
  } catch (e) {
    return 'anonymous-' + Date.now();
  }
}

// ==================== OPC CRUD ====================

// GET /opc/list
app.get('/opc/list', async (req, res) => {
  await db.read();
  res.json(db.data.opcList);
});

// GET /opc/detail/:id
app.get('/opc/detail/:id', async (req, res) => {
  await db.read();
  const item = db.data.opcList.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'OPC not found' });
  res.json(item);
});

// POST /opc/publish
app.post('/opc/publish', async (req, res) => {
  await db.read();
  const { name, description, tags, price, contact, category, requiredSkills, collaborationType, experienceLevel, timeCommitment } = req.body;
  if (!name || !contact) return res.status(400).json({ error: 'missing required fields' });
  const newOpc = {
    id: Date.now(), name, description: description || '', tags: tags || '', price: price || '', contact,
    category: category || 'other', requiredSkills: requiredSkills || [],
    collaborationType: collaborationType || 'once', experienceLevel: experienceLevel || 'any',
    timeCommitment: timeCommitment || '',
  };
  db.data.opcList.push(newOpc);
  await db.write();
  res.json({ success: true, opc: newOpc });
});

// PUT /opc/edit/:id
app.put('/opc/edit/:id', async (req, res) => {
  await db.read();
  const idx = db.data.opcList.findIndex(i => i.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'OPC not found' });
  const { name, description, tags, price, contact, category, requiredSkills, collaborationType, experienceLevel, timeCommitment } = req.body;
  const old = db.data.opcList[idx];
  db.data.opcList[idx] = {
    ...old, name: name || old.name,
    description: description !== undefined ? description : old.description,
    tags: tags !== undefined ? tags : old.tags,
    price: price !== undefined ? price : old.price,
    contact: contact || old.contact, category: category || old.category,
    requiredSkills: requiredSkills || old.requiredSkills,
    collaborationType: collaborationType || old.collaborationType,
    experienceLevel: experienceLevel || old.experienceLevel,
    timeCommitment: timeCommitment !== undefined ? timeCommitment : old.timeCommitment,
  };
  await db.write();
  res.json({ success: true, opc: db.data.opcList[idx] });
});

// DELETE /opc/delete/:id
app.delete('/opc/delete/:id', async (req, res) => {
  await db.read();
  const idx = db.data.opcList.findIndex(i => i.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'OPC not found' });
  db.data.opcList.splice(idx, 1);
  await db.write();
  res.json({ success: true });
});

// GET /opc/match/:id — 相似推荐
app.get('/opc/match/:id', async (req, res) => {
  await db.read();
  const target = db.data.opcList.find(i => i.id === Number(req.params.id));
  if (!target) return res.status(404).json({ error: 'OPC not found' });

  const scored = db.data.opcList
    .filter(opc => opc.id !== target.id)
    .map(opc => {
      let score = 0;
      if (opc.category === target.category && opc.category !== 'other') score += 3;
      if (opc.collaborationType === target.collaborationType) score += 2;
      const shared = (target.requiredSkills || []).filter(s => (opc.requiredSkills || []).includes(s));
      score += shared.length * 1.5;
      const targetTags = (target.tags || '').split(/[,，、]/).map(t => t.trim()).filter(Boolean);
      const opcTags = (opc.tags || '').split(/[,，、]/).map(t => t.trim()).filter(Boolean);
      const sharedTags = targetTags.filter(t => opcTags.includes(t));
      score += sharedTags.length;
      const kw1 = (target.description || '').toLowerCase();
      const kw2 = (opc.description || '').toLowerCase();
      if (kw1 && kw2) {
        const words = kw1.split(/[\s，。、！？]+/).filter(w => w.length > 2);
        score += words.filter(w => kw2.includes(w)).length * 0.5;
      }
      return { ...opc, similarity: Math.min(score / 10, 0.99) };
    })
    .filter(opc => opc.similarity > 0.05)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  res.json(scored);
});

// POST /opc/chat — Ollama LLM
app.post('/opc/chat', async (req, res) => {
  try {
    const { opcId, messages } = req.body;
    if (!messages || !messages.length) return res.status(400).json({ error: 'messages required' });

    await db.read();
    const opc = db.data.opcList.find(i => i.id === Number(opcId));
    const sysPrompt = opc
      ? 'You are an AI collaboration assistant for: ' + opc.name + '. ' + (opc.description || '') + ' Help the user with collaboration suggestions.'
      : 'You are a helpful collaboration assistant.';

    const chatMessages = [{ role: 'system', content: sysPrompt }, ...messages];
    const result = await ollamaChat(chatMessages);
    res.json({ reply: result.message?.content || 'No response from AI.' });
  } catch (err) {
    console.error('Ollama error:', err.message);
    res.json({ reply: 'AI service is temporarily unavailable. Please make sure Ollama is running and ' + OLLAMA_MODEL + ' model is available.' });
  }
});

// ==================== 申请流程 ====================

// POST /opc/apply — 提交申请
app.post('/opc/apply', async (req, res) => {
  try {
    await db.read();
    db.data.applications = db.data.applications || [];
    const { opcId, applicantName, applicantContact, message } = req.body;
    if (!opcId || !applicantName || !applicantContact) {
      return res.status(400).json({ error: 'opcId, applicantName, applicantContact are required' });
    }
    
    const opc = db.data.opcList.find(i => i.id === Number(opcId));
    if (!opc) return res.status(404).json({ error: 'OPC not found' });
    
    const application = {
      id: Date.now(),
      opcId: Number(opcId),
      applicantName,
      applicantContact,
      message: message || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    db.data.applications.push(application);
    await db.write();
    res.json({ success: true, application });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /opc/applicants/:id — 查看某 OPC 的所有申请
app.get('/opc/applicants/:id', async (req, res) => {
  await db.read();
  const opcId = Number(req.params.id);
  const applications = (db.data.applications || []).filter(a => a.opcId === opcId);
  res.json(applications);
});

// PUT /opc/application/:id — 更新申请状态（同意/拒绝）
app.put('/opc/application/:id', async (req, res) => {
  await db.read();
  db.data.applications = db.data.applications || [];
  const appId = Number(req.params.id);
  const { status } = req.body;
  
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be accepted or rejected' });
  }
  
  const app = db.data.applications.find(a => a.id === appId);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  
  app.status = status;
  app.updatedAt = new Date().toISOString();
  await db.write();
  res.json({ success: true, application: app });
});

// ==================== Star 系统 ====================

// POST /opc/star/:id — star/unstar (toggle)
app.post('/opc/star/:id', async (req, res) => {
  try {
    await db.read();
    db.data.stars = db.data.stars || [];
    const opcId = Number(req.params.id);
    const userId = getUserId(req);
    
    // 检查 OPC 是否存在
    const opc = db.data.opcList.find(i => i.id === opcId);
    if (!opc) return res.status(404).json({ error: 'OPC not found' });
    
    let starRecord = db.data.stars.find(s => s.opcId === opcId);
    
    if (!starRecord) {
      // 首次 star
      starRecord = { opcId, count: 1, starredBy: [userId] };
      db.data.stars.push(starRecord);
      await db.write();
      return res.json({ success: true, starred: true, count: 1 });
    }
    
    const idx = starRecord.starredBy.indexOf(userId);
    if (idx === -1) {
      // star
      starRecord.starredBy.push(userId);
      starRecord.count++;
    } else {
      // unstar
      starRecord.starredBy.splice(idx, 1);
      starRecord.count = Math.max(0, starRecord.count - 1);
    }
    
    await db.write();
    res.json({ success: true, starred: idx === -1, count: starRecord.count });
  } catch (err) {
    console.error('Star error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /opc/star/:id — 获取 star 数和当前用户是否已 star
app.get('/opc/star/:id', async (req, res) => {
  await db.read();
  db.data.stars = db.data.stars || [];
  const opcId = Number(req.params.id);
  const userId = getUserId(req);
  
  const starRecord = db.data.stars.find(s => s.opcId === opcId);
  const count = starRecord ? starRecord.count : 0;
  const starred = starRecord ? starRecord.starredBy.includes(userId) : false;
  
  res.json({ count, starred });
});

// ==================== My Applications ====================

// GET /opc/my-applications/received?contact=xxx — 获取我收到的申请（我创建的OPC的申请）
app.get('/opc/my-applications/received', async (req, res) => {
  try {
    await db.read();
    db.data.applications = db.data.applications || [];
    db.data.opcList = db.data.opcList || [];
    
    const contact = req.query.contact;
    if (!contact) return res.status(400).json({ error: 'Missing contact parameter' });
    
    // 找到我创建的 OPC
    const myOpcs = db.data.opcList.filter(opc => opc.contact === contact);
    const myOpcIds = myOpcs.map(opc => opc.id);
    
    // 找到这些 OPC 的申请
    const applications = db.data.applications
      .filter(app => myOpcIds.includes(app.opcId))
      .map(app => {
        const opc = db.data.opcList.find(o => o.id === app.opcId);
        return { ...app, opcName: opc ? opc.name : `OPC #${app.opcId}` };
      });
    
    res.json({ success: true, applications });
  } catch (err) {
    console.error('Get received applications error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /opc/my-applications/sent?contact=xxx — 获取我发起的申请
app.get('/opc/my-applications/sent', async (req, res) => {
  try {
    await db.read();
    db.data.applications = db.data.applications || [];
    db.data.opcList = db.data.opcList || [];
    
    const contact = req.query.contact;
    if (!contact) return res.status(400).json({ error: 'Missing contact parameter' });
    
    // 找到我发起的申请
    const applications = db.data.applications
      .filter(app => app.applicantContact === contact)
      .map(app => {
        const opc = db.data.opcList.find(o => o.id === app.opcId);
        return { ...app, opcName: opc ? opc.name : `OPC #${app.opcId}` };
      });
    
    res.json({ success: true, applications });
  } catch (err) {
    console.error('Get sent applications error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== Start Server ====================

app.listen(PORT, () => {
  console.log('OPC server running on http://localhost:' + PORT);
});
