import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// 文件过滤器：只允许图片
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件（JPEG、JPG、PNG、GIF、WEBP）'));
  }
};

// 配置上传
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 限制
  }
});

/**
 * @route POST /api/upload/image
 * @desc 上传图片
 * @access public (临时开放，生产环境需要认证)
 */
router.post('/image', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '没有上传文件',
        timestamp: Date.now()
      });
    }

    // 返回文件 URL
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      timestamp: Date.now()
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: error.message || '上传失败',
      timestamp: Date.now()
    });
  }
});

// 错误处理中间件
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        code: 400,
        message: '文件大小超过限制（最大 5MB）',
        timestamp: Date.now()
      });
    }
  }

  if (error.message) {
    return res.status(400).json({
      code: 400,
      message: error.message,
      timestamp: Date.now()
    });
  }

  next(error);
});

export default router;
