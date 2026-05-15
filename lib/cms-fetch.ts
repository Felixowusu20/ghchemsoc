/** Browser fetch options so the CMS JWT cookie is sent to `/api/cms/*` and `/api/auth/*`. */
export const cmsCredentials: RequestInit = { credentials: "include" };
