import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const customers = await prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const { name, subscription } = await req.json();
  if (!name || !subscription?.endpoint) {
    return NextResponse.json({ error: "名前と通知の許可が必要です" }, { status: 400 });
  }

  const existing = await prisma.customer.findUnique({
    where: { endpoint: subscription.endpoint },
  });

  if (existing) {
    if (!existing.isActive) {
      const updated = await prisma.customer.update({
        where: { endpoint: subscription.endpoint },
        data: { isActive: true, name },
      });
      return NextResponse.json(updated);
    }
    return NextResponse.json({ error: "このデバイスはすでに登録されています" }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
  return NextResponse.json(customer, { status: 201 });
}
