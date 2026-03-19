# 微信公众号推广客服系统 - 前端部署指南

## 构建产物

前端项目已成功构建，产物位于 `dist/` 目录：

```
dist/
├── index.html              # 入口HTML文件
├── vite.svg               # 图标
└── assets/
    ├── index-BnmPZDFG.js  # 打包后的JavaScript (734.63 kB)
    └── index-CNHRQllC.css # 打包后的CSS (28.31 kB)
```

## 部署方式

### 1. Nginx 部署（推荐）

#### 1.1 使用 Docker 部署

```bash
# 在 frontend 目录下运行
docker build -t wechat-frontend .
docker run -d -p 80:80 --name wechat-frontend wechat-frontend
```

#### 1.2 直接部署到现有 Nginx

```bash
# 将 dist 目录内容复制到 Nginx 根目录
cp -r dist/* /usr/share/nginx/html/

# 或使用自定义配置
cp nginx.conf /etc/nginx/conf.d/wechat-frontend.conf
nginx -s reload
```

### 2. Vercel/Netlify 部署

#### Vercel

1. 安装 Vercel CLI：`npm i -g vercel`
2. 在 frontend 目录运行：`vercel`
3. 按提示完成部署

#### Netlify

1. 登录 Netlify
2. 拖拽 `dist` 目录到 Netlify 部署区域
3. 自动完成部署

### 3. 静态托管服务

直接将 `dist` 目录上传到：
- GitHub Pages
- OSS（阿里云OSS、腾讯云COS等）
- CDN 服务

## 重要配置

### 环境变量

构建时需要配置后端API地址，编辑 `.env.production`：

```env
VITE_API_BASE_URL=https://your-backend-api.com
```

然后重新构建：`npm run build`

### 路由配置

前端使用 React Router，需要服务器配置 SPA 路由支持：

**Nginx：**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Apache：**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 性能优化建议

1. **启用 Gzip 压缩**（已在 nginx.conf 中配置）
2. **配置 CDN**：将静态资源上传到 CDN
3. **代码分割**：当前打包文件较大（734KB），建议使用动态导入进行代码分割
4. **缓存策略**：静态资源设置长期缓存

## 访问地址

部署成功后，访问对应地址即可：
- 本地开发：http://localhost:5173
- 生产环境：http://your-domain.com

## 故障排查

1. **白屏问题**：检查控制台网络请求，确认API地址配置正确
2. **路由404**：确认服务器配置了 SPA 路由支持
3. **资源加载失败**：检查静态资源路径是否正确

## 技术栈

- React 18
- TypeScript
- Vite 7
- Ant Design 5
- React Router
- Axios
- Zustand (状态管理)

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
