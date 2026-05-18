import { getSiteFooterForPublic } from "@/lib/cms-queries";
import { SiteFooterView } from "@/components/home/site-footer-view";

export async function ContactFooter() {
  const data = await getSiteFooterForPublic();
  return <SiteFooterView data={data} />;
}
