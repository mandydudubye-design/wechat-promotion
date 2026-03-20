/**
 * 海报生成工具
 * 使用Canvas在模板上绘制二维码、头像、文字等元素
 */

import type { PosterTemplate, Employee, OfficialAccount } from '../types';

// 海报生成配置
interface PosterGenerateOptions {
  template: PosterTemplate;
  employee: Employee;
  account: OfficialAccount;
  qrCodeUrl: string;
  avatarUrl?: string;
}

// 加载图片
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

// 生成圆角图片
const drawRoundedImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  borderRadius: number = 0
) => {
  ctx.save();
  
  if (borderRadius > 0) {
    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo(x + width - borderRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
    ctx.lineTo(x + width, y + height - borderRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
    ctx.lineTo(x + borderRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
    ctx.lineTo(x, y + borderRadius);
    ctx.quadraticCurveTo(x, y, x + borderRadius, y);
    ctx.closePath();
    ctx.clip();
  }
  
  ctx.drawImage(img, x, y, width, height);
  ctx.restore();
};

// 绘制文字
const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: string,
  fontWeight: string = 'normal',
  textAlign: 'left' | 'center' | 'right' = 'center'
) => {
  ctx.save();
  ctx.font = `${fontWeight} ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'top';
  ctx.fillText(text, x, y);
  ctx.restore();
};

/**
 * 生成海报
 * @param options 海报生成配置
 * @returns 海报图片的 DataURL
 */
export const generatePoster = async (options: PosterGenerateOptions): Promise<string> => {
  const { template, employee, account, qrCodeUrl, avatarUrl } = options;
  
  // 创建Canvas
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = template.width * dpr;
  canvas.height = template.height * dpr;
  canvas.style.width = `${template.width}px`;
  canvas.style.height = `${template.height}px`;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建Canvas上下文');
  }
  
  ctx.scale(dpr, dpr);
  
  try {
    // 1. 加载并绘制模板背景
    let templateImg: HTMLImageElement;
    try {
      templateImg = await loadImage(template.templateUrl);
    } catch {
      // 如果模板加载失败，使用默认背景
      templateImg = new Image();
      templateImg.width = template.width;
      templateImg.height = template.height;
      // 创建默认渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, template.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, template.width, template.height);
    }
    
    if (templateImg.src) {
      ctx.drawImage(templateImg, 0, 0, template.width, template.height);
    }
    
    // 2. 加载并绘制二维码
    const { qrCodeConfig } = template;
    try {
      const qrImg = await loadImage(qrCodeUrl);
      drawRoundedImage(
        ctx,
        qrImg,
        qrCodeConfig.x,
        qrCodeConfig.y,
        qrCodeConfig.width,
        qrCodeConfig.height,
        qrCodeConfig.borderRadius || 0
      );
    } catch {
      // 二维码加载失败时绘制占位符
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrCodeConfig.x, qrCodeConfig.y, qrCodeConfig.width, qrCodeConfig.height);
      ctx.fillStyle = '#999999';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('二维码', qrCodeConfig.x + qrCodeConfig.width / 2, qrCodeConfig.y + qrCodeConfig.height / 2);
    }
    
    // 3. 绘制头像（如果有配置）
    if (template.avatarConfig && avatarUrl) {
      try {
        const avatarImg = await loadImage(avatarUrl);
        drawRoundedImage(
          ctx,
          avatarImg,
          template.avatarConfig.x,
          template.avatarConfig.y,
          template.avatarConfig.width,
          template.avatarConfig.height,
          template.avatarConfig.borderRadius || 0
        );
      } catch {
        console.warn('头像加载失败');
      }
    }
    
    // 4. 绘制文字（如果有配置）
    if (template.textConfigs) {
      const textData: Record<string, string> = {
        name: employee.name,
        department: employee.department,
        employeeId: employee.employeeId,
        accountName: account.name,
      };
      
      template.textConfigs.forEach((textConfig) => {
        const text = textData[textConfig.key] || '';
        drawText(
          ctx,
          text,
          textConfig.x,
          textConfig.y,
          textConfig.fontSize,
          textConfig.color,
          textConfig.fontWeight,
          textConfig.textAlign || 'center'
        );
      });
    }
    
    // 5. 添加公众号名称水印
    ctx.save();
    ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'center';
    ctx.fillText(account.name, template.width / 2, template.height - 50);
    ctx.restore();
    
    // 返回图片Data URL
    return canvas.toDataURL('image/png', 0.9);
  } catch (error) {
    console.error('海报生成失败:', error);
    throw error;
  }
};

/**
 * 下载海报
 * @param dataUrl 海报Data URL
 * @param fileName 文件名
 */
export const downloadPoster = (dataUrl: string, fileName: string = '推广海报.png') => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 海报转Blob（用于分享）
 * @param dataUrl 海报Data URL
 */
export const dataURLtoBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * 检查是否支持Web Share API
 */
export const canShare = (): boolean => {
  return navigator.share !== undefined;
};

/**
 * 分享海报
 * @param dataUrl 海报Data URL
 * @param title 分享标题
 */
export const sharePoster = async (dataUrl: string, title: string = '推广海报'): Promise<boolean> => {
  if (!canShare()) {
    return false;
  }
  
  try {
    const blob = dataURLtoBlob(dataUrl);
    const file = new File([blob], 'poster.png', { type: 'image/png' });
    
    await navigator.share({
      title,
      files: [file],
    });
    
    return true;
  } catch (error) {
    console.error('分享失败:', error);
    return false;
  }
};