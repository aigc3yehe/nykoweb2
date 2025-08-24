/**
 * 尺寸转换工具
 * 用于将设计稿中的px值转换为rem值
 */

// 设计稿基准宽度(px)
const DESIGN_WIDTH = 1512;

// 基准字体大小(px)
const BASE_FONT_SIZE = 16;

/**
 * 将px转换为rem
 * @param px - 设计稿中的像素值
 * @returns 转换后的rem值
 */
export function pxToRem(px: number): string {
  const remValue = px / BASE_FONT_SIZE;
  return `${remValue}rem`;
}

/**
 * 将px转换为vw (视窗宽度的百分比)
 * @param px - 设计稿中的像素值
 * @returns 转换后的vw值
 */
export function pxToVw(px: number): string {
  const vwValue = (px / DESIGN_WIDTH) * 100;
  return `${vwValue}vw`;
}

/**
 * 创建响应式尺寸
 * 在小于等于设计稿宽度时使用vw，大于时使用固定的rem值
 * @param px - 设计稿中的像素值
 * @returns 响应式CSS值 (clamp或具体值)
 */
export function responsiveSize(px: number): string {
  // 在CSS中使用如下：
  // width: responsiveSize(200);
  return `clamp(${pxToRem(px)}, ${pxToVw(px)}, ${pxToRem(px)})`;
}

/**
 * 计算间距 - 输入一个或多个px值，返回对应的rem值
 * 用法与CSS的margin、padding类似
 * @example 
 * - spacing(8) => "0.5rem"
 * - spacing(8, 16) => "0.5rem 1rem"
 * - spacing(8, 16, 24, 32) => "0.5rem 1rem 1.5rem 2rem"
 */
export function spacing(...values: number[]): string {
  return values.map(pxToRem).join(' ');
} 