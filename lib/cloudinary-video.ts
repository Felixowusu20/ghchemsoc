/** Cloudinary upload tuning — transcoding runs async after upload. */
export const CMS_VIDEO_UPLOAD_OPTIONS = {
  resource_type: "video" as const,
  chunk_size: 6_000_000,
  quality: "auto:good",
  video_codec: "auto",
  audio_codec: "aac",
  eager: [
    {
      width: 1920,
      height: 1080,
      crop: "limit",
      quality: "auto:good",
      video_codec: "h264",
      audio_codec: "aac",
      format: "mp4",
    },
  ],
  eager_async: true,
};
