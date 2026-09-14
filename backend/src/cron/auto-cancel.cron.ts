import cron from 'node-cron';
import prisma from '../config/prisma';

export function autoCancelExpiredOrders(): void {
  cron.schedule('*/5 * * * *', async () => {
    try {
      await executeCancelExpired();
    } catch {
      // Background cron errors handled silently in production
    }
  });
}

async function executeCancelExpired(): Promise<void> {
  const expired = await prisma.order.findMany({
    where: { status: 'WAITING_PAYMENT', expiresAt: { lt: new Date() } },
    select: { id: true },
  });
  if (expired.length === 0) return;
  await prisma.order.updateMany({
    where: { id: { in: expired.map((o) => o.id) } },
    data: { status: 'CANCELLED', cancelledBy: 'SYSTEM', cancelReason: 'Payment deadline expired' },
  });
}
