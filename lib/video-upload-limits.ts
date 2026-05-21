/** Max CMS video upload size (bytes). */
export const CMS_VIDEO_MAX_BYTES = 340 * 1024 * 1024;

export const CMS_VIDEO_MAX_LABEL = "340 MB";

export function isVideoWithinSizeLimit(bytes: number): boolean {
  return bytes > 0 && bytes <= CMS_VIDEO_MAX_BYTES;
}

export function formatVideoFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
