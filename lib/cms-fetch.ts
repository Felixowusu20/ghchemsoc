/** Browser fetch options so the CMS JWT cookie is sent with admin API requests. */
export const cmsCredentials: RequestInit = { credentials: "include" };

export { CMS_UNAUTHORIZED_MESSAGE } from "@/lib/cms-api-errors";
