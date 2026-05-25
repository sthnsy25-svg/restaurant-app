import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// 会員情報＋クーポン＋お知らせ履歴を返す
export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ error: "customerId required" }, { status: 400 });

  const customer = await prisma.customer.findUnique({
    where: { id: customerId, isActive: true },
    include: {
      coupons: {
        include: { coupon: true },
        orderBy: { issuedAt: "desc" },
      },
    },
  });

  if (!customer) return NextResponse.json({ error: "not found" }, { status: 404 });

  const broadcasts = await prisma.broadcast.findMany({
    orderBy: { sentAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    id: customer.id,
    name: customer.name,
    coupons: customer.coupons.map((cc) => ({
      code: cc.code,
      isUsed: cc.isUsed,
      usedAt: cc.usedAt,
      issuedAt: cc.issuedAt,
      title: cc.coupon.title,
      description: cc.coupon.description,
      discount: cc.coupon.discount,
      expiresAt: cc.coupon.expiresAt,
    })),
    broadcasts,
  });
}
