import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // auth 路由：去掉 /opc 前缀（后端路由是 /auth/*）
      '/opc/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opc/, ''),
      },
      // 其他 opc 路由：保留 /opc 前缀
      '/opc': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
