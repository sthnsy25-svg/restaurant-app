import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const instance = await prisma.customerCoupon.findUnique({
    where: { code: params.code },
    include: { coupon: true, customer: true },
  });

  if (!instance) return NextResponse.json({ error: "クーポンが見つかりません" }, { status: 404 });

  return NextResponse.json({
    code: instance.code,
    isUsed: instance.isUsed,
    usedAt: instance.usedAt,
    customerName: instance.customer.name,
    coupon: {
      title: instance.coupon.title,
      description: instance.coupon.description,
      discount: instance.coupon.discount,
      expiresAt: instance.coupon.expiresAt,
    },
  });
}
