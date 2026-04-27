const http = require('http');
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = '/root/wechat-promotion/frontend/dist';
const BACKEND_PORT = 3000;
const PORT = 8080;

const contentTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  if (req.url.startsWith('/api')) {
    // 代理到后端
    const options = {
      hostname: 'localhost',
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => {
      console.error('Proxy error:', e.message);
      res.writeHead(500);
      res.end('Proxy error');
    });

    req.pipe(proxyReq);
  } else {
    // 提供静态文件
    let filePath = path.join(FRONTEND_DIR, req.url.split('?')[0]);
    
    if (!path.extname(filePath) || filePath.endsWith('/')) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // SPA: 返回 index.html
        fs.readFile(path.join(FRONTEND_DIR, 'index.html'), (e, d) => {
          if (e) {
            res.writeHead(404);
            res.end('Not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(d);
          }
        });
      } else {
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
        res.end(data);
      }
    });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
  console.log(`📡 API proxying to http://localhost:${BACKEND_PORT}`);
});