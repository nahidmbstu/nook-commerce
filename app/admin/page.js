import { getAdminEmail } from "@/lib/admin-auth";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const email = await getAdminEmail();
  return email ? <AdminDashboard email={email} /> : <AdminLogin />;
}
