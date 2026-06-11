# Task Artifact: P1-3 MyOPCs.jsx 管理页面

**时间**: 2026-06-06 21:30 CST  
**Commit**: `b407cfc`（已 push 至 `origin/main`）

---

## 完成了什么

### 后端 `server.js`（4 处改动）

1. **`GET /opc/list`**：过滤掉 `status: "offline"` 的项，下架后不再出现在首页
2. **`POST /opc/publish`**：新 OPC 默认 `status: "online"`
3. **`PUT /opc/edit/:id`**：解构和对象更新都加入 `status` 字段支持
4. **新增 `GET /opc/my-opcs`**（需登录）：按 `creatorId === req.user.userId` 过滤

### 前端 `MyCollaborations.jsx` 重写

- 调 `GET /opc/my-opcs` 只显示自己发布的 OPC
- 顶部统计：上架中 X | 已下架 Y
- 每个 OPC 卡片显示：名称、状态标签（上架中/已下架）、描述、分类、技能标签、价格
- 操作按钮：
  - **查看申请** → 跳转 `/notifications`
  - **编辑** → 跳转 `/publish?id=xxx`
  - **下架/上架** → 调 `PUT /opc/edit/:id` 切换 status
  - **删除** → 带确认弹窗，硬删
- 空状态 UI（引导去发布）
- 已下架卡片加半透明 + 灰色背景区分

---

## 设计决策

- **下架用软下架**（`status: "offline"`），不是硬删，用户可重新上架
- **首页列表**（`GET /opc/list`）自动过滤 offline 项
- **"查看申请"** 暂时跳转到 `/notifications` 页（复用已有页面），后续可改成弹窗预览
- **`GET /opc/my-opcs`** 需登录（authMiddleware），前端 `api.js` 自动带 token

---

## 待验证（建议手动在浏览器确认）

1. 发布新 OPC → 默认 `status=online` → 首页可见
2. 管理页点击「下架」→ status 变为 `offline` → 首页消失，管理页显示「已下架」
3. 点击「上架」→ status 变回 `online` → 首页重新出现
4. 「查看申请」跳转到 `/notifications` 能看到该 OPC 的申请
5. 编辑/删除功能正常

---

## 当前完成进度

- ✅ P1-1 Token 刷新机制
- ✅ P1-2 密码强度校验
- ✅ P1-3 MyOPCs 管理页面
