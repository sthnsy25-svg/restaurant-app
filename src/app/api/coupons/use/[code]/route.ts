import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const instance = await prisma.customerCoupon.findUnique({
    where: { code: params.code },
    include: { coupon: true, customer: true },
  });

  if (!instance) return NextResponse.json({ error: "クーポンが見つかりません" }, { status: 404 });
  if (instance.isUsed) return NextResponse.json({ error: "このクーポンはすでに使用済みです" }, { status: 400 });

  const now = new Date();
  if (instance.coupon.expiresAt < now) {
    return NextResponse.json({ error: "このクーポンは有効期限切れです" }, { status: 400 });
  }

  await prisma.customerCoupon.update({
    where: { code: params.code },
    data: { isUsed: true, usedAt: now },
  });

  return NextResponse.json({ ok: true, customerName: instance.customer.name });
}
