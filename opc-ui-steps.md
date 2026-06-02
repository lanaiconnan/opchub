# OPC MVP UI优化记录

## 日期
2026-05-31

## 目标
参考 GitHub/Gitee 风格优化 OPC 协作网络 MVP 前端界面

## 设计规范

### 颜色方案
- 背景色: `#24292f` (深色顶栏)
- 主色: `#2ea44f` (绿色按钮)
- 链接色: `#0969da` (蓝色链接)
- 边框色: `#d0d7de` (灰色边框)
- 背景: `#ffffff` (白色卡片)
- 标签背景: `#dafbe4` (浅绿标签)
- 标签文字: `#116329` (深绿文字)

### 字体
- 主标题: 32px, font-weight 600, #1F2328
- 副标题: 16px, #656d76
- 卡片标题: 20px, font-weight 600, #0969da
- 正文: 14px

## 实施步骤

### Step 1: 创建 Navbar 组件 ✅
- 路径: `frontend/src/components/Navbar.jsx`
- 深色背景顶栏 (#24292f)
- Logo: "🤝 OPC协作网络" (白色)
- 按钮: "New OPC" (绿色 #2ea44f)
- 使用 react-router-dom 的 Link 实现 SPA 导航

### Step 2: 修改 App.jsx 引入 Navbar ✅
- 路径: `frontend/src/App.jsx`
- 在 `<Router>` 内部、`<Routes>` 外部添加 `<Navbar />`
- 确保 Navbar 在所有页面顶部显示

### Step 3: 重写 Home.jsx ✅
- 路径: `frontend/src/pages/Home.jsx`
- 页面标题: "OPC协作网络" (32px, #1F2328)
- 副标题: "发现、协作、构建开源项目" (16px, #656d76)
- 加载状态: "加载中..." 居中显示
- 空状态: 虚线边框提示
- OPC 列表: 卡片布局
  - 左侧: 名称(链接)、描述、标签
  - 右侧: 创建时间
- 卡片样式: 白色背景 + 灰色边框

### Step 4: 美化 Publish.jsx ✅
- 路径: `frontend/src/pages/Publish.jsx`
- 表单容器: 白色背景 + 边框 + 圆角
- 输入框: 灰色背景 (#f6f8fa) + 边框 (#d0d7de)
- 聚焦时: 边框变蓝效果
- 提交按钮: 绿色 (#2ea44f)
- 返回按钮: 灰色 (#f6f8fa) + 边框
- 新增字段: 描述(description)、标签(tags)、预期回报(price)

## 后续优化
- [ ] 全局 CSS 变量统一管理
- [ ] 响应式布局适配移动端
- [ ] 空状态插图/图标
- [ ] 加载动画
- [ ] 卡片悬停效果