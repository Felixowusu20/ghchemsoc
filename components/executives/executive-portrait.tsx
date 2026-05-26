import Image from "next/image";
import { cn } from "@/lib/utils";

type Variant = "card" | "detail" | "teaser";

type Props = {
  name: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  variant: Variant;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

function Fallback({ name, variant }: { name: string; variant: Variant }) {
  const initials = (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-gcs-primary/15 font-bold text-gcs-primary",
        variant === "teaser" && "h-full w-full text-base",
        variant === "card" && "h-14 w-14 text-xl sm:h-16 sm:w-16 sm:text-2xl",
        variant === "detail" && "h-20 w-20 text-3xl"
      )}
    >
      {name.charAt(0)}
    </span>
  );

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 bg-gcs-primary/5 text-slate-500",
        variant === "teaser" && "min-h-0",
        variant === "card" && "min-h-[8.5rem] sm:min-h-0",
        variant === "detail" && "min-h-[12rem]"
      )}
    >
      {initials}
      {variant !== "teaser" ? (
        <span className={cn("font-medium", variant === "detail" ? "text-sm" : "text-xs")}>Photo coming soon</span>
      ) : null}
    </div>
  );
}

const IMAGE_CLASS: Record<Variant, string> = {
  card: "object-cover object-[center_18%] transition-transform duration-500 group-hover:scale-[1.02] sm:object-top",
  detail: "object-cover object-[center_18%] sm:object-top",
  teaser: "object-cover object-[center_20%]",
};

const SIZES: Record<Variant, string> = {
  card: "(max-width: 639px) 34vw, (max-width: 1023px) 44vw, 320px",
  detail: "(max-width: 640px) min(88vw, 304px), (max-width: 1024px) min(50vw, 384px), 480px",
  teaser: "(max-width: 640px) 72px, 80px",
};

export function ExecutivePortrait({
  name,
  imageUrl,
  imageAlt,
  variant,
  priority,
  className,
  imageClassName,
}: Props) {
  if (!imageUrl) {
    return (
      <div className={className}>
        <Fallback name={name} variant={variant} />
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      <Image
        src={imageUrl}
        alt={imageAlt ?? name}
        fill
        priority={priority}
        className={cn(IMAGE_CLASS[variant], imageClassName)}
        sizes={SIZES[variant]}
      />
    </div>
  );
}
