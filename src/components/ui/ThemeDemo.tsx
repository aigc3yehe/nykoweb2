import React from 'react';
import { useI18n } from '../../hooks/useI18n';

const ThemeDemo: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="p-8 space-y-8 bg-primary dark:bg-primary-dark">
      <h1 className="text-2xl font-bold text-text-main dark:text-text-main-dark mb-6">{t('ui.themeDemo.title')}</h1>
      
      {/* 背景色演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">{t('ui.themeDemo.backgroundColors')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-primary dark:bg-primary-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">{t('ui.themeDemo.primaryBackground')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">{t('ui.themeDemo.primaryBackgroundDesc')}</p>
          </div>
          <div className="bg-secondary dark:bg-secondary-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">{t('ui.themeDemo.secondaryBackground')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">{t('ui.themeDemo.secondaryBackgroundDesc')}</p>
          </div>
          <div className="bg-tertiary dark:bg-tertiary-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">{t('ui.themeDemo.tertiaryBackground')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">{t('ui.themeDemo.tertiaryBackgroundDesc')}</p>
          </div>
          <div className="bg-quaternary dark:bg-quaternary-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">{t('ui.themeDemo.quaternaryBackground')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">{t('ui.themeDemo.quaternaryBackgroundDesc')}</p>
          </div>
        </div>
      </section>

      {/* 文本色演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">{t('ui.themeDemo.textColors')}</h2>
        <div className="bg-secondary dark:bg-secondary-dark p-6 rounded-lg border border-line-subtle dark:border-line-subtle-dark space-y-3">
          <div>
            <h3 className="text-text-main dark:text-text-main-dark font-medium">{t('ui.themeDemo.primaryText')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark">{t('ui.themeDemo.secondaryText')}</p>
          </div>
          <div>
            <p className="text-text-tips dark:text-text-tips-dark">{t('ui.themeDemo.tipsText')}</p>
          </div>
          <div className="space-y-2">
            <p className="text-text-success dark:text-text-success-dark">{t('ui.themeDemo.successText')}</p>
            <p className="text-text-error dark:text-text-error-dark">{t('ui.themeDemo.errorText')}</p>
            <p className="text-text-warning dark:text-text-warning-dark">{t('ui.themeDemo.warningText')}</p>
            <p className="text-text-disable dark:text-text-disable-dark">{t('ui.themeDemo.disabledText')}</p>
          </div>
        </div>
      </section>

      {/* 链接色演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">{t('ui.themeDemo.linkColors')}</h2>
        <div className="bg-secondary dark:bg-secondary-dark p-6 rounded-lg border border-line-subtle dark:border-line-subtle-dark space-y-3">
          <a href="#" className="text-link-default dark:text-link-default-dark hover:text-link-pressed dark:hover:text-link-pressed-dark block">默认链接状态</a>
          <a href="#" className="text-link-pressed dark:text-link-pressed-dark block">按下链接状态</a>
          <a href="#" className="text-link-disable dark:text-link-disable-dark block cursor-not-allowed">禁用链接状态</a>
        </div>
      </section>

      {/* 边框色演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">{t('ui.themeDemo.borderColors')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-secondary dark:bg-secondary-dark p-4 rounded-lg border-2 border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">{t('ui.themeDemo.subtleBorder')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">{t('ui.themeDemo.subtleBorderDesc')}</p>
          </div>
          <div className="bg-secondary dark:bg-secondary-dark p-4 rounded-lg border-2 border-line-strong dark:border-line-strong-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">{t('ui.themeDemo.strongBorder')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">{t('ui.themeDemo.strongBorderDesc')}</p>
          </div>
        </div>
      </section>

      {/* 组件背景色演示 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">{t('ui.themeDemo.componentBackgrounds')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-pop-ups dark:bg-pop-ups-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">{t('ui.themeDemo.popupBackground')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">{t('ui.themeDemo.popupBackgroundDesc')}</p>
          </div>
          <div className="bg-chat-bg dark:bg-chat-bg-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">{t('ui.themeDemo.chatBackground')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">{t('ui.themeDemo.chatBackgroundDesc')}</p>
          </div>
          <div className="bg-switch-bg dark:bg-switch-bg-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">{t('ui.themeDemo.switchBackground')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">{t('ui.themeDemo.switchBackgroundDesc')}</p>
          </div>
          <div className="bg-btn-selected dark:bg-btn-selected-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">{t('ui.themeDemo.buttonSelected')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">{t('ui.themeDemo.buttonSelectedDesc')}</p>
          </div>
          <div className="bg-brand-accent dark:bg-brand-accent-dark p-4 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
            <h3 className="font-medium text-text-main dark:text-text-main-dark mb-2">{t('ui.themeDemo.brandBackground')}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">{t('ui.themeDemo.brandBackgroundDesc')}</p>
          </div>
        </div>
      </section>

      {/* 主题切换说明 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-text-main dark:text-text-main-dark">{t('ui.themeDemo.themeSwitching')}</h2>
        <div className="bg-secondary dark:bg-secondary-dark p-6 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
          <p className="text-text-secondary dark:text-text-secondary-dark mb-4">
            {t('ui.themeDemo.currentThemeDescription')}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => document.documentElement.classList.remove('dark')}
              className="bg-primary dark:bg-primary-dark text-text-main dark:text-text-main-dark px-4 py-2 rounded-lg mr-2 hover:bg-tertiary dark:hover:bg-tertiary-dark transition-colors border border-line-subtle dark:border-line-subtle-dark"
            >
              {t('ui.themeDemo.switchToLight')}
            </button>
            <button
              onClick={() => document.documentElement.classList.add('dark')}
              className="bg-primary dark:bg-primary-dark text-text-main dark:text-text-main-dark px-4 py-2 rounded-lg hover:bg-tertiary dark:hover:bg-tertiary-dark transition-colors border border-line-subtle dark:border-line-subtle-dark"
            >
              {t('ui.themeDemo.switchToDark')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ThemeDemo;
