import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          instances: true,
        },
      },
      instances: {
        select: { isUsed: true },
      },
    },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, discount, expiresAt } = await req.json();
  if (!title || !discount || !expiresAt) {
    return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
  }

  const coupon = await prisma.coupon.create({
    data: { title, description: description || "", discount, expiresAt: new Date(expiresAt) },
  });
  return NextResponse.json(coupon, { status: 201 });
}
