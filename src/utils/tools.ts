export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// 判断URL是否为视频格式
export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  // 去掉URL中的查询参数部分
  const cleanUrl = url.split('?')[0];
  
  // 支持的视频扩展名
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
  
  return videoExtensions.some(ext => cleanUrl.toLowerCase().endsWith(ext));
};
