/**
 * Generates a resized image URL using ImageKit.
 *
 * @param url The original image URL (can be relative or absolute).
 * @param width The desired width of the image in pixels.
 * @returns The URL for the resized image, or the original URL if it's external or invalid.
 */
export const getScaledImageUrl = (url?: string, width?: number): string => {
  if (!url) {
    return '';
  }
  // TODO：待优化：部分图片封面与显示的图片大小不一致，会导致显示模糊
  // const baseUrl = 'https://ik.imagekit.io/xenoai/niyoko/';
  const baseUrl = 'https://ik.imagekit.io/mavae/';

  // If width is not provided, we can't scale it, so return the original path with base URL.
  if (!width) {
    // For safety, construct a full URL even without scaling
    return `${baseUrl}${url}`;
  }

  // Construct the ImageKit URL with width transformation and quality setting.
  return `${baseUrl}${url}?tr=w-${Math.round(width*2)},q-90`;
};