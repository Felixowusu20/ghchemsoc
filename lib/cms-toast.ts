import { readCmsErrorResponse } from "@/lib/cms-api-errors";
import { gooeyToast } from "@/lib/toast";

const toastOpts = { preset: "smooth" as const, spring: false };

export async function parseCmsError(res: Response): Promise<string> {
  return readCmsErrorResponse(res);
}

export function notifyCmsSuccess(message: string, description?: string) {
  gooeyToast.success(message, { ...toastOpts, description });
}

export function notifyCmsError(message: string, description?: string) {
  gooeyToast.error(message, { ...toastOpts, description });
}

/** Show toast + optional inline error; returns true when the response succeeded. */
export async function handleCmsResponse(
  res: Response,
  successMessage: string,
  options?: { failureTitle?: string; setErr?: (msg: string | null) => void }
): Promise<boolean> {
  if (!res.ok) {
    const description = await parseCmsError(res);
    options?.setErr?.(description);
    notifyCmsError(options?.failureTitle ?? "Could not complete action", description);
    return false;
  }
  options?.setErr?.(null);
  notifyCmsSuccess(successMessage);
  return true;
}
