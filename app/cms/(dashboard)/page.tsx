import { CmsDashboard } from "@/components/cms/cms-dashboard";
import { getCmsDashboardStats } from "@/lib/cms-dashboard-stats";
import { getCmsNotificationCounts } from "@/lib/cms-notifications";

export default async function CmsHome() {
  const [{ counts, degraded }, stats] = await Promise.all([getCmsNotificationCounts(), getCmsDashboardStats()]);

  return <CmsDashboard counts={counts} stats={stats} degraded={degraded} />;
}
