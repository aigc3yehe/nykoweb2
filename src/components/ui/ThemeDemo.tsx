import React from 'react';

const ThemeDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-primary dark:bg-primary-dark">
      <h1 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-6">主题系统演示</h1>
      
      {/* 背景色演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">背景色系统</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-primary dark:bg-primary-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">Primary Background</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">主背景色</p>
          </div>
          <div className="bg-secondary dark:bg-secondary-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">Secondary Background</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">次背景色</p>
          </div>
          <div className="bg-tertiary dark:bg-tertiary-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">Tertiary Background</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">第三级背景色</p>
          </div>
          <div className="bg-quaternary dark:bg-quaternary-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">Quaternary Background</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">第四级背景色</p>
          </div>
        </div>
      </section>

      {/* 文本色演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">文本色系统</h2>
        <div className="bg-secondary dark:bg-secondary-dark p-6 rounded-lg border border-line-subtle dark:border-line-subtle-dark space-y-3">
          <div>
            <h3 className="text-text-main dark:text-text-main-dark font-medium">主要文本 (Primary Text)</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark">这是次要文本，用于描述和说明内容</p>
          </div>
          <div>
            <p className="text-text-tips dark:text-text-tips-dark">这是提示文本，用于辅助信息和提示</p>
          </div>
          <div className="space-y-2">
            <p className="text-text-success dark:text-text-success-dark">✓ 成功状态文本</p>
            <p className="text-text-error dark:text-text-error-dark">✗ 错误状态文本</p>
            <p className="text-text-warning dark:text-text-warning-dark">⚠ 警告状态文本</p>
            <p className="text-text-disable dark:text-text-disable-dark">禁用状态文本</p>
          </div>
        </div>
      </section>

      {/* 链接色演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">链接色系统</h2>
        <div className="bg-secondary dark:bg-secondary-dark p-6 rounded-lg border border-line-subtle dark:border-line-subtle-dark space-y-3">
          <a href="#" className="text-link-default dark:text-link-default-dark hover:text-link-pressed dark:hover:text-link-pressed-dark block">默认链接状态</a>
          <a href="#" className="text-link-pressed dark:text-link-pressed-dark block">按下链接状态</a>
          <a href="#" className="text-link-disable dark:text-link-disable-dark block cursor-not-allowed">禁用链接状态</a>
        </div>
      </section>

      {/* 边框色演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">边框色系统</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-secondary dark:bg-secondary-dark p-4 rounded-lg border-2 border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">细微边框 (Subtle)</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">用于分割线和轻微边框</p>
          </div>
          <div className="bg-secondary dark:bg-secondary-dark p-4 rounded-lg border-2 border-line-strong dark:border-line-strong-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">粗边框 (Strong)</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">用于重要边框和强调</p>
          </div>
        </div>
      </section>

      {/* 组件背景色演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">组件背景色</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-pop-ups dark:bg-pop-ups-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">弹窗背景</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">用于模态框和弹窗</p>
          </div>
          <div className="bg-chat-bg dark:bg-chat-bg-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">聊天背景</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">用于聊天界面</p>
          </div>
          <div className="bg-switch-bg dark:bg-switch-bg-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">开关背景</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">用于开关组件</p>
          </div>
          <div className="bg-btn-selected dark:bg-btn-selected-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">按钮选中</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">用于选中状态的按钮</p>
          </div>
          <div className="bg-brand-accent dark:bg-brand-accent-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">品牌色背景</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">10%透明度的品牌色</p>
          </div>
        </div>
      </section>

      {/* 主题切换说明 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">主题切换</h2>
        <div className="bg-secondary dark:bg-secondary-dark p-6 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
          <p className="text-text-secondary dark:text-text-secondary-dark mb-4">
            当前主题会根据系统设置自动切换。你也可以手动切换主题：
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => document.documentElement.classList.remove('dark')}
              className="bg-primary dark:bg-primary-dark text-text-main dark:text-text-main-dark px-4 py-2 rounded-lg mr-2 hover:bg-tertiary dark:hover:bg-tertiary-dark transition-colors border border-line-subtle dark:border-line-subtle-dark"
            >
              切换到 Light 主题
            </button>
            <button 
              onClick={() => document.documentElement.classList.add('dark')}
              className="bg-primary dark:bg-primary-dark text-text-main dark:text-text-main-dark px-4 py-2 rounded-lg hover:bg-tertiary dark:hover:bg-tertiary-dark transition-colors border border-line-subtle dark:border-line-subtle-dark"
            >
              切换到 Dark 主题
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThemeDemo;
