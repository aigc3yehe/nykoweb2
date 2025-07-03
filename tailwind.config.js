/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 添加这行确保暗色模式正常工作
  theme: {
    extend: {
      colors: {
        // 保留原有的语义化颜色
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // 新增设计稿颜色系统
        design: {
          // 文本颜色
          'main-text': '#1F2937',
          'medium-gray': '#6B7280',
          'dark-gray': '#4B5563',
          'lightest-gray': '#9CA3AF',
          // 主色调
          'main-blue': '#0900FF',
          'light-green': '#00FF48',
          // 背景和边框
          'line-light-gray': '#E5E7EB',
          'bg-light-blue': '#EEF2FF',
          'bg-light-gray': '#F3F4F6',
          // 暗色主题对应颜色
          dark: {
            'main-text': '#F9FAFB',
            'medium-gray': '#9CA3AF',
            'dark-gray': '#D1D5DB',
            'lightest-gray': '#6B7280',
            'main-blue': '#3B82F6',
            'light-green': '#10B981',
            'line-light-gray': '#374151',
            'bg-light-blue': '#1E293B',
            'bg-light-gray': '#111827',
          }
        },
        // 新增主内容区背景色
        'main-bg': '#F9FAFB',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'xl': '0.625rem', // 10px
        '2.5xl': '1.25rem', // 20px
      },
      screens: {
        pc: '744px',
      },
      spacing: {
        '7.5': '1.875rem', // 30px
        '3.5': '0.875rem', // 14px
        '45': '11.25rem', // 180px
      },
      height: {
        '7.5': '1.875rem', // 30px
        '3.5': '0.875rem', // 14px
        '45': '11.25rem', // 180px
      },
      width: {
        '16.8125': '16.8125rem', // 269px
      },
      fontFamily: {
        'lexend': ['Lexend', 'sans-serif'],
      }
    },
  },
  plugins: [],
}