import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteFooterPublic } from "@/lib/site-footer";
import type { FooterSocialLink } from "@/lib/site-footer-defaults";

function SocialIcon({ platform }: { platform: FooterSocialLink["platform"] }) {
  const className = "h-4 w-4";
  switch (platform) {
    case "linkedin":
      return <Linkedin className={className} aria-hidden />;
    case "instagram":
      return <Instagram className={className} aria-hidden />;
    case "twitter":
      return <Twitter className={className} aria-hidden />;
    case "facebook":
      return <Facebook className={className} aria-hidden />;
    case "youtube":
      return <Youtube className={className} aria-hidden />;
    default:
      return <Globe className={className} aria-hidden />;
  }
}

function FooterPhoto({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[5/6] w-full overflow-hidden rounded-2xl shadow-lg shadow-blue-950/40 ring-1 ring-white/20",
        className
      )}
    >
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 45vw, 220px" priority={priority} />
    </div>
  );
}

export function SiteFooterView({ data }: { data: SiteFooterPublic }) {
  return (
    <footer
      className="relative mt-16 w-full overflow-hidden border-t border-blue-500/30 bg-gradient-to-b from-blue-600 via-gcs-primary to-blue-950 text-white"
      data-aos="fade-up"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.14),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-blue-300/15 blur-3xl"
        aria-hidden
      />

      {/* Stay connected — balanced headline + photos */}
      <div className="relative mx-auto max-w-[1440px] px-4 py-14 sm:px-6 md:px-12 md:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          <div className="hidden lg:col-span-3 lg:block xl:col-span-3">
            <FooterPhoto
              src={data.leftImageUrl}
              alt={data.leftImageAlt}
              className="mx-auto max-w-[220px] xl:max-w-[240px]"
            />
          </div>

          <div className="text-center lg:col-span-6 lg:px-4 xl:col-span-6">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-100">Stay connected</p>
            <h2 className="mt-4 break-words text-[clamp(1.75rem,8vw,4.25rem)] font-semibold leading-[0.92] tracking-tight text-white xl:text-[4.5rem]">
              <span className="block">{data.headlineLine1}</span>
              <span className="mt-1 block text-sky-100">{data.headlineLine2}</span>
            </h2>
          </div>

          <div className="hidden lg:col-span-3 lg:block xl:col-span-3">
            <FooterPhoto
              src={data.rightImageUrl}
              alt={data.rightImageAlt}
              className="mx-auto max-w-[220px] xl:max-w-[240px]"
            />
          </div>
        </div>

        {/* Tablet / mobile — photos under headline, side by side */}
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 gap-4 sm:gap-6 lg:hidden">
          <FooterPhoto src={data.leftImageUrl} alt={data.leftImageAlt} priority />
          <FooterPhoto src={data.rightImageUrl} alt={data.rightImageAlt} />
        </div>
      </div>

      {/* Info bar */}
      <div className="relative border-t border-white/15 bg-blue-950/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-12 md:flex-row md:items-center md:justify-between md:gap-8 md:px-12 md:py-14">
          <div className="max-w-xs shrink-0 md:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Secretariat</p>
            <p className="mt-3 break-words text-sm font-medium leading-relaxed text-blue-50 md:text-base">{data.helplineText}</p>
          </div>

          <div className="flex max-w-xl flex-col items-center gap-6 text-center md:flex-1 md:px-6">
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {data.navLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="group inline-flex items-center gap-1 text-sm font-semibold text-white transition-colors hover:text-sky-200"
                >
                  {link.label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </Link>
              ))}
            </nav>
            <p className="max-w-md text-sm leading-relaxed text-blue-100/90">{data.description}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {data.socialLinks.map((s) => (
                <a
                  key={`${s.platform}-${s.href}`}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label ?? s.platform}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-gcs-primary"
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          </div>

          <div className="max-w-xs shrink-0 text-left md:text-right">
            <p className="text-sm font-medium text-blue-100">{data.copyrightText}</p>
            {data.trademarkNotice ? (
              <p className="mt-2 text-xs leading-relaxed text-blue-200/80">{data.trademarkNotice}</p>
            ) : null}
            <Link
              href={data.trademarkHref}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-200 transition-colors hover:text-white"
            >
              {data.trademarkLabel}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
