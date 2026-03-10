import { pool } from '../config/database';
import { logger } from '../utils/logger';

/**
 * 双向同步脚本
 * 同步员工信息和关注记录的状态
 */

export async function syncAllStatus() {
  const connection = await pool.getConnection();
  
  try {
    logger.info('🔄 开始双向同步...');

    await connection.beginTransaction();

    // ========================================
    // 方向1：员工信息 → 关注记录
    // 场景：员工先登记，后关注公众号
    // ========================================
    
    logger.info('📊 同步方向1：员工信息 → 关注记录');
    
    // 1. 更新所有已登记员工的关注状态
    const update1 = await connection.query(
      `UPDATE employee_info ei
      LEFT JOIN follow_records fr ON ei.openid = fr.openid
      SET ei.is_followed = CASE WHEN fr.openid IS NOT NULL AND fr.status = 1 THEN 1 ELSE 0 END,
          ei.follow_time = CASE WHEN fr.openid IS NOT NULL AND fr.status = 1 THEN fr.subscribe_time ELSE NULL END
      WHERE ei.openid IN (SELECT openid FROM follow_records WHERE status = 1)`
    );
    
    logger.info(`✅ 更新员工关注状态：${update1[0].affectedRows} 条`);

    // 2. 更新关注记录的员工信息
    const update2 = await connection.query(
      `UPDATE follow_records fr
      INNER JOIN employee_info ei ON fr.openid = ei.openid
      SET fr.is_employee = 1,
          fr.employee_id = ei.employee_id,
          fr.employee_name = ei.name
      WHERE fr.status = 1`
    );
    
    logger.info(`✅ 更新关注记录员工信息：${update2[0].affectedRows} 条`);

    // ========================================
    // 方向2：关注记录 → 员工信息
    // 场景：员工先关注，后登记
    // ========================================
    
    logger.info('📊 同步方向2：关注记录 → 员工信息');
    
    // 3. 更新所有已关注用户的员工状态
    const update3 = await connection.query(
      `UPDATE follow_records fr
      LEFT JOIN employee_info ei ON fr.openid = ei.openid
      SET fr.is_employee = CASE WHEN ei.openid IS NOT NULL THEN 1 ELSE 0 END,
          fr.employee_id = CASE WHEN ei.openid IS NOT NULL THEN ei.employee_id ELSE NULL END,
          fr.employee_name = CASE WHEN ei.openid IS NOT NULL THEN ei.name ELSE NULL END
      WHERE fr.status = 1`
    );
    
    logger.info(`✅ 更新关注记录员工标记：${update3[0].affectedRows} 条`);

    // 4. 更新员工信息的关注状态（对于取消关注的）
    const update4 = await connection.query(
      `UPDATE employee_info ei
      LEFT JOIN follow_records fr ON ei.openid = fr.openid
      SET ei.is_followed = CASE WHEN fr.openid IS NOT NULL AND fr.status = 1 THEN 1 ELSE 0 END,
          ei.follow_time = CASE WHEN fr.openid IS NOT NULL AND fr.status = 1 THEN fr.subscribe_time ELSE NULL END`
    );
    
    logger.info(`✅ 更新员工关注状态：${update4[0].affectedRows} 条`);

    await connection.commit();

    // ========================================
    // 统计信息
    // ========================================
    
    const [stats] = await connection.query(
      `SELECT 
        COUNT(*) as total_employees,
        SUM(CASE WHEN is_followed = 1 THEN 1 ELSE 0 END) as followed_count,
        SUM(CASE WHEN is_followed = 0 THEN 1 ELSE 0 END) as not_followed_count
      FROM employee_info`
    );

    const [followStats] = await connection.query(
      `SELECT 
        COUNT(*) as total_followers,
        SUM(CASE WHEN is_employee = 1 THEN 1 ELSE 0 END) as employee_followers,
        SUM(CASE WHEN is_employee = 0 THEN 1 ELSE 0 END) as customer_followers
      FROM follow_records
      WHERE status = 1`
    );

    logger.info('📊 同步完成统计：', {
      员工总数: (stats as any[])[0].total_employees,
      已关注员工: (stats as any[])[0].followed_count,
      未关注员工: (stats as any[])[0].not_followed_count,
      关注者总数: (followStats as any[])[0].total_followers,
      员工关注者: (followStats as any[])[0].employee_followers,
      客户关注者: (followStats as any[])[0].customer_followers
    });

    logger.info('✅ 双向同步完成！');

    return {
      success: true,
      stats: (stats as any[])[0],
      followStats: (followStats as any[])[0]
    };

  } catch (error) {
    await connection.rollback();
    logger.error('❌ 双向同步失败：', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 快速同步：只同步单个OpenID
 */
export async function syncSingleOpenid(openid: string) {
  const connection = await pool.getConnection();
  
  try {
    logger.info('🔄 同步单个OpenID：', openid);

    await connection.beginTransaction();

    // 1. 检查是否有员工信息
    const [employee] = await connection.query(
      'SELECT employee_id, name FROM employee_info WHERE openid = ?',
      [openid]
    );

    // 2. 检查是否有关注记录
    const [follower] = await connection.query(
      'SELECT * FROM follow_records WHERE openid = ? AND status = 1',
      [openid]
    );

    // 3. 双向同步
    if ((employee as any[]).length > 0 && (follower as any[]).length > 0) {
      // 都有：双向更新
      const emp = (employee as any[])[0];
      
      await connection.query(
        `UPDATE follow_records 
        SET is_employee = 1, 
            employee_id = ?,
            employee_name = ?
        WHERE openid = ?`,
        [emp.employee_id, emp.name, openid]
      );

      await connection.query(
        `UPDATE employee_info 
        SET is_followed = 1, 
            follow_time = (SELECT subscribe_time FROM follow_records WHERE openid = ?)
        WHERE openid = ?`,
        [openid, openid]
      );

      logger.info('✅ 双向同步成功（员工+关注者）', { openid, employee_id: emp.employee_id });
    
    } else if ((employee as any[]).length > 0) {
      // 只有员工信息：更新为未关注
      await connection.query(
        'UPDATE employee_info SET is_followed = 0, follow_time = NULL WHERE openid = ?',
        [openid]
      );

      logger.info('✅ 同步成功（仅员工，未关注）', { openid });
    
    } else if ((follower as any[]).length > 0) {
      // 只有关注记录：更新为非员工
      await connection.query(
        'UPDATE follow_records SET is_employee = 0, employee_id = NULL, employee_name = NULL WHERE openid = ?',
        [openid]
      );

      logger.info('✅ 同步成功（仅关注者，非员工）', { openid });
    }

    await connection.commit();

    return {
      success: true,
      hasEmployee: (employee as any[]).length > 0,
      hasFollower: (follower as any[]).length > 0
    };

  } catch (error) {
    await connection.rollback();
    logger.error('❌ 同步单个OpenID失败：', error);
    throw error;
  } finally {
    connection.release();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'all') {
    // 同步所有
    syncAllStatus()
      .then(() => {
        logger.info('✅ 全量同步完成');
        process.exit(0);
      })
      .catch((error) => {
        logger.error('❌ 全量同步失败：', error);
        process.exit(1);
      });
  
  } else if (command === 'single') {
    // 同步单个
    const openid = process.argv[3];
    
    if (!openid) {
      console.error('请提供OpenID：npm run sync single <openid>');
      process.exit(1);
    }

    syncSingleOpenid(openid)
      .then(() => {
        logger.info('✅ 单个同步完成');
        process.exit(0);
      })
      .catch((error) => {
        logger.error('❌ 单个同步失败：', error);
        process.exit(1);
      });
  
  } else {
    console.log('用法：');
    console.log('  npm run sync all           # 同步所有');
    console.log('  npm run sync single <openid>  # 同步单个OpenID');
    process.exit(1);
  }
}
