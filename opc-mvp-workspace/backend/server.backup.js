const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const PORT = 3000;

app.use(express.json());

// 模拟OPC数据（初始为空）
let opcList = [];

// 获取OPC列表
app.get('/opc/list', (req, res) => {
  res.json(opcList);
});

// 获取OPC详情
app.get('/opc/detail/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const opc = opcList.find(item => item.id === id);
  if (!opc) {
    return res.status(404).json({ error: 'OPC不存在' });
  }
  res.json(opc);
});

// 发布OPC服务
app.post('/opc/publish', (req, res) => {
  const { name, description, tags, price, contact } = req.body;
  if (!name || !contact) {
    return res.status(400).json({ error: '缺少必填字段' });
  }
  const newOpc = {
    id: Date.now(),
    name,
    description: description || '',
    tags: tags || '',
    price: price || '',
    contact,
  };
  opcList.push(newOpc);
  res.json({ success: true, opc: newOpc });
});

// 编辑OPC
app.put('/opc/edit/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = opcList.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'OPC不存在' });
  }
  const { name, description, tags, price, contact } = req.body;
  opcList[index] = {
    ...opcList[index],
    name: name || opcList[index].name,
    description: description !== undefined ? description : opcList[index].description,
    tags: tags !== undefined ? tags : opcList[index].tags,
    price: price !== undefined ? price : opcList[index].price,
    contact: contact || opcList[index].contact,
  };
  res.json({ success: true, opc: opcList[index] });
});

// 删除OPC
app.delete('/opc/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = opcList.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'OPC不存在' });
  }
  opcList.splice(index, 1);
  res.json({ success: true, message: '删除成功' });
});

app.listen(PORT, () => {
  console.log(`OPC后端服务运行在 http://localhost:${PORT}`);
});
