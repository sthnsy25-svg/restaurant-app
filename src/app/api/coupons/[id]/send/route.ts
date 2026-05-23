import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { sendPushNotification } from "@/lib/webpush";
import { nanoid } from "nanoid";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const coupon = await prisma.coupon.findUnique({ where: { id: params.id } });
  if (!coupon) return NextResponse.json({ error: "クーポンが見つかりません" }, { status: 404 });

  const customers = await prisma.customer.findMany({ where: { isActive: true } });
  if (customers.length === 0) return NextResponse.json({ error: "登録者がいません" }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const results = await Promise.allSettled(
    customers.map(async (customer) => {
      const existing = await prisma.customerCoupon.findFirst({
        where: { customerId: customer.id, couponId: coupon.id },
      });
      if (existing) return;

      const code = nanoid(12);
      await prisma.customerCoupon.create({
        data: { code, customerId: customer.id, couponId: coupon.id },
      });

      await sendPushNotification(
        { endpoint: customer.endpoint, p256dh: customer.p256dh, auth: customer.auth },
        {
          title: `🎟️ クーポンが届きました`,
          body: `${coupon.title} - ${coupon.discount}`,
          url: `${appUrl}/coupon/${code}`,
        }
      );
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  return NextResponse.json({ succeeded, failed });
}
