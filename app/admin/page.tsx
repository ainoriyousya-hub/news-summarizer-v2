import { NewsDashboard } from "@/components/NewsDashboard";

export default function AdminPage() {
  // 管理ページのみ収集操作を許可します。
  return <NewsDashboard isAdmin={true} />;
}
