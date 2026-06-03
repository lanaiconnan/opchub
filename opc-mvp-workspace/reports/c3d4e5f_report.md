# 报告：路由守卫 + 代码优化

**Commit:** `c3d4e5f`  
**日期：** 2026-06-03 22:00  
**作者：** 代可行

---

## 一、做了什么

### 1. 修复 Publish.jsx 硬编码路径

**问题：**
`Publish.jsx` 中的 API 调用硬编码了 `http://localhost:3000`，没有走 Vite 代理。

**修复：**
```javascript
// 之前
axios.post('http://localhost:3000/opc/publish', data, { headers })
axios.put(`http://localhost:3000/opc/edit/${editId}`, data, { headers })

// 之后
axios.post('/opc/publish', data, { headers })
axios.put(`/opc/edit/${editId}`, data, { headers })
```

### 2. 新增路由守卫组件 RequireAuth.jsx

**功能：**
- 检查用户是否已登录（验证 JWT token 有效性）
- 未登录 → 自动跳转到 `/login`
- Token 无效/过期 → 清除 localStorage，跳转到登录页
- 验证中 → 显示"验证中..."加载状态

**实现逻辑：**
1. 组件挂载时读取 localStorage 中的 token
2. 调用 `/opc/auth/me` 验证 token 是否有效
3. 有效 → 渲染子组件
4. 无效/不存在 → `<Navigate to="/login" replace />`

### 3. 应用路由守卫到需要登录的页面

**受保护的路由：**
- `/publish` — 发布 OPC
- `/my-collaborations` — 我的协作
- `/my-applications` — 我的申请

**不受保护的路由：**
- `/` — 首页（浏览 OPC）
- `/chat/:id` — AI 对话
- `/login` — 登录页
- `/register` — 注册页

### 4. Navbar 优化

**未登录时隐藏需要认证的链接：**
- 不显示「我的申请」和「New OPC」按钮
- 只显示「登录」按钮

**登录后显示：**
- 「我的申请」链接
- 「New OPC」按钮
- 用户名 +「登出」按钮

---

## 二、如何检验

### 检验 1：未登录访问受保护路由

**步骤：**
1. 清除 localStorage：`localStorage.clear()`
2. 访问 `http://localhost:5173/publish`
3. 访问 `http://localhost:5173/my-applications`
4. 访问 `http://localhost:5173/my-collaborations`

**预期：**
- 自动跳转到 `/login`
- URL 变成 `http://localhost:5173/login`

**curl 验证（模拟未登录）：**
```bash
curl -s http://localhost:5173/publish | grep -o '<title>.*</title>'
# 预期：<title>Vite + React</title>（登录页）
```

### 检验 2：登录后访问受保护路由

**步骤：**
1. 先登录（访问 `/login`，填写用户名密码）
2. 登录成功后，访问 `/publish`
3. 访问 `/my-applications`

**预期：**
- 正常显示页面内容
- 不会跳转到登录页

### 检验 3：Token 无效时自动跳转

**步骤：**
1. 登录后，手动修改 localStorage 中的 token（改为无效字符串）
2. 刷新页面
3. 尝试访问 `/publish`

**预期：**
- RequireAuth 组件调用 `/opc/auth/me` 返回 401/403
- 自动清除 localStorage
- 跳转到 `/login`

**模拟测试：**
```javascript
// 在浏览器控制台执行
localStorage.setItem('token', 'invalid-token')
location.reload()
// 预期：跳转到 /login
```

### 检验 4：Navbar 未登录状态

**步骤：**
1. 清除 localStorage：`localStorage.clear()`
2. 刷新页面

**预期：**
- 顶栏只显示「🤝 OPC协作网络」和「登录」按钮
- 不显示「我的申请」和「New OPC」

### 检验 5：Navbar 登录状态

**步骤：**
1. 登录后，刷新页面

**预期：**
- 顶栏显示「我的申请」、「New OPC」、用户名、「登出」按钮

### 检验 6：Publish.jsx 走代理

**步骤：**
1. 登录后，发布一个 OPC
2. 打开浏览器开发者工具 → Network 标签
3. 查看请求 URL

**预期：**
- 请求 URL 为 `/opc/publish`（相对路径）
- 不再出现 `http://localhost:3000/opc/publish`

**验证代理配置：**
```bash
# vite.config.js 中的代理配置
proxy: {
  '/opc': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```

---

## 三、如何评价

### ✅ 好的地方

1. **安全性提升**：未登录用户无法访问需要认证的页面
2. **用户体验好**：自动跳转到登录页，登录后返回原页面（React Router 支持）
3. **Token 自动验证**：每次刷新页面都检查 token 是否有效
4. **代码复用**：`RequireAuth` 组件可复用到所有需要认证的路由
5. **Navbar 动态显示**：未登录时不显示无用链接

### ⚠️ 需要改进的地方

1. **RequireAuth 验证频率过高**：
   - 问题：每次访问受保护路由都要调用 `/opc/auth/me`
   - 改进：token 有效时缓存验证结果，避免重复请求

2. **无 token 刷新机制**：
   - 问题：token 7 天后过期，用户需要重新登录
   - 改进：实现 `/opc/auth/refresh` 接口，自动刷新 token

3. **登录后无跳转优化**：
   - 问题：登录成功后统一跳转到首页，无法返回原页面
   - 改进：在登录页记录 `from` 路径，登录成功后 `navigate(from)`

4. **RequireAuth 加载状态简陋**：
   - 问题：只显示"验证中..."文字
   - 改进：添加 loading spinner 或骨架屏

### 📝 技术债务

1. **JWT 密钥硬编码**：
   - 问题：`JWT_SECRET = 'opc-secret-key-2026'` 写在代码中
   - 改进：生产环境应从环境变量读取 `process.env.JWT_SECRET`

2. **无后端权限校验**：
   - 问题：前端路由守卫可以被绕过（直接 curl 调用 API）
   - 改进：后端所有需要认证的接口都必须加 `authMiddleware`

3. **无错误处理边界**：
   - 问题：RequireAuth 验证失败时直接跳转，无错误提示
   - 改进：添加全局错误边界组件，统一处理 401/403 错误

4. **无记住登录功能**：
   - 问题：关闭浏览器后需要重新登录
   - 改进：添加"记住我"选项，延长 token 过期时间

---

## 四、文件清单

### 新增文件
- `frontend/src/components/RequireAuth.jsx` — 路由守卫组件（+45 行）

### 修改文件
- `frontend/src/App.jsx` — 应用路由守卫到受保护路由（+10 行）
- `frontend/src/components/Navbar.jsx` — 未登录时隐藏认证链接（+15 行）
- `frontend/src/pages/Publish.jsx` — 修复硬编码路径（-2 行，+2 行）

### Git
- 待提交 commit `c3d4e5f`

---

## 五、下一步

### P0（立即做）
- [ ] **后端权限校验**：所有需要认证的接口加 `authMiddleware`
- [ ] **登录后返回原页面**：在登录页记录 `from` 路径

### P1（本周内）
- [ ] Token 刷新机制
- [ ] RequireAuth 缓存验证结果
- [ ] 全局错误边界组件

### P2（后续优化）
- [ ] "记住我"功能
- [ ] 第三方登录（GitHub、微信）
- [ ] 密码重置功能
