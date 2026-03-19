import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { pool } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, loginSchema, updatePasswordSchema } from '../middleware/validation';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// 管理员登录
router.post('/login', validate(loginSchema), async (req: AuthRequest, res, next) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    const admins = rows as any[];
    if (admins.length === 0) {
      throw new ApiError(401, '用户名或密码错误');
    }

    const admin = (admins as any)[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      throw new ApiError(401, '用户名或密码错误');
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role || 'admin'
      },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    );

    res.json({
      code: 200,
      message: '登录成功',
      timestamp: Date.now(),
      data: {
        token,
        user: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, name, email, role, created_at FROM admins WHERE id = ?',
      [req.user?.id]
    );

    const admins = rows as any[];
    if (admins.length === 0) {
      throw new ApiError(404, '用户不存在');
    }

    res.json({
      code: 200,
      message: '获取成功',
      timestamp: Date.now(),
      data: (admins as any)[0]
    });
  } catch (error) {
    next(error);
  }
});

// 修改密码
router.put('/password', authenticate, validate(updatePasswordSchema), async (req: AuthRequest, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 获取用户信息
    const [rows] = await pool.query(
      'SELECT password FROM admins WHERE id = ?',
      [req.user?.id]
    );

    const admins = rows as any[];
    if (admins.length === 0) {
      throw new ApiError(404, '用户不存在');
    }

    // 验证旧密码
    const isValidPassword = await bcrypt.compare(oldPassword, (admins as any)[0].password);
    if (!isValidPassword) {
      throw new ApiError(401, '旧密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await pool.query(
      'UPDATE admins SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, req.user?.id]
    );

    res.json({
      code: 200,
      message: '密码修改成功',
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
