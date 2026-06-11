# 暗色主题完整实现 — 2026-06-06

## 目标

为 OPC Hub 前端添加一键切换亮色/暗色模式，所有页面和组件主题感知，无硬编码颜色。

## 实现方案

### 核心机制

- `tokens.js` 导出 `useColors()` hook → 组件内调用，返回当前主题色板
- `ThemeContext.jsx` 提供 `theme`（light/dark）、`colors`（当前色板）、`toggle()`
- `main.jsx` 用 `<ThemeProvider>` 包裹入口
- `document.documentElement.dataset.theme` 驱动 CSS 变量（如有需要可扩展）

### 改动文件清单

| 文件 | 改动 |
|------|------|
| `src/styles/tokens.js` | 顶部加 `import { useTheme }`；末尾导出 `useColors()` |
| `src/context/ThemeContext.jsx` | 新建：light/dark 色板、`ThemeProvider`、`useTheme` |
| `src/main.jsx` | 用 `<ThemeProvider>` 包裹 `<App>` |
| `src/components/Navbar.jsx` | 加主题切换按钮（☀️/🌙）；`useColors()` 驱动动态样式 |
| `src/pages/Home.jsx` | `s` 对象移入组件内；`color = useColors()` |
| `src/pages/ChatPage.jsx` | 同上；ApplyModal 独立调用 `useColors()` |
| `src/pages/Login.jsx` | 同上 |
| `src/pages/Register.jsx` | 同上 |
| `src/pages/Publish.jsx` | 同上 |
| `src/pages/MyApplications.jsx` | 同上 |
| `src/pages/NotificationPage.jsx` | 同上 |
| `src/components/StatusMessage.jsx` | 同上 |
| `src/components/ChatInput.jsx` | 同上（修复重复 `cursor` key 的语法错误） |

### 未改动

- `MarkdownRenderer.jsx` — 颜色由 `variant="light"|"dark"` prop 控制（跟随气泡颜色，而非全局主题），无需修改。

## 构建验证

```
vite v5.0.0 building for development...
✓ 104 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-7vU95AIZ.css    1.80 kB │ gzip:  0.83 kB
dist/assets/index-C4qfYXCM.js   272.33 kB │ gzip: 87.65 kB
✓ built in 1.72s
```

## 如何使用

1. 启动前端 `npm run dev`（端口 5173）
2. 点击 Navbar 右侧的 ☀️/🌙 按钮切换主题
3. 页面刷新后主题保持（存储在 `localStorage`，key: `opc-theme`）

## 已知限制

- 目前只换了组件内联样式，`index.css` 全局样式未做暗色适配（后续可扩展）
- 代码块高亮颜色在暗色主题下可进一步优化（`MarkdownRenderer.jsx`）
