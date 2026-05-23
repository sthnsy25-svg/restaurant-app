import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import BroadcastClient from "./BroadcastClient";

export default async function BroadcastPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return (
    <AdminShell>
      <BroadcastClient />
    </AdminShell>
  );
}
