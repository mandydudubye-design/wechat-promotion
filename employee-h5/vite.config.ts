import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // 改为根路径，避免路由重定向丢失参数
  server: {
    port: 5174,
    host: '0.0.0.0'  // 允许局域网访问，手机扫码可用
  }
})