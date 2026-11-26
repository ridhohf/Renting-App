import cron from 'node-cron';
import prisma from '../config/prisma';
import { toUtcDate } from '../utils/price.helper';

export function autoCompleteOrders(): void {
  cron.schedule('0 1 * * *', async () => {
    try {
      const today = toUtcDate(new Date());
      await prisma.order.updateMany({
        where: { status: 'PROCESSED', checkOutDate: { lt: today } },
        data: { status: 'COMPLETED' },
      });
    } catch {
      // Cron errors handled silently in production
    }
  });
}
