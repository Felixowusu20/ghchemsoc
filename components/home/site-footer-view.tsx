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

export function SiteFooterView({ data }: { data: SiteFooterPublic }) {
  return (
    <footer className="relative mt-16 w-full overflow-hidden border-t border-blue-100/80 bg-white" data-aos="fade-up">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(29,78,216,0.08),transparent_60%)]"
        aria-hidden
      />

      {/* Display band */}
      <div className="relative mx-auto max-w-[1440px] px-4 pb-8 pt-14 sm:px-6 md:px-12 md:pb-12 md:pt-20">
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-gcs-primary">Stay connected</p>
          <h2 className="mt-4 text-[clamp(2.25rem,11vw,5.5rem)] font-semibold leading-[0.9] tracking-tight text-slate-900">
            <span className="block">{data.headlineLine1}</span>
            <span className="mt-1 block bg-gradient-to-r from-gcs-primary via-blue-600 to-blue-800 bg-clip-text text-transparent">
              {data.headlineLine2}
            </span>
          </h2>

          <div className="pointer-events-none absolute left-[2%] top-[8%] relative hidden h-36 w-28 overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/80 md:block lg:h-44 lg:w-36 -rotate-6">
            <Image src={data.leftImageUrl} alt={data.leftImageAlt} fill className="object-cover" sizes="144px" />
          </div>
          <div className="pointer-events-none absolute right-[2%] top-[18%] relative hidden h-40 w-32 overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/80 md:block lg:h-48 lg:w-40 rotate-3">
            <Image src={data.rightImageUrl} alt={data.rightImageAlt} fill className="object-cover" sizes="160px" />
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="relative border-t border-blue-900/10 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-12 md:flex-row md:items-end md:justify-between md:gap-8 md:px-12 md:py-14">
          <div className="max-w-xs">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200/90">Secretariat</p>
            <p className="mt-3 text-sm font-medium leading-relaxed text-blue-50/95 md:text-base">{data.helplineText}</p>
          </div>

          <div className="flex max-w-xl flex-col items-center gap-6 text-center md:flex-1 md:px-6">
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {data.navLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="group inline-flex items-center gap-1 text-sm font-semibold text-white/95 transition-colors hover:text-sky-200"
                >
                  {link.label}
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </Link>
              ))}
            </nav>
            <p className="gcs-body max-w-md text-sm leading-relaxed text-blue-100/85">{data.description}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {data.socialLinks.map((s) => (
                <a
                  key={`${s.platform}-${s.href}`}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label ?? s.platform}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:border-sky-300/50 hover:bg-white hover:text-gcs-primary"
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          </div>

          <div className="max-w-xs text-left md:text-right">
            <p className="text-sm font-medium text-blue-200/90">{data.copyrightText}</p>
            {data.trademarkNotice ? (
              <p className="mt-2 text-xs leading-relaxed text-blue-200/75">{data.trademarkNotice}</p>
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
