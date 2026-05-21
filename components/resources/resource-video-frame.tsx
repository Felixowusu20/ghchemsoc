import { cloudinaryVideoPosterUrl, optimizeVideoDeliveryUrl } from "@/lib/video-delivery-url";
import { isHostedVideoFile, parseVideoEmbed } from "@/lib/society-resources";
import { cn } from "@/lib/utils";

type Props = {
  url: string | null | undefined;
  title: string;
  className?: string;
  /** Cloudinary public_id — enables poster thumbnail for uploaded videos */
  urlPublicId?: string | null;
  showControls?: boolean;
};

export function ResourceVideoFrame({
  url,
  title,
  className,
  urlPublicId,
  showControls = true,
}: Props) {
  const trimmed = url?.trim() ?? "";
  const embed = trimmed ? parseVideoEmbed(trimmed) : null;
  const isFile = trimmed && isHostedVideoFile(trimmed);
  const src = isFile ? optimizeVideoDeliveryUrl(trimmed) : null;
  const poster =
    urlPublicId && isFile ? cloudinaryVideoPosterUrl(urlPublicId) : undefined;

  if (!embed && !src) {
    return (
      <div
        className={cn(
          "flex aspect-video w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-sm text-white/70",
          className
        )}
      >
        No preview available
      </div>
    );
  }

  if (embed) {
    return (
      <div className={cn("relative aspect-video w-full overflow-hidden bg-slate-950", className)}>
        <iframe
          src={embed.embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-slate-950", className)}>
      <video
        src={src!}
        title={title}
        poster={poster || undefined}
        className="h-full w-full object-contain"
        controls={showControls}
        playsInline
        preload="metadata"
        controlsList="nodownload"
      />
    </div>
  );
}
