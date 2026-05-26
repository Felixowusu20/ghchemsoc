/** Shared portrait specs for executives (CMS guidance + public layout). */
export const EXECUTIVE_PORTRAIT = {
  /** Width × height to upload in CMS */
  recommendedWidth: 800,
  recommendedHeight: 1000,
  aspectRatio: "4:5" as const,
  /** Shown in CMS helper copy */
  cmsGuidance:
    "Upload a portrait at 800 × 1000 px (4:5 ratio), JPG or WebP. Center the face with a little space above the head; avoid wide group shots.",
  /** List card image (Next/Image sizes hint) */
  list: { width: 320, height: 400 },
  /** Profile page hero portrait */
  detail: { width: 480, height: 600 },
} as const;
