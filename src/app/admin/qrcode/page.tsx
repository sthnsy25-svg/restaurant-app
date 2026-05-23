import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import QRCodeClient from "./QRCodeClient";

export default async function QRCodePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return (
    <AdminShell>
      <QRCodeClient />
    </AdminShell>
  );
}
