export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (!process.env.DATABASE_URL) return;

  const { PrismaClient } = await import('@prisma/client');
  const db = new PrismaClient();
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Customer" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "endpoint" TEXT NOT NULL,
        "p256dh" TEXT NOT NULL,
        "auth" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
      )
    `);
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Customer_endpoint_key" ON "Customer"("endpoint")`);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Coupon" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "discount" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
      )
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CustomerCoupon" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "customerId" TEXT NOT NULL,
        "couponId" TEXT NOT NULL,
        "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "usedAt" TIMESTAMP(3),
        "isUsed" BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "CustomerCoupon_pkey" PRIMARY KEY ("id")
      )
    `);
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "CustomerCoupon_code_key" ON "CustomerCoupon"("code")`);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Broadcast" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "body" TEXT NOT NULL,
        "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "recipientCount" INTEGER NOT NULL,
        CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
      )
    `);

    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'CustomerCoupon_customerId_fkey'
        ) THEN
          ALTER TABLE "CustomerCoupon" ADD CONSTRAINT "CustomerCoupon_customerId_fkey"
            FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
      END $$
    `);
    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'CustomerCoupon_couponId_fkey'
        ) THEN
          ALTER TABLE "CustomerCoupon" ADD CONSTRAINT "CustomerCoupon_couponId_fkey"
            FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
      END $$
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    await db.$disconnect();
  }
}
