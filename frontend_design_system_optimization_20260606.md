# 前端设计系统搭建与全局 UI 优化

**时间**: 2026-06-06 22:40 – 23:10 (GMT+8)
**Scope**: `opc-mvp-workspace/frontend/src`

---

## 目标

执行用户 22:39 确认的优化方向：
1. 提取全局设计 Token
2. 重写 Home.jsx 卡片设计
3. 优化 ChatPage.jsx 对话气泡
4. 统一 loading/empty/error 组件
5. 全局响应式布局替换死宽度

---

## 完成工作

### 1. 全局设计 Token（`styles/tokens.js`）

新建 `frontend/src/styles/tokens.js`，导出：

| 变量 | 内容 |
|------|------|
| `color.*` | 品牌色、中性色、功能色、语义别名（共 20+ 个） |
| `space.*` | xs(4) → xxxl(32) → section(40) → page(60) |
| `radius.*` | sm(6) / md(8) / lg(12) / xl(16) / full(9999) |
| `fontSize.*` | xs(11) → hero(24) 共 8 档 |
| `fontWeight.*` | regular(400) → bold(700) |
| `shadow.*` | card / cardHover / modal |
| `breakpoint.*` | sm(480) / md(768) / lg(1024) |
| `containerStyle` | maxWidth:960px 响应式容器 |
| `responsive` | 移动端 padding 参考值 |

**规则**：所有页面必须从 `tokens.js` 引用颜色和间距，禁止写死。

---

### 2. 统一状态组件 `StatusMessage.jsx`

新建 `frontend/src/components/StatusMessage.jsx`：
- 支持 `variant="loading" | "empty" | "error"`
- 统一图标、标题、描述文案
- 接收 `title` / `description` props 覆盖默认文案
- 所有页面不再各自写 loading/empty 状态

**修复**：初版 `fontWeight` 变量在 `s` 对象之后定义，导致 `s.title()` 引用 `undefined`，已修正定义顺序。

---

### 3. Home.jsx 卡片重设计

**改动**：
- 顶部 Hero 区：emoji 图标 + 标题 + 副标题 + 三个行动按钮
- 搜索/筛选栏：搜索框 + 3 个 `<select>` + 清除按钮，响应式折行
- 卡片布局：
  - 左侧：分类 badge（彩色，按 category 映射）+ 标题 + 描述（2 行截断）+ 技能标签 + 元信息 badge（协作类型/经验要求/时间投入）
  - 右侧：申请按钮 + AI 协助按钮
  - hover 效果：shadow.card → shadow.cardHover
- 推荐区：独立区域，带顶部绿色边框
- 申请弹窗：姓名/联系方式/留言，提交后 POST `/opc/apply`
- 全部颜色/间距/圆角改为从 `tokens.js` 引用

---

### 4. ChatPage.jsx 对话气泡优化

**改动**：
- 顶部栏：返回按钮 + OPC 名称 + catIcon + AI 协作助手标签 + Star 按钮
- OPC 详情折叠区（`<details>`）：分类/协作类型/经验要求/时间投入 + 技能标签 + 申请按钮
- 对话气泡：
  - user：绿色实心，`borderRadius: 16px 16px 4px 16px`（右下小角）
  - assistant：浅灰底色+边框，`borderRadius: 4px 16px 16px 16px`（左上小角）
  - MarkdownRenderer 传入 `variant` 适配明暗
- 输入区固定在底部
- 申请弹窗复用 `ApplyModal` 组件
- 全部样式从 `tokens.js` 引用

---

### 5. 其余页面适配 Token

| 文件 | 改动 |
|------|------|
| `Login.jsx` | 全部样式改用 token，移除了所有写死的颜色/间距 |
| `Register.jsx` | 同上，密码强度条改为动态宽度 + 颜色（红→橙→绿） |
| `Publish.jsx` | 双列布局（分类+协作类型 一行，经验+时间 一行），全部 token 化 |
| `MyApplications.jsx` | **修复 bug**：原代码用 `localStorage.getItem('token')`，应为 `accessToken`；且直接用 `axios` 而非 `api` 实例，已改为 `api.get()`；全部 token 化 |
| `NotificationPage.jsx` | 待处理/已处理分 section，全部 token 化 |
| `Navbar.jsx` | 保持暗色主题（GitHub 风格 `#24292f`），所有颜色改用 `color.*` 和 `rgba(255,255,255,0.x)` |

---

### 6. 响应式布局

- `tokens.js` 导出 `containerStyle`（maxWidth: 960px + 自动居中 + 响应式 padding）
- `Home.jsx` 使用 `containerStyle`
- 其余页面待后续迭代统一应用（本次先完成核心页面）

---

## 构建验证

每次修改后执行 `npx vite build --mode development`，结果：

| 轮次 | modules | 结果 |
|--------|----------|------|
| Home.jsx 重写后 | 102 | ✅ |
| ChatPage.jsx 重写后 | 102 | ✅ |
| Login.jsx 重写后 | 102 | ✅ |
| Register.jsx 重写后 | 102 | ✅ |
| Publish.jsx 重写后 | 102 | ✅ |
| MyApplications.jsx 重写后 | 102 | ✅ |
| NotificationPage.jsx 重写后 | 102 | ✅ |
| Navbar.jsx 重写后 | 102 | ✅ |
| StatusMessage.jsx 修复后 | 102 | ✅ |

**全部 102 modules 通过，无语法错误。**

---

## 待后续迭代

- [ ] 全部页面应用 `containerStyle`（目前仅 Home.jsx）
- [ ] 移动端 hamburger 菜单（Navbar 响应式）
- [ ] 首页卡片在 `< 480px` 时改为单列
- [ ] 全局 ErrorBoundary 细化（按页面定制 fallback UI）
- [ ] 暗色主题切换（目前 Navbar 暗色、其余浅色）

---

## 提交信息

```
feat: 前端设计系统 + 全局 UI 优化

- 新增 styles/tokens.js 全局设计 Token
- 新增 components/StatusMessage.jsx 统一状态组件
- 重写 Home.jsx（卡片重设计 + 响应式）
- 重写 ChatPage.jsx（对话气泡优化 + token 化）
- 重写 Login/Register/Publish/MyApplications/NotificationPage/Navbar
- 修复 MyApplications.jsx 的 token 读取 bug（accessToken）和 api 实例使用
- 全部页面禁止写死颜色/间距，统一从 tokens.js 引用
```
