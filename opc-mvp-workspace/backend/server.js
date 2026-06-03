const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const dbPath = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { opcList: [] });

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

// POST /opc/chat — Ollama LLM
app.post('/opc/chat', async (req, res) => {
  try {
    const { opcId, messages } = req.body;
    if (!messages || !messages.length) return res.status(400).json({ error: 'messages required' });

    // Build system prompt from OPC data
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

app.listen(PORT, () => {
  console.log('OPC server running on http://localhost:' + PORT);
});
