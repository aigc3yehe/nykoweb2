import React from 'react';
import { pxToRem, spacing, responsiveSize } from '../utils';

/**
 * 示例组件 - 展示如何使用尺寸转换工具
 */
const ExampleUsage: React.FC = () => {
  // 使用样式对象时的转换示例
  const containerStyle = {
    width: pxToRem(400),
    height: pxToRem(300),
    padding: spacing(16),
    margin: spacing(24, 16, 24, 16), // 上右下左
    borderRadius: pxToRem(8),
    fontSize: pxToRem(18),
  };

  // 为了展示响应式尺寸，这里使用内联样式
  // 实际项目中建议使用CSS模块或styled-components等
  return (
    <div style={{ padding: spacing(20) }}>
      <h2 style={{ fontSize: pxToRem(24), marginBottom: pxToRem(16) }}>
        尺寸转换工具示例
      </h2>
      
      <div style={containerStyle} className="bg-secondary">
        <p>这个容器宽度是 {pxToRem(400)} (400px)</p>
        <p>内边距是 {spacing(16)} (16px)</p>
        <p>文字大小是 {pxToRem(18)} (18px)</p>
      </div>

      <div style={{ 
        width: responsiveSize(500), 
        height: pxToRem(200),
        marginTop: spacing(24),
        padding: spacing(16),
        background: 'var(--primary)',
        color: 'var(--primary-foreground)'
      }}>
        <p>这个容器使用responsiveSize，宽度为 {responsiveSize(500)}</p>
        <p>在不同屏幕宽度下会有不同表现</p>
      </div>
    </div>
  );
};

export default ExampleUsage; 