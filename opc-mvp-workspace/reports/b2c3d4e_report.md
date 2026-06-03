# 报告：登录系统（JWT认证）

**Commit:** `b2c3d4e`  
**日期：** 2026-06-03 21:45  
**作者：** 代可行

---

## 一、做了什么

### 1. 后端认证系统

**新增依赖：**
- `bcryptjs` — 密码加密
- `jsonwebtoken` — JWT token 签发和验证

**新增数据结构（db.json）：**
```json
{
  "users": [
    {
      "id": "user_xxx",
      "username": "testuser",
      "password": "$2a$10$...",  // bcrypt 加密
      "email": "test@example.com",
      "createdAt": "2026-06-03T..."
    }
  ]
}
```

**新增接口：**

| 接口 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/auth/register` | POST | 注册新用户 | 无需 |
| `/auth/login` | POST | 登录，返回 JWT token | 无需 |
| `/auth/me` | GET | 获取当前用户信息 | 需要 JWT |

**JWT 配置：**
- 密钥：`opc-secret-key-2026`（生产环境应从环境变量读取）
- 过期时间：7 天
- 载荷：`{ userId, username }`

**认证中间件：**
- `authMiddleware` — 验证 JWT token，提取用户信息
- 无 token → 401 未登录
- token 无效 → 403 token 无效或已过期

### 2. 数据模型更新

**OPC 新增字段：**
- `creatorId` — 创建者 ID（优先 userId，否则用 contact）

**申请（Application）新增字段：**
- `applicantId` — 申请人 ID（优先 userId，否则用 contact）

### 3. 接口改造

**需要 JWT 的接口：**
- `GET /opc/my-applications/received` — 获取收到的申请
- `GET /opc/my-applications/sent` — 获取发起的申请

**支持 JWT 的接口（可选）：**
- `POST /opc/publish` — 发布 OPC（有 token 则记录 creatorId）
- `POST /opc/apply` — 提交申请（有 token 则记录 applicantId）

### 4. 前端登录系统

**新增页面：**
- `Login.jsx` — 登录页
- `Register.jsx` — 注册页

**新增路由：**
- `/login` → Login 组件
- `/register` → Register 组件

**Navbar 更新：**
- 未登录：显示「登录」按钮
- 已登录：显示用户名 +「登出」按钮
- 登出：清除 localStorage 中的 token 和 user

**组件更新：**
- `Publish.jsx` — 发布时携带 token
- `Home.jsx` — 申请时携带 token
- `MyApplications.jsx` — 改用 token 验证（不再用 contact）

---

## 二、如何检验

### 检验 1：注册功能

**步骤：**
1. 访问 `http://localhost:5173/register`
2. 填写用户名、密码（至少 6 字符）、确认密码
3. 点击「注册」

**预期：**
- 注册成功后自动登录
- 跳转到首页
- 顶栏显示用户名和「登出」按钮

**curl 验证：**
```bash
curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}' | jq '.'
# 预期：{"success":true,"token":"...","user":{...}}
```

### 检验 2：登录功能

**步骤：**
1. 点击顶栏「登出」按钮
2. 点击「登录」按钮
3. 填写用户名和密码
4. 点击「登录」

**预期：**
- 登录成功后跳转到首页
- 顶栏显示用户名

**curl 验证：**
```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}' | jq '.'
# 预期：{"success":true,"token":"...","user":{...}}
```

### 检验 3：获取用户信息

**步骤：**
1. 登录后，检查 localStorage：`localStorage.getItem('user')`
2. 预期返回 JSON 字符串，包含 `id`, `username`, `email`

**curl 验证：**
```bash
TOKEN="你的token"
curl -s http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'
# 预期：{"id":"user_xxx","username":"testuser",...}
```

### 检验 4：发布 OPC（带 token）

**步骤：**
1. 登录后，点击「New OPC」
2. 填写表单并发布
3. 检查 `db.json`，预期 OPC 记录包含 `creatorId` 字段（值为 userId）

**curl 验证：**
```bash
TOKEN="你的token"
curl -s -X POST http://localhost:3000/opc/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"测试OPC","contact":"test@example.com"}' | jq '.'
# 预期：{"success":true,"opc":{...,"creatorId":"user_xxx"}}
```

### 检验 5：提交申请（带 token）

**步骤：**
1. 登录后，在首页点击某个 OPC 的「申请加入」
2. 填写申请表单并提交
3. 检查 `db.json`，预期申请记录包含 `applicantId` 字段

**curl 验证：**
```bash
TOKEN="你的token"
curl -s -X POST http://localhost:3000/opc/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"opcId":1780330439307,"applicantName":"测试","applicantContact":"test@example.com"}' | jq '.'
# 预期：{"success":true,"application":{...,"applicantId":"user_xxx"}}
```

### 检验 6：查看收到的申请（需 JWT）

**步骤：**
1. 登录（用创建了 OPC 的账号）
2. 访问「我的申请」页面
3. 点击「收到的申请」tab

**预期：**
- 显示该用户创建的 OPC 收到的申请
- 未登录时提示「请先登录」

**curl 验证：**
```bash
TOKEN="你的token"
curl -s http://localhost:3000/opc/my-applications/received \
  -H "Authorization: Bearer $TOKEN" | jq '.'
# 预期：{"success":true,"applications":[...]}
```

### 检验 7：登出功能

**步骤：**
1. 点击顶栏「登出」按钮
2. 检查 localStorage：`localStorage.getItem('token')`

**预期：**
- 返回 `null`
- 顶栏显示「登录」按钮

---

## 三、如何评价

### ✅ 好的地方

1. **安全可靠**：密码 bcrypt 加密，JWT token 7 天有效期
2. **向后兼容**：未登录用户仍可发布 OPC 和提交申请（用 contact 作为标识）
3. **用户体验好**：注册后自动登录，登出后清除所有登录态
4. **代码复用**：`authMiddleware` 中间件可复用到所有需要认证的接口

### ⚠️ 需要改进的地方

1. **JWT 密钥硬编码**：
   - 问题：`JWT_SECRET = 'opc-secret-key-2026'` 写在代码中
   - 改进：生产环境应从环境变量读取 `process.env.JWT_SECRET`

2. **无 token 刷新机制**：
   - 问题：token 7 天后过期，用户需要重新登录
   - 改进：实现 token 刷新接口 `/auth/refresh`

3. **密码强度未校验**：
   - 问题：只检查长度 ≥6，未检查复杂度
   - 改进：前端加密码强度提示，后端加强度校验

4. **无邮箱验证**：
   - 问题：邮箱字段选填且未验证
   - 改进：发送验证邮件，或用邮箱作为登录凭证

### 📝 技术债务

1. **`Publish.jsx` 硬编码 API 路径**：
   - 问题：仍用 `http://localhost:3000`，未走 Vite 代理
   - 改进：改为 `/opc/*` 相对路径

2. **无路由守卫**：
   - 问题：未登录也可访问 `/my-applications`（只是显示错误）
   - 改进：添加路由守卫，未登录自动跳转到登录页

3. **无登录状态持久化检查**：
   - 问题：刷新页面后 Navbar 显示登录状态，但 token 可能已过期
   - 改进：页面加载时调用 `/auth/me` 验证 token

---

## 四、文件清单

### 后端
- `backend/server.js` — 新增认证接口和中间件，+150 行
- `backend/package.json` — 新增 `bcryptjs`, `jsonwebtoken` 依赖
- `backend/db.json.backup` — 数据库备份（迁移前）

### 前端
- `frontend/src/pages/Login.jsx` — 新建文件，+180 行
- `frontend/src/pages/Register.jsx` — 新建文件，+200 行
- `frontend/src/App.jsx` — 新增 2 个路由
- `frontend/src/components/Navbar.jsx` — 显示登录状态，+50 行
- `frontend/src/pages/Home.jsx` — 申请时携带 token
- `frontend/src/pages/Publish.jsx` — 发布时携带 token
- `frontend/src/pages/MyApplications.jsx` — 改用 token 验证

### Git
- 待提交 commit

---

## 五、下一步

### P0（立即做）
- [ ] **路由守卫**：未登录访问 `/my-applications` 时自动跳转到登录页
- [ ] **token 验证**：页面加载时检查 token 是否有效

### P1（本周内）
- [ ] JWT 密钥从环境变量读取
- [ ] token 刷新机制
- [ ] 密码强度校验

### P2（后续优化）
- [ ] 邮箱验证
- [ ] 第三方登录（GitHub、微信）
- [ ] 密码重置功能
