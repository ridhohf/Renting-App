import cron from 'node-cron';
import prisma from '../config/prisma';

export function completeFinishedOrdersJob(): void {
  cron.schedule('0 1 * * *', async () => {
    try {
      await prisma.order.updateMany({
        where: { status: 'PROCESSED', checkOutDate: { lte: new Date() } },
        data: { status: 'COMPLETED' },
      });
    } catch {
      // Background cron errors handled silently in production
    }
  });
}
