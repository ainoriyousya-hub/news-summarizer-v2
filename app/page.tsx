import { NewsDashboard } from "@/components/NewsDashboard";

export default function PublicPage() {
  // 公開ページは閲覧専用です。
  return <NewsDashboard isAdmin={false} />;
}
