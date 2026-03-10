import Joi from 'joi';
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ApiError } from './errorHandler';

/**
 * 验证中间件工厂函数
 */
export function validate(schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      const validationError = new ApiError(400, '参数验证失败');
      (validationError as any).errors = errors;
      throw validationError;
    }

    // 将验证后的值替换原值
    req[property] = value;
    next();
  };
}

// ==================== 认证相关验证 ====================

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': '用户名不能为空',
    'any.required': '用户名是必填项'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': '密码长度至少6位',
    'string.empty': '密码不能为空',
    'any.required': '密码是必填项'
  })
});

export const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'string.empty': '旧密码不能为空',
    'any.required': '旧密码是必填项'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': '新密码长度至少6位',
    'string.empty': '新密码不能为空',
    'any.required': '新密码是必填项'
  })
});

// ==================== 员工相关验证 ====================

export const createEmployeeSchema = Joi.object({
  employee_id: Joi.string().required().messages({
    'string.empty': '员工ID不能为空',
    'any.required': '员工ID是必填项'
  }),
  name: Joi.string().required().messages({
    'string.empty': '姓名不能为空',
    'any.required': '姓名是必填项'
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '手机号格式不正确',
    'string.empty': '手机号不能为空',
    'any.required': '手机号是必填项'
  }),
  department: Joi.string().allow('').optional(),
  position: Joi.string().allow('').optional(),
  bind_status: Joi.number().valid(0, 1, 2).optional()
});

export const updateEmployeeSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
  department: Joi.string().allow('').optional(),
  position: Joi.string().allow('').optional(),
  bind_status: Joi.number().valid(0, 1, 2).optional()
}).min(1).messages({
  'object.min': '至少需要提供一个要更新的字段'
});

export const employeeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  pageSize: Joi.number().integer().min(1).max(100).optional(),
  keyword: Joi.string().allow('').optional(),
  department: Joi.string().allow('').optional(),
  position: Joi.string().allow('').optional(),
  bindStatus: Joi.number().valid(0, 1, 2).optional()
});

// ==================== 公众号相关验证 ====================

export const createAccountSchema = Joi.object({
  account_name: Joi.string().required().messages({
    'string.empty': '公众号名称不能为空',
    'any.required': '公众号名称是必填项'
  }),
  app_id: Joi.string().required().messages({
    'string.empty': 'AppID不能为空',
    'any.required': 'AppID是必填项'
  }),
  app_secret: Joi.string().required().messages({
    'string.empty': 'AppSecret不能为空',
    'any.required': 'AppSecret是必填项'
  }),
  description: Joi.string().allow('').optional(),
  avatar: Joi.string().allow('').optional()
});

export const updateAccountSchema = Joi.object({
  account_name: Joi.string().optional(),
  app_id: Joi.string().optional(),
  app_secret: Joi.string().optional(),
  description: Joi.string().allow('').optional(),
  avatar: Joi.string().allow('').optional(),
  status: Joi.number().valid(0, 1).optional()
}).min(1).messages({
  'object.min': '至少需要提供一个要更新的字段'
});

// ==================== 推广相关验证 ====================

export const createPromotionSchema = Joi.object({
  employee_id: Joi.string().required().messages({
    'string.empty': '员工ID不能为空',
    'any.required': '员工ID是必填项'
  }),
  account_id: Joi.number().integer().required().messages({
    'number.base': '公众号ID必须是数字',
    'any.required': '公众号ID是必填项'
  }),
  description: Joi.string().allow('').optional()
});

export const promotionQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  pageSize: Joi.number().integer().min(1).max(100).optional(),
  keyword: Joi.string().allow('').optional(),
  employeeId: Joi.string().optional(),
  accountId: Joi.number().integer().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().min(Joi.ref('startDate')).messages({
    'date.min': '结束日期不能早于开始日期'
  })
});

export const updatePromotionStatsSchema = Joi.object({
  scan_count: Joi.number().integer().min(0).optional(),
  follow_count: Joi.number().integer().min(0).optional()
}).min(1).messages({
  'object.min': '至少需要提供一个要更新的字段'
});

// ==================== 关注相关验证 ====================

export const followQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  pageSize: Joi.number().integer().min(1).max(100).optional(),
  keyword: Joi.string().allow('').optional(),
  employeeId: Joi.string().optional(),
  accountId: Joi.number().integer().optional(),
  status: Joi.number().valid(0, 1).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().min(Joi.ref('startDate')).messages({
    'date.min': '结束日期不能早于开始日期'
  })
});

export const updateFollowStatusSchema = Joi.object({
  status: Joi.number().valid(0, 1).required().messages({
    'number.base': '状态必须是数字',
    'any.only': '状态只能是0（已取关）或1（已关注）',
    'any.required': '状态是必填项'
  })
});

// ==================== 统计相关验证 ====================

export const statsQuerySchema = Joi.object({
  employee_id: Joi.string().optional(),
  account_id: Joi.number().integer().optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional().min(Joi.ref('start_date')).messages({
    'date.min': '结束日期不能早于开始日期'
  })
});

export const rankingQuerySchema = Joi.object({
  type: Joi.string().valid('follow', 'scan', 'promotion').optional(),
  period: Joi.string().valid('all', 'today', 'week', 'month').optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

export const trendQuerySchema = Joi.object({
  type: Joi.string().valid('follow', 'scan', 'promotion').optional(),
  period: Joi.string().valid('week', 'month', 'quarter').optional()
});

// ==================== 通用验证 ====================

export const idParamsSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.base': 'ID必须是数字',
    'any.required': 'ID是必填项'
  })
});

export const employeeIdParamsSchema = Joi.object({
  employeeId: Joi.string().required().messages({
    'string.empty': '员工ID不能为空',
    'any.required': '员工ID是必填项'
  })
});
