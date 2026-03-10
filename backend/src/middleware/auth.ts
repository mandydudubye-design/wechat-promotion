import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, '未提供认证令牌');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as {
      id: number;
      username: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    next(new ApiError(401, '认证失败'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, '未认证'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, '权限不足'));
    }

    next();
  };
};
