import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { sendBroadcastPush } from "@/lib/webpush";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body } = await req.json();
  if (!title || !body) {
    return NextResponse.json({ error: "タイトルと本文を入力してください" }, { status: 400 });
  }

  const customers = await prisma.customer.findMany({
    where: { isActive: true },
  });

  if (customers.length === 0) {
    return NextResponse.json({ error: "登録者がいません" }, { status: 400 });
  }

  const { succeeded, failed } = await sendBroadcastPush(customers, {
    title,
    body,
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  });

  await prisma.broadcast.create({
    data: { title, body, recipientCount: succeeded },
  });

  return NextResponse.json({ succeeded, failed });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const history = await prisma.broadcast.findMany({
    orderBy: { sentAt: "desc" },
    take: 20,
  });
  return NextResponse.json(history);
}
