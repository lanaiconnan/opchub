# 分类统计实现

## 目标
实现 OPC Hub 全维度平台统计：分类、技能、协作类型、经验级别、时间投入。

## 实现

### 后端 `GET /opc/stats`
- 全局统计：按 category / requiredSkills / collaborationType / experienceLevel / timeCommitment 聚合
- 个人统计（带 JWT）：同上维度 + applicationsSent / applicationsReceived
- 一次请求返回 `{ global, personal }`

### 前端 `Stats.jsx` (`/stats`)
- 概览卡片：项目总数、覆盖分类、技能标签、协作类型
- BarChart 纯 CSS 柱状图组件（支持暗色主题、0→目标值入场动画）
- 2列 grid 布局，移动端自适应单列
- 个人统计区（登录后自动展示）：我的项目、发出/收到申请数

### 路由 & 导航
- `/stats` 无登录要求（全局统计公开）
- Navbar 桌面端 + 移动端均已添加「📊 统计」链接

## 验证
- 构建通过（105 modules）
- 后端 `curl localhost:3000/opc/stats` 正确返回 5 个 OPC 的聚合数据
- Vite 代理 `localhost:5173/opc/stats` 正常
- JWT 认证下 personal stats 正确返回

Commit: `0ada05c`
