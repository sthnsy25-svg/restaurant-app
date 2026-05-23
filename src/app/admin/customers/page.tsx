import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/AdminShell";
import CustomersClient from "./CustomersClient";

export default async function CustomersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell>
      <CustomersClient initialCustomers={customers} />
    </AdminShell>
  );
}
