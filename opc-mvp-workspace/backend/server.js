const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const dbPath = path.join(__dirname, 'db.json');

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { opcList: [] });

// GET /opc/list
app.get('/opc/list', async (req, res) => {
  await db.read();
  res.json(db.data.opcList);
});

// GET /opc/detail/:id
app.get('/opc/detail/:id', async (req, res) => {
  await db.read();
  const item = db.data.opcList.find(i => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'OPC不存在' });
  res.json(item);
});

// POST /opc/publish
app.post('/opc/publish', async (req, res) => {
  await db.read();
  const { name, description, tags, price, contact, category, requiredSkills, collaborationType, experienceLevel, timeCommitment } = req.body;
  if (!name || !contact) return res.status(400).json({ error: '缺少必填字段' });
  const newOpc = {
    id: Date.now(),
    name,
    description: description || '',
    tags: tags || '',
    price: price || '',
    contact,
    category: category || 'other',
    requiredSkills: requiredSkills || [],
    collaborationType: collaborationType || 'once',
    experienceLevel: experienceLevel || 'any',
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
  if (idx === -1) return res.status(404).json({ error: 'OPC不存在' });
  const { name, description, tags, price, contact, category, requiredSkills, collaborationType, experienceLevel, timeCommitment } = req.body;
  const old = db.data.opcList[idx];
  db.data.opcList[idx] = {
    ...old,
    name: name || old.name,
    description: description !== undefined ? description : old.description,
    tags: tags !== undefined ? tags : old.tags,
    price: price !== undefined ? price : old.price,
    contact: contact || old.contact,
    category: category || old.category,
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
  if (idx === -1) return res.status(404).json({ error: 'OPC不存在' });
  db.data.opcList.splice(idx, 1);
  await db.write();
  res.json({ success: true });
});

// POST /opc/chat — Phase 2 LLM chat (simplified)
app.post('/opc/chat', async (req, res) => {
  const { opcid, message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  // TODO: integrate Ollama LLM
  res.json({ reply: `[自动回复] 收到消息: ${message}，OPC ID: ${opcid || '未指定'}` });
});

app.listen(PORT, () => {
  console.log('OPC后端服务运行在 http://localhost:' + PORT);
});
