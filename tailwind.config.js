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
        // 基础颜色系统 - 遵循Tailwind CSS dark mode规范
        primary: {
          DEFAULT: '#F3F5F9',
          dark: {
            DEFAULT: '#000000',
          }
        },
        secondary: {
          DEFAULT: '#FFFFFF',
          dark: {
            DEFAULT: '#121314',
          }
        },
        tertiary: {
          DEFAULT: '#F5F6F7',
          dark: {
            DEFAULT: '#191B1C',
          }
        },
        quaternary: {
          DEFAULT: '#EBEBEB',
          dark: {
            DEFAULT: '#2A2C32',
          }
        },
        // 文本颜色系统
        'text-main': {
          DEFAULT: '#121314',
          dark: {
            DEFAULT: '#FFFFFF',
          }
        },
        'text-secondary': {
          DEFAULT: '#686E7D',
          dark: {
            DEFAULT: '#9CA1AF',
          }
        },
        'text-tips': {
          DEFAULT: '#9CA1AF',
          dark: {
            DEFAULT: '#686E7D',
          }
        },
        'text-disable': {
          DEFAULT: '#858B9A',
          dark: {
            DEFAULT: '#4B505C',
          }
        },
        'text-inverse': {
          DEFAULT: '#FFFFFF',
          dark: {
            DEFAULT: '#121314',
          }
        },
        'text-success': {
          DEFAULT: '#1C7E33',
          dark: {
            DEFAULT: '#4CB564',
          }
        },
        'text-error': {
          DEFAULT: '#CA3542',
          dark: {
            DEFAULT: '#FF7584',
          }
        },
        'text-warning': {
          DEFAULT: '#9A6300',
          dark: {
            DEFAULT: '#FFD957',
          }
        },
        // 线条颜色系统
        'line-subtle': {
          DEFAULT: '#E2E4E8',
          dark: {
            DEFAULT: '#292B2F',
          }
        },
        'line-strong': {
          DEFAULT: '#9CA1AF',
          dark: {
            DEFAULT: '#4B505C',
          }
        },
        // 链接颜色系统
        'link-default': {
          DEFAULT: '#4458FF',
          dark: {
            DEFAULT: '#8B99FF',
          }
        },
        'link-pressed': {
          DEFAULT: '#3A49D6',
          dark: {
            DEFAULT: '#3A49D6',
          }
        },
        'link-disable': {
          DEFAULT: '#8B99FF',
          dark: {
            DEFAULT: '#0B0F32',
          }
        },
        // 组件专用颜色
        'pop-ups': {
          DEFAULT: '#FFFFFF',
          dark: {
            DEFAULT: '#202224',
          }
        },
        'chat-bg': {
          DEFAULT: '#F5F6F7',
          dark: {
            DEFAULT: '#323538',
          }
        },
        'switch-bg': {
          DEFAULT: '#FFFFFF',
          dark: {
            DEFAULT: '#292B2E',
          }
        },
        'switch-hover': {
          DEFAULT: '#EBEBEB',
          dark: {
            DEFAULT: '#323538',
          }
        },
        'btn-selected': {
          DEFAULT: '#FFFFFF',
          dark: {
            DEFAULT: '#4B505C',
          }
        },
        'brand-accent': {
          DEFAULT: 'rgba(68, 88, 255, 0.1)',
          dark: {
            DEFAULT: 'rgba(139, 153, 255, 0.1)',
          }
        },
        // 保留原有的shadcn/ui颜色系统作为备用
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
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
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        '7.5': '1.875rem', // 30px
        '3.5': '0.875rem', // 14px
        '45': '11.25rem', // 180px
        '3.3': '0.825rem', // 13.2px
      },
      height: {
        '7.5': '1.875rem', // 30px
        '3.5': '0.875rem', // 14px
        '45': '11.25rem', // 180px
        '33.125': '33.125rem', // 530px
        '41.125': '41.125rem', // 658px
        '12.36': '3.09rem', // 49.45657730102539px ≈ 3.09rem
        '19': '4.75rem', // 76px
        '30': '7.5rem', // 120px
        '14': '3.5rem', // 56px
        '18': '4.5rem', // 72px - 添加这个以匹配width配置
      },
      width: {
        '16.8125': '16.8125rem', // 269px
        '25.125': '25.125rem', // 402px
        '33.125': '33.125rem', // 530px
        '37.125': '37.125rem', // 594px
        '62.25': '62.25rem', // 996px
        '33': '8.25rem', // 132px
        '37': '9.25rem', // 148px
        '18': '4.5rem', // 72px
        '30': '7.5rem', // 120px
        '14': '3.5rem', // 56px
      },
      maxWidth: {
        '31.5': '31.5rem', // 504px - 聊天输入框最大宽度
      },
      fontFamily: {
        'lexend': ['Lexend', 'sans-serif'],
        'switzer': ['Switzer', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
      lineHeight: {
        '140': '1.4', // 140% line height
      },
      // 新增自定义渐变背景
      backgroundImage: {
        'premium-gradient': 'linear-gradient(180deg, rgba(9, 0, 255, 0) 68.81%, rgba(9, 0, 255, 0.1) 100%)',
        'premium-plus-gradient': 'linear-gradient(180deg, rgba(0, 255, 72, 0) 68.81%, rgba(0, 255, 72, 0.1) 100%)',
      },
      // 玻璃效果
      backdropBlur: {
        'glass': 'blur(8px)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      }
      addUtilities(newUtilities)
    }
  ],
}