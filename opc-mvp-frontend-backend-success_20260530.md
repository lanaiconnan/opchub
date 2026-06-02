# OPC MVP 前后端联调成功 - 2026-05-30

## 目标
搭建 OPC 协作网络 MVP 的前后端，实现服务发布和列表展示功能。

## 关键问题与解决
1. **create-vite@9 + Node.js v20.11.0 不兼容** → 改用 `npx create-vite@8`
2. **React 19 + react-router-dom v6 Invalid hook call** → 降级 React 18.3.1 + react-router-dom v7.16.0
3. **多副本 React** → `rm -rf node_modules package-lock.json` + 重装
4. **CORS 跨域拦截** → 后端安装 cors 包，添加 `app.use(cors())`
5. **pages 目录未创建** → 手动 mkdir + 重新创建 Home.jsx / Publish.jsx / App.jsx

## 当前状态
- 后端：http://localhost:3000（终端1，node server.js）
- 前端：http://localhost:5176（终端2，npm run dev）
- 发布功能已测试通过
- Ngrok 公网映射、Gitee 推送待完成

## 待办
- Ngrok 映射公网（前端+后端）
- Gitee 仓库初始化与推送
- UI 美化、功能完善
