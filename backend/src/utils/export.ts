import ExcelJS from 'exceljs';
import { Response } from 'express';
import { logger } from './logger';

interface ExportOptions {
  filename: string;
  sheetName: string;
  headers: Array<{ key: string; header: string; width?: number }>;
  data: any[];
}

/**
 * 导出数据到Excel文件
 */
export async function exportToExcel(
  res: Response,
  options: ExportOptions
): Promise<void> {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName);

    // 设置列
    worksheet.columns = options.headers.map(h => ({
      key: h.key,
      header: h.header,
      width: h.width || 20
    }));

    // 添加数据
    worksheet.addRows(options.data);

    // 设置表头样式
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // 设置数据行样式
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', horizontal: 'left' };
        row.height = 20;
      }
    });

    // 自动调整列宽
    worksheet.columns.forEach(column => {
      if (!column.eachCell) return;
      
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const length = cell.value ? cell.value.toString().length : 10;
        if (length > maxLength) {
          maxLength = length;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    // 设置响应头
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(options.filename)}"`
    );

    // 发送文件
    await workbook.xlsx.write(res);
    res.end();

    logger.info('Excel导出成功', { filename: options.filename });
  } catch (error) {
    logger.error('Excel导出失败', error);
    throw error;
  }
}

/**
 * 导出员工数据
 */
export async function exportEmployees(res: Response, data: any[]): Promise<void> {
  const options: ExportOptions = {
    filename: `员工数据_${new Date().getTime()}.xlsx`,
    sheetName: '员工列表',
    headers: [
      { key: 'employee_id', header: '员工ID', width: 15 },
      { key: 'name', header: '姓名', width: 15 },
      { key: 'phone', header: '手机号', width: 15 },
      { key: 'department', header: '部门', width: 20 },
      { key: 'position', header: '职位', width: 15 },
      { key: 'bind_status_text', header: '绑定状态', width: 12 },
      { key: 'created_at', header: '创建时间', width: 20 }
    ],
    data: data.map(item => ({
      ...item,
      bind_status_text: getBindStatusText(item.bind_status)
    }))
  };

  await exportToExcel(res, options);
}

/**
 * 导出推广数据
 */
export async function exportPromotions(res: Response, data: any[]): Promise<void> {
  const options: ExportOptions = {
    filename: `推广数据_${new Date().getTime()}.xlsx`,
    sheetName: '推广记录',
    headers: [
      { key: 'id', header: 'ID', width: 10 },
      { key: 'employee_name', header: '员工姓名', width: 15 },
      { key: 'account_name', header: '公众号', width: 20 },
      { key: 'scene_str', header: '场景值', width: 30 },
      { key: 'scan_count', header: '扫码次数', width: 12 },
      { key: 'follow_count', header: '关注次数', width: 12 },
      { key: 'description', header: '描述', width: 30 },
      { key: 'created_at', header: '创建时间', width: 20 }
    ],
    data
  };

  await exportToExcel(res, options);
}

/**
 * 导出关注数据
 */
export async function exportFollows(res: Response, data: any[]): Promise<void> {
  const options: ExportOptions = {
    filename: `关注数据_${new Date().getTime()}.xlsx`,
    sheetName: '关注记录',
    headers: [
      { key: 'id', header: 'ID', width: 10 },
      { key: 'openid', header: 'OpenID', width: 30 },
      { key: 'nickname', header: '昵称', width: 20 },
      { key: 'employee_name', header: '员工姓名', width: 15 },
      { key: 'account_name', header: '公众号', width: 20 },
      { key: 'status_text', header: '状态', width: 12 },
      { key: 'subscribed_at', header: '关注时间', width: 20 },
      { key: 'unsubscribed_at', header: '取关时间', width: 20 }
    ],
    data: data.map(item => ({
      ...item,
      status_text: item.status === 1 ? '已关注' : '已取关'
    }))
  };

  await exportToExcel(res, options);
}

/**
 * 导出统计数据
 */
export async function exportStats(res: Response, data: {
  overview: any;
  employeeRanking: any[];
  accountStats: any[];
}): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  // 概览数据
  const overviewSheet = workbook.addWorksheet('数据概览');
  overviewSheet.columns = [
    { key: 'key', header: '指标', width: 25 },
    { key: 'value', header: '数值', width: 20 }
  ];
  
  const overviewData = [
    { key: '员工总数', value: data.overview.employees?.total || 0 },
    { key: '活跃员工', value: data.overview.employees?.active || 0 },
    { key: '公众号总数', value: data.overview.accounts?.total || 0 },
    { key: '推广记录总数', value: data.overview.promotions?.total_records || 0 },
    { key: '总扫码次数', value: data.overview.promotions?.total_scans || 0 },
    { key: '总关注次数', value: data.overview.promotions?.total_follows || 0 },
    { key: '关注者总数', value: data.overview.follows?.total_follows || 0 },
    { key: '当前关注数', value: data.overview.follows?.current_follows || 0 }
  ];
  overviewSheet.addRows(overviewData);

  // 员工排行
  const rankingSheet = workbook.addWorksheet('员工排行');
  rankingSheet.columns = [
    { key: 'rank', header: '排名', width: 10 },
    { key: 'employee_name', header: '员工姓名', width: 15 },
    { key: 'department', header: '部门', width: 20 },
    { key: 'position', header: '职位', width: 15 },
    { key: 'follow_count', header: '关注数', width: 12 },
    { key: 'scan_count', header: '扫码数', width: 12 },
    { key: 'promotion_count', header: '推广数', width: 12 }
  ];
  rankingSheet.addRows(data.employeeRanking.map((item, index) => ({
    rank: index + 1,
    ...item
  })));

  // 公众号统计
  const accountSheet = workbook.addWorksheet('公众号统计');
  accountSheet.columns = [
    { key: 'account_name', header: '公众号名称', width: 25 },
    { key: 'total_follows', header: '总关注数', width: 15 },
    { key: 'current_follows', header: '当前关注', width: 15 },
    { key: 'total_promotions', header: '推广记录数', width: 15 },
    { key: 'total_scans', header: '总扫码数', width: 15 }
  ];
  accountSheet.addRows(data.accountStats);

  // 设置样式
  [overviewSheet, rankingSheet, accountSheet].forEach(sheet => {
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // 设置响应头
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(`统计数据_${new Date().getTime()}.xlsx`)}"`
  );

  await workbook.xlsx.write(res);
  res.end();

  logger.info('统计数据导出成功');
}

// 辅助函数
function getBindStatusText(status: number): string {
  switch (status) {
    case 0:
      return '未绑定';
    case 1:
      return '已绑定';
    case 2:
      return '已禁用';
    default:
      return '未知';
  }
}
