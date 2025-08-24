import React from 'react';
import { toggleTheme, getCurrentTheme } from '../../utils/theme';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(getCurrentTheme());

  const handleToggle = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  };

  // 监听主题变化
  React.useEffect(() => {
    const handleThemeChange = () => {
      setTheme(getCurrentTheme());
    };

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleThemeChange);

    // 监听DOM变化
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
      observer.disconnect();
    };
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        ${sizeClasses[size]}
        rounded-lg
        bg-secondary dark:bg-secondary-dark
        border
        border-line-subtle dark:border-line-subtle-dark
        flex
        items-center
        justify-center
        transition-all
        duration-200
        hover:bg-tertiary dark:hover:bg-tertiary-dark
        hover:border-line-strong dark:hover:border-line-strong-dark
        focus:outline-none
        focus:ring-2
        focus:ring-link-default dark:focus:ring-link-default-dark
        focus:ring-opacity-50
        ${className}
      `}
      aria-label={`切换到${theme === 'light' ? '暗色' : '亮色'}主题`}
      title={`当前主题: ${theme === 'light' ? '亮色' : '暗色'}`}
    >
      {theme === 'light' ? (
        // 月亮图标 - 暗色主题
        <svg
          className="w-5 h-5 text-text-main dark:text-text-main-dark"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // 太阳图标 - 亮色主题
        <svg
          className="w-5 h-5 text-text-main dark:text-text-main-dark"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;