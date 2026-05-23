import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import CouponsClient from "./CouponsClient";

export default async function CouponsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return (
    <AdminShell>
      <CouponsClient />
    </AdminShell>
  );
}
