// 格式化日期时间
export const formatDateTime = (dateTime: string): string => {
  const date = new Date(dateTime);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 获取日期范围
export const getDateRange = (days: number): { start: string; end: string } => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

// 保存本地存储
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('保存本地存储失败:', error);
  }
};

// 获取本地存储
export const getLocalStorage = <T>(key: string, defaultValue?: T): T | undefined => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('获取本地存储失败:', error);
    return defaultValue;
  }
};

// 删除本地存储
export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('删除本地存储失败:', error);
  }
};

// 复制到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (error) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
};

// 下载图片
export const downloadImage = (url: string, filename: string = 'qr-code.png'): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 获取排名颜色
export const getRankColor = (rank: number): string => {
  if (rank === 1) return '#FFD700'; // 金色
  if (rank === 2) return '#C0C0C0'; // 银色
  if (rank === 3) return '#CD7F32'; // 铜色
  return '#999'; // 灰色
};

// 获取排名图标
export const getRankIcon = (rank: number): string => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
};
