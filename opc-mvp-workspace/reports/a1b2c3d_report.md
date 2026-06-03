# 报告：我的申请页面（临时身份识别方案）

**Commit:** `a1b2c3d`  
**日期：** 2026-06-03 21:22  
**作者：** 代可行

---

## 一、做了什么

### 1. 后端新增接口（2个）

| 接口 | 方法 | 功能 |
|------|------|------|
| `/opc/my-applications/received?contact=xxx` | GET | 获取我收到的申请（我创建的OPC的申请）|
| `/opc/my-applications/sent?contact=xxx` | GET | 获取我发起的申请 |

**实现逻辑：**
- `received`: 根据 `contact` 参数找到我创建的 OPC，再找这些 OPC 的申请
- `sent`: 根据 `contact` 参数找到我发起的申请（`applicantContact` 字段匹配）
- 返回数据附带 `opcName` 字段，方便前端显示

### 2. 前端新增页面

**文件：** `frontend/src/pages/MyApplications.jsx`

- ✅ Tab 切换（收到的申请 / 我发起的申请）
- ✅ 申请列表展示（申请人、联系方式、留言、状态、时间）
- ✅ 状态标签（待处理/已接受/已拒绝）
- ✅ 接受/拒绝按钮（仅收到的申请且状态为 pending 时显示）
- ✅ 无申请时的空状态提示
- ✅ 未设置 contact 时的错误提示

### 3. 路由和导航更新

**App.jsx：**
- 新增路由 `/my-applications` → `MyApplications` 组件

**Navbar.jsx：**
- 新增「我的申请」链接，在「New OPC」按钮左侧

### 4. 身份识别临时方案

**Publish.jsx：**
- 发布 OPC 成功后，将 `contact` 保存到 `localStorage.setItem('userContact', contact)`

**MyApplications.jsx：**
- 从 `localStorage.getItem('userContact')` 读取用户标识
- 未设置时显示提示：「请先在「发布OPC」页面填写联系方式，系统才能识别您的身份」

---

## 二、如何检验

### 检验 1：访问「我的申请」页面

**步骤：**
1. 打开 `http://localhost:5173`
2. 点击顶栏「我的申请」链接
3. 预期：进入 `/my-applications` 页面

**验证点：**
- ✅ 页面正常加载，无白屏
- ✅ Tab 切换正常（收到的申请 / 我发起的申请）

### 检验 2：未设置 contact 时的提示

**步骤：**
1. 清空 localStorage：在浏览器控制台执行 `localStorage.removeItem('userContact')`
2. 刷新页面
3. 预期：显示错误提示「请先在「发布OPC」页面填写联系方式，系统才能识别您的身份」

### 检验 3：发布 OPC 后自动设置 contact

**步骤：**
1. 点击「New OPC」发布一个 OPC（填写联系方式）
2. 发布成功后，检查 localStorage：`localStorage.getItem('userContact')`
3. 预期：返回刚才填写的联系方式

### 检验 4：查看收到的申请

**步骤：**
1. 确保 localStorage 有 `userContact`（且该 contact 创建过 OPC）
2. 访问 `/my-applications`
3. 点击「收到的申请」tab
4. 预期：显示该 OPC 收到的所有申请

**curl 验证：**
```bash
curl -s "http://localhost:3000/opc/my-applications/received?contact=188" | jq '.'
# 预期：返回申请列表，包含 opcName 字段
```

### 检验 5：查看我发起的申请

**步骤：**
1. 确保 localStorage 有 `userContact`（且该 contact 发起过申请）
2. 访问 `/my-applications`
3. 点击「我发起的申请」tab
4. 预期：显示该用户发起的所有申请

**curl 验证：**
```bash
curl -s "http://localhost:3000/opc/my-applications/sent?contact=test@example.com" | jq '.'
# 预期：返回申请列表
```

### 检验 6：接受/拒绝申请

**步骤：**
1. 在「收到的申请」列表中找到状态为「待处理」的申请
2. 点击「接受」或「拒绝」按钮
3. 预期：状态标签更新，按钮消失

**curl 验证：**
```bash
# 接受申请
curl -s -X PUT http://localhost:3000/opc/application/1780487123539 \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}' | jq '.'
# 预期：{"success":true,"application":{"status":"accepted",...}}
```

---

## 三、如何评价

### ✅ 好的地方

1. **快速跑通流程**：30分钟内完成「我的申请」核心功能
2. **用户体验友好**：Tab 切换直观，状态标签清晰，空状态提示明确
3. **错误提示完善**：未设置 contact 时给出明确指引
4. **代码复用**：`fetchApplications` 复用两个 tab 的逻辑

### ⚠️ 需要改进的地方

1. **身份识别不可靠**：
   - 问题：用 `contact` 作为用户标识，不同用户可能填写相同 contact
   - 改进：**必须做登录系统**（JWT + localStorage）

2. **申请列表无分页**：
   - 问题：申请数量多时页面会很长
   - 改进：加分页或滚动加载

3. **无实时刷新**：
   - 问题：用户在其他页面提交申请后，需要手动刷新才能看到
   - 改进：WebSocket 或轮询实时更新

### 📝 技术债务

1. **contact 字段用途混乱**：
   - 当前用途：创建者标识 + 申请人联系方式
   - 改进：增加 `creatorId` 字段，与 `applicantContact` 分离

2. **硬编码 API 路径**：
   - 问题：`Publish.jsx` 仍然硬编码 `http://localhost:3000`
   - 改进：改为相对路径 `/opc/*`，走 Vite 代理

3. **无权限校验**：
   - 问题：任何人都可以查看/更新申请，只要知道 contact
   - 改进：登录系统 + JWT 验证

---

## 四、文件清单

### 后端
- `backend/server.js` — 新增 2 个接口，+50 行

### 前端
- `frontend/src/pages/MyApplications.jsx` — 新建文件，+180 行
- `frontend/src/App.jsx` — 新增路由
- `frontend/src/components/Navbar.jsx` — 新增导航链接
- `frontend/src/pages/Publish.jsx` — 保存 contact 到 localStorage

### Git
- 待提交 commit

---

## 五、下一步

### P0（立即做）
- [ ] **登录系统**（解决身份识别问题）
  - 后端：注册/登录/JWT 签发/中间件验证
  - 前端：登录页/注册页/路由守卫/localStorage 存 token
  - 所有接口改为 `userId` 验证

### P1（本周内）
- [ ] 申请列表分页
- [ ] 实时刷新（WebSocket 或轮询）

### P2（后续优化）
- [ ] 申请通知机制（邮件/站内信）
- [ ] 批量操作（批量接受/拒绝）
