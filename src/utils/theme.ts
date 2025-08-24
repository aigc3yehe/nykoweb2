/**
 * 主题系统工具函数
 */

// 主题类型
export type Theme = 'light' | 'dark';

// 获取当前主题
export const getCurrentTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

// 设置主题
export const setTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return;
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

// 切换主题
export const toggleTheme = (): Theme => {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
};

// 初始化主题
export const initializeTheme = (): void => {
  if (typeof window === 'undefined') return;

  // 检查本地存储的主题设置
  const savedTheme = localStorage.getItem('theme') as Theme;
  
  // 检查系统主题偏好
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  // 优先使用保存的主题，否则使用系统主题
  const theme = savedTheme || systemTheme;
  setTheme(theme);
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
};

// 主题颜色映射
export const themeColors = {
  light: {
    // 背景色
    primary: '#F3F5F9',
    secondary: '#FFFFFF',
    tertiary: '#F5F6F7',
    quaternary: '#EBEBEB',
    
    // 文本色
    textPrimary: '#121314',
    textSecondary: '#686E7D',
    textTips: '#9CA1AF',
    textDisable: '#858B9A',
    textInverse: '#FFFFFF',
    textSuccess: '#1C7E33',
    textError: '#CA3542',
    textWarning: '#9A6300',
    
    // 线条色
    lineSubtle: '#E2E4E8',
    lineStrong: '#9CA1AF',
    
    // 链接色
    linkDefault: '#4458FF',
    linkPressed: '#3A49D6',
    linkDisable: '#8B99FF',
    
    // 组件色
    popUps: '#FFFFFF',
    chat: '#F5F6F7',
    switch: '#FFFFFF',
    switchHover: '#EBEBEB',
    btnSelected: '#FFFFFF',
    brand10: 'rgba(68, 88, 255, 0.1)',
  },
  dark: {
    // 背景色
    primary: '#000000',
    secondary: '#121314',
    tertiary: '#191B1C',
    quaternary: '#2A2C32',
    
    // 文本色
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA1AF',
    textTips: '#686E7D',
    textDisable: '#4B505C',
    textInverse: '#121314',
    textSuccess: '#4CB564',
    textError: '#FF7584',
    textWarning: '#FFD957',
    
    // 线条色
    lineSubtle: '#292B2F',
    lineStrong: '#4B505C',
    
    // 链接色
    linkDefault: '#8B99FF',
    linkPressed: '#3A49D6',
    linkDisable: '#0B0F32',
    
    // 组件色
    popUps: '#202224',
    chat: '#323538',
    switch: '#292B2E',
    switchHover: '#323538',
    btnSelected: '#4B505C',
    brand10: 'rgba(139, 153, 255, 0.1)',
  },
};

// 获取当前主题的颜色
export const getThemeColors = () => {
  const currentTheme = getCurrentTheme();
  return themeColors[currentTheme];
};

// 获取指定主题的颜色
export const getColorsByTheme = (theme: Theme) => {
  return themeColors[theme];
};

// 主题相关的CSS类名
export const themeClasses = {
  // 背景色类名
  backgrounds: {
    primary: 'bg-primary-theme',
    secondary: 'bg-secondary-theme',
    tertiary: 'bg-tertiary-theme',
    quaternary: 'bg-quaternary-theme',
    popUps: 'bg-pop-ups-theme',
    chat: 'bg-chat-theme',
    switch: 'bg-switch-theme',
    switchHover: 'bg-switch-hover-theme',
    btnSelected: 'bg-btn-selected-theme',
    brand10: 'bg-brand-10-theme',
  },
  
  // 文本色类名
  texts: {
    primary: 'text-primary-theme',
    secondary: 'text-secondary-theme',
    tips: 'text-tips-theme',
    disable: 'text-disable-theme',
    inverse: 'text-inverse-theme',
    success: 'text-success-theme',
    error: 'text-error-theme',
    warning: 'text-warning-theme',
  },
  
  // 边框色类名
  borders: {
    subtle: 'border-subtle-theme',
    strong: 'border-strong-theme',
  },
  
  // 链接色类名
  links: {
    default: 'text-link-default',
    pressed: 'text-link-pressed',
    disable: 'text-link-disable',
  },
};

// 主题相关的Tailwind类名（带dark:前缀）
export const tailwindThemeClasses = {
  // 背景色
  backgrounds: {
    primary: 'bg-primary dark:bg-primary-dark',
    secondary: 'bg-secondary dark:bg-secondary-dark',
    tertiary: 'bg-tertiary dark:bg-tertiary-dark',
    quaternary: 'bg-quaternary dark:bg-quaternary-dark',
  },
  
  // 文本色
  texts: {
    primary: 'text-text-primary dark:text-text-primary-dark',
    secondary: 'text-text-secondary dark:text-text-secondary-dark',
    tips: 'text-text-tips dark:text-text-tips-dark',
    disable: 'text-text-disable dark:text-text-disable-dark',
    inverse: 'text-text-inverse dark:text-text-inverse-dark',
    success: 'text-text-success dark:text-text-success-dark',
    error: 'text-text-error dark:text-text-error-dark',
    warning: 'text-text-warning dark:text-text-warning-dark',
  },
  
  // 边框色
  borders: {
    subtle: 'border-line-subtle dark:border-line-subtle-dark',
    strong: 'border-line-strong dark:border-line-strong-dark',
  },
  
  // 链接色
  links: {
    default: 'text-link-default dark:text-link-default-dark',
    pressed: 'text-link-pressed dark:text-link-pressed-dark',
    disable: 'text-link-disable dark:text-link-disable-dark',
  },
};

// 主题变化监听器
export const onThemeChange = (callback: (theme: Theme) => void) => {
  if (typeof window === 'undefined') return;
  
  // 创建MutationObserver监听class变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const theme = getCurrentTheme();
        callback(theme);
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  
  return () => observer.disconnect();
};
