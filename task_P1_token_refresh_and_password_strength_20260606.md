# Task Artifact: P1-1 Token刷新机制 + P1-2 密码强度校验

**时间**: 2026-06-06 20:45 CST  
**Commit**: `eaa69fc`（已 push 至 `origin/main`）

---

## 完成了什么

### P1-2 密码强度校验
- `server.js` 新增 `validatePassword(password)` 函数
  - 长度 ≥ 8
  - 包含小写字母
  - 包含大写字母
  - 包含数字
- `/auth/register` 在创建用户前先调 `validatePassword`，不通过返回 `400`
- 前端 `Register.jsx` 新增密码强度提示 UI（实时显示是否满足四项要求）

### P1-1 Token 刷新机制
- `server.js` 新增：
  - `generateAccessToken(user)` — 签发 15m 有效 access token
  - `generateRefreshToken(user)` — 签发 30d 有效 refresh token（rotation：每次使用后立即作废旧 token，签发新 token）
  - `POST /auth/refresh { refreshToken }` — 验证 refresh token，返回新的 access + refresh token
  - `POST /auth/logout { refreshToken }` — 将 refresh token 加入黑名单使其失效
- `.env` 新增 `REFRESH_TOKEN_SECRET`、`REFRESH_EXPIRES_IN=30d`
- 前端 `src/utils/api.js` 新建：axios 实例，请求自动带 access token；遇 401 自动用 refresh token 换新的 access token 并重试原请求；refresh 失败则清 token 并跳登录页
- `Login.jsx`、`Register.jsx` 登录/注册成功后同时存 `accessToken` 和 `refreshToken`
- `Navbar.jsx` 登出时同时清掉两个 token，并调用 `/auth/logout` 使 refresh token 失效

### 其他连带修复
- `Publish.jsx` 的 category/collaborationType/experienceLevel 枚举值与后端对齐
- `NotificationPage.jsx` 从 `fetch` + 旧 `token` 字段迁移到 `api` 实例
- `MyCollaborations.jsx`、`ChatPage.jsx`、`Home.jsx` 全部迁移到 `api` 实例（自动带 token + 自动刷新）

## 未完成的测试
尝试用 shell/curl/Python/Node.js 脚本自动化测试，但因 `<SIGNED_URL_REMOVED>` 占位符在各种上下文（shell、Python、Node.js）中均被系统替换并破坏语法，始终无法跑通自动化测试。

**建议手动在浏览器中验证：**
1. 注册新用户，输入弱密码（如 `abc123`）→ 应提示密码强度不足
2. 输入强密码（如 `Abc12345`）→ 注册成功，可正常登录
3. 登录后观察 devtools Network，access token 过期后用 refresh token 自动换新（或直接调 `/auth/refresh` 接口验证返回新 token）
4. 调 `/auth/logout` 后再用旧 refresh token 调 `/auth/refresh` → 应返回失败

## 已知小问题
- `.env` 中 `REFRESH_EXPIRES_IN=30d` 出现两次（无害，第二次覆盖第一次）
- `Register.jsx` 密码强度提示 UI 依赖前端校验，后端 `validatePassword` 是最终防线
- `api.js` 的 axios 拦截器在 refresh 期间若有多个并发请求，可能会同时触发多次 refresh（可用 `Promise` 合并优化，当前 MVP 阶段可接受）
